const User = require("../models/users");

const Post = require("../models/posts");
const { generateToken } = require("../utils/utils.js");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground" // Redirect URL
);
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});
const accessToken = oauth2Client.getAccessToken();
module.exports.createUser = async (req, res) => {
  const { password, fullname, username, email } = req.body;
  const user = new User({
    password: bcrypt.hashSync(password, 8),
    fullname,
    username,
    email,
  });
  if (
    user.email === "oluseye.olusoji@gmail.com" &&
    user.username === "Olusoji"
  ) {
    user.isAdmin = true;
  }
  const createdUser = await user.save();

  res.send({
    _id: createdUser._id,
    username: createdUser.username,
    fullname: createdUser.fullname,
    email: createdUser.email,
    isAdmin: createdUser.isAdmin,
    savedPosts: createdUser.bookmarkedPosts,
    token: generateToken(createdUser),
  });
};

module.exports.signinUser = async (req, res) => {
  const { info, password } = req.body;
  //const user = await User.find({ username: info });

  //check if the user info match any of either username or email in db
  const user = await User.findOne({
    $or: [{ email: info }, { username: info }],
  });

  if (user) {
    //if found, check if password match and send data
    if (bcrypt.compareSync(password, user.password)) {
      res.send({
        _id: user._id,
        username: user.username,
        fullname: user.fullname,
        savedPosts: user.bookmarkedPosts,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
      return;
    }
    //if no match or password do not match
    res.status(401).send({ message: "Invalid email/username or password" });
  }
};

module.exports.allUsers = async (req, res) => {
  const userPerPage = parseInt(req.query.limit);
  const page = parseInt(req.query.page || 1);
  const search = req.query.search || "";
  //check if query fields are not empty
  const searchFilter = search
    ? {
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};
  //get the total number of users in database
  const allUsers = await User.estimatedDocumentCount({});
  const users = await User.find({ ...searchFilter })
    .limit(userPerPage)
    .skip(userPerPage * (page - 1))
    .sort({ createdAt: -1 });
  const totalPages = Math.ceil(allUsers / userPerPage);
  const hasNextPage = page >= totalPages ? false : true;
  const hasPrevPage = page > 1 ? true : false;
  const nextPage = page + 1;
  const prevPage = page - 1;
  res.send({
    userList: users,
    allUsers,
    totalPages,
    prevPage,
    nextPage,
    hasPrevPage,
    hasNextPage,
    page,
  });
};

module.exports.createMessage = async (req, res) => {
  const { message, name, email } = req.body;
  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  const output = ` <p>You have a new message</p>
  <h3>Contact details</h3>
  
    <p>Name: ${name}</p>
    <p>Email: ${email}</p>
    

  <h3>Message</h3>
<p>${message}</p>`;
  const mailOptions = {
    from: process.env.EMAIL,
    to: "agritalkblog@gmail.com",
    subject: "Message from agritalk user",
    html: output,
  };
  await smtpTransport.sendMail(mailOptions, (error, response) => {
    error ? console.log(error) : console.log(response);
    smtpTransport.close();
  });
  res.status(201).send("Message Sent");
};

module.exports.getUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("bookmarkedPosts");
  res.send(user);
};

module.exports.editUser = async (req, res) => {
  const { id } = req.params;
  //const {username, fullname, email, image, bio, socials, password, currentPassword, location} = req.body

  const user = await User.findByIdAndUpdate(id, {
    ...req.body,
  });

  await user.save();
  res.send({
    _id: user._id,
    username: user.username,
    fullname: user.fullname,

    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user),
  });
};
module.exports.changePassword = async (req, res) => {
  const { id } = req.params;
  const { password, currentPassword } = req.body;
  const user = await User.findById(id);
  //check if password match
  if (bcrypt.compareSync(currentPassword, user.password)) {
    user.password = bcrypt.hashSync(password, 8);
    await user.save();
    res.send({
      _id: user._id,
      username: user.username,
      fullname: user.fullname,

      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  } else {
    res.status(401).send({ message: "Invalid current password" });
  }
};

module.exports.bookmarkPost = async (req, res) => {
  const { id, title } = req.body;
  //find user
  const user = await User.findById(req.user._id);
  //push id and title in bookmarkedposts array
  user.bookmarkedPosts.push({ id, title });
  await user.save();
  res.send(user);
};
module.exports.removeFromBookmark = async (req, res) => {
  const { id } = req.params;
  //find the user
  const user = await User.findById(req.user._id);
  //find any posts id in the bookmark array that matches the post id sent by user
  //remove the post id that match and save the new array in bookmark variable
  const bookmark = user.bookmarkedPosts.filter((post) => post.id !== id);

  //save bookmark variable as the new user bookmarkedposts as the unwanted ones has been removed
  user.bookmarkedPosts = bookmark;

  await user.save();
  res.send(id);
};
module.exports.changeAdminStatus = async (req, res) => {
  const { id } = req.params;
  //find user
  const user = await User.findById(id);
  //change value of isAdmin to the of whatever it was. Either true or false
  user.isAdmin = !user.isAdmin;
  await user.save();

  res.send(user);
};
module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  res.send(id);
};

const User = require("../models/users");
const Post = require("../models/posts");
const { generateToken } = require("../utils/utils.js");
const bcrypt = require("bcryptjs");

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
    token: generateToken(createdUser),
  });
};

module.exports.signinUser = async (req, res) => {
  const { info, password } = req.body;
  //const user = await User.find({ username: info });
  const user = await User.findOne({
    $or: [{ email: info }, { username: info }],
  });

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      res.send({
        _id: user._id,
        username: user.username,
        fullname: user.fullname,

        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
      return;
    }
    res.status(401).send({ message: "Invalid email/username or password" });
  }

  /*if (user) {
    res.send(user);
  }*/
};

module.exports.allUsers = async (req, res) => {
  const users = await User.find({});
  res.send(users);
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
  const { id } = req.params;
  const user = await User.findById(req.user._id);
  const post = await Post.findById(id);
  user.bookmarkedPosts.push(post);
  await user.save();
  res.send(user);
};
module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  res.send(user);
};

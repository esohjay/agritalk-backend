const jwt = require("jsonwebtoken");
const Post = require("../models/posts");
const Comment = require("../models/comments");
const Reply = require("../models/replies");
module.exports.generateToken = (user) => {
  const { _id, fullname, username, email, isAdmin } = user;
  return jwt.sign(
    {
      _id,
      fullname,
      username,
      email,
      isAdmin,
    },
    process.env.JWT_SECRET || "somethingsecret"
  );
};
module.exports.isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  //if the request headers contains authorization field

  if (authorization) {
    //cut out the token from authoriztion for verification
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(
      token,
      //verify with same secret that was used to encode
      process.env.JWT_SECRET || "somethingsecret",
      (err, decode) => {
        if (err) {
          //if someting goes wrong, send error message
          res.status(401).send({ message: "Invalid Token" });
        } else {
          //if decode is successfull, make req.user = the decoded values i.e user details
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

module.exports.isAdmin = (req, res, next) => {
  //check if req.user.isAdmin = true
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};

module.exports.isPostAuthor = async (req, res, next) => {
  const { id } = req.params;
  //find post
  const post = await Post.findById(id);
  //check if the user is the author of the post or if user is an admin
  if (post.author.equals(req.user._id) || (req.user && req.user.isAdmin)) {
    next();
  } else {
    res.status(401).send({ message: "You are not authorized for this action" });
  }

  //next();
};
module.exports.isCommentAuthor = async (req, res, next) => {
  const { id } = req.params;
  //find comment
  const comment = await Comment.findById(id);
  //check if the user is the author of the comment or if user is an admin
  if (comment.author.equals(req.user._id) || (req.user && req.user.isAdmin)) {
    next();
  } else {
    res.status(401).send({ message: "You are not authorized for this action" });
  }
  //next();
};

module.exports.isReplyAuthor = async (req, res, next) => {
  const { id } = req.params;
  const reply = await Reply.findById(id);

  if (reply.author.equals(req.user._id) || (req.user && req.user.isAdmin)) {
    next();
  } else {
    res.status(401).send({ message: "You are not authorized for this action" });
  }
  // next();
};

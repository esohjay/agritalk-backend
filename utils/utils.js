const jwt = require("jsonwebtoken");
const Post = require("../models/posts.js");
const Comment = require("../models/comments.js");
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
    process.env.JWT_SECRET || "somethingsecret",
    {
      expiresIn: "30d",
    }
  );
};
module.exports.isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(
      token,
      process.env.JWT_SECRET || "somethingsecret",
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: "Invalid Token" });
        } else {
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
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post.author.equals(req.user._id)) {
    res.status(401).send({ message: "You are not authorized for this action" });
  }
  next();
};
module.exports.isCommentAuthor = async (req, res, next) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment.author.equals(req.user._id)) {
    res.status(401).send({ message: "You are not authorized for this action" });
  }
  next();
};

module.exports.isReplyAuthor = async (req, res, next) => {
  const { id, replyId } = req.params;
  const comment = await Comment.findById(id);
  const reply = comment.replies.find((x) => {
    x.id === replyId;
  });
  if (!reply.author.equals(req.user._id)) {
    res.status(401).send({ message: "You are not authorized for this action" });
  }
  next();
};

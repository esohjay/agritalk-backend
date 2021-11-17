const Comment = require("../models/comments");
const Reply = require("../models/replies");
const Post = require("../models/posts");

module.exports.createComment = async (req, res) => {
  const { id } = req.params;
  const comment = new Comment({ ...req.body });
  comment.author = req.user;
  const post = await Post.findById(id);
  post.comments.push(comment);
  await comment.save();
  await post.save();
  res.send(comment);
};

module.exports.createCommentReply = async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  const newReply = new Reply({ reply });
  newReply.author = req.user;
  const comment = await Comment.findById(id);
  /*const postComment = post.comments.find((x) => {
    x.id === commentId;
  });*/
  comment.replies.push(newReply);

  await comment.save();

  await newReply.save();
  res.send(newReply);
};

module.exports.allComments = async (req, res) => {
  const comments = await Comment.find({});
  res.send(comments);
};

module.exports.getComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  res.send(comment);
};

module.exports.editComment = async (req, res) => {
  const { id } = req.params;
  //const { comment } = req.params;
  const comment = await Comment.findByIdAndUpdate(id, {
    comment: req.body.comment,
  });
  // console.log(req.body.comment);
  await comment.save();
  res.send(comment);
};

module.exports.editReply = async (req, res) => {
  const { id } = req.params;
  const reply = await Reply.findByIdAndUpdate(id, {
    reply: req.body.reply,
  });
  await reply.save();
  res.send(reply);
};

module.exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findByIdAndDelete(id);
  res.send(comment);
};

module.exports.deleteReply = async (req, res) => {
  const { id } = req.params;
  const reply = await Reply.findByIdAndDelete(id);
  res.send(reply);
};

module.exports.likeComment = async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (comment.likes.users.includes(req.user._id)) {
    const removeLike = comment.likes.users.filter((like) => {
      like !== req.user;
    });
    comment.likes = {
      counts: removeLike.length,
      users: removeLike,
    };
  } else {
    const newLike = comment.likes.users.push(req.user);
    comment.likes.counts = comment.likes.users.length;
  }
  await comment.save();
  res.send(id);
};

module.exports.likeReply = async (req, res) => {
  const { id } = req.params;

  const reply = await Reply.findById(id);

  if (reply.likes.users.includes(req.user._id)) {
    const removeLike = reply.likes.users.filter((like) => {
      like !== req.user;
    });
    reply.likes = {
      counts: removeLike.length,
      users: removeLike,
    };
  } else {
    const newLike = reply.likes.users.push(req.user);
    reply.likes.counts = reply.likes.users.length;
  }
  await reply.save();
  res.send(id);
};

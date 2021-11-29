const Comment = require("../models/comments");
const Reply = require("../models/replies");
const Post = require("../models/posts");

module.exports.createComment = async (req, res) => {
  const { id } = req.params;
  //create new comment
  const comment = new Comment({ ...req.body });
  comment.author = req.user;
  //find post that the comment is passed on
  const post = await Post.findById(id);
  //push the newly created commented into the comments array property in post schema
  post.comments.push(comment);
  await comment.save();
  await post.save();
  res.send(comment);
};

module.exports.createCommentReply = async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;
  //create new reply
  const newReply = new Reply({ reply });
  newReply.author = req.user;
  //find comment that is being replied
  const comment = await Comment.findById(id);
  //push the newly created reply into the replies array property in the comments schema
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
  //find the comment
  const comment = await Comment.findById(id);
  //check if the user has liked the comment before by checking if user id is in comment.likes array property
  //to know if user wants to remove their like or like comment
  if (comment.likes.users.includes(req.user._id)) {
    //if it includes user id, remove the user id from the array
    //store the remaining ids in the array in removeLike variable
    const removeLike = comment.likes.users.filter((like) => {
      like !== req.user;
    });
    //use the new array "removeLike", to update the comment like field
    comment.likes = {
      counts: removeLike.length,
      users: removeLike,
    };
  } else {
    //user id is not in the like array, that means user wants to like the comment
    const newLike = comment.likes.users.push(req.user);
    comment.likes.counts = comment.likes.users.length;
  }
  await comment.save();
  res.send(id);
};

module.exports.likeReply = async (req, res) => {
  const { id } = req.params;
  //find the reply
  const reply = await Reply.findById(id);
  //check if the user has liked the reply before by checking if user id is in reply.likes array property
  //to know if user wants to remove their like or like reply
  if (reply.likes.users.includes(req.user._id)) {
    //if it includes user id, remove the user id from the array
    //store the remaining ids in the array in removeLike variable
    const removeLike = reply.likes.users.filter((like) => {
      like !== req.user;
    });
    //use the new array "removeLike", to update the comment like field
    reply.likes = {
      counts: removeLike.length,
      users: removeLike,
    };
  } else {
    //user id is not in the like array, that means user wants to like the comment
    const newLike = reply.likes.users.push(req.user);
    reply.likes.counts = reply.likes.users.length;
  }
  await reply.save();
  res.send(id);
};

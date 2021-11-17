const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comment: String,
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
    likes: {
      counts: {
        type: Number,
        default: 0,
      },
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;

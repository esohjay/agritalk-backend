const mongoose = require("mongoose");

const ReplySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reply: String,
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

const Reply = mongoose.model("Reply", ReplySchema);
module.exports = Reply;

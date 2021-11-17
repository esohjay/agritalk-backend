const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  url: String,
  filename: String,
});

const PostSchema = new mongoose.Schema(
  {
    title: String,
    category: String,

    description: Object,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: {
      counts: {
        type: Number,
        default: 0,
      },
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    image: ImageSchema,
    postImages: [ImageSchema],
    tags: Array,
    isDraft: Boolean,
  },

  { timestamps: true, minimize: false }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;

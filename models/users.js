const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  url: String,
  filename: String,
});
const UserSchema = new mongoose.Schema(
  {
    fullname: String,
    username: { type: String, unique: true },
    email: String,
    image: ImageSchema,
    password: String,
    isAdmin: { type: Boolean, default: false },
    socials: {
      facebook: String,
      twitter: String,
      whatsapp: String,
      instagram: String,
      linkedIn: String,
    },
    bio: String,
    location: String,
    bookmarkedPosts: [{ id: String, title: String }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;

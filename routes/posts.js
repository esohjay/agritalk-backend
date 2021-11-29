const express = require("express");
const catchAsync = require("../utils/catchAsync.js");
const { isAuth, isPostAuthor } = require("../utils/utils.js");
const {
  getPost,
  allPosts,
  createPost,
  editPost,
  deletePost,
  uploadImage,
  likePost,
  changePostStatus,
  getUserPosts,
} = require("../controllers/posts.js");
const multer = require("multer");

const { storage } = require("../cloudinary/index.js");
const upload = multer({ storage });

const router = express.Router();

router.post("/", isAuth, catchAsync(createPost));
router.get("/", catchAsync(allPosts));
router.get("/user/:id", catchAsync(getUserPosts));
router.post("/upload", upload.single("file"), catchAsync(uploadImage));
router.get("/:id", catchAsync(getPost));
router.put("/like/:id", isAuth, catchAsync(likePost));
router.put("/:id", isAuth, isPostAuthor, catchAsync(editPost));
router.put("/status/:id", isAuth, isPostAuthor, catchAsync(changePostStatus));
router.delete("/:id", isAuth, isPostAuthor, catchAsync(deletePost));

module.exports = router;

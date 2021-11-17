const express = require("express");
const catchAsync = require("../utils/catchAsync.js");
const { isAuth } = require("../utils/utils.js");
const {
  getComment,
  allComments,
  createComment,
  createCommentReply,
  editComment,
  deleteComment,
  likeComment,
  editReply,
  deleteReply,
  likeReply,
} = require("../controllers/comments.js");

const router = express.Router();

router.post("/:id", isAuth, catchAsync(createComment));
router.post("/reply/:id", isAuth, catchAsync(createCommentReply));
router.get("/", catchAsync(allComments));
router.get("/:id", catchAsync(getComment));
router.put("/:id", isAuth, catchAsync(editComment));
router.put("/like/:id", isAuth, catchAsync(likeComment));
router.delete("/:id", catchAsync(deleteComment));

router.put("/reply/:id", isAuth, catchAsync(editReply));
router.put("/like-reply/:id", isAuth, catchAsync(likeReply));
router.delete("/reply/:id", catchAsync(deleteReply));

module.exports = router;

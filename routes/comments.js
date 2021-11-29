const express = require("express");
const catchAsync = require("../utils/catchAsync.js");
const { isAuth, isReplyAuthor, isCommentAuthor } = require("../utils/utils.js");
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
router.put("/:id", isAuth, isCommentAuthor, catchAsync(editComment));
router.put("/like/:id", isAuth, catchAsync(likeComment));
router.delete("/:id", isAuth, isCommentAuthor, catchAsync(deleteComment));

router.put("/reply/:id", isAuth, isReplyAuthor, catchAsync(editReply));
router.put("/like-reply/:id", isAuth, catchAsync(likeReply));
router.delete("/reply/:id", isAuth, isReplyAuthor, catchAsync(deleteReply));

module.exports = router;

const express = require("express");
const catchAsync = require("../utils/catchAsync.js");
const {
  getUser,
  allUsers,
  createUser,
  signinUser,
  editUser,
  deleteUser,
  changePassword,
  bookmarkPost,
  createMessage,
  changeAdminStatus,
  removeFromBookmark,
} = require("../controllers/users.js");
const { isAdmin, isAuth } = require("../utils/utils.js");

const router = express.Router();

router.post("/", catchAsync(createUser));
router.post("/contact", catchAsync(createMessage));
router.post("/signin", catchAsync(signinUser));
router.put("/is-admin/:id", isAuth, isAdmin, catchAsync(changeAdminStatus));
router.get("/", isAuth, isAdmin, catchAsync(allUsers));
router.put("/bookmark-posts", isAuth, catchAsync(bookmarkPost));
router.put(
  "/bookmark-posts/remove/:id",
  isAuth,
  catchAsync(removeFromBookmark)
);
router.get("/:id", catchAsync(getUser));
router.put("/:id", isAuth, catchAsync(editUser));
router.put("/password/:id", isAuth, catchAsync(changePassword));
router.delete("/:id", isAuth, catchAsync(deleteUser));

module.exports = router;

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
} = require("../controllers/users.js");
const { isAdmin, isAuth } = require("../utils/utils.js");

const router = express.Router();

router.post("/", catchAsync(createUser));
router.post("/signin", catchAsync(signinUser));
router.get("/", catchAsync(allUsers));
router.put("/bookmark-posts/:id", isAuth, catchAsync(bookmarkPost));
router.get("/:id", catchAsync(getUser));
router.put("/:id", catchAsync(editUser));
router.put("/password/:id", catchAsync(changePassword));
router.delete("/:id", isAuth, isAdmin, catchAsync(deleteUser));

module.exports = router;

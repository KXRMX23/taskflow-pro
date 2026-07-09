const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");
const {
  uploadProfileImage,
} = require("../controllers/userController");

router.put(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  uploadProfileImage
);

module.exports = router;
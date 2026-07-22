const express = require("express");
const router = express.Router();

const { createTeam } = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createTeam);

module.exports = router;
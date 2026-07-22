const express = require("express");
const router = express.Router();

const { createTeam, addTeamMember, getMyTeams, getTeamMembers, removeTeamMember, } = require("../controllers/teamController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createTeam);
router.post("/:teamId/members", authMiddleware, addTeamMember);
router.get("/", authMiddleware, getMyTeams);
router.get("/:teamId/members", authMiddleware, getTeamMembers);
router.delete("/:teamId/members/:userId", authMiddleware, removeTeamMember);

module.exports = router;
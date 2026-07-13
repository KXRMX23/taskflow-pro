const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  getArchivedTasks,
  getActivityLogs,
  updateTask,
  archiveTask,
  restoreTask,
  deleteTask,
} = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.post(
  "/", 
  authMiddleware,
  upload.single("attachment"),
  createTask
);

router.get("/", authMiddleware, getTasks);
router.get(
  "/archived",
  authMiddleware,
  getArchivedTasks
);
router.get("/:id/activity", authMiddleware, getActivityLogs);
router.put(
  "/:id",
  authMiddleware,
  upload.single("attachment"),
  updateTask
);

router.put(
  "/:id/archive",
  authMiddleware,
  archiveTask
);

router.put(
  "/:id/restore",
  authMiddleware,
  restoreTask
);
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;
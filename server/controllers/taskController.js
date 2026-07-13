const db = require("../config/db");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Create Task
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, tags, due_date, comments } = req.body;
    const userId = req.user.id; // Get user ID from the authenticated user

let attachment = "";

if (req.file) {
const result = await new Promise((resolve, reject) => {
const stream = cloudinary.uploader.upload_stream(
{
folder: "taskflow-attachments",
resource_type: "auto",
},
(error, result) => {
if (error) reject(error);
else resolve(result);
}
);

streamifier.createReadStream(req.file.buffer).pipe(stream);
});

attachment = result.secure_url;
}

    const formattedDueDate = !due_date ? null : due_date; // Set to null if empty string

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const newTask = await db.query(
      `INSERT INTO tasks(title, description, status, priority, tags, due_date, comments, attachment, user_id)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, status, priority, tags, formattedDueDate, comments, attachment, userId]
    );

    await db.query(
      `INSERT INTO activity_logs (task_id, action)
       VALUES ($1, $2)`,
       [newTask.rows[0].id, "Task Created"]
    );

    res.status(201).json({
      message: "Task Created Successfully",
      task: newTask.rows[0],
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Get All Tasks
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the authenticated user

    const tasks = await db.query(
      'SELECT * FROM tasks WHERE user_id = $1  AND is_archived = FALSE ORDER BY id ASC',
      [userId]
    );

    res.status(200).json(tasks.rows);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getArchivedTasks = async (req, res) => {
try {
const userId = req.user.id;

const archivedTasks = await db.query(
`
SELECT *
FROM tasks
WHERE user_id = $1
AND is_archived = TRUE
ORDER BY id DESC;
`,
[userId]
);

res.status(200).json(archivedTasks.rows);
} catch (error) {
console.log(error);

res.status(500).json({
message: "Server Error",
});
}
};

const getActivityLogs = async (req, res) => {
try {
const { id } = req.params;

const logs = await db.query(
`
SELECT *
FROM activity_logs
WHERE task_id = $1
ORDER BY created_at DESC
`,
[id]
);

res.status(200).json(logs.rows);

} catch (error) {
console.log(error);

res.status(500).json({
message: "Server Error",
});
}
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, tags, due_date, comments } = req.body;
    const formattedDueDate = due_date === "" ? null : due_date; // Set to null if empty string

    const updatedTask = await db.query(
      `UPDATE tasks
       SET title=$1,
           description=$2,
           status=$3,
           priority=$4,
           tags=$5,
           due_date=$6,
           comments=$7
       WHERE id=$8
       AND user_id=$9
       RETURNING *`,
      [title, description, status, priority, tags, formattedDueDate, comments, id, req.user.id]
    );

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await db.query(
`INSERT INTO activity_logs (task_id, action)
VALUES ($1, $2)`,
[updatedTask.rows[0].id, "Task Updated"]
);

    res.status(200).json({
      message: "Task Updated Successfully",
      task: updatedTask.rows[0],
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

const archiveTask = async (req, res) => {
try {
const { id } = req.params;

// archive Task
const archivedTask = await db.query(
`
UPDATE tasks
SET is_archived = TRUE
WHERE id = $1
RETURNING *;
`,
[id]
);

if (archivedTask.rows.length === 0) {
return res.status(404).json({
message: "Task not found",
});
}

res.status(200).json({
message: "Task archived successfully",
task: archivedTask.rows[0],
});
} catch (error) {
console.log(error);

res.status(500).json({
message: "Server Error",
});
}
};

// Restore Task
const restoreTask = async (req, res) => {
try {
const { id } = req.params;

const restoredTask = await db.query(
`
UPDATE tasks
SET is_archived = FALSE
WHERE id = $1
RETURNING *;
`,
[id]
);

if (restoredTask.rows.length === 0) {
return res.status(404).json({
message: "Task not found",
});
}

res.status(200).json({
message: "Task restored successfully",
task: restoredTask.rows[0],
});
} catch (error) {
console.log(error);

res.status(500).json({
message: "Server Error",
});
}
};



// Delete Task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await db.query(
      "DELETE FROM tasks WHERE id=$1 AND user_id=$2 RETURNING *",
      [id, req.user.id]
    );

    if (deletedTask.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task Deleted Successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getArchivedTasks,
  getActivityLogs,
  updateTask,
  archiveTask,
  restoreTask,
  deleteTask,
};
const db = require("../config/db");

// Create Task
const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const userId = req.user.id; // Get user ID from the authenticated user

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const newTask = await db.query(
      `INSERT INTO tasks(title, description, status, user_id)
       VALUES($1, $2, $3, $4)
       RETURNING *`,
      [title, description, status, userId]
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
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY id ASC',
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

// Update Task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const updatedTask = await db.query(
      `UPDATE tasks
       SET title=$1,
           description=$2,
           status=$3
       WHERE id=$4
       and user_id=$5
       RETURNING *`,
      [title, description, status, id, req.user.id]
    );

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

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
  updateTask,
  deleteTask,
};
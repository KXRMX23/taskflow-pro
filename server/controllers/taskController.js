const db = require("../config/db");

// Create Task
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const newTask = await db.query(
      `INSERT INTO tasks(title, description)
       VALUES($1, $2)
       RETURNING *`,
      [title, description]
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
    const tasks = await db.query(
      "SELECT * FROM tasks ORDER BY id ASC"
    );

    res.status(200).json(tasks.rows);

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
};
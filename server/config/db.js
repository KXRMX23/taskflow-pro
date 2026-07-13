const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.connect()
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch((err) => console.error("❌ Database Connection Error:", err));

module.exports = pool;

// Create Tasks Table
const createTasksTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        priority VARCHAR(50) DEFAULT 'Medium',
        tags TEXT DEFAULT '',
        comments TEXT DEFAULT '',
        attachment TEXT DEFAULT '',
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '';
    `); 
   
    console.log("✅ tags column verified");

    await pool.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS comments TEXT DEFAULT '';
    `);

    console.log("✅ comments column verified");

    await pool.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS attachment TEXT DEFAULT '';
    `);

    console.log("✅ attachment column verified");

    console.log("✅ Tasks table created");
  } catch (error) {
    console.log(error);
  }
};

createTasksTable();
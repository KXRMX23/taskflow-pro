const pool = require("../config/db");

const createUsersTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      profile_image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

try {
await pool.query(query);
console.log("✅ CREATE TABLE executed");

await pool.query(`
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_image TEXT;
`);

console.log("✅ profile_image column verified");
} catch (err) {
console.error(err);
}}
require("./config/db");

const createUsersTable = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("🚀 TaskFlow Backend is Running!");
});

const PORT = process.env.PORT || 5000;

createUsersTable(); // Call the function to create the users table

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
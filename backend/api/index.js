// Vercel serverless entry point
const app = require("../app");
const connectDB = require("../db");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error("DB connection failed:", error.message);
    return res.status(500).json({ message: "Database connection failed" });
  }
  return app(req, res);
};

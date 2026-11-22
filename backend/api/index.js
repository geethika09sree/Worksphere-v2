// Vercel serverless entry point
const app = require("../app");
const connectDB = require("../db");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error("DB connection failed:", error.message);
    return res.status(500).json({
      message: "Database connection failed",
      reason:
        error.name +
        ": " +
        String(error.message)
          .replace(/mongodb(\+srv)?:\/\/\S+/g, "[uri hidden]")
          .slice(0, 200),
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
    });
  }
  return app(req, res);
};
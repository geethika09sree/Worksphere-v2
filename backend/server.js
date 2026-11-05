// Local / traditional-host entry point. On Vercel, api/index.js is used instead.
const app = require("./app");
const connectDB = require("./db");

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => console.log(`WorkSphere server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  });


const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getMe
} = require("../controllers/authController");

// Registration
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Current user
router.get("/me", protect, getMe);

module.exports = router;


const express = require("express");
const router = express.Router();

const {
  checkIn,
  checkOut,
  getAttendance
} = require("../controllers/attendanceController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/checkin", checkIn);
router.post("/checkout", checkOut);

// Controller filters records according to the logged-in user
router.get("/", getAttendance);

module.exports = router;

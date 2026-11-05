const express = require("express");
const router = express.Router();

const { getHolidays } = require("../controllers/externalController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/holidays", getHolidays);

module.exports = router;

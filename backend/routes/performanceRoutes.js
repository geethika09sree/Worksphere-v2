
const express = require("express");
const router = express.Router();

const {
  getMyPerformance,
  getPerformance,
  addPerformance,
  updatePerformance,
  deletePerformance
} = require("../controllers/performanceController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

router.use(protect);

// Employee: own reviews (before the role guard)
router.get("/my", getMyPerformance);

router.use(authorizeRoles("Admin", "HR"));

router.get("/", getPerformance);
router.post("/", addPerformance);
router.put("/:id", updatePerformance);
router.delete("/:id", deletePerformance);

module.exports = router;

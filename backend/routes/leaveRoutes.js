
const express = require("express");
const router = express.Router();

const {
  applyLeave,
  getLeaves,
  reviewLeave
} = require("../controllers/leaveController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", applyLeave);
router.get("/", getLeaves);
router.patch(
  "/:id/review",
  authorizeRoles("Admin", "HR"),
  reviewLeave
);

module.exports = router;

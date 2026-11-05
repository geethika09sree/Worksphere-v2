
const express = require("express");
const router = express.Router();

const {
  getPayroll,
  createPayroll,
  updatePayrollStatus
} = require("../controllers/payrollController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorizeRoles("Admin", "HR"));

router.get("/", getPayroll);
router.post("/", createPayroll);
router.patch("/:id/status", updatePayrollStatus);

module.exports = router;


const express = require("express");
const router = express.Router();

const {
  getMyEmployee,
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

router.use(protect);

// Any logged-in user can read their own record (must come before :id)
router.get("/me", getMyEmployee);

// Only Admin and HR can manage employees
router.use(authorizeRoles("Admin", "HR"));

router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.post("/", addEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;

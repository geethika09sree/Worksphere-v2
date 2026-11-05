
const express = require("express");
const router = express.Router();

const {
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment
} = require("../controllers/departmentController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorizeRoles("Admin", "HR"));

router.get("/", getDepartments);
router.post("/", addDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

module.exports = router;

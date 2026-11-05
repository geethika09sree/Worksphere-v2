
const express = require("express");
const router = express.Router();

const {
  getFinance,
  addFinance,
  updateFinance,
  deleteFinance
} = require("../controllers/financeController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorizeRoles("Admin", "HR"));

router.get("/", getFinance);
router.post("/", addFinance);
router.put("/:id", updateFinance);
router.delete("/:id", deleteFinance);

module.exports = router;

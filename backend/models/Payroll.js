
const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },

    year: {
      type: Number,
      required: true
    },

    basicSalary: {
      type: Number,
      required: true,
      min: 0
    },

    allowances: {
      type: Number,
      default: 0,
      min: 0
    },

    deductions: {
      type: Number,
      default: 0,
      min: 0
    },

    netSalary: {
      type: Number,
      required: true,
      min: 0
    },

    paymentDate: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

payrollSchema.index(
  { employee: 1, month: 1, year: 1 },
  { unique: true }
);

module.exports = mongoose.model("Payroll", payrollSchema);


const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    manager: {
      type: String,
      default: ""
    },

    budget: {
      type: Number,
      default: 0,
      min: 0
    },

    employeeCount: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);

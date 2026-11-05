
const mongoose = require("mongoose");

const financeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    transactionDate: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Completed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Finance", financeSchema);

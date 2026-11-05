
const Finance = require("../models/Finance");

const getFinance = async (req, res) => {
  try {
    const records = await Finance.find().sort({
      transactionDate: -1
    });

    const income = records
      .filter(item => item.type === "Income")
      .reduce((sum, item) => sum + item.amount, 0);

    const expenses = records
      .filter(item => item.type === "Expense")
      .reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      records,
      summary: {
        income,
        expenses,
        balance: income - expenses
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addFinance = async (req, res) => {
  try {
    const {
      type,
      category,
      description,
      amount,
      transactionDate,
      status
    } = req.body;

    if (!type || !category || amount == null) {
      return res.status(400).json({
        message: "Type, category and amount are required"
      });
    }

    const record = await Finance.create({
      type,
      category,
      description,
      amount,
      transactionDate,
      status
    });

    res.status(201).json({
      message: "Transaction added successfully",
      record
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateFinance = async (req, res) => {
  try {
    const record = await Finance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.status(200).json({
      message: "Transaction updated",
      record
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteFinance = async (req, res) => {
  try {
    const record = await Finance.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Transaction not found"
      });
    }

    res.status(200).json({
      message: "Transaction deleted"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFinance,
  addFinance,
  updateFinance,
  deleteFinance
};

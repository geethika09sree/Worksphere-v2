
const Performance = require("../models/Performance");
const Employee = require("../models/Employee");

const getPerformance = async (req, res) => {
  try {
    const records = await Performance.find()
      .populate("employee", "employeeId name department")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logged-in employee's own reviews
const getMyPerformance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.user.employeeId });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const records = await Performance.find({ employee: employee._id }).sort({ createdAt: -1 });

    res.status(200).json({ count: records.length, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addPerformance = async (req, res) => {
  try {
    const {
      employee,
      reviewPeriod,
      rating,
      goals,
      achievements,
      feedback
    } = req.body;

    if (!employee || !reviewPeriod || rating == null) {
      return res.status(400).json({
        message: "Employee, review period and rating are required"
      });
    }

    const record = await Performance.create({
      employee,
      reviewPeriod,
      rating,
      goals,
      achievements,
      feedback
    });

    res.status(201).json({
      message: "Performance review created",
      record
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePerformance = async (req, res) => {
  try {
    const record = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        message: "Performance record not found"
      });
    }

    res.status(200).json({
      message: "Performance record updated",
      record
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePerformance = async (req, res) => {
  try {
    const record = await Performance.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        message: "Performance record not found"
      });
    }

    res.status(200).json({
      message: "Performance record deleted"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyPerformance,
  getPerformance,
  addPerformance,
  updatePerformance,
  deletePerformance
};

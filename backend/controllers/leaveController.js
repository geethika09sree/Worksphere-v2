
const Leave = require("../models/Leave");
const Employee = require("../models/Employee");

// APPLY FOR LEAVE
const applyLeave = async (req, res) => {
  try {
    let employee;

    if (req.user.role === "Employee") {
      employee = await Employee.findOne({
        employeeId: req.user.employeeId
      });
    } else {
     employee = await Employee.findOne({
  $or: [
    { _id: req.body.employeeId.match(/^[0-9a-fA-F]{24}$/) ? req.body.employeeId : null },
    { employeeId: req.body.employeeId }
  ]
});
    }

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        message: "Please provide all leave details"
      });
    }

    if (
      new Date(endDate) < new Date(startDate) ||
      new Date(startDate) < new Date("2000-01-01") ||
      isNaN(new Date(startDate)) ||
      isNaN(new Date(endDate))
    ) {
      return res.status(400).json({
        message: "Please provide valid leave dates"
      });
    }

    const leave = await Leave.create({
      employee: employee._id,
      leaveType,
      startDate,
      endDate,
      reason
    });

    res.status(201).json({
      message: "Leave application submitted",
      leave
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET LEAVES
const getLeaves = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "Employee") {
      const employee = await Employee.findOne({
        employeeId: req.user.employeeId
      });

      if (!employee) {
        return res.status(404).json({
          message: "Employee profile not found"
        });
      }

      filter.employee = employee._id;
    }

    const leaves = await Leave.find(filter)
      .populate("employee", "employeeId name department")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: leaves.length,
      leaves
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REVIEW LEAVE
const reviewLeave = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Approved or Rejected"
      });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewedBy: req.user._id
      },
      { new: true, runValidators: true }
    );

    if (!leave) {
      return res.status(404).json({
        message: "Leave application not found"
      });
    }

    res.status(200).json({
      message: "Leave application updated",
      leave
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyLeave, getLeaves, reviewLeave };

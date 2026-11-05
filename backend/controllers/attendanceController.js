
const Attendance = require("../models/Attendance");
const Employee = require("../models/Employee");

const getTargetEmployee = async (req, employeeId) => {
  if (req.user.role === "Employee") {
    if (!req.user.employeeId) return null;

    return Employee.findOne({
      employeeId: req.user.employeeId
    });
  }

  if (!employeeId) return null;

  return Employee.findOne({
    employeeId: employeeId
  });
};

// CHECK IN
const checkIn = async (req, res) => {
  try {
    const employee = await getTargetEmployee(req, req.body.employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found or not linked to your account"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.create({
      employee: employee._id,
      date: today,
      checkIn: new Date(),
      status: "Present"
    });

    res.status(201).json({
      message: "Check-in successful",
      attendance
    });

  } catch (error) {
    res.status(400).json({
      message: "Check-in failed. You may already have checked in today.",
      error: error.message
    });
  }
};

// CHECK OUT
const checkOut = async (req, res) => {
  try {
    const employee = await getTargetEmployee(req, req.body.employeeId);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({
        message: "No check-in record found"
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        message: "Already checked out"
      });
    }

    attendance.checkOut = new Date();
    await attendance.save();

    res.status(200).json({
      message: "Check-out successful",
      attendance
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// GET ATTENDANCE
const getAttendance = async (req, res) => {
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

    const records = await Attendance.find(filter)
      .populate("employee", "employeeId name department")
      .sort({ date: -1 });

    res.status(200).json({
      count: records.length,
      records
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendance
};

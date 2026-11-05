
const Employee = require("../models/Employee");

// GET ALL EMPLOYEES
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch employees",
      error: error.message
    });
  }
};

// GET LOGGED-IN USER'S OWN EMPLOYEE RECORD
const getMyEmployee = async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(404).json({ message: "No employee record linked to your account" });
    }

    const employee = await Employee.findOne({ employeeId: req.user.employeeId });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE EMPLOYEE
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch employee",
      error: error.message
    });
  }
};

// ADD EMPLOYEE
const addEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      joiningDate,
      salary
    } = req.body;

    if (!employeeId || !name || !email) {
      return res.status(400).json({
        message: "Employee ID, name and email are required"
      });
    }

    const employee = await Employee.create({
      employeeId,
      name,
      email,
      phone,
      department,
      designation,
      joiningDate,
      salary
    });

    res.status(201).json({
      message: "Employee added successfully",
      employee
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to add employee",
      error: error.message
    });
  }
};

// UPDATE EMPLOYEE
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json({
      message: "Employee updated successfully",
      employee
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to update employee",
      error: error.message
    });
  }
};

// DELETE EMPLOYEE
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found"
      });
    }

    res.status(200).json({
      message: "Employee deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete employee",
      error: error.message
    });
  }
};

module.exports = {
  getMyEmployee,
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee
};

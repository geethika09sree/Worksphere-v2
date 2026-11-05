
const Payroll = require("../models/Payroll");
const Employee = require("../models/Employee");

const getPayroll = async (req, res) => {
  try {
    const records = await Payroll.find()
      .populate("employee", "employeeId name department")
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      count: records.length,
      records
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logged-in employee's own payslips
const getMyPayroll = async (req, res) => {
  try {
    const employee = await Employee.findOne({ employeeId: req.user.employeeId });

    if (!employee) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    const records = await Payroll.find({ employee: employee._id }).sort({ year: -1, month: -1 });

    res.status(200).json({ count: records.length, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPayroll = async (req, res) => {
  try {
    const {
      employee,
      month,
      year,
      basicSalary,
      allowances = 0,
      deductions = 0
    } = req.body;

    if (
      !employee ||
      month == null ||
      year == null ||
      basicSalary == null
    ) {
      return res.status(400).json({
        message: "Employee, month, year and basic salary are required"
      });
    }

    const netSalary =
      Number(basicSalary) +
      Number(allowances) -
      Number(deductions);

    if (
      !Number.isFinite(netSalary) ||
      !Number.isFinite(Number(basicSalary)) ||
      !Number.isFinite(Number(allowances)) ||
      !Number.isFinite(Number(deductions)) ||
      netSalary < 0
    ) {
      return res.status(400).json({
        message: "Invalid salary values"
      });
    }

    const payroll = await Payroll.create({
      employee,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      netSalary
    });

    res.status(201).json({
      message: "Payroll created successfully",
      payroll
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePayrollStatus = async (req, res) => {
  try {
    const { status, paymentDate } = req.body;

    if (!["Pending", "Paid"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Pending or Paid"
      });
    }

    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      {
        status,
        paymentDate: status === "Paid"
          ? (paymentDate || new Date())
          : null
      },
      { new: true, runValidators: true }
    );

    if (!payroll) {
      return res.status(404).json({
        message: "Payroll record not found"
      });
    }

    res.status(200).json({
      message: "Payroll status updated",
      payroll
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getMyPayroll,
  getPayroll,
  createPayroll,
  updatePayrollStatus
};

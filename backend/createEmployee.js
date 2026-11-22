// One-off bootstrap: creates ONE Employee login (and its linked Employee record),
// or resets that employee's password if the login already exists.
// Run from the backend folder: `npm run create-employee`
// Reads from .env: MONGO_URI, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD (min 12 chars),
// and optionally EMPLOYEE_NAME, EMPLOYEE_ID, EMPLOYEE_DEPARTMENT, EMPLOYEE_DESIGNATION
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");
const Employee = require("./models/Employee");

async function run() {
  try {
    const email = (process.env.EMPLOYEE_EMAIL || "").trim().toLowerCase();
    const password = process.env.EMPLOYEE_PASSWORD || "";
    const name = (process.env.EMPLOYEE_NAME || "Employee").trim();
    const wantedId = (process.env.EMPLOYEE_ID || "EMP001").trim();

    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing.");
    if (!email || password.length < 12) {
      throw new Error("Set EMPLOYEE_EMAIL and an EMPLOYEE_PASSWORD of at least 12 characters.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    // 1) Never touch an Admin/HR account by accident
    let user = await User.findOne({ email });
    if (user && user.role !== "Employee") {
      throw new Error(`${email} already belongs to a ${user.role} account. Use a different email.`);
    }

    // 2) Find or create the Employee record (the pages like My Profile / My Payroll read this)
    let employee = await Employee.findOne({ $or: [{ email }, { employeeId: wantedId }] });

    if (employee && employee.email !== email) {
      throw new Error(`Employee ID ${wantedId} is already used by another email. Change EMPLOYEE_ID.`);
    }

    if (!employee) {
      employee = await Employee.create({
        employeeId: wantedId,
        name,
        email,
        department: process.env.EMPLOYEE_DEPARTMENT || "General",
        designation: process.env.EMPLOYEE_DESIGNATION || "Employee",
      });
      console.log("Employee record created:", employee.employeeId);
    } else {
      console.log("Existing Employee record reused:", employee.employeeId);
    }

    // 3) Create (or reset) the login
    if (user) {
      user.password = password; // hashed by the model's pre-save hook
      user.employeeId = employee.employeeId;
      await user.save();
      console.log("Existing Employee login password updated.");
    } else {
      await User.create({
        name: employee.name,
        email,
        password,
        employeeId: employee.employeeId,
        role: "Employee",
      });
      console.log("Employee login created.");
    }

    console.log("Login email:", email);
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();

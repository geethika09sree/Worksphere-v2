
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Employee = require("../models/Employee");

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d"
  });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  employeeId: user.employeeId,
  role: user.role
});

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password, employeeId} = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters"
      });
    }

    // Check existing email
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    // Only allow linking to an employee record that exists and has this email,
    // otherwise anyone could claim another employee's ID and read their data.
    if (employeeId) {
      const employee = await Employee.findOne({ employeeId });

      if (!employee || employee.email !== email.toLowerCase().trim()) {
        return res.status(400).json({
          message: "Employee ID does not match this email"
        });
      }
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      employeeId,
      role: "Employee"
    });

    res.status(201).json({
      message: "User registered successfully",
      user: publicUser(user)
    });

  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed"
    });
  }
};
// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: publicUser(user)
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed"
    });
  }
};

// CURRENT USER (validates the stored token on app load)
const getMe = async (req, res) => {
  res.status(200).json({ user: publicUser(req.user) });
};

module.exports = { registerUser, loginUser, getMe };

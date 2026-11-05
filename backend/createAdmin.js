// One-off bootstrap: creates the first Admin account, or resets the existing Admin's
// credentials. Run from the backend folder: `npm run create-admin`
// Reads MONGO_URI, ADMIN_NAME (optional), ADMIN_EMAIL and ADMIN_PASSWORD from .env
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function run() {
  try {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "";

    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing.");
    if (!email || password.length < 12) {
      throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    let admin = await User.findOne({ role: "Admin" });

    if (admin) {
      admin.email = email;
      admin.password = password; // hashed by the model's pre-save hook
      await admin.save();
      console.log("Existing Admin credentials updated.");
    } else {
      admin = await User.create({
        name: process.env.ADMIN_NAME || "Administrator",
        email,
        password,
        role: "Admin",
      });
      console.log("Admin account created.");
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

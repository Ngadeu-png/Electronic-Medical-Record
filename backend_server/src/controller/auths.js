const { User } = require("../models/db-models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secret_key = "shdkffhifhihf9847wyry8rhafha";

// ─────────────────────────────────────────────────────────────
//  SIGNUP
// ─────────────────────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, dob, phone, gender, role } =
      req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate MRN for patients
    const mrn =
      role === "patient"
        ? `MRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
        : undefined;

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      dob,
      phone,
      gender,
      role: role || "patient",
      mrn,
    });

    return res.status(201).json({
      message: "User created successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        mrn: newUser.mrn,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ user }, secret_key, {
      expiresIn: "6h",
    });

    return res.status(200).json({
      message: "Login successful",
      token: token,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        mrn: user.mrn,
        dob: user.dob,
        phone: user.phone,
        gender: user.gender,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  RESET PASSWORD
// ─────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ error: "Email and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET PATIENTS  (admin use — returns only patients)
// ─────────────────────────────────────────────────────────────
const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" })
      .select("-password")
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ data: patients, message: "Patients fetched successfully" });
  } catch (err) {
    console.error("Get patients error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

module.exports = {
  signup,
  login,
  resetPassword,
  getPatients,
  secret_key,
};

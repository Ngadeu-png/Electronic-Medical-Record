const { User } = require("../models/db-models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const SENDMAIL = require("../../utils/nodeMailer.config");
const secret_key = "shdkffhifhihf9847wyry8rhafha";
const signup = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, dob, phone, role } =
      req.body;

    const currentYear = new Date().getFullYear();
    const sequenceName = `MRN${currentYear}`;

    const mrn = `MRN-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

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
    if (role === "doctor" && !speciality) {
      return res.status(409).json({ error: "All fields are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      dob,
      phone,
      role,
      mrn,
    });

    if (newUser.role === "doctor") {
      const templatePath = path.join(
        __dirname,
        "../Mailtemplate",
        "doctorTem.html"
      );
      let htmlTemplate = fs.readFileSync(templatePath, "utf-8");
      htmlTemplate = htmlTemplate
        .replace("{{name}}", doctor.name)
        .replace("{{password}}", doctor.password);

      const msg = {
        to: doctor.email,
        subject: "Your Account Has Been Created On CentriCare",
        content: htmlTemplate,
        html: true,
      };
      await SENDMAIL(msg, (success, err) => {
        if (err) {
          console.log(err, "An error occurred while sending the email");
        }
      });
    }
    return res.status(201).json({
      message: "User created successfully",
      user: newUser,
    });
  } catch (err) {
    console.log(err, "heeee");
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

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
      data: user,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

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
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

const getPatients = async (req, res) => {
  try {
    const patients = await User.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ data: patients, message: "Patients fetched successfully" });
  } catch (error) {
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

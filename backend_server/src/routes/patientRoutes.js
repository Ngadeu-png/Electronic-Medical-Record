const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/db-models").User;
const checkIfAuthenticated = require("../middleware.js");

router.use(checkIfAuthenticated);

// GET all patients (role=patient)
router.get("/", async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new patient
router.post("/", async (req, res) => {
  try {
    const { username, email, password, dob, phone, gender } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });
    
    const hashedPassword = await bcrypt.hash(password || "Password123!", 10);
    const mrn = `MRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: "patient",
      dob,
      phone,
      gender,
      mrn,
    });
    await user.save();
    
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single patient by id
router.get("/:id", async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select("-password");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    if (patient.role !== "patient")
      return res.status(403).json({ message: "User is not a patient" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update patient
router.put("/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      select: "-password",
    });
    if (!updated) return res.status(404).json({ message: "Patient not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE patient
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const User = require("../models/db-models").User;

// GET all patients (role=patient)
router.get("/", async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" });
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
    const user = new User({
      username,
      email,
      password,
      role: "patient",
      dob,
      phone,
      gender,
    });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single patient by id
router.get("/:id", async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
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
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

// Assign a doctor to a patient appointment (approve)
router.put("/:id/assign-doctor", async (req, res) => {
  const { doctorId } = req.body;
  try {
    const patient = await User.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    // Here you could also update an Appointment document if you have one;
    // for now we just update the patient's assigned doctor field (if you add it)
    patient.assignedDoctor = doctorId;
    await patient.save();
    res.json({ message: "Doctor assigned to patient", patient });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
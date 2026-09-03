const { MedicalRecord } = require("../models/db-models");

const addRecord = async (req, res) => {
  try {
    console.log("========== ADD MEDICAL RECORD ==========");
    console.log("BODY:", req.body);
    console.log("Patient:", req.body.patient);
    console.log("Doctor:", req.body.doctor);
    console.log("Appointment:", req.body.appointment);
    console.log("=========================================");
    const {
      patient,
      appointment,
      doctor,
      noteType,
      subjective,
      objective,
      assessment,
      plan,
    } = req.body;
    if (
      !patient ||
      !appointment ||
      !doctor ||
      !noteType ||
      !subjective ||
      !objective ||
      !assessment ||
      !plan
    ) {
      return res.status(400).json({ error: "fields are required" });
    }
    const newRecord = await MedicalRecord.create({
      patient,
      appointment,
      doctor,
      noteType,
      subjective,
      objective,
      assessment,
      plan,
      isSigned: true,  
      signedAt: new Date()
    });
    return res.status(201).json({
      message: "Patient record added successfully",
      record: newRecord,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
const getPatientRecords = async (req, res) => {
  try {
    const notes = await MedicalRecord.find({ patient: req.params.patientId })
      .populate("doctor", "name specialty")
      .populate("appointment", "appointmentDate type status reason")
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ data: notes, message: "Records fetched successfully" });
  } catch (err) {
    console.error("Error fetching records:", err);
    res.status(500).json({ error: err.message });
  }
};

const signRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    record.isSigned = true;
    record.signedAt = new Date();
    await record.save();
    return res
      .status(200)
      .json({ message: "Record signed successfully", record });
  } catch (err) {
    console.error("Error signing record:", err);
    res.status(500).json({ error: "Failed to sign record" });
  }
};
module.exports = {
  addRecord,
  getPatientRecords,
  signRecord,
};

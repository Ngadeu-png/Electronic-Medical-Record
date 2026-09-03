const { MedicalRecord, Appoints, Notification } = require("../models/db-models");

// ─────────────────────────────────────────────────────────────
//  Helper: verify doctor has active assignment for this patient
// ─────────────────────────────────────────────────────────────
const verifyDoctorPatientAccess = async (doctorId, patientId) => {
  const activeAppointment = await Appoints.findOne({
    userId: patientId,
    doctorId: doctorId,
    status: { $in: ["assigned", "accepted", "completed"] },
  });
  return !!activeAppointment;
};

// ─────────────────────────────────────────────────────────────
//  CREATE MEDICAL RECORD  (doctor)
// ─────────────────────────────────────────────────────────────
const addRecord = async (req, res) => {
  try {
    const {
      patient,
      appointment,
      noteType,
      subjective,
      objective,
      assessment,
      plan,
    } = req.body;

    const doctorId = req.user._id;
    const doctorRole = req.user.role;

    if (!patient || !appointment || !noteType || !subjective || !objective || !assessment || !plan) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Access control: doctor must be currently assigned to this patient
    if (doctorRole === "doctor") {
      const hasAccess = await verifyDoctorPatientAccess(doctorId, patient);
      if (!hasAccess) {
        return res.status(403).json({
          error: "Forbidden: You are not currently assigned to this patient",
        });
      }
    }

    const newRecord = await MedicalRecord.create({
      patient,
      appointment,
      doctor: doctorId,  // always use the authenticated doctor's ID
      noteType,
      subjective,
      objective,
      assessment,
      plan,
      isSigned: true,
      signedAt: new Date(),
    });

    // Notify patient that a medical record has been created
    await Notification.create({
      recipient: patient,
      type: "medical_record_created",
      message: "A new medical record has been added to your profile by your doctor.",
      relatedAppointment: appointment,
    }).catch((err) => console.warn("Notification failed:", err.message));

    return res.status(201).json({
      message: "Medical record created successfully",
      record: newRecord,
    });
  } catch (err) {
    console.error("Create medical record error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET PATIENT'S MEDICAL RECORDS
//  - Patient: can only see their own
//  - Doctor: must be currently assigned to the patient
//  - Admin: can see all
// ─────────────────────────────────────────────────────────────
const getPatientRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const requestingUser = req.user;

    // Authorization checks
    if (requestingUser.role === "patient") {
      // Patient can only see their own records
      if (requestingUser._id.toString() !== patientId.toString()) {
        return res.status(403).json({
          error: "Forbidden: You can only view your own medical records",
        });
      }
    } else if (requestingUser.role === "doctor") {
      // Doctor must be currently assigned
      const hasAccess = await verifyDoctorPatientAccess(
        requestingUser._id,
        patientId
      );
      if (!hasAccess) {
        return res.status(403).json({
          error: "Forbidden: You are not currently assigned to this patient",
        });
      }
    }
    // admin: no restriction

    const notes = await MedicalRecord.find({ patient: patientId })
      .populate("doctor", "username specialty email")
      .populate("appointment", "appointmentDate type status reason")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      data: notes,
      message: "Records fetched successfully",
    });
  } catch (err) {
    console.error("Get patient records error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  SIGN RECORD  (doctor)
// ─────────────────────────────────────────────────────────────
const signRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const doctorId = req.user._id;

    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }

    // Only the creating doctor can sign
    if (record.doctor.toString() !== doctorId.toString()) {
      return res.status(403).json({ error: "Forbidden: You did not create this record" });
    }

    record.isSigned = true;
    record.signedAt = new Date();
    await record.save();

    return res.status(200).json({ message: "Record signed successfully", record });
  } catch (err) {
    console.error("Sign record error:", err);
    return res.status(500).json({ error: "Failed to sign record" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET ALL MEDICAL RECORDS  (admin only)
// ─────────────────────────────────────────────────────────────
const getAllRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate("doctor", "username specialty")
      .populate("patient", "username email mrn")
      .populate("appointment", "appointmentDate type status")
      .sort({ createdAt: -1 });

    return res.status(200).json({ data: records, message: "All records fetched" });
  } catch (err) {
    console.error("Get all records error:", err);
    return res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addRecord,
  getPatientRecords,
  signRecord,
  getAllRecords,
};

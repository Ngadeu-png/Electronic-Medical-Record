const {
  User,
  EmergencyMedicalProfile,
  EmergencyContact,
  EmergencyAccessLog,
} = require("../models/db-models");

// ─────────────────────────────────────────────────────────────
//  DOCTOR / HOSPITAL EMERGENCY PATIENT PROFILE
//  Pulls emergency-critical info + contacts, records access log
// ─────────────────────────────────────────────────────────────
const getPatientEmergencyProfile = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reason = req.query.reason || "Emergency Consultation / Clinical Review";

    const patient = await User.findById(patientId).select(
      "username email mrn dob phone gender photo address"
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const [emergencyProfile, emergencyContacts] = await Promise.all([
      EmergencyMedicalProfile.findOne({ patient: patientId }),
      EmergencyContact.find({ patient: patientId, isActive: true })
        .select("firstName lastName phone alternativePhone email relationship priority photo")
        .sort({ priority: 1 }),
    ]);

    // Record access in audit log
    try {
      await EmergencyAccessLog.create({
        patient: patientId,
        accessedBy: req.user._id,
        role: req.user.role || "doctor",
        accessType: "doctor_emergency_view",
        reason,
        permissionsUsed: "Emergency Medical Profile Access",
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
        timestamp: new Date(),
      });
    } catch (logErr) {
      console.warn("Emergency audit logging warning:", logErr.message);
    }

    res.json({
      patient,
      emergencyProfile: emergencyProfile || {
        bloodType: "Unknown",
        allergies: [],
        height: null,
        weight: null,
        criticalConditions: [],
        currentImportantMedications: [],
        surgeries: [],
        emergencyWarnings: "No emergency record registered yet",
        emergencyInstructions: "Standard emergency triage protocols apply",
      },
      emergencyContacts: emergencyContacts || [],
    });
  } catch (err) {
    console.error("Emergency profile lookup error:", err);
    res.status(500).json({ message: "Failed to retrieve emergency profile" });
  }
};

// ─────────────────────────────────────────────────────────────
//  EMERGENCY PATIENT SEARCH (By MRN, Name, or Phone)
// ─────────────────────────────────────────────────────────────
const searchPatientsForEmergency = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) {
      return res.json([]);
    }

    const regex = new RegExp(query, "i");
    const patients = await User.find({
      role: "patient",
      $or: [{ username: regex }, { mrn: regex }, { phone: regex }],
    })
      .select("username mrn phone gender dob photo")
      .limit(10);

    res.json(patients);
  } catch (err) {
    console.error("Emergency patient search error:", err);
    res.status(500).json({ message: "Failed to search patient records" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET ACCESS AUDIT LOGS FOR A PATIENT
// ─────────────────────────────────────────────────────────────
const getAccessLogs = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Security check: patients can only inspect their own logs; doctors/admins can inspect
    const isOwner = String(req.user._id) === String(patientId);
    const isStaff = req.user.role === "doctor" || req.user.role === "admin";

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        message: "You are not authorized to view these emergency access logs.",
      });
    }

    const logs = await EmergencyAccessLog.find({ patient: patientId })
      .populate("accessedBy", "username email role specialty")
      .sort({ timestamp: -1 })
      .limit(50);

    res.json(logs);
  } catch (err) {
    console.error("Get emergency access logs error:", err);
    res.status(500).json({ message: "Failed to retrieve access logs" });
  }
};

module.exports = {
  getPatientEmergencyProfile,
  searchPatientsForEmergency,
  getAccessLogs,
};

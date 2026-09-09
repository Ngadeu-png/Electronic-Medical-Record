const mongoose = require("mongoose");
const { generateGeminiResponse } = require("../geminiService");
const { User, Appoints, MedicalRecord, AiChat } = require("../models/db-models");

/**
 * Strict helper to extract and validate authenticated user's ObjectId
 */
const getValidUserId = (user) => {
  if (!user) return null;
  const idStr = user._id || user.id || user._doc?._id;
  if (!idStr) return null;
  const str = idStr.toString();
  if (!mongoose.Types.ObjectId.isValid(str)) return null;
  return new mongoose.Types.ObjectId(str);
};

/**
 * Helper to build comprehensive database context for Gemini
 */
const buildClinicalContext = async (user, { targetPatientId, targetRecordId, targetDoctorId }) => {
  const now = new Date();
  const currentDateStr = now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  let contextSections = [
    `Current System Time & Date: ${currentDateStr}`,
    `Active User: ${user.username} (Role: ${user.role}${user.specialty ? `, Specialty: ${user.specialty}` : ""})`,
  ];

  // ── DOCTOR ROLE CONTEXT ──────────────────────────────────────────────────
  if (user.role === "doctor") {
    // 1. Doctor's own appointments
    const doctorAppointments = await Appoints.find({ doctorId: user._id })
      .populate("userId", "username email mrn dob phone gender")
      .sort({ appointmentDate: 1, createdAt: -1 })
      .lean();

    const apptSummary = doctorAppointments.map((a) => {
      const patientName = a.userId?.username || "Unknown Patient";
      const mrn = a.userId?.mrn || "No MRN";
      const dateStr = a.appointmentDate
        ? new Date(a.appointmentDate).toLocaleString()
        : "Unscheduled date";
      return `- Appointment [ID: ${a._id}] with ${patientName} (MRN: ${mrn}): Type="${a.type}", Status="${a.status}", Scheduled="${dateStr}", Reason="${a.reason}"`;
    });

    contextSections.push(
      `Doctor's Assigned Appointments (${doctorAppointments.length} total):\n${
        apptSummary.length ? apptSummary.join("\n") : "No appointments currently assigned."
      }`
    );

    // 2. Target Specific Patient OR All Patients
    if (targetPatientId) {
      const targetPatient = await User.findById(targetPatientId).select("-password").lean();
      if (targetPatient) {
        contextSections.push(
          `SELECTED TARGET PATIENT:\nName: ${targetPatient.username}, MRN: ${targetPatient.mrn || "N/A"}, DOB: ${
            targetPatient.dob ? new Date(targetPatient.dob).toLocaleDateString() : "N/A"
          }, Gender: ${targetPatient.gender || "N/A"}, Phone: ${targetPatient.phone || "N/A"}, Email: ${targetPatient.email}`
        );

        // Fetch medical records for target patient
        const records = await MedicalRecord.find({ patient: targetPatientId })
          .populate("doctor", "username specialty")
          .sort({ createdAt: -1 })
          .lean();

        const recordSummaries = records.map((r) => {
          const recDate = new Date(r.createdAt).toLocaleDateString();
          const docName = r.doctor?.username || "Attending Doctor";
          return `[Record ID: ${r._id} | Date: ${recDate} | Note: ${r.noteType} | Signed: ${r.isSigned} by Dr. ${docName}]\n  Subjective: ${r.subjective}\n  Objective: ${r.objective}\n  Assessment: ${r.assessment}\n  Plan: ${r.plan}`;
        });

        contextSections.push(
          `Medical Records for Patient ${targetPatient.username} (${records.length} records found):\n${
            recordSummaries.length ? recordSummaries.join("\n---\n") : "No medical records found for this patient."
          }`
        );
      }
    } else {
      // Targeting all patients assigned to this doctor
      const patientIds = [
        ...new Set(
          doctorAppointments.map((a) => a.userId?._id?.toString()).filter(Boolean)
        ),
      ];

      const patients = await User.find({ _id: { $in: patientIds } })
        .select("username mrn dob gender phone email")
        .lean();

      const patientSummary = patients.map(
        (p) => `- Patient: ${p.username} (MRN: ${p.mrn || "N/A"}, Gender: ${p.gender || "N/A"})`
      );

      contextSections.push(
        `Doctor's Assigned Patients Pool (${patients.length} patients):\n${
          patientSummary.length ? patientSummary.join("\n") : "None"
        }`
      );

      // Also provide recent medical records created by this doctor
      const recentDoctorRecords = await MedicalRecord.find({ doctor: user._id })
        .populate("patient", "username mrn")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const recNotes = recentDoctorRecords.map((r) => {
        const pName = r.patient?.username || "Unknown Patient";
        const dStr = new Date(r.createdAt).toLocaleDateString();
        return `- Record for ${pName} on ${dStr} (${r.noteType}): Assessment: "${r.assessment}", Plan: "${r.plan}"`;
      });

      if (recNotes.length) {
        contextSections.push(
          `Recent Medical Records Written By Doctor:\n${recNotes.join("\n")}`
        );
      }
    }
  }

  // ── PATIENT ROLE CONTEXT ─────────────────────────────────────────────────
  else if (user.role === "patient") {
    contextSections.push(
      `Patient Profile: ${user.username}, MRN: ${user.mrn || "N/A"}, DOB: ${
        user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"
      }, Gender: ${user.gender || "N/A"}`
    );

    // 1. Patient's appointments
    const patientAppointments = await Appoints.find({ userId: user._id })
      .populate("doctorId", "username specialty email")
      .sort({ appointmentDate: 1, createdAt: -1 })
      .lean();

    const apptSummary = patientAppointments.map((a) => {
      const docName = a.doctorId ? `Dr. ${a.doctorId.username} (${a.doctorId.specialty || "General"})` : "Pending assignment";
      const dateStr = a.appointmentDate ? new Date(a.appointmentDate).toLocaleString() : "TBD";
      return `- Appointment [ID: ${a._id}] with ${docName}: Type="${a.type}", Status="${a.status}", Scheduled="${dateStr}", Reason="${a.reason}"`;
    });

    contextSections.push(
      `Patient's Appointments (${patientAppointments.length} total):\n${
        apptSummary.length ? apptSummary.join("\n") : "No appointments booked."
      }`
    );

    // 2. Patient's medical records
    const records = await MedicalRecord.find({ patient: user._id })
      .populate("doctor", "username specialty")
      .sort({ createdAt: -1 })
      .lean();

    if (targetRecordId) {
      const focusedRecord = records.find((r) => r._id.toString() === targetRecordId.toString());
      if (focusedRecord) {
        const docName = focusedRecord.doctor?.username || "Doctor";
        contextSections.push(
          `FOCUSED MEDICAL RECORD SELECTED BY PATIENT:\nDate: ${new Date(focusedRecord.createdAt).toLocaleDateString()}\nDoctor: Dr. ${docName} (${focusedRecord.doctor?.specialty || "General"})\nNote Category: ${focusedRecord.noteType}\nSubjective Symptoms: ${focusedRecord.subjective}\nObjective Findings: ${focusedRecord.objective}\nAssessment & Diagnosis: ${focusedRecord.assessment}\nPrescribed Plan & Instructions: ${focusedRecord.plan}`
        );
      }
    } else {
      const recordSummaries = records.map((r) => {
        const dStr = new Date(r.createdAt).toLocaleDateString();
        const docName = r.doctor?.username || "Doctor";
        return `[Record ID: ${r._id} | Date: ${dStr} | Dr. ${docName}]: Note="${r.noteType}", Assessment="${r.assessment}", Plan="${r.plan}"`;
      });

      contextSections.push(
        `Patient Medical Records Summary (${records.length} records):\n${
          recordSummaries.length ? recordSummaries.join("\n") : "No medical records found."
        }`
      );
    }
  }

  // ── ADMIN ROLE CONTEXT ───────────────────────────────────────────────────
  else if (user.role === "admin") {
    contextSections.push("Admin Mode: Hospital-wide access.");

    if (targetPatientId) {
      const targetPatient = await User.findById(targetPatientId).select("-password").lean();
      if (targetPatient) {
        contextSections.push(
          `TARGET PATIENT: ${targetPatient.username} (MRN: ${targetPatient.mrn || "N/A"}, Email: ${targetPatient.email}, Phone: ${targetPatient.phone || "N/A"})`
        );
        const pAppts = await Appoints.find({ userId: targetPatientId })
          .populate("doctorId", "username specialty")
          .lean();
        const pRecs = await MedicalRecord.find({ patient: targetPatientId })
          .populate("doctor", "username specialty")
          .lean();

        contextSections.push(
          `Target Patient Appointments (${pAppts.length}):\n${pAppts.map((a) => `- ${a.type}, Status: ${a.status}, Doctor: ${a.doctorId?.username || "None"}, Reason: ${a.reason}`).join("\n")}`
        );
        contextSections.push(
          `Target Patient Records (${pRecs.length}):\n${pRecs.map((r) => `- ${r.noteType} (${new Date(r.createdAt).toLocaleDateString()}): Assessment: ${r.assessment}, Plan: ${r.plan}`).join("\n")}`
        );
      }
    } else if (targetDoctorId) {
      const targetDoctor = await User.findById(targetDoctorId).select("-password").lean();
      if (targetDoctor) {
        contextSections.push(
          `TARGET DOCTOR: Dr. ${targetDoctor.username} (Specialty: ${targetDoctor.specialty || "General"}, Email: ${targetDoctor.email})`
        );
        const docAppts = await Appoints.find({ doctorId: targetDoctorId })
          .populate("userId", "username mrn")
          .lean();
        contextSections.push(
          `Assigned Appointments (${docAppts.length}):\n${docAppts.map((a) => `- Patient: ${a.userId?.username || "N/A"}, Type: ${a.type}, Status: ${a.status}, Reason: ${a.reason}`).join("\n")}`
        );
      }
    } else {
      // General hospital stats & recent overview
      const [totalPatients, totalDoctors, pendingAppts, activeAppts] = await Promise.all([
        User.countDocuments({ role: "patient" }),
        User.countDocuments({ role: "doctor" }),
        Appoints.countDocuments({ status: { $in: ["pending_admin_assignment", "rejected_by_doctor", "redirected_to_admin"] } }),
        Appoints.countDocuments({ status: { $in: ["assigned", "accepted"] } }),
      ]);

      contextSections.push(
        `CentriCare Hospital Metrics Overview:\n- Total Registered Patients: ${totalPatients}\n- Total Registered Doctors: ${totalDoctors}\n- Pending/Awaiting Assignment Appointments: ${pendingAppts}\n- Active/Accepted Consultations: ${activeAppts}`
      );
    }
  }

  return contextSections.join("\n\n");
};

/**
 * POST /api/ai/ask
 * Handle user queries with dynamic DB context and save conversation history
 */
const handleAiQuery = async (req, res) => {
  try {
    const { prompt, targetPatientId, targetRecordId, targetDoctorId, customContext } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required.",
      });
    }

    const user = req.user;
    const userObjectId = getValidUserId(user);
    if (!userObjectId) {
      return res.status(401).json({
        success: false,
        error: "User authentication required.",
      });
    }

    // 1. Build rich live database context
    const dbContext = await buildClinicalContext(user, {
      targetPatientId,
      targetRecordId,
      targetDoctorId,
    });

    const fullContext = customContext
      ? `${dbContext}\n\nAdditional Note Context:\n${customContext}`
      : dbContext;

    // 2. Generate AI response from Gemini
    const aiResult = await generateGeminiResponse(prompt, fullContext);
    const aiResponse =
      typeof aiResult === "string" ? aiResult : aiResult?.response;

    if (!aiResponse || typeof aiResponse !== "string") {
      throw new Error("Gemini returned an invalid response.");
    }

    // 3. Find target patient name if targetPatientId was specified
    let targetPatientName = undefined;
    if (targetPatientId && mongoose.Types.ObjectId.isValid(targetPatientId)) {
      const p = await User.findById(targetPatientId).select("username").lean();
      if (p) targetPatientName = p.username;
    }

    // 4. Save question and answer in MongoDB with strict user ObjectId
    const chatEntry = await AiChat.create({
      userId: userObjectId,
      role: user.role,
      prompt: prompt.trim(),
      response: aiResponse,
      targetPatientId:
        targetPatientId && mongoose.Types.ObjectId.isValid(targetPatientId)
          ? new mongoose.Types.ObjectId(targetPatientId)
          : undefined,
      targetPatientName: targetPatientName || undefined,
      targetRecordId:
        targetRecordId && mongoose.Types.ObjectId.isValid(targetRecordId)
          ? new mongoose.Types.ObjectId(targetRecordId)
          : undefined,
    });

    return res.status(200).json({
      success: true,
      response: aiResponse,
      chat: chatEntry,
    });
  } catch (error) {
    console.error("Gemini API error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Unable to process the AI request. Please try again.",
    });
  }
};

/**
 * GET /api/ai/history
 * Fetch conversation history strictly isolated to the current authenticated user
 */
const getChatHistory = async (req, res) => {
  try {
    const userObjectId = getValidUserId(req.user);
    if (!userObjectId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required to retrieve chat history.",
        data: [],
      });
    }

    // Strictly match the authenticated user's ObjectId
    const history = await AiChat.find({ userId: userObjectId })
      .sort({ createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get chat history error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve conversation history.",
      data: [],
    });
  }
};

/**
 * DELETE /api/ai/history
 * Clear conversation history strictly for the current authenticated user
 */
const clearChatHistory = async (req, res) => {
  try {
    const userObjectId = getValidUserId(req.user);
    if (!userObjectId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required.",
      });
    }

    // Strictly delete only the authenticated user's records
    await AiChat.deleteMany({ userId: userObjectId });
    return res.status(200).json({
      success: true,
      message: "Conversation history cleared successfully.",
    });
  } catch (error) {
    console.error("Clear chat history error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to clear conversation history.",
    });
  }
};

/**
 * GET /api/ai/context-options
 * Provides options for target dropdowns (patients, records, doctors)
 */
const getContextOptions = async (req, res) => {
  try {
    const user = req.user;
    const result = {
      patients: [],
      records: [],
      doctors: [],
    };

    if (user.role === "doctor") {
      // Get all patients assigned to this doctor
      const appointments = await Appoints.find({ doctorId: user._id })
        .populate("userId", "username mrn email gender dob phone")
        .lean();

      const map = new Map();
      for (const a of appointments) {
        if (a.userId && !map.has(a.userId._id.toString())) {
          map.set(a.userId._id.toString(), {
            _id: a.userId._id,
            username: a.userId.username,
            mrn: a.userId.mrn,
            gender: a.userId.gender,
          });
        }
      }
      result.patients = Array.from(map.values());
    } else if (user.role === "patient") {
      // Get all medical records of this patient
      const records = await MedicalRecord.find({ patient: user._id })
        .populate("doctor", "username specialty")
        .sort({ createdAt: -1 })
        .lean();

      result.records = records.map((r) => ({
        _id: r._id,
        noteType: r.noteType,
        doctorName: r.doctor?.username || "Doctor",
        specialty: r.doctor?.specialty || "General",
        date: r.createdAt,
        assessment: r.assessment,
      }));
    } else if (user.role === "admin") {
      // Get all patients and all doctors
      const [patients, doctors] = await Promise.all([
        User.find({ role: "patient" }).select("username mrn email gender").lean(),
        User.find({ role: "doctor" }).select("username specialty email").lean(),
      ]);
      result.patients = patients;
      result.doctors = doctors;
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get context options error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch context options.",
    });
  }
};

module.exports = {
  handleAiQuery,
  getChatHistory,
  clearChatHistory,
  getContextOptions,
};

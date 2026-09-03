const mongoose = require("mongoose");

// ─────────────────────────────────────────────
//  User Schema  (patients, doctors, admins)
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    mrn: { type: String, unique: true, sparse: true },
    username: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    dob: { type: Date },
    specialty: { type: String },
    phone: { type: String },
    gender: { type: String },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
//  Assignment History Sub-document
// ─────────────────────────────────────────────
const assignmentHistorySchema = new mongoose.Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // admin who assigned
    action: {
      type: String,
      enum: [
        "assigned",
        "accepted",
        "rejected",
        "redirected_to_doctor",
        "redirected_to_admin",
        "unassigned",
        "completed",
      ],
      required: true,
    },
    reason: { type: String }, // rejection / redirection reason
    redirectedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // target doctor if redirecting
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ─────────────────────────────────────────────
//  Appointment Schema
// ─────────────────────────────────────────────
const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // doctorId — the CURRENTLY assigned doctor (null when unassigned)
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["Outpatient", "Inpatient", "Emergency", "Virtual", "Preventive"],
      required: true,
    },
    reason: { type: String, required: true },
    appointmentDate: { type: Date },
    status: {
      type: String,
      enum: [
        "pending_admin_assignment", // just booked, waiting for admin
        "assigned",                 // admin assigned a doctor, awaiting doctor acceptance
        "accepted",                 // doctor accepted the assignment
        "rejected_by_doctor",       // doctor rejected — admin must reassign
        "awaiting_reassignment",    // admin acknowledged rejection, about to reassign
        "redirected_to_doctor",     // doctor redirected to another doctor (pending admin confirm)
        "redirected_to_admin",      // doctor sent back to admin
        "completed",                // consultation done
        "unassigned",               // admin removed doctor assignment
        "cancelled",                // appointment cancelled
      ],
      default: "pending_admin_assignment",
    },
    // Rejection/redirection details from current doctor
    rejectionReason: { type: String },
    redirectionReason: { type: String },
    redirectedToDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Full audit trail
    assignmentHistory: [assignmentHistorySchema],
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
//  Medical Record Schema
//  NOTE: doctor ref uses "User" — doctors are stored in User collection
// ─────────────────────────────────────────────
const MedicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Appointment",
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // ← FIXED: was "Doctor" but doctors live in User collection
    },
    noteType: {
      type: String,
      enum: [
        "Progress Note",
        "Discharge Summary",
        "Referral Note",
        "Consultation Note",
        "Operative Note",
        "History and Physical Note",
        "Admission Note",
        "Death Summary",
      ],
    },
    subjective: { type: String, required: true },
    objective: { type: String, required: true },
    assessment: { type: String, required: true },
    plan: { type: String, required: true },
    isSigned: { type: Boolean, default: false },
    signedAt: { type: Date },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
//  Notification Schema  (in-app)
// ─────────────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "appointment_booked",
        "doctor_assigned",
        "doctor_accepted",
        "doctor_rejected",
        "appointment_completed",
        "redirection_requested",
        "reassignment_needed",
        "medical_record_created",
      ],
    },
    message: { type: String, required: true },
    relatedAppointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
//  AI Chat / Conversation History Schema
// ─────────────────────────────────────────────
const aiChatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    targetPatientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    targetPatientName: { type: String },
    targetRecordId: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalRecord" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Appoints = mongoose.model("Appointment", appointmentSchema);
const MedicalRecord = mongoose.model("MedicalRecord", MedicalRecordSchema);
const Notification = mongoose.model("Notification", notificationSchema);
const AiChat = mongoose.model("AiChat", aiChatSchema);

module.exports = {
  User,
  Appoints,
  MedicalRecord,
  Notification,
  AiChat,
};

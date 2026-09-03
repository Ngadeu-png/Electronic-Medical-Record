const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    mrn: { type: String, unique: true },
    username: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    dob: { type: Date },
    specialty: { type: String },
    phone: { type: String },
    gender: { type: String },
    role: { type: String },
  },
  { timestamps: true }
);

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  Password: { type: String },
});

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      // required: true,
    },
    type: {
      type: String,
      enum: ["Outpatient", "Inpatient", "Emergency", "Virtual", "Preventive"],
      required: true,
    },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    appointmentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const MedicalRecordSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    appointment: {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "Appointment",
    },
    doctor: { type: mongoose.Schema.ObjectId, required: true, ref: "Doctor" },
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

const User = mongoose.model("User", userSchema);
const Doctor = mongoose.model("Doctor", doctorSchema);
const Appoints = mongoose.model("Appointment", appointmentSchema);
const MedicalRecord = mongoose.model("MedicalRecord", MedicalRecordSchema);

module.exports = {
  User,
  Doctor,
  Appoints,
  MedicalRecord,
};

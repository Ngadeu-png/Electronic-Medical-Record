const { Appoints, Notification } = require("../models/db-models");

// ─────────────────────────────────────────────────────────────
//  Helper: create an in-app notification
// ─────────────────────────────────────────────────────────────
const createNotification = async (recipientId, type, message, appointmentId) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      message,
      relatedAppointment: appointmentId,
    });
  } catch (err) {
    console.warn("Notification creation failed:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  BOOK APPOINTMENT  (patient)
// ─────────────────────────────────────────────────────────────
const bookAppointment = async (req, res) => {
  try {
    const { userId, reason, type, appointmentDate } = req.body;

    if (!userId || !type || !reason) {
      return res.status(400).json({ error: "userId, type, and reason are required" });
    }

    const newAppointment = await Appoints.create({
      userId,
      type,
      reason,
      appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
      status: "pending_admin_assignment",
    });

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (err) {
    console.error("Book appointment error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET PATIENT'S OWN APPOINTMENTS  (patient)
// ─────────────────────────────────────────────────────────────
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user._id;

    const appointments = await Appoints.find({ userId })
      .populate("doctorId", "username email specialty")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      data: appointments,
      message: "Appointments fetched successfully",
    });
  } catch (err) {
    console.error("Get my appointments error:", err);
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET ALL APPOINTMENTS  (admin)
// ─────────────────────────────────────────────────────────────
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appoints.find()
      .populate("userId", "username email mrn dob phone gender")
      .populate("doctorId", "username email specialty")
      .sort({ createdAt: -1 });
    return res.status(200).json({ data: appointments });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET APPOINTMENT BY ID
// ─────────────────────────────────────────────────────────────
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appoints.findById(req.params.id)
      .populate("userId", "username email mrn dob phone gender")
      .populate("doctorId", "username email specialty")
      .populate("assignmentHistory.doctor", "username email specialty")
      .populate("assignmentHistory.assignedBy", "username email");

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    return res.status(200).json({ data: appointment });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  DOCTOR: ACCEPT ASSIGNMENT
// ─────────────────────────────────────────────────────────────
const acceptAssignment = async (req, res) => {
  try {
    const { id: appointmentId } = req.params;
    const doctorId = req.user._id;

    const appointment = await Appoints.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Verify this doctor is actually assigned
    if (appointment.doctorId?.toString() !== doctorId.toString()) {
      return res.status(403).json({ error: "You are not assigned to this appointment" });
    }

    if (appointment.status !== "assigned" && appointment.status !== "redirected_to_doctor") {
      return res.status(400).json({ error: "Appointment is not in an assignable state" });
    }

    appointment.assignmentHistory.push({
      doctor: doctorId,
      action: "accepted",
      timestamp: new Date(),
    });

    appointment.status = "accepted";
    await appointment.save();

    // Notify patient
    await createNotification(
      appointment.userId,
      "doctor_accepted",
      "Your assigned doctor has accepted your appointment. You will be seen soon.",
      appointment._id
    );

    return res.status(200).json({
      message: "Assignment accepted successfully",
      status: appointment.status,
    });
  } catch (err) {
    console.error("Accept assignment error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  DOCTOR: REJECT ASSIGNMENT
// ─────────────────────────────────────────────────────────────
const rejectAssignment = async (req, res) => {
  try {
    const { id: appointmentId } = req.params;
    const { reason } = req.body;
    const doctorId = req.user._id;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "A rejection reason is required" });
    }

    const appointment = await Appoints.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.doctorId?.toString() !== doctorId.toString()) {
      return res.status(403).json({ error: "You are not assigned to this appointment" });
    }

    if (!["assigned", "redirected_to_doctor"].includes(appointment.status)) {
      return res.status(400).json({ error: "This appointment cannot be rejected in its current state" });
    }

    appointment.assignmentHistory.push({
      doctor: doctorId,
      action: "rejected",
      reason,
      timestamp: new Date(),
    });

    appointment.status = "rejected_by_doctor";
    appointment.rejectionReason = reason;
    appointment.doctorId = undefined; // Clear assignment

    await appointment.save();

    // Find admins and notify them
    const { User } = require("../models/db-models");
    const admins = await User.find({ role: "admin" }).select("_id");
    for (const admin of admins) {
      await createNotification(
        admin._id,
        "reassignment_needed",
        `A doctor has rejected an appointment assignment. Reason: "${reason}". Please reassign.`,
        appointment._id
      );
    }

    return res.status(200).json({
      message: "Assignment rejected. Admin has been notified.",
      status: appointment.status,
    });
  } catch (err) {
    console.error("Reject assignment error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  DOCTOR: REQUEST REDIRECTION TO ANOTHER DOCTOR
// ─────────────────────────────────────────────────────────────
const requestRedirectionToDoctor = async (req, res) => {
  try {
    const { id: appointmentId } = req.params;
    const { targetDoctorId, reason } = req.body;
    const doctorId = req.user._id;

    if (!targetDoctorId || !reason) {
      return res
        .status(400)
        .json({ error: "targetDoctorId and reason are required" });
    }

    const appointment = await Appoints.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.doctorId?.toString() !== doctorId.toString()) {
      return res.status(403).json({ error: "You are not assigned to this appointment" });
    }

    if (appointment.status !== "accepted") {
      return res
        .status(400)
        .json({ error: "You can only redirect from an accepted assignment" });
    }

    const { User } = require("../models/db-models");
    const targetDoctor = await User.findOne({ _id: targetDoctorId, role: "doctor" });
    if (!targetDoctor) {
      return res.status(404).json({ error: "Target doctor not found" });
    }

    appointment.assignmentHistory.push({
      doctor: doctorId,
      action: "redirected_to_doctor",
      reason,
      redirectedTo: targetDoctorId,
      timestamp: new Date(),
    });

    appointment.status = "redirected_to_doctor";
    appointment.redirectionReason = reason;
    appointment.redirectedToDoctor = targetDoctorId;

    await appointment.save();

    // Notify admins to confirm the redirection
    const admins = await User.find({ role: "admin" }).select("_id");
    for (const admin of admins) {
      await createNotification(
        admin._id,
        "redirection_requested",
        `Dr. ${req.user.username} has requested to redirect a patient to another doctor. Please confirm the reassignment.`,
        appointment._id
      );
    }

    return res.status(200).json({
      message: "Redirection request submitted. Admin will confirm the reassignment.",
      status: appointment.status,
    });
  } catch (err) {
    console.error("Redirect to doctor error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  DOCTOR: REDIRECT BACK TO ADMIN
// ─────────────────────────────────────────────────────────────
const requestRedirectionToAdmin = async (req, res) => {
  try {
    const { id: appointmentId } = req.params;
    const { reason } = req.body;
    const doctorId = req.user._id;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: "A reason is required" });
    }

    const appointment = await Appoints.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.doctorId?.toString() !== doctorId.toString()) {
      return res.status(403).json({ error: "You are not assigned to this appointment" });
    }

    if (!["accepted", "assigned"].includes(appointment.status)) {
      return res
        .status(400)
        .json({ error: "Cannot redirect in current status" });
    }

    appointment.assignmentHistory.push({
      doctor: doctorId,
      action: "redirected_to_admin",
      reason,
      timestamp: new Date(),
    });

    appointment.status = "redirected_to_admin";
    appointment.redirectionReason = reason;
    appointment.doctorId = undefined;

    await appointment.save();

    // Notify admins
    const { User } = require("../models/db-models");
    const admins = await User.find({ role: "admin" }).select("_id");
    for (const admin of admins) {
      await createNotification(
        admin._id,
        "reassignment_needed",
        `Dr. ${req.user.username} has redirected a patient back to admin. Reason: "${reason}". Please reassign.`,
        appointment._id
      );
    }

    return res.status(200).json({
      message: "Patient redirected to admin for reassignment.",
      status: appointment.status,
    });
  } catch (err) {
    console.error("Redirect to admin error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  MARK APPOINTMENT AS COMPLETED  (doctor)
// ─────────────────────────────────────────────────────────────
const completeAppointment = async (req, res) => {
  try {
    const { id: appointmentId } = req.params;
    const doctorId = req.user._id;

    const appointment = await Appoints.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (appointment.doctorId?.toString() !== doctorId.toString()) {
      return res.status(403).json({ error: "You are not assigned to this appointment" });
    }

    if (appointment.status !== "accepted") {
      return res.status(400).json({ error: "Appointment must be accepted before completing" });
    }

    appointment.assignmentHistory.push({
      doctor: doctorId,
      action: "completed",
      timestamp: new Date(),
    });

    appointment.status = "completed";
    await appointment.save();

    await createNotification(
      appointment.userId,
      "appointment_completed",
      "Your appointment has been completed. Your medical record will be available soon.",
      appointment._id
    );

    return res.status(200).json({
      message: "Appointment marked as completed",
      status: appointment.status,
    });
  } catch (err) {
    console.error("Complete appointment error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  UPDATE APPOINTMENT STATUS  (generic, admin use)
// ─────────────────────────────────────────────────────────────
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appoints.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    return res.status(200).json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  DELETE APPOINTMENT
// ─────────────────────────────────────────────────────────────
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appoints.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    return res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointments,
  getAppointmentById,
  acceptAssignment,
  rejectAssignment,
  requestRedirectionToDoctor,
  requestRedirectionToAdmin,
  completeAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};

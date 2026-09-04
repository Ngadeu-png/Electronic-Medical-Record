const { Types } = require("mongoose");
const { Appoints, User, Notification } = require("../models/db-models.js");


const createNotification = async (recipientId, type, message, appointmentId) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      message,
      relatedAppointment: appointmentId,
    });
  } catch (err) {
    console.warn("Notification creation failed (non-critical):", err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  GET ALL APPOINTMENTS  (admin)
// ─────────────────────────────────────────────────────────────
const getAllAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const appointments = await Appoints.find(filter)
      .populate("userId", "username email mrn dob phone gender")
      .populate("doctorId", "username email specialty")
      .populate("redirectedToDoctor", "username email specialty")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "OK",
      data: appointments,
      message: "Appointments fetched successfully",
    });
  } catch (error) {
    console.error("Get all appointments error:", error);
    return res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET PENDING APPOINTMENTS  (awaiting admin assignment)
// ─────────────────────────────────────────────────────────────
const getPendingAppointments = async (req, res) => {
  try {
    const appointments = await Appoints.find({
      status: {
        $in: [
          "pending_admin_assignment",
          "rejected_by_doctor",
          "awaiting_reassignment",
          "redirected_to_admin",
        ],
      },
    })
      .populate("userId", "username email mrn dob phone gender")
      .populate("doctorId", "username email specialty")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "OK",
      data: appointments,
      message: "Pending appointments fetched",
    });
  } catch (error) {
    console.error("Get pending appointments error:", error);
    return res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
//  ASSIGN DOCTOR TO APPOINTMENT  (admin)
// ─────────────────────────────────────────────────────────────
const assignDoctor = async (req, res) => {
  const appointmentId = req.params.appointmentId || req.query.appointmentId;
  const doctorId = req.body.doctorId || req.query.doctorID || req.query.doctorId;
  const adminId = req.user?._id;

  if (!appointmentId || !doctorId) {
    return res
      .status(400)
      .json({ status: "error", message: "appointmentId and doctorId are required" });
  }

  try {
    const appointment = await Appoints.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ status: "error", message: "Appointment not found" });
    }

    // Verify doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({ status: "error", message: "Doctor not found" });
    }

    const convertedDoctorId = new Types.ObjectId(doctorId);

    // Append to history
    appointment.assignmentHistory.push({
      doctor: convertedDoctorId,
      assignedBy: adminId,
      action: "assigned",
      timestamp: new Date(),
    });

    appointment.doctorId = convertedDoctorId;
    appointment.status = "assigned";
    appointment.rejectionReason = undefined;
    appointment.redirectionReason = undefined;
    appointment.redirectedToDoctor = undefined;

    await appointment.save();

    // Notify the assigned doctor
    await createNotification(
      doctorId,
      "doctor_assigned",
      `You have been assigned a new patient appointment. Please review and accept or reject.`,
      appointment._id
    );

    // Notify the patient
    await createNotification(
      appointment.userId,
      "doctor_assigned",
      `A doctor has been assigned to your appointment. You will be notified when they accept.`,
      appointment._id
    );

    await appointment.populate("userId", "username email mrn dob phone gender");
    await appointment.populate("doctorId", "username email specialty");

    return res.status(200).json({
      status: "OK",
      message: "Doctor assigned successfully",
      appointment,
    });
  } catch (error) {
    console.error("Assign doctor error:", error);
    return res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
//  UNASSIGN DOCTOR  (admin only)
// ─────────────────────────────────────────────────────────────
const unassignDoctor = async (req, res) => {
  const appointmentId = req.params.appointmentId || req.query.appointmentId;
  const adminId = req.user?._id;

  try {
    const appointment = await Appoints.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ status: "error", message: "Appointment not found" });
    }

    const previousDoctorId = appointment.doctorId;

    // Append unassignment to history
    appointment.assignmentHistory.push({
      doctor: previousDoctorId,
      assignedBy: adminId,
      action: "unassigned",
      timestamp: new Date(),
    });

    appointment.doctorId = undefined;
    appointment.status = "unassigned";

    await appointment.save();

    // Notify previous doctor
    if (previousDoctorId) {
      await createNotification(
        previousDoctorId,
        "doctor_assigned",
        `You have been unassigned from a patient appointment by the admin.`,
        appointment._id
      );
    }

    await appointment.populate("userId", "username email mrn dob phone gender");

    return res.status(200).json({
      status: "OK",
      message: "Doctor unassigned successfully",
      appointment,
    });
  } catch (error) {
    console.error("Unassign doctor error:", error);
    return res.status(500).json({ status: "error", message: "Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET ADMIN STATISTICS
// ─────────────────────────────────────────────────────────────
const getAdminStatistics = async (req, res) => {
  try {
    const [total, pending, assigned, accepted, completed, totalDoctors, totalPatients] =
      await Promise.all([
        Appoints.countDocuments(),
        Appoints.countDocuments({ status: "pending_admin_assignment" }),
        Appoints.countDocuments({ status: "assigned" }),
        Appoints.countDocuments({ status: "accepted" }),
        Appoints.countDocuments({ status: "completed" }),
        User.countDocuments({ role: "doctor" }),
        User.countDocuments({ role: "patient" }),
      ]);

    return res.status(200).json({
      totalAppointments: total,
      pendingAssignment: pending,
      assigned,
      accepted,
      completed,
      totalDoctors,
      totalPatients,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllAppointments,
  getPendingAppointments,
  assignDoctor,
  aprouveAppointment: assignDoctor,
  unassignDoctor,
  getAdminStatistics,
};

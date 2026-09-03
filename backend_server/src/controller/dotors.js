const { User, Appoints, Notification } = require("../models/db-models");
const bcrypt = require("bcrypt");
const SENDMAIL = require("../../utils/nodeMailer.config");
const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────
//  ADD DOCTOR  (admin creates doctor account)
// ─────────────────────────────────────────────────────────────
const addDoctor = async (req, res) => {
  try {
    const { name, username, specialty, email, phone, password } = req.body;
    const doctorName = name || username;

    if (!doctorName || !specialty || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const doctorExist = await User.findOne({ email });
    if (doctorExist) {
      return res.status(409).json({
        message: "This email is already in use. Please use another email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = new User({
      username: doctorName,
      specialty,
      email,
      phone,
      password: hashedPassword,
      role: "doctor",
    });

    await doctor.save();

    // Send welcome email (non-blocking)
    try {
      const templatePath = path.join(
        __dirname,
        "../Mailtemplate",
        "doctorTem.html"
      );
      let htmlTemplate = fs.readFileSync(templatePath, "utf-8");
      htmlTemplate = htmlTemplate
        .replace("{{name}}", doctor.username)
        .replace("{{password}}", password);

      const msg = {
        to: doctor.email,
        subject: "Your Doctor Account Has Been Created On CentriCare",
        content: htmlTemplate,
        html: true,
      };
      await SENDMAIL(msg, (info) => {
        console.log("Welcome email sent:", info?.messageId);
      });
    } catch (emailErr) {
      console.warn("Welcome email failed (non-critical):", emailErr.message);
    }

    res.status(201).json({
      message: "Doctor created successfully",
      doctor: {
        _id: doctor._id,
        username: doctor.username,
        specialty: doctor.specialty,
        email: doctor.email,
        phone: doctor.phone,
        role: doctor.role,
      },
    });
  } catch (err) {
    console.error("Error saving doctor:", err);
    // E11000 = MongoDB duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      const msg =
        field === "email"
          ? "A user with this email already exists."
          : field === "mrn"
          ? "MRN index conflict. Please run the fix-mrn-index migration script and restart the server."
          : `Duplicate value for field: ${field}`;
      return res.status(409).json({ error: msg });
    }
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET ALL DOCTORS
// ─────────────────────────────────────────────────────────────
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" })
      .select("-password")
      .sort({ username: 1 });
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  UPDATE DOCTOR
// ─────────────────────────────────────────────────────────────
const updateDoctor = async (req, res) => {
  try {
    const { password, name, username, email, specialty, phone } = req.body;
    const doctorId = req.params.id;

    // Check if email already in use by another user
    if (email) {
      const emailTaken = await User.findOne({
        email,
        _id: { $ne: doctorId },
      });
      if (emailTaken) {
        return res.status(409).json({ message: "This email is already in use by another account" });
      }
    }

    const updateData = {};
    if (name || username) updateData.username = name || username;
    if (email) updateData.email = email;
    if (specialty) updateData.specialty = specialty;
    if (phone) updateData.phone = phone;

    // If password provided and non-empty, hash and update
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const doctor = await User.findOneAndUpdate(
      { _id: doctorId, role: "doctor" },
      { $set: updateData },
      { new: true, select: "-password" }
    );

    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json({ message: "Doctor updated successfully", doctor });
  } catch (err) {
    console.error("Update doctor error:", err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      const msg =
        field === "email"
          ? "This email is already in use by another account."
          : `Duplicate value for field: ${field}`;
      return res.status(409).json({ error: msg });
    }
    res.status(400).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  DELETE DOCTOR
// ─────────────────────────────────────────────────────────────
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findOneAndDelete({ _id: req.params.id, role: "doctor" });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET ASSIGNED APPOINTMENTS FOR LOGGED-IN DOCTOR
// ─────────────────────────────────────────────────────────────
const getDoctorAssignedAppointments = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const appointments = await Appoints.find({
      doctorId: doctorId,
      status: { $in: ["assigned", "accepted", "redirected_to_doctor", "completed"] },
    })
      .populate("userId", "username email mrn dob phone gender")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "OK",
      data: appointments,
      message: "Doctor appointments fetched successfully",
    });
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Server error occurred" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET DOCTOR STATISTICS  (for dashboard)
// ─────────────────────────────────────────────────────────────
const getDoctorStatistics = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const [totalAssigned, completed, pending] = await Promise.all([
      Appoints.countDocuments({ doctorId }),
      Appoints.countDocuments({ doctorId, status: "completed" }),
      Appoints.countDocuments({ doctorId, status: { $in: ["assigned", "accepted"] } }),
    ]);

    const uniquePatients = await Appoints.distinct("userId", { doctorId });

    return res.status(200).json({
      totalPatients: uniquePatients.length,
      totalAppointments: totalAssigned,
      completedAppointments: completed,
      pendingAppointments: pending,
      appointmentsByDay: [
        { day: "Mon", appointments: Math.max(1, Math.round(totalAssigned * 0.15)), completed: Math.round(completed * 0.2) },
        { day: "Tue", appointments: Math.max(2, Math.round(totalAssigned * 0.2)), completed: Math.round(completed * 0.2) },
        { day: "Wed", appointments: Math.max(1, Math.round(totalAssigned * 0.15)), completed: Math.round(completed * 0.15) },
        { day: "Thu", appointments: Math.max(2, Math.round(totalAssigned * 0.25)), completed: Math.round(completed * 0.25) },
        { day: "Fri", appointments: Math.max(1, Math.round(totalAssigned * 0.15)), completed: Math.round(completed * 0.1) },
        { day: "Sat", appointments: Math.round(totalAssigned * 0.1), completed: Math.round(completed * 0.1) },
      ],
      appointmentStatus: [
        { name: "Completed", value: completed || 0, color: "#10b981" },
        { name: "Active / Scheduled", value: pending || 0, color: "#8b5cf6" },
      ],
    });
  } catch (err) {
    console.error("Get doctor stats error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  getDoctorAssignedAppointments,
  getDoctorStatistics,
};

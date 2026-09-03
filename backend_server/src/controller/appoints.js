const { Appoints } = require("../models/db-models");

const bookAppointment = async (req, res) => {
  try {
    const { userId, reason, type } = req.body;
    if (!userId || !type || !reason) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newAppointment = await Appoints.create({
      userId,
      type,
      reason,
    });

    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: newAppointment,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
const Doctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctorAppointments = await Appoints.find({ doctor: doctorId })
      .populate("patient")
      .populate("doctor");

    res.json(doctorAppointments);
  } catch (err) {
    console.error("Error fetching doctor appointments:", err);
    res.status(500).json({ error: "Failed to fetch doctor appointments" });
  }
};

const findByIdAndUpdate = async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ error: "Doctor ID is required" });
    }

    const updated = await Appoints.findByIdAndUpdate(
      req.params.id,
      { doctor: doctorId },
      { new: true }
    )
      .populate("patient")
      .populate("doctor");

    if (!updated) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error assigning doctor:", err);
    res.status(500).json({ error: "Failed to assign doctor" });
  }
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appoints.find().sort({ createdAt: -1 });
    return res.status(200).json(appointments);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appoints.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    return res.status(200).json(appointment);
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
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

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appoints.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }
    return res
      .status(200)
      .json({ message: "Appointment deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ error: "Server error", details: err.message });
  }
};
module.exports = {
  bookAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getAppointmentById,
  getAppointments,
  findByIdAndUpdate,
  Doctor,
};

const express = require("express");
const checkIfAuthenticated = require("../middleware.js");
const { requireRole } = require("../authorize.js");
const {
  getAllAppointments,
  getPendingAppointments,
  assignDoctor,
  aprouveAppointment,
  unassignDoctor,
  getAdminStatistics,
} = require("../controller/admin.js");

const adminRoute = express.Router();

adminRoute.use(checkIfAuthenticated);
adminRoute.use(requireRole("admin"));

// Statistics
adminRoute.get("/statistics", getAdminStatistics);

// Appointments
adminRoute.get("/appointments", getAllAppointments);
adminRoute.get("/appointments/pending", getPendingAppointments);
adminRoute.patch("/appointments/:appointmentId/assign", assignDoctor);
adminRoute.patch("/appointments/:appointmentId/unassign", unassignDoctor);

// Backward compatibility
adminRoute.patch("/approve-appointment", aprouveAppointment);

module.exports = adminRoute;
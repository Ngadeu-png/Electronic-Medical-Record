const express = require("express");
const {
  addDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  getDoctorAssignedAppointments,
  getDoctorStatistics,
} = require("../controller/dotors");
const checkIfAuthenticated = require("../middleware.js");
const { requireRole } = require("../authorize.js");

const docRoute = express.Router();
docRoute.use(checkIfAuthenticated);

// Doctor management (Admin)
docRoute.post("/", requireRole("admin"), addDoctor);
docRoute.get("/", getDoctors);
docRoute.put("/:id", requireRole("admin"), updateDoctor);
docRoute.delete("/:id", requireRole("admin"), deleteDoctor);

// Doctor dashboard & appointments (Doctor)
docRoute.get("/statistics", requireRole("doctor"), getDoctorStatistics);
docRoute.get("/assigned-appointments", requireRole("doctor"), getDoctorAssignedAppointments);
// Compatibility with legacy route
docRoute.get("/my-appointments/:id", getDoctorAssignedAppointments);

module.exports = docRoute;

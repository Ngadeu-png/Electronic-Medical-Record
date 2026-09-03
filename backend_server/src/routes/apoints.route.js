const express = require("express");
const checkIfAuthenticated = require("../middleware.js");
const { requireRole } = require("../authorize.js");

const {
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
} = require("../controller/appoints.js");

const router = express.Router();

// All appointment routes require authentication
router.use(checkIfAuthenticated);

// ── Patient routes ────────────────────────────────────────────
router.post("/", bookAppointment);                       // Patient books
router.get("/my", getMyAppointments);                    // Patient sees their own appointments

// ── Admin / general routes ────────────────────────────────────
router.get("/", requireRole("admin"), getAppointments);  // Admin sees all
router.get("/:id", getAppointmentById);
router.patch("/:id/status", requireRole("admin"), updateAppointmentStatus);
router.delete("/:id", requireRole("admin"), deleteAppointment);

// ── Doctor workflow routes ────────────────────────────────────
router.post("/:id/accept", requireRole("doctor"), acceptAssignment);
router.post("/:id/reject", requireRole("doctor"), rejectAssignment);
router.post("/:id/redirect-doctor", requireRole("doctor"), requestRedirectionToDoctor);
router.post("/:id/redirect-admin", requireRole("doctor"), requestRedirectionToAdmin);
router.post("/:id/complete", requireRole("doctor"), completeAppointment);

module.exports = router;

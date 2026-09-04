const express = require("express");
const checkIfAuthenticated = require("../middleware");
const { requireRole } = require("../authorize");
const {
  getPatientEmergencyProfile,
  searchPatientsForEmergency,
  getAccessLogs,
} = require("../controller/emergency");

const router = express.Router();

router.use(checkIfAuthenticated);

// Emergency search across patients (doctors and admins only)
router.get(
  "/search",
  requireRole("doctor", "admin"),
  searchPatientsForEmergency
);

// Emergency patient profile retrieval (doctors and admins only)
router.get(
  "/patient/:patientId",
  requireRole("doctor", "admin"),
  getPatientEmergencyProfile
);

// Emergency access audit log (patient viewing own, or doctor/admin)
router.get(
  "/access-logs/:patientId",
  getAccessLogs
);

module.exports = router;

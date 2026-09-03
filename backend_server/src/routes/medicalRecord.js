const express = require("express");
const checkIfAuthenticated = require("../middleware.js");
const { requireRole } = require("../authorize.js");
const {
  signRecord,
  getPatientRecords,
  addRecord,
  getAllRecords,
} = require("../controller/medicalRecord");

const recordRoute = express.Router();

recordRoute.use(checkIfAuthenticated);

// Create medical record (doctor only)
recordRoute.post("/", requireRole("doctor"), addRecord);

// Get medical records for a patient (patient can see own, assigned doctor can see, admin can see)
recordRoute.get("/patient/:patientId", getPatientRecords);

// Sign a record (doctor only)
recordRoute.patch("/:recordId/sign", requireRole("doctor"), signRecord);

// Get all records (admin only)
recordRoute.get("/", requireRole("admin"), getAllRecords);

module.exports = recordRoute;

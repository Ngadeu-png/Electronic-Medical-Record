const express = require("express");
const {
  signRecord,
  getPatientRecords,
  addRecord,
} = require("../controller/medicalRecord");

const recordRoute = express.Router();
recordRoute.post("/", addRecord);
recordRoute.get("/patient/:patientId", getPatientRecords);
recordRoute.patch("/:recordId/sign", signRecord);
module.exports = recordRoute;

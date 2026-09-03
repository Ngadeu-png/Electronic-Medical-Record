const express = require("express");
const { Appoints } = require("../models/db-models.js");
const checkIfAuthenticated = require("../middleware.js");

const {
  bookAppointment,
  getAppointments,
} = require("../controller/appoints.js");

const router = express.Router();
router.use(checkIfAuthenticated);

router.post("/", bookAppointment);

router.get("/", getAppointments);

router.put("/:id/assign", bookAppointment, getAppointments);

router.get("/doctor/:doctorId", bookAppointment, getAppointments);

module.exports = router;

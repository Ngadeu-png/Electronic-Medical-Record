const express = require("express");
const {
  addDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  getDoctorAppointments,
} = require("../controller/dotors");
const checkIfAuthenticated = require("../middleware.js");
const docRoute = express.Router();
docRoute.use(checkIfAuthenticated);

docRoute.post("/", addDoctor);
docRoute.get("/", getDoctors);
docRoute.put("/:id", updateDoctor);
docRoute.delete("/:id", deleteDoctor);
docRoute.get("/my-appointments/:id", getDoctorAppointments);

module.exports = docRoute;

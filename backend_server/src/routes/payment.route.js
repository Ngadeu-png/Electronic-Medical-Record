const express = require("express");
const checkIfAuthenticated = require("../middleware.js");
const {
  initiatePayment,
  verifyPayment,
  getPaymentByAppointment,
} = require("../controller/payment");

const router = express.Router();

// All payment routes require authentication
router.use(checkIfAuthenticated);

// Initiate payment via CamPay
router.post("/initiate", initiatePayment);

// Verify payment status with CamPay and update DB
router.post("/verify/:reference", verifyPayment);
router.get("/status/:reference", verifyPayment);

// Retrieve payment info for a specific appointment
router.get("/appointment/:appointmentId", getPaymentByAppointment);

module.exports = router;

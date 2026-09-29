const { Appoints, Payment, Notification } = require("../models/db-models");
const campayService = require("../services/campayService");

/**
 * Helper: create in-app notification
 */
const createNotification = async (recipientId, type, message, appointmentId) => {
  try {
    await Notification.create({
      recipient: recipientId,
      type,
      message,
      relatedAppointment: appointmentId,
    });
  } catch (err) {
    console.warn("Notification creation failed:", err.message);
  }
};

/**
 * ─────────────────────────────────────────────────────────────
 *  INITIATE PAYMENT
 * ─────────────────────────────────────────────────────────────
 * Patient initiates payment for a pending appointment via CamPay
 */
const initiatePayment = async (req, res) => {
  try {
    const { appointmentId, phoneNumber, paymentMethod, amount: customAmount } = req.body;
    const userId = req.user?._id;

    if (!appointmentId || !phoneNumber) {
      return res.status(400).json({
        error: "appointmentId and phoneNumber are required",
      });
    }

    const appointment = await Appoints.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Access control: only the patient who booked or an admin can pay
    if (
      req.user.role !== "admin" &&
      appointment.userId.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        error: "You are not authorized to pay for this appointment",
      });
    }

    // Idempotency: cannot pay an already paid appointment
    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({
        error: "This appointment has already been paid successfully",
        paymentStatus: "paid",
        appointment,
      });
    }

    // Rate-limiting / Double-click prevention:
    // Check if an existing payment for this appointment was initiated in the last 20 seconds and is processing
    const recentPayment = await Payment.findOne({
      appointment: appointmentId,
      status: "processing",
      createdAt: { $gt: new Date(Date.now() - 20000) },
    });

    if (recentPayment) {
      return res.status(409).json({
        error: "A payment request is already in progress for this appointment. Please check your phone for the confirmation prompt.",
        reference: recentPayment.reference,
        payment: recentPayment,
      });
    }

    const amount = customAmount || appointment.amount || 25;
    const externalReference = `CENTRICARE-${appointment._id.toString().slice(-6)}-${Date.now()}`;
    const description = `CentriCare Consultation - ${appointment.type} (${appointment._id.toString().slice(-6)})`;

    // Call CamPay Collect API
    const collectResult = await campayService.collectPayment({
      amount,
      from: phoneNumber,
      description,
      externalReference,
    });

    if (!collectResult.success) {
      // Record failed attempt
      const failedPayment = await Payment.create({
        appointment: appointment._id,
        patient: appointment.userId,
        amount,
        currency: "XAF",
        paymentMethod: paymentMethod || "MTN",
        phoneNumber,
        status: "failed",
        externalReference,
        failureReason: collectResult.message,
        campayResponse: collectResult.data,
      });

      appointment.paymentStatus = "failed";
      appointment.paymentId = failedPayment._id;
      await appointment.save();

      return res.status(400).json({
        error: collectResult.message || "Failed to initiate payment with CamPay",
        payment: failedPayment,
      });
    }

    // Create payment record in processing state
    const payment = await Payment.create({
      appointment: appointment._id,
      patient: appointment.userId,
      amount,
      currency: "XAF",
      paymentMethod: paymentMethod || "MTN",
      phoneNumber,
      status: "processing",
      reference: collectResult.reference,
      externalReference,
      operator: collectResult.operator,
      campayResponse: collectResult.data,
    });

    // Link payment to appointment
    appointment.paymentStatus = "processing";
    appointment.paymentId = payment._id;
    appointment.amount = amount;
    await appointment.save();

    return res.status(200).json({
      message: "Payment initiated successfully. Please check your phone to confirm the transaction.",
      reference: collectResult.reference,
      payment,
      appointment,
    });
  } catch (err) {
    console.error("Initiate payment error:", err);
    return res.status(500).json({
      error: "Failed to initiate payment",
      details: err.message,
    });
  }
};

/**
 * ─────────────────────────────────────────────────────────────
 *  VERIFY PAYMENT STATUS
 * ─────────────────────────────────────────────────────────────
 * Verifies the transaction with CamPay API and reconciles the database
 */
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ error: "Payment reference is required" });
    }

    // Find payment by reference or ID
    let payment = await Payment.findOne({
      $or: [{ reference }, { externalReference: reference }],
    });

    if (!payment && reference.match(/^[0-9a-fA-F]{24}$/)) {
      payment = await Payment.findById(reference);
    }

    if (!payment) {
      return res.status(404).json({ error: "Payment record not found" });
    }

    const appointment = await Appoints.findById(payment.appointment);

    // If already marked paid, return current state directly
    if (payment.status === "paid") {
      return res.status(200).json({
        success: true,
        status: "paid",
        message: "Payment has already been confirmed as paid",
        payment,
        appointment,
      });
    }

    // Query CamPay for definitive status
    const statusResult = await campayService.checkTransactionStatus(
      payment.reference || reference
    );

    if (statusResult.success) {
      const normalizedStatus = statusResult.status; // 'paid', 'failed', 'processing', 'pending'

      payment.status = normalizedStatus;
      if (statusResult.operator) payment.operator = statusResult.operator;
      if (statusResult.operatorReference)
        payment.operatorReference = statusResult.operatorReference;
      payment.campayResponse = statusResult.data;
      await payment.save();

      if (appointment) {
        appointment.paymentStatus = normalizedStatus;
        await appointment.save();

        if (normalizedStatus === "paid") {
          await createNotification(
            appointment.userId,
            "appointment_booked",
            `Your payment of ${payment.amount} XAF for appointment (${appointment.type}) was successfully processed. Hospital administration will assign a doctor shortly.`,
            appointment._id
          );
        }
      }

      return res.status(200).json({
        success: true,
        status: normalizedStatus,
        rawStatus: statusResult.rawStatus,
        payment,
        appointment,
      });
    } else {
      // Keep existing status if lookup failed temporarily
      return res.status(200).json({
        success: false,
        status: payment.status,
        message: statusResult.message || "Unable to confirm status at this time",
        payment,
        appointment,
      });
    }
  } catch (err) {
    console.error("Verify payment error:", err);
    return res.status(500).json({
      error: "Failed to verify payment",
      details: err.message,
    });
  }
};

/**
 * ─────────────────────────────────────────────────────────────
 *  GET PAYMENT DETAILS BY APPOINTMENT
 * ─────────────────────────────────────────────────────────────
 */
const getPaymentByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appoints.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const payment = await Payment.findOne({ appointment: appointmentId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      appointment,
      payment: payment || null,
      paymentStatus: appointment.paymentStatus || "pending",
    });
  } catch (err) {
    console.error("Get payment by appointment error:", err);
    return res.status(500).json({
      error: "Server error retrieving payment details",
      details: err.message,
    });
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  getPaymentByAppointment,
};

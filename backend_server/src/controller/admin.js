const { Types } = require("mongoose");
const { Appoints } = require("../models/db-models.js");

const aprouveAppointment = async (req, res) => {
  const { appointmentId, doctorID } = req.query;
  const { status } = req.body;
  if (!appointmentId || !doctorID) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing request parameters" });
  }
  try {
    const appointment = await Appoints.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ status: "error", message: "Appointment not found" });
    } else {
      appointment.status = status;

      // convert doctorId to mongoDb Object ID
      const convertedID = new Types.ObjectId(doctorID);
      appointment.doctorId = convertedID;
      
      await Appoints.updateOne(
        { _id: appointmentId },
        {
          $set: {
            status,
            doctorId: convertedID,
          },
        }
      )
        .then((respond) => {
          if (respond.modifiedCount > 0) {
            return res.status(200).json({
              status: "OK",
              message: "Appointment approved and assigned successfully",
            });
          } else {
            return res
              .status(400)
              .json({
                status: "error",
                message: "Appointment approval failed",
              });
          }
        })
        .catch((err) => {
          console.log("Failed to save query updates: ", err.messqge);
        });
    }
  } catch (error) {
    console.log("Server Error ", error.message);
    return res.status(500).json({ status: "error", message: "Server Error" });
  }
};

module.exports = {
  aprouveAppointment,
};

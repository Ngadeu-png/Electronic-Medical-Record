const { User, Appoints } = require("../models/db-models");
const SENDMAIL = require("../../utils/nodeMailer.config");

const fs = require("fs");
const path = require("path");

const addDoctor = async (req, res) => {
  try {
    const doctorexist = await User.findOne({ email: req.body.email });
    if (doctorexist) {
      return res.status(409).json({
        message: "This email is already in use. please use another email",
      });
    }
    console.log(req.body, "helloo backend");
    const doctor = new User({
      ...req.body,
      role: "doctor",
      username: req.body.name,
    });
    // Load HTML template
    const templatePath = path.join(
      __dirname,
      "../Mailtemplate",
      "doctorTem.html"
    );
    let htmlTemplate = fs.readFileSync(templatePath, "utf-8");

    // Replace placeholders with actual values
    htmlTemplate = htmlTemplate
      .replace("{{name}}", doctor.name)
      .replace("{{password}}", doctor.password);

    const msg = {
      to: doctor.email,
      subject: "Your Account Has Been Created On CentriCare",
      content: htmlTemplate, // put HTML content here
      html: true, // flag that it’s HTML content
    };

    await SENDMAIL(msg, (success, err) => {
      if (err) {
        console.log(err, "An error occurred while sending the email");
      }
    });

    await doctor.save();

    res.status(201).json(doctor);
  } catch (err) {
    console.error("Error saving doctor:", err);
    res.status(500).json({ error: err.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor" });
    console.log(doctors, "here are the doctors");
    res.json({ doctors: doctors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await User.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json({ message: "Doctor deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// gets appointments for specific doctors
const getDoctorAppointments = async (req, res) => {
  const { doctorID } = req.params;

  if (!doctorID) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing request parameter" });
  }

  try {
    const appointmentsOfDoctor = await Appoints.find({
      $and: [{ status: "Approve" }, { doctorId: doctorID }],
    });

    if (!appointmentsOfDoctor) {
      return res.status(404).json({
        status: "error",
        message: "No appointments found for this doctor",
      });
    } else {
      return res.status(200).json({ status: "OK", data: appointmentsOfDoctor });
    }
  } catch (error) {
    console.log("Server Error: ", error);
    return res
      .status(500)
      .json({ status: "error", message: "Server Error occured" });
  }
};

module.exports = {
  addDoctor,
  getDoctors,
  updateDoctor,
  deleteDoctor,
  getDoctorAppointments,
};

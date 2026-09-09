require("dotenv").config();

const dbConnect = require("./src/db/conn");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { initChatWebSocket } = require("./src/websocket/chatSocket");

// Import routes
const authsRoute = require("./src/routes/auths.route");
const appointmentRoutes = require("./src/routes/apoints.route");
const doctorRoutes = require("./src/routes/doctor.route");
const adminRoute = require("./src/routes/admin.route");
const medicalRecordRoute = require("./src/routes/medicalRecord");
const patientRoute = require("./src/routes/patientRoutes");
const aiRoute = require("./src/routes/ai.route");
const profileRoute = require("./src/routes/profile.route");
const emergencyRoute = require("./src/routes/emergency.route");
const chatRoute = require("./src/routes/chat.route");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

dbConnect();

// Initialize WebSocket server
initChatWebSocket(server);

// Middleware (allow 25mb for image attachments)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cors({ origin: "*" }));

// Routes
app.use("/api/auths", authsRoute);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/medical-records", medicalRecordRoute);
app.use("/api/patients", patientRoute);
app.use("/api/ai", aiRoute);
app.use("/api/profile", profileRoute);
app.use("/api/emergency", emergencyRoute);
app.use("/api/chat", chatRoute);

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// require("dotenv").config();

// // Import routes
// const userRoutes = require("./src/User/user-route");
// const appointmentRoutes = require("./src/Appointment/Appointment-route");

// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors({ origin: "*" }));

// // Routes
// app.use("/api/users", userRoutes);
// app.use("/api/appointments", appointmentRoutes);

// // MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb://localhost:27017/emedical", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error(" MongoDB connection error:", err));

// // Start server
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

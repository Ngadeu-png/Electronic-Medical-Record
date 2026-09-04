const express = require("express");
const checkIfAuthenticated = require("../middleware");
const {
  getMyProfile,
  updateMyProfile,
  getEmergencyProfile,
  updateEmergencyProfile,
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  searchRegisteredUsers,
  getTrustedPatients,
} = require("../controller/profile");

const router = express.Router();

router.use(checkIfAuthenticated);

// Personal profile
router.get("/me", getMyProfile);
router.put("/me", updateMyProfile);

// Emergency medical profile
router.get("/emergency", getEmergencyProfile);
router.put("/emergency", updateEmergencyProfile);

// Emergency contacts / trusted persons
router.get("/emergency-contacts", getEmergencyContacts);
router.post("/emergency-contacts", addEmergencyContact);
router.put("/emergency-contacts/:id", updateEmergencyContact);
router.delete("/emergency-contacts/:id", deleteEmergencyContact);

// Search registered users to add as trusted person
router.get("/search-users", searchRegisteredUsers);

// Patients who trusted the logged-in user
router.get("/trusted-patients", getTrustedPatients);

module.exports = router;

const {
  User,
  EmergencyMedicalProfile,
  EmergencyContact,
  EmergencyAccessLog,
  MedicalRecord,
  Notification,
} = require("../models/db-models");

// ─────────────────────────────────────────────────────────────
//  HELPER: Send in-app notification if model is available
// ─────────────────────────────────────────────────────────────
const sendInAppNotification = async (recipientId, type, message) => {
  try {
    if (!recipientId) return;
    await Notification.create({
      recipient: recipientId,
      type,
      message,
    });
  } catch (err) {
    console.warn("Notification creation failed (non-critical):", err.message);
  }
};

// ─────────────────────────────────────────────────────────────
//  GET MY PROFILE (Logged-in user personal details)
// ─────────────────────────────────────────────────────────────
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const emergencyProfile = await EmergencyMedicalProfile.findOne({
      patient: req.user._id,
    });

    res.json({
      user,
      emergencyProfile: emergencyProfile || null,
    });
  } catch (err) {
    console.error("Get my profile error:", err);
    res.status(500).json({ message: "Server error retrieving profile" });
  }
};

// ─────────────────────────────────────────────────────────────
//  UPDATE MY PROFILE (Personal details)
// ─────────────────────────────────────────────────────────────
const updateMyProfile = async (req, res) => {
  try {
    const { username, phone, dob, gender, address, photo } = req.body;

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (phone !== undefined) updateData.phone = phone;
    if (dob !== undefined) updateData.dob = dob;
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (photo !== undefined) updateData.photo = photo;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message || "Failed to update profile" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET EMERGENCY MEDICAL PROFILE
// ─────────────────────────────────────────────────────────────
const getEmergencyProfile = async (req, res) => {
  try {
    let profile = await EmergencyMedicalProfile.findOne({
      patient: req.user._id,
    });

    if (!profile) {
      // Return blank template if none exists yet
      profile = {
        patient: req.user._id,
        bloodType: "Unknown",
        allergies: [],
        height: null,
        weight: null,
        criticalConditions: [],
        currentImportantMedications: [],
        surgeries: [],
        emergencyWarnings: "",
        emergencyInstructions: "",
      };
    }

    res.json(profile);
  } catch (err) {
    console.error("Get emergency profile error:", err);
    res.status(500).json({ message: "Failed to retrieve emergency profile" });
  }
};

// ─────────────────────────────────────────────────────────────
//  UPDATE EMERGENCY MEDICAL PROFILE
// ─────────────────────────────────────────────────────────────
const updateEmergencyProfile = async (req, res) => {
  try {
    const {
      bloodType,
      allergies,
      height,
      weight,
      criticalConditions,
      currentImportantMedications,
      surgeries,
      emergencyWarnings,
      emergencyInstructions,
    } = req.body;

    const validBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
    if (bloodType && !validBloodTypes.includes(bloodType)) {
      return res.status(400).json({
        message: `Invalid blood type. Must be one of: ${validBloodTypes.join(", ")}`,
      });
    }

    const parseArrayField = (val) => {
      if (Array.isArray(val)) return val.map((s) => String(s).trim()).filter(Boolean);
      if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const updateFields = {
      bloodType: bloodType || "Unknown",
      allergies: parseArrayField(allergies),
      height: height ? Number(height) : null,
      weight: weight ? Number(weight) : null,
      criticalConditions: parseArrayField(criticalConditions),
      currentImportantMedications: parseArrayField(currentImportantMedications),
      surgeries: parseArrayField(surgeries),
      emergencyWarnings: emergencyWarnings || "",
      emergencyInstructions: emergencyInstructions || "",
    };

    const profile = await EmergencyMedicalProfile.findOneAndUpdate(
      { patient: req.user._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      message: "Emergency medical profile saved successfully",
      profile,
    });
  } catch (err) {
    console.error("Update emergency profile error:", err);
    res.status(500).json({ message: err.message || "Failed to save emergency profile" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET EMERGENCY CONTACTS (Patient's contacts)
// ─────────────────────────────────────────────────────────────
const getEmergencyContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ patient: req.user._id })
      .populate("contactUser", "username email role")
      .sort({ priority: 1, createdAt: -1 });

    res.json(contacts);
  } catch (err) {
    console.error("Get emergency contacts error:", err);
    res.status(500).json({ message: "Failed to load emergency contacts" });
  }
};

// ─────────────────────────────────────────────────────────────
//  ADD EMERGENCY CONTACT
// ─────────────────────────────────────────────────────────────
const addEmergencyContact = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      alternativePhone,
      email,
      relationship,
      address,
      priority,
      emergencyAccessEnabled,
      accessLevel,
      contactUserId,
    } = req.body;

    if (!firstName || !phone || !relationship) {
      return res.status(400).json({
        message: "First name, phone number, and relationship are required.",
      });
    }

    let isRegistered = false;
    let linkedUser = null;

    if (contactUserId) {
      if (String(contactUserId) === String(req.user._id)) {
        return res.status(400).json({
          message: "You cannot add yourself as an emergency contact.",
        });
      }

      linkedUser = await User.findById(contactUserId).select("username email role");
      if (!linkedUser) {
        return res.status(404).json({ message: "Selected registered user not found." });
      }

      // Check if already added
      const existing = await EmergencyContact.findOne({
        patient: req.user._id,
        contactUser: contactUserId,
      });
      if (existing) {
        return res.status(409).json({
          message: "This user is already added as an emergency contact.",
        });
      }

      isRegistered = true;
    }

    const contact = new EmergencyContact({
      patient: req.user._id,
      contactUser: linkedUser ? linkedUser._id : undefined,
      isRegisteredUser: isRegistered,
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      phone: phone.trim(),
      alternativePhone: (alternativePhone || "").trim(),
      email: (email || (linkedUser ? linkedUser.email : "")).trim(),
      relationship,
      address: (address || "").trim(),
      priority: priority || "Primary",
      isActive: true,
      emergencyAccessEnabled: isRegistered ? Boolean(emergencyAccessEnabled) : false,
      accessLevel: isRegistered ? Number(accessLevel || 1) : 1,
    });

    await contact.save();

    // Populate for response
    await contact.populate("contactUser", "username email role");

    // Send notification if registered user and access is granted
    if (isRegistered && contact.emergencyAccessEnabled) {
      const patientName = req.user.username || "A patient";
      await sendInAppNotification(
        contact.contactUser._id,
        "trusted_access_granted",
        `You have been designated as a trusted emergency contact by ${patientName} with Access Level ${contact.accessLevel}.`
      );
    }

    res.status(201).json({
      message: "Emergency contact added successfully",
      contact,
    });
  } catch (err) {
    console.error("Add emergency contact error:", err);
    res.status(500).json({ message: err.message || "Failed to add emergency contact" });
  }
};

// ─────────────────────────────────────────────────────────────
//  UPDATE EMERGENCY CONTACT
// ─────────────────────────────────────────────────────────────
const updateEmergencyContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await EmergencyContact.findOne({
      _id: contactId,
      patient: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({ message: "Emergency contact not found" });
    }

    const previousAccess = contact.emergencyAccessEnabled;
    const previousLevel = contact.accessLevel;

    const {
      firstName,
      lastName,
      phone,
      alternativePhone,
      email,
      relationship,
      address,
      priority,
      isActive,
      emergencyAccessEnabled,
      accessLevel,
    } = req.body;

    if (firstName !== undefined) contact.firstName = firstName.trim();
    if (lastName !== undefined) contact.lastName = lastName.trim();
    if (phone !== undefined) contact.phone = phone.trim();
    if (alternativePhone !== undefined) contact.alternativePhone = alternativePhone.trim();
    if (email !== undefined) contact.email = email.trim();
    if (relationship !== undefined) contact.relationship = relationship;
    if (address !== undefined) contact.address = address.trim();
    if (priority !== undefined) contact.priority = priority;
    if (isActive !== undefined) contact.isActive = Boolean(isActive);

    // Only registered contacts can have emergency access enabled
    if (contact.isRegisteredUser) {
      if (emergencyAccessEnabled !== undefined) {
        contact.emergencyAccessEnabled = Boolean(emergencyAccessEnabled);
      }
      if (accessLevel !== undefined) {
        contact.accessLevel = Math.min(3, Math.max(1, Number(accessLevel)));
      }
    }

    await contact.save();
    await contact.populate("contactUser", "username email role");

    // Notification handling for permission changes
    if (contact.isRegisteredUser && contact.contactUser) {
      const patientName = req.user.username || "A patient";
      if (previousAccess && !contact.emergencyAccessEnabled) {
        await sendInAppNotification(
          contact.contactUser._id,
          "trusted_access_revoked",
          `${patientName} has disabled your emergency trusted contact access.`
        );
      } else if (!previousAccess && contact.emergencyAccessEnabled) {
        await sendInAppNotification(
          contact.contactUser._id,
          "trusted_access_granted",
          `${patientName} granted you emergency trusted contact access at Level ${contact.accessLevel}.`
        );
      } else if (
        contact.emergencyAccessEnabled &&
        previousLevel !== contact.accessLevel
      ) {
        await sendInAppNotification(
          contact.contactUser._id,
          "trusted_access_updated",
          `${patientName} updated your emergency access to Level ${contact.accessLevel}.`
        );
      }
    }

    res.json({
      message: "Emergency contact updated successfully",
      contact,
    });
  } catch (err) {
    console.error("Update emergency contact error:", err);
    res.status(500).json({ message: err.message || "Failed to update contact" });
  }
};

// ─────────────────────────────────────────────────────────────
//  DELETE EMERGENCY CONTACT
// ─────────────────────────────────────────────────────────────
const deleteEmergencyContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({ message: "Emergency contact not found" });
    }

    // If was registered and had active access, notify that access was revoked
    if (contact.isRegisteredUser && contact.contactUser && contact.emergencyAccessEnabled) {
      const patientName = req.user.username || "A patient";
      await sendInAppNotification(
        contact.contactUser,
        "trusted_access_revoked",
        `${patientName} has removed you as a trusted emergency contact.`
      );
    }

    res.json({ message: "Emergency contact removed successfully" });
  } catch (err) {
    console.error("Delete emergency contact error:", err);
    res.status(500).json({ message: "Failed to delete emergency contact" });
  }
};

// ─────────────────────────────────────────────────────────────
//  SEARCH REGISTERED USERS (Privacy-aware search)
//  Never exposes passwords, medical records, or sensitive details
// ─────────────────────────────────────────────────────────────
const searchRegisteredUsers = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (query.length < 2) {
      return res.json([]);
    }

    const regex = new RegExp(query, "i");
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ username: regex }, { email: regex }],
    })
      .select("_id username email role")
      .limit(8);

    res.json(users);
  } catch (err) {
    console.error("User search error:", err);
    res.status(500).json({ message: "Failed to search registered users" });
  }
};

// ─────────────────────────────────────────────────────────────
//  GET TRUSTED PATIENTS ("People Who Have Trusted You")
//  Enforces Level 1, Level 2, Level 3 permissions strictly
// ─────────────────────────────────────────────────────────────
const getTrustedPatients = async (req, res) => {
  try {
    // Find contacts where logged-in user is the contactUser, active, and access is enabled
    const authorizations = await EmergencyContact.find({
      contactUser: req.user._id,
      isActive: true,
      emergencyAccessEnabled: true,
    }).populate("patient", "username email mrn dob phone gender photo address");

    const trustedData = await Promise.all(
      authorizations.map(async (auth) => {
        const patient = auth.patient;
        if (!patient) return null;

        const accessLevel = auth.accessLevel || 1;

        // Fetch Emergency Medical Profile
        const emergencyProfile = await EmergencyMedicalProfile.findOne({
          patient: patient._id,
        });

        // Base Data: Level 1 (Emergency Summary)
        const result = {
          authorizationId: auth._id,
          accessLevel,
          relationship: auth.relationship,
          priority: auth.priority,
          patient: {
            _id: patient._id,
            username: patient.username,
            mrn: patient.mrn,
            gender: patient.gender,
            dob: patient.dob,
            photo: patient.photo,
          },
          emergencySummary: emergencyProfile
            ? {
                bloodType: emergencyProfile.bloodType,
                allergies: emergencyProfile.allergies,
                height: emergencyProfile.height,
                weight: emergencyProfile.weight,
                criticalConditions: emergencyProfile.criticalConditions,
                emergencyWarnings: emergencyProfile.emergencyWarnings,
                emergencyInstructions: emergencyProfile.emergencyInstructions,
              }
            : null,
        };

        // Level 2: Include current medications & surgeries
        if (accessLevel >= 2 && emergencyProfile) {
          result.limitedMedicalInfo = {
            currentImportantMedications: emergencyProfile.currentImportantMedications,
            surgeries: emergencyProfile.surgeries,
          };
        }

        // Level 3: Include authorized signed medical records
        if (accessLevel >= 3) {
          const records = await MedicalRecord.find({
            patient: patient._id,
            isSigned: true,
          })
            .populate("doctor", "username specialty")
            .sort({ createdAt: -1 })
            .limit(10);

          result.medicalRecords = records;
        }

        return result;
      })
    );

    res.json(trustedData.filter(Boolean));
  } catch (err) {
    console.error("Get trusted patients error:", err);
    res.status(500).json({ message: "Failed to retrieve trusted patients data" });
  }
};

module.exports = {
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
};

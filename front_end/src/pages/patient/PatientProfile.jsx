import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyProfile,
  updateMyProfile,
  fetchEmergencyProfile,
  updateEmergencyProfile,
  fetchEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  searchRegisteredUsers,
  fetchTrustedPatients,
  fetchPatientEmergencyAccessLogs,
  clearPatientActionMessage,
  clearSearchResults,
} from "../../redux/slices/patientSlice";
import {
  User,
  ShieldAlert,
  Users,
  HeartHandshake,
  History,
  Phone,
  Mail,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Search,
  Lock,
  Unlock,
  Eye,
  X,
  Activity,
  Droplet,
  FileText,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const relationships = [
  "Parent",
  "Spouse",
  "Brother",
  "Sister",
  "Child",
  "Relative",
  "Friend",
  "Guardian",
  "Other",
];

const PatientProfile = () => {
  const dispatch = useDispatch();

  const {
    profile,
    profileStatus,
    emergencyProfile,
    emergencyStatus,
    emergencyContacts,
    contactsStatus,
    userSearchResults,
    searchStatus,
    trustedPatients,
    trustedStatus,
    accessLogs,
    logsStatus,
    actionStatus,
    actionMessage,
    error,
  } = useSelector((state) => state.patients);

  const [activeTab, setActiveTab] = useState("personal");

  // Personal Info Form State
  const [personalForm, setPersonalForm] = useState({
    username: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    photo: "",
  });

  // Emergency Profile Form State
  const [emergencyForm, setEmergencyForm] = useState({
    bloodType: "Unknown",
    allergies: "",
    height: "",
    weight: "",
    criticalConditions: "",
    currentImportantMedications: "",
    surgeries: "",
    emergencyWarnings: "",
    emergencyInstructions: "",
  });

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactMode, setContactMode] = useState("create"); // "create" or "edit"
  const [contactType, setContactType] = useState("external"); // "external" or "registered"
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [contactForm, setContactForm] = useState({
    id: null,
    firstName: "",
    lastName: "",
    phone: "",
    alternativePhone: "",
    email: "",
    relationship: "Family",
    address: "",
    priority: "Primary",
    isActive: true,
    emergencyAccessEnabled: false,
    accessLevel: 1,
    contactUserId: null,
  });

  // Trusted patient detail view modal
  const [viewingTrustedPatient, setViewingTrustedPatient] = useState(null);

  useEffect(() => {
    dispatch(fetchMyProfile());
    dispatch(fetchEmergencyProfile());
    dispatch(fetchEmergencyContacts());
    dispatch(fetchTrustedPatients());
  }, [dispatch]);

  // Load personal form from profile
  useEffect(() => {
    if (profile) {
      setPersonalForm({
        username: profile.username || "",
        phone: profile.phone || "",
        dob: profile.dob ? profile.dob.slice(0, 10) : "",
        gender: profile.gender || "",
        address: profile.address || "",
        photo: profile.photo || "",
      });
      if (profile._id) {
        dispatch(fetchPatientEmergencyAccessLogs(profile._id));
      }
    }
  }, [profile, dispatch]);

  // Load emergency form from emergencyProfile
  useEffect(() => {
    if (emergencyProfile) {
      setEmergencyForm({
        bloodType: emergencyProfile.bloodType || "Unknown",
        allergies: Array.isArray(emergencyProfile.allergies)
          ? emergencyProfile.allergies.join(", ")
          : "",
        height: emergencyProfile.height || "",
        weight: emergencyProfile.weight || "",
        criticalConditions: Array.isArray(emergencyProfile.criticalConditions)
          ? emergencyProfile.criticalConditions.join(", ")
          : "",
        currentImportantMedications: Array.isArray(
          emergencyProfile.currentImportantMedications
        )
          ? emergencyProfile.currentImportantMedications.join(", ")
          : "",
        surgeries: Array.isArray(emergencyProfile.surgeries)
          ? emergencyProfile.surgeries.join(", ")
          : "",
        emergencyWarnings: emergencyProfile.emergencyWarnings || "",
        emergencyInstructions: emergencyProfile.emergencyInstructions || "",
      });
    }
  }, [emergencyProfile]);

  // Auto clear message after 4s
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => {
        dispatch(clearPatientActionMessage());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage, dispatch]);

  // User search debounce
  useEffect(() => {
    if (contactType === "registered" && userSearchQuery.trim().length >= 2) {
      const timeout = setTimeout(() => {
        dispatch(searchRegisteredUsers(userSearchQuery.trim()));
      }, 350);
      return () => clearTimeout(timeout);
    } else {
      dispatch(clearSearchResults());
    }
  }, [userSearchQuery, contactType, dispatch]);

  const handleSavePersonal = (e) => {
    e.preventDefault();
    dispatch(updateMyProfile(personalForm));
  };

  const handleSaveEmergency = (e) => {
    e.preventDefault();
    dispatch(updateEmergencyProfile(emergencyForm));
  };

  const openAddContactModal = () => {
    setContactMode("create");
    setContactType("external");
    setSelectedUser(null);
    setUserSearchQuery("");
    setContactForm({
      id: null,
      firstName: "",
      lastName: "",
      phone: "",
      alternativePhone: "",
      email: "",
      relationship: "Parent",
      address: "",
      priority: "Primary",
      isActive: true,
      emergencyAccessEnabled: false,
      accessLevel: 1,
      contactUserId: null,
    });
    setIsContactModalOpen(true);
  };

  const openEditContactModal = (contact) => {
    setContactMode("edit");
    setContactType(contact.isRegisteredUser ? "registered" : "external");
    setSelectedUser(contact.contactUser || null);
    setContactForm({
      id: contact._id,
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      phone: contact.phone || "",
      alternativePhone: contact.alternativePhone || "",
      email: contact.email || "",
      relationship: contact.relationship || "Other",
      address: contact.address || "",
      priority: contact.priority || "Primary",
      isActive: contact.isActive !== undefined ? contact.isActive : true,
      emergencyAccessEnabled: Boolean(contact.emergencyAccessEnabled),
      accessLevel: contact.accessLevel || 1,
      contactUserId: contact.contactUser?._id || null,
    });
    setIsContactModalOpen(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!contactForm.firstName || !contactForm.phone) {
      alert("First name and phone number are required.");
      return;
    }

    if (contactMode === "create") {
      await dispatch(
        addEmergencyContact({
          ...contactForm,
          contactUserId: selectedUser ? selectedUser._id : null,
        })
      );
    } else {
      await dispatch(
        updateEmergencyContact({
          id: contactForm.id,
          data: contactForm,
        })
      );
    }
    setIsContactModalOpen(false);
  };

  const handleDeleteContact = (id, name) => {
    if (window.confirm(`Remove ${name} from your emergency contacts?`)) {
      dispatch(deleteEmergencyContact(id));
    }
  };

  const toggleContactAccess = (contact) => {
    dispatch(
      updateEmergencyContact({
        id: contact._id,
        data: { emergencyAccessEnabled: !contact.emergencyAccessEnabled },
      })
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Banner / Title */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">My Patient Profile</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
              {profile?.mrn ? `MRN: ${profile.mrn}` : "CENTRIC CARE"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage your personal identity, quick-response emergency medical summary, and trusted emergency contacts.
          </p>
        </div>

        {/* System Verification Pill */}
        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-gray-200 shadow-xs self-start">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-gray-700">Account Active &amp; Verified</span>
        </div>
      </div>

      {/* Success / Error Feedback Toast */}
      {actionMessage && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearPatientActionMessage())}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearPatientActionMessage())}
            className="text-red-600 hover:text-red-800 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === "personal"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <User className="w-4 h-4" />
          Personal Details
        </button>

        <button
          onClick={() => setActiveTab("emergency")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === "emergency"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Emergency Medical Profile
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === "contacts"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <Users className="w-4 h-4" />
          Emergency Contacts ({emergencyContacts.length})
        </button>

        <button
          onClick={() => setActiveTab("trusted")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === "trusted"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-emerald-500" />
          People Who Trusted You ({trustedPatients.length})
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeTab === "logs"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
          }`}
        >
          <History className="w-4 h-4" />
          Access Audit Logs ({accessLogs.length})
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: PERSONAL INFORMATION
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "personal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-md mb-4 overflow-hidden border-2 border-white">
              {personalForm.photo ? (
                <img
                  src={personalForm.photo}
                  alt={profile?.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                (profile?.username || "P").charAt(0).toUpperCase()
              )}
            </div>

            <h2 className="text-lg font-bold text-gray-800">{profile?.username}</h2>
            <p className="text-xs font-semibold text-purple-700 mt-0.5">
              MRN: {profile?.mrn || "Pending"}
            </p>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mt-2">
              Role: {profile?.role || "Patient"}
            </span>

            <div className="w-full mt-6 pt-5 border-t border-gray-100 text-left space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{profile?.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>
                  DOB: {profile?.dob ? new Date(profile.dob).toLocaleDateString() : "Not set"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{profile?.address || "No address provided"}</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-1">Edit Personal Details</h3>
            <p className="text-xs text-gray-400 mb-5">
              Update your contact and demographic profile stored in CENTRIC CARE.
            </p>

            <form onSubmit={handleSavePersonal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={personalForm.username}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={personalForm.phone}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, phone: e.target.value })
                    }
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={personalForm.dob}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, dob: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Gender</label>
                  <select
                    value={personalForm.gender}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={personalForm.address}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, address: e.target.value })
                    }
                    placeholder="Street, City, State, ZIP"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-semibold mb-1">Profile Photo URL</label>
                  <input
                    type="url"
                    value={personalForm.photo}
                    onChange={(e) =>
                      setPersonalForm({ ...personalForm, photo: e.target.value })
                    }
                    placeholder="https://example.com/photo.jpg"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={actionStatus === "loading"}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition shadow-sm disabled:opacity-50"
                >
                  {actionStatus === "loading" ? "Saving..." : "Save Personal Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: EMERGENCY MEDICAL PROFILE
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "emergency" && (
        <div className="space-y-6">
          {/* Emergency Alert Context Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-xs text-amber-900">
              <h4 className="font-bold">Rapid Emergency Decision Summary</h4>
              <p className="mt-0.5 text-amber-800">
                This quick summary is accessed by authorized doctors and hospital staff when a patient is unconscious, in an accident, or unable to communicate. It displays vital blood type, allergies, critical conditions, and emergency instructions.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveEmergency} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-red-500" />
                  Blood Type
                </label>
                <select
                  value={emergencyForm.bloodType}
                  onChange={(e) =>
                    setEmergencyForm({ ...emergencyForm, bloodType: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl font-bold text-red-600 bg-red-50/30 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                >
                  {bloodTypes.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 175"
                  value={emergencyForm.height}
                  onChange={(e) =>
                    setEmergencyForm({ ...emergencyForm, height: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={emergencyForm.weight}
                  onChange={(e) =>
                    setEmergencyForm({ ...emergencyForm, weight: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 font-bold mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Latex, Peanuts, Sulfa"
                  value={emergencyForm.allergies}
                  onChange={(e) =>
                    setEmergencyForm({ ...emergencyForm, allergies: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Critical for avoiding dangerous drug or allergen reactions.
                </span>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-red-500" />
                  Critical Medical Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Type 1 Diabetes, Severe Asthma, Epilepsy, Hypertension"
                  value={emergencyForm.criticalConditions}
                  onChange={(e) =>
                    setEmergencyForm({
                      ...emergencyForm,
                      criticalConditions: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Important Current Medications (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Insulin, Warfarin (Blood thinner), Albuterol inhaler"
                  value={emergencyForm.currentImportantMedications}
                  onChange={(e) =>
                    setEmergencyForm({
                      ...emergencyForm,
                      currentImportantMedications: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Previous Important Surgeries / Implants (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pacemaker, Appendectomy, Coronary Stent (2022)"
                  value={emergencyForm.surgeries}
                  onChange={(e) =>
                    setEmergencyForm({ ...emergencyForm, surgeries: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-red-700 font-bold mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  Emergency Warnings (Highlighted in Bold Red for Emergency Responders)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Patient carries an auto-injector (EpiPen) in backpack. Do not administer Aspirin."
                  value={emergencyForm.emergencyWarnings}
                  onChange={(e) =>
                    setEmergencyForm({
                      ...emergencyForm,
                      emergencyWarnings: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-red-200 bg-red-50/20 rounded-xl text-red-900 font-medium focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  Emergency Instructions &amp; Directives
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Organ donor. Contact spouse immediately before administering sedation."
                  value={emergencyForm.emergencyInstructions}
                  onChange={(e) =>
                    setEmergencyForm({
                      ...emergencyForm,
                      emergencyInstructions: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={actionStatus === "loading"}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition shadow-sm disabled:opacity-50"
              >
                {actionStatus === "loading" ? "Saving..." : "Save Emergency Profile"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: EMERGENCY CONTACTS / TRUSTED PERSONS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "contacts" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Emergency Contacts &amp; Trusted Persons
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Persons notified in an emergency, with optional granular medical access levels.
              </p>
            </div>

            <button
              onClick={openAddContactModal}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 self-start"
            >
              <Plus className="w-4 h-4" />
              Add Emergency Contact
            </button>
          </div>

          {emergencyContacts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700 text-sm">No emergency contacts added yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                Add family members, guardians, or friends who can be reached immediately in clinical emergencies.
              </p>
              <button
                onClick={openAddContactModal}
                className="mt-4 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition"
              >
                + Add First Contact
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {emergencyContacts.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shadow-xs">
                          {c.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">
                            {c.firstName} {c.lastName}
                          </h4>
                          <span className="text-[11px] font-semibold text-purple-700">
                            {c.relationship}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          c.priority === "Primary"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {c.priority}
                      </span>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-gray-50 p-3 rounded-xl space-y-2 text-xs text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone:
                        </span>
                        <a
                          href={`tel:${c.phone}`}
                          className="font-bold text-purple-700 hover:underline flex items-center gap-1"
                        >
                          {c.phone}
                        </a>
                      </div>

                      {c.alternativePhone && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Alt Phone:</span>
                          <a href={`tel:${c.alternativePhone}`} className="hover:underline">
                            {c.alternativePhone}
                          </a>
                        </div>
                      )}

                      {c.email && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="truncate max-w-[150px]">{c.email}</span>
                        </div>
                      )}

                      {/* Registration & Access Badge */}
                      <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-gray-500">Account Type:</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full ${
                            c.isRegisteredUser
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {c.isRegisteredUser ? "Registered User" : "External Contact"}
                        </span>
                      </div>

                      {c.isRegisteredUser && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">Medical Access:</span>
                          <span
                            className={`font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full ${
                              c.emergencyAccessEnabled
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {c.emergencyAccessEnabled ? (
                              <>
                                <Unlock className="w-3 h-3 text-emerald-600" /> Level {c.accessLevel}
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-gray-400" /> Disabled
                              </>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    {c.isRegisteredUser && (
                      <button
                        onClick={() => toggleContactAccess(c)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                          c.emergencyAccessEnabled
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {c.emergencyAccessEnabled ? "Disable Access" : "Enable Access"}
                      </button>
                    )}

                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => openEditContactModal(c)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Edit Contact"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(c._id, `${c.firstName} ${c.lastName}`)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Contact"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: PEOPLE WHO TRUSTED YOU (Trusted Person Portal)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "trusted" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Patients Who Designated You As A Trusted Person
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Patients who have granted you emergency access under their profile. You can view only the information permitted by their specific authorization level.
            </p>
          </div>

          {trustedPatients.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
              <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-700 text-sm">No trusted authorizations found</h3>
              <p className="text-xs text-gray-400 mt-1">
                You have not yet been added as an active emergency trusted contact by any patient.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {trustedPatients.map((tp) => (
                <div
                  key={tp.authorizationId}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                          {(tp.patient.username || "P").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm">
                            {tp.patient.username}
                          </h4>
                          <span className="text-[11px] font-semibold text-emerald-700">
                            Relationship: {tp.relationship}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Level {tp.accessLevel}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl text-xs space-y-1.5 text-gray-600 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">MRN:</span>
                        <span className="font-semibold text-purple-700">{tp.patient.mrn || "Pending"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Blood Type:</span>
                        <span className="font-bold text-red-600">
                          {tp.emergencySummary?.bloodType || "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Permitted Access:</span>
                        <span className="font-medium text-gray-700">
                          {tp.accessLevel === 1 && "Emergency Summary"}
                          {tp.accessLevel === 2 && "Summary + Medications"}
                          {tp.accessLevel === 3 && "Full Clinical Records"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setViewingTrustedPatient(tp)}
                      className="w-full py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Authorized Medical Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: ACCESS AUDIT LOGS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-800">Emergency Access Audit History</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Traceable log of all doctors and clinical staff who have accessed your emergency medical profile.
            </p>
          </div>

          {accessLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              No emergency profile access events recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="p-3">Staff Member</th>
                    <th className="p-3">Role / Specialty</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Date &amp; Time</th>
                    <th className="p-3">Access Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accessLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-bold text-gray-800">
                        {log.accessedBy?.username || "Authorized Hospital User"}
                      </td>
                      <td className="p-3 capitalize text-purple-700 font-medium">
                        {log.accessedBy?.specialty
                          ? `Dr. (${log.accessedBy.specialty})`
                          : log.role}
                      </td>
                      <td className="p-3 text-gray-600">{log.reason || "Emergency Review"}</td>
                      <td className="p-3 text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          {log.accessType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT EMERGENCY CONTACT
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {contactMode === "create" ? "Add Emergency Contact" : "Edit Emergency Contact"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Configure contact details and granular emergency medical permissions.
                  </p>
                </div>
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
                {/* Contact Type Selector (Create Mode Only) */}
                {contactMode === "create" && (
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setContactType("external");
                        setSelectedUser(null);
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                        contactType === "external"
                          ? "bg-white text-purple-700 shadow-xs"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      External Person
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactType("registered")}
                      className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition ${
                        contactType === "registered"
                          ? "bg-white text-purple-700 shadow-xs"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Registered CENTRIC CARE User
                    </button>
                  </div>
                )}

                {/* Registered User Search Box */}
                {contactType === "registered" && contactMode === "create" && (
                  <div className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100 space-y-2">
                    <label className="block text-purple-900 font-bold">
                      Search User by Name or Email
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Type at least 2 characters to search..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                      />
                    </div>

                    {/* Results dropdown */}
                    {userSearchResults.length > 0 && !selectedUser && (
                      <div className="max-h-36 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-md divide-y divide-gray-100 mt-1">
                        {userSearchResults.map((u) => (
                          <div
                            key={u._id}
                            onClick={() => {
                              setSelectedUser(u);
                              setContactForm({
                                ...contactForm,
                                firstName: u.username,
                                email: u.email,
                                contactUserId: u._id,
                              });
                            }}
                            className="p-2.5 hover:bg-purple-50 cursor-pointer flex items-center justify-between"
                          >
                            <span className="font-bold text-gray-800">{u.username}</span>
                            <span className="text-gray-500 text-[11px]">{u.email}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedUser && (
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 text-emerald-800">
                        <span className="font-bold">
                          Linked: {selectedUser.username} ({selectedUser.email})
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(null);
                            setContactForm({ ...contactForm, contactUserId: null });
                          }}
                          className="text-red-600 text-xs hover:underline font-semibold"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.firstName}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      value={contactForm.lastName}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, phone: e.target.value })
                      }
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Alt. Phone</label>
                    <input
                      type="tel"
                      value={contactForm.alternativePhone}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, alternativePhone: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Relationship *</label>
                    <select
                      value={contactForm.relationship}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, relationship: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none bg-white"
                    >
                      {relationships.map((rel) => (
                        <option key={rel} value={rel}>
                          {rel}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Priority</label>
                    <select
                      value={contactForm.priority}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, priority: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none bg-white"
                    >
                      <option value="Primary">Primary (First Call)</option>
                      <option value="Secondary">Secondary</option>
                      <option value="Tertiary">Tertiary</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Registered User Medical Authorization Levels */}
                {(contactType === "registered" || selectedUser) && (
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900">Enable Medical Profile Access</span>
                      <input
                        type="checkbox"
                        checked={contactForm.emergencyAccessEnabled}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            emergencyAccessEnabled: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-400 cursor-pointer"
                      />
                    </div>

                    {contactForm.emergencyAccessEnabled && (
                      <div className="space-y-2 pt-2 border-t border-purple-100">
                        <label className="block font-bold text-gray-700">
                          Select Access Level:
                        </label>
                        <div className="space-y-1.5">
                          <label className="flex items-start gap-2 p-2 rounded-xl bg-white border border-gray-200 cursor-pointer">
                            <input
                              type="radio"
                              name="accessLevel"
                              value={1}
                              checked={Number(contactForm.accessLevel) === 1}
                              onChange={() =>
                                setContactForm({ ...contactForm, accessLevel: 1 })
                              }
                              className="mt-0.5"
                            />
                            <div>
                              <span className="font-bold text-gray-800 block">
                                Level 1 — Emergency Summary
                              </span>
                              <span className="text-[11px] text-gray-500">
                                Blood type, allergies, height, weight, critical conditions, emergency warnings.
                              </span>
                            </div>
                          </label>

                          <label className="flex items-start gap-2 p-2 rounded-xl bg-white border border-gray-200 cursor-pointer">
                            <input
                              type="radio"
                              name="accessLevel"
                              value={2}
                              checked={Number(contactForm.accessLevel) === 2}
                              onChange={() =>
                                setContactForm({ ...contactForm, accessLevel: 2 })
                              }
                              className="mt-0.5"
                            />
                            <div>
                              <span className="font-bold text-gray-800 block">
                                Level 2 — Limited Medical Info
                              </span>
                              <span className="text-[11px] text-gray-500">
                                Level 1 plus current medications, surgeries, and diagnoses.
                              </span>
                            </div>
                          </label>

                          <label className="flex items-start gap-2 p-2 rounded-xl bg-white border border-gray-200 cursor-pointer">
                            <input
                              type="radio"
                              name="accessLevel"
                              value={3}
                              checked={Number(contactForm.accessLevel) === 3}
                              onChange={() =>
                                setContactForm({ ...contactForm, accessLevel: 3 })
                              }
                              className="mt-0.5"
                            />
                            <div>
                              <span className="font-bold text-gray-800 block">
                                Level 3 — Authorized Medical Record Access
                              </span>
                              <span className="text-[11px] text-gray-500">
                                Level 2 plus access to signed medical records and clinical SOAP notes.
                              </span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsContactModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionStatus === "loading"}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition shadow-sm"
                  >
                    {contactMode === "create" ? "Add Contact" : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: VIEW TRUSTED PATIENT MEDICAL DATA
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {viewingTrustedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                    {(viewingTrustedPatient.patient.username || "P").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {viewingTrustedPatient.patient.username}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-700">
                      Authorized at Level {viewingTrustedPatient.accessLevel} (Relationship:{" "}
                      {viewingTrustedPatient.relationship})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingTrustedPatient(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Level 1 Data */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                  <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    Level 1 — Emergency Summary
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px]">Blood Type</span>
                      <span className="font-extrabold text-red-600 text-sm">
                        {viewingTrustedPatient.emergencySummary?.bloodType || "Unknown"}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px]">Height</span>
                      <span className="font-bold text-gray-800">
                        {viewingTrustedPatient.emergencySummary?.height
                          ? `${viewingTrustedPatient.emergencySummary.height} cm`
                          : "Not recorded"}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px]">Weight</span>
                      <span className="font-bold text-gray-800">
                        {viewingTrustedPatient.emergencySummary?.weight
                          ? `${viewingTrustedPatient.emergencySummary.weight} kg`
                          : "Not recorded"}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px]">Gender</span>
                      <span className="font-bold text-gray-800 capitalize">
                        {viewingTrustedPatient.patient.gender || "—"}
                      </span>
                    </div>
                  </div>

                  {viewingTrustedPatient.emergencySummary?.allergies?.length > 0 && (
                    <div>
                      <span className="text-gray-500 font-semibold block mb-1">Allergies:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {viewingTrustedPatient.emergencySummary.allergies.map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold text-[11px]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewingTrustedPatient.emergencySummary?.criticalConditions?.length > 0 && (
                    <div>
                      <span className="text-gray-500 font-semibold block mb-1">
                        Critical Conditions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {viewingTrustedPatient.emergencySummary.criticalConditions.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-[11px]"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {viewingTrustedPatient.emergencySummary?.emergencyWarnings && (
                    <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-red-800">
                      <span className="font-bold block">Emergency Warning:</span>
                      <span>{viewingTrustedPatient.emergencySummary.emergencyWarnings}</span>
                    </div>
                  )}
                </div>

                {/* Level 2 Data */}
                {viewingTrustedPatient.accessLevel >= 2 && (
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-2">
                    <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-purple-700" />
                      Level 2 — Limited Medical Information
                    </h4>

                    {viewingTrustedPatient.limitedMedicalInfo?.currentImportantMedications?.length >
                      0 && (
                      <div>
                        <span className="font-semibold text-gray-700 block mb-1">
                          Current Medications:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {viewingTrustedPatient.limitedMedicalInfo.currentImportantMedications.map(
                            (m, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-0.5 bg-white border border-purple-200 rounded-full text-purple-800 font-medium"
                              >
                                {m}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {viewingTrustedPatient.limitedMedicalInfo?.surgeries?.length > 0 && (
                      <div>
                        <span className="font-semibold text-gray-700 block mb-1">
                          Surgeries &amp; Implants:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {viewingTrustedPatient.limitedMedicalInfo.surgeries.map((s, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 bg-white border border-gray-200 rounded-full text-gray-700 font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Level 3 Data */}
                {viewingTrustedPatient.accessLevel >= 3 && (
                  <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                    <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-700" />
                      Level 3 — Authorized Signed Medical Records
                    </h4>

                    {(!viewingTrustedPatient.medicalRecords ||
                      viewingTrustedPatient.medicalRecords.length === 0) ? (
                      <p className="text-gray-400 text-[11px]">No signed medical records available.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {viewingTrustedPatient.medicalRecords.map((rec) => (
                          <div
                            key={rec._id}
                            className="bg-white p-3 rounded-xl border border-gray-200 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-800">{rec.noteType}</span>
                              <span className="text-[10px] text-gray-400">
                                {new Date(rec.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600">
                              <strong>Assessment:</strong> {rec.assessment}
                            </p>
                            <p className="text-gray-600">
                              <strong>Plan:</strong> {rec.plan}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t flex justify-end">
                <button
                  onClick={() => setViewingTrustedPatient(null)}
                  className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientProfile;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPatientRecords,
  createMedicalRecord,
  clearRecordMessages,
} from "../../redux/slices/medicalRecordSlice";
import MedicalRecordList from "../../components/Dashboard/MedicalRecordList";
import AIAssistant from "../../components/Dashboard/AIAssistant";
import EmergencyProfileModal from "../../components/EmergencyProfileModal";
import { doctorFetchEmergencyProfile } from "../../redux/slices/patientSlice";
import {
  User,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

const noteTypes = [
  "Progress Note",
  "Discharge Summary",
  "Referral Note",
  "Consultation Note",
  "Operative Note",
  "History and Physical Note",
  "Admission Note",
  "Death Summary",
];

const PatientRecord = () => {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const statePatient = location.state?.patient;
  const stateAppointment = location.state?.appointment;

  const { records, status, createStatus, error, successMessage } = useSelector(
    (state) => state.medicalRecords
  );
  const { doctorEmergencyPatient, doctorEmergencyStatus } = useSelector(
    (state) => state.patients
  );

  const [activeTab, setActiveTab] = useState("records");
  const [patientData, setPatientData] = useState(statePatient || null);
  const [activeAppointmentId, setActiveAppointmentId] = useState(
    stateAppointment?._id || ""
  );
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const handleOpenEmergency = () => {
    if (patientId) {
      dispatch(
        doctorFetchEmergencyProfile({
          patientId,
          reason: "Consultation Emergency Medical Review",
        })
      );
      setIsEmergencyModalOpen(true);
    }
  };

  const [formData, setFormData] = useState({
    noteType: "Consultation Note",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const patientContext = patientData
    ? `Patient: ${patientData.username}, MRN: ${patientData.mrn || "Pending"}, Gender: ${patientData.gender || "Not specified"}. Active Doctor: Dr. ${currentUser.username || ""} (${currentUser.specialty || "General"}). Current SOAP input - Subjective: "${formData.subjective || "None yet"}", Objective: "${formData.objective || "None yet"}", Assessment: "${formData.assessment || "None yet"}"`
    : "";

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientRecords(patientId));
    }
  }, [patientId, dispatch]);

  useEffect(() => {
    // If patient data wasn't passed in navigation state, fetch from API
    if (!patientData && patientId) {
      const fetchPatient = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:5000/api/patients/${patientId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setPatientData(data);
          }
        } catch (err) {
          console.error("Error fetching patient details:", err);
        }
      };
      fetchPatient();
    }
  }, [patientId, patientData]);

  // If appointment ID was not passed, look for an active appointment in records or fetch
  useEffect(() => {
    if (!activeAppointmentId && patientId) {
      const findActiveAppointment = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`http://localhost:5000/api/doctors/assigned-appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const matchingAppt = (data.data || []).find(
              (a) => a.userId?._id === patientId || a.userId === patientId
            );
            if (matchingAppt) {
              setActiveAppointmentId(matchingAppt._id);
            }
          }
        } catch (err) {
          console.warn("Could not find active appointment:", err);
        }
      };
      findActiveAppointment();
    }
  }, [activeAppointmentId, patientId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();

    if (!formData.subjective || !formData.objective || !formData.assessment || !formData.plan) {
      alert("Please complete all SOAP note fields (Subjective, Objective, Assessment, Plan).");
      return;
    }

    if (!activeAppointmentId) {
      alert(
        "No active appointment linked to this record. Please select or ensure an appointment exists for this patient consultation."
      );
      return;
    }

    const payload = {
      patient: patientId,
      appointment: activeAppointmentId,
      noteType: formData.noteType,
      subjective: formData.subjective,
      objective: formData.objective,
      assessment: formData.assessment,
      plan: formData.plan,
    };

    const result = await dispatch(createMedicalRecord(payload));
    if (createMedicalRecord.fulfilled.match(result)) {
      setFormData({
        noteType: "Consultation Note",
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
      });
      setActiveTab("records");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back button & Title */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-purple-700 bg-white px-3 py-1.5 rounded-lg border border-gray-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Appointments
        </button>

        <span className="text-xs text-gray-400">
          Doctor: Dr. {currentUser.username} ({currentUser.specialty || "General"})
        </span>
      </div>

      {/* Patient Demographic Card */}
      {patientData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl font-bold">
              {(patientData.username || "P").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {patientData.username}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                <span>MRN: <strong className="text-purple-700">{patientData.mrn || "Pending"}</strong></span>
                <span>Email: {patientData.email}</span>
                {patientData.phone && <span>Phone: {patientData.phone}</span>}
                {patientData.gender && <span>Gender: {patientData.gender}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleOpenEmergency}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Emergency Profile
            </button>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
              Active Consultation Access
            </span>
          </div>
        </motion.div>
      )}

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-6 space-x-3">
        <button
          onClick={() => setActiveTab("records")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "records"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          Consultation History ({records.length})
        </button>
        <button
          onClick={() => setActiveTab("new")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "new"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Write Clinical Note (SOAP)
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeTab === "ai"
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          AI Clinical Assistant
        </button>
      </div>

      {/* Records Tab */}
      {activeTab === "records" && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          {status === "loading" ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              Loading medical records...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              No clinical notes recorded for this patient yet. Click "Write Clinical Note" to start.
            </div>
          ) : (
            <MedicalRecordList records={records} />
          )}
        </div>
      )}

      {/* New SOAP Note Tab */}
      {activeTab === "new" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 max-w-3xl mx-auto"
        >
          <div className="border-b pb-4 mb-5">
            <h3 className="text-lg font-bold text-gray-800">
              Create Hospital Consultation Note
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Standard structured medical documentation (SOAP format). Saved records are immediately available to the patient.
            </p>
          </div>

          <form onSubmit={handleSaveRecord} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Note Category
              </label>
              <select
                name="noteType"
                value={formData.noteType}
                onChange={handleChange}
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                {noteTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* S - Subjective */}
            <div>
              <label className="block text-xs font-semibold text-purple-900 mb-1">
                S — Subjective (Patient's narrative, symptoms, history of present illness)
              </label>
              <textarea
                name="subjective"
                rows={3}
                value={formData.subjective}
                onChange={handleChange}
                placeholder="Patient reports onset of symptoms 3 days ago, describes pain as..."
                required
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            {/* O - Objective */}
            <div>
              <label className="block text-xs font-semibold text-blue-900 mb-1">
                O — Objective (Vital signs, physical exam findings, lab/diagnostic data)
              </label>
              <textarea
                name="objective"
                rows={3}
                value={formData.objective}
                onChange={handleChange}
                placeholder="BP 120/80, HR 72, Temp 98.6°F. Physical exam reveals..."
                required
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            {/* A - Assessment */}
            <div>
              <label className="block text-xs font-semibold text-green-900 mb-1">
                A — Assessment (Diagnosis, differential diagnoses, clinical impression)
              </label>
              <textarea
                name="assessment"
                rows={2}
                value={formData.assessment}
                onChange={handleChange}
                placeholder="Primary diagnosis: Acute viral pharyngitis..."
                required
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            {/* P - Plan */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-indigo-900">
                  P — Plan (Treatment, medication, patient education, follow-up)
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab("ai")}
                  className="flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-semibold"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  AI Clinical Suggestions
                </button>
              </div>
              <textarea
                name="plan"
                rows={3}
                value={formData.plan}
                onChange={handleChange}
                placeholder="Prescribed rest, hydration, acetaminophen 500mg as needed. Follow up in 5 days if..."
                required
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("records")}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={createStatus === "loading"}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {createStatus === "loading" ? "Saving Record..." : "Save Record & Sign"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* AI Assistant Tab */}
      {activeTab === "ai" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <AIAssistant
            initialPatientId={patientId}
            patientContext={patientContext}
            onInsertToSOAP={(aiSuggestion) => {
              setFormData((prev) => ({
                ...prev,
                plan: prev.plan
                  ? `${prev.plan}\n\n[AI Recommendation]:\n${aiSuggestion}`
                  : aiSuggestion,
              }));
              setActiveTab("new");
            }}
          />
        </motion.div>
      )}

      {/* Doctor Emergency Profile Modal */}
      <EmergencyProfileModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        data={doctorEmergencyPatient}
        loading={doctorEmergencyStatus === "loading"}
      />
    </div>
  );
};

export default PatientRecord;

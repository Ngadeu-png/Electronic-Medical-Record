import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import MedicalRecordList from "../../components/Dashboard/MedicalRecordList";

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
  const state = useLocation().state;

  const [activeTab, setActiveTab] = useState("records");
  const [patientRecords, setPatientRecords] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
const [isEditing, setIsEditing] = useState(false);
const [editingRecordId, setEditingRecordId] = useState(null);


  const [newRecord, setNewRecord] = useState({
    noteType: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    doctor: "68c1b63a98c78f06b9346fd0",
    appointment: "68c12b1d8ffdfb92ff5c7345",
  });
  
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); // get token
        const res = await fetch(
          `http://localhost:5000/api/medical-records/patient/${patientId}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`, // attach token
            },
          }
        );
        const data = await res.json();
       console.log("rec",data);
       
        if (res.ok) setPatientRecords(data.data || []);
        else console.error("Fetch error:", data);
      } catch (err) {
        console.error("Error fetching records:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [patientId]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Save new patient record
  const handleSaveRecord = async () => {
    const {
      noteType,
      subjective,
      objective,
      assessment,
      plan,
      doctor,
      appointment,
    } = newRecord;
  console.log("PATIENT ID:", patientId);
  console.log("DOCTOR ID:", doctor);
  console.log("APPOINTMENT ID:", appointment);


    if (!noteType || !subjective || !objective || !assessment || !plan) {
      alert("Please fill in all required fields");
      return;
    }

    const payload = {
      patient: patientId,
      doctor,
      appointment,
      noteType,
      subjective,
      objective,
      assessment,
      plan,
    };

    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/medical-records/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
          
      if (res.ok) {
        alert("Patient record saved successfully!");
        setPatientRecords((prev) => [...prev, data.record]);
        setNewRecord({
          noteType: "",
          subjective: "",
          objective: "",
          assessment: "",
          plan: "",
          doctor,
          appointment,
        });
        setSelectedFile(null);
        setActiveTab("records");
      } else {
        console.error("Save error:", data);
        alert(`Failed to save record: ${data.error || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error("Error saving record:", err);
      alert("Server error. Check console for details.");
    }
  };

// Update patient info
const handleUpdate = (id) => {
  const token = localStorage.getItem("token");

  fetch(`http://localhost:5000/api/medical-record/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData), // send new values
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        alert("Record updated successfully ✅");
        setIsEditing(false);   // close modal/form
        fetchRecords();        // refresh updated list
      } else {
        alert(data.error || "Failed to update record");
      }
    })
    .catch((err) => {
      console.error("Error updating patient:", err);
      alert("Something went wrong while updating record");
    });
};

  return (

    <div className="p-6 bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-indigo-700">Patient Records</h1>
        <p className="text-gray-600">
          Manage consultation history, add new records, and share reports
        </p>
      </motion.div>

      <div className="flex justify-center mb-6 space-x-4">
        <button
          onClick={() => setActiveTab("records")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "records"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Records
        </button>
        <button
          onClick={() => setActiveTab("new")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "new"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Add Record
        </button>
      </div>

      {state?.patient && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-2xl font-bold shadow-md">
              {state.patient.username?.charAt(0) || "P"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {state.patient.username}
              </h2>
              <p className="text-gray-500">MRN: {state.patient.mrn}</p>
              <p className="text-sm text-indigo-600 font-medium capitalize">
                {state.patient.role}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-gray-700">
            <p>
<button
  onClick={() => {
    setIsEditing(true);
    setEditingRecordId(state.patient._id); // use the real record id
    setNewRecord({
      noteType: state.patient.noteType || "",
      subjective: state.patient.subjective || "",
      objective: state.patient.objective || "",
      assessment: state.patient.assessment || "",
      plan: state.patient.plan || "",
    });
    setShowEditModal(true);
  }}
  className="px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
>
  Edit Record
</button>
            </p>
          </div>
        </motion.div>
      )}

      {activeTab === "records" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-md p-6"
        >
          {loading ? (
            <div className="text-center text-gray-500">Loading records...</div>
          ) : patientRecords.length === 0 ? (
            <div className="text-center text-gray-500">
              No records found for this patient.
            </div>
          ) : (
            <MedicalRecordList records={patientRecords} />
          )}
        </motion.div>
      )}

      {activeTab === "new" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-md p-6 space-y-6"
        >
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">
            Enter Patient Record
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Note Type
              </label>
              <select
                value={newRecord.noteType}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, noteType: e.target.value })
                }
                className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select note type</option>
                {noteTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Subjective
              </label>
              <textarea
                rows="3"
                value={newRecord.subjective}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, subjective: e.target.value })
                }
                className="border p-3 rounded-lg w-full resize-y focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Objective
              </label>
              <textarea
                rows="3"
                value={newRecord.objective}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, objective: e.target.value })
                }
                className="border p-3 rounded-lg w-full resize-y focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Assessment
              </label>
              <textarea
                rows="3"
                value={newRecord.assessment}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, assessment: e.target.value })
                }
                className="border p-3 rounded-lg w-full resize-y focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Plan
              </label>
              <textarea
                rows="3"
                value={newRecord.plan}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, plan: e.target.value })
                }
                className="border p-3 rounded-lg w-full resize-y focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-indigo-700 mb-2">
                Upload PDF Report
              </h3>
              <label className="flex items-center space-x-3 border-dashed border-2 border-gray-300 p-4 rounded-lg cursor-pointer hover:border-indigo-500 transition">
                <Upload className="w-6 h-6 text-indigo-600" />
                <span className="text-gray-700">
                  {selectedFile ? selectedFile.name : "Click to upload PDF"}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleSaveRecord}
              className="w-full mt-6 px-6 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition"
            >
              Save Record & Send to Patient
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PatientRecord;


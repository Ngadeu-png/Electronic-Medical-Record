import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchDoctorAppointments,
  acceptAssignment,
  rejectAssignment,
  redirectDoctor,
  redirectAdmin,
  completeAppointment,
  clearAppointmentMessages,
} from "../../redux/slices/appointmentSlice";
import { fetchDoctors } from "../../redux/slices/doctorSlice";
import {
  CheckCircle,
  XCircle,
  CornerUpRight,
  ArrowLeftRight,
  Calendar,
  Clock,
  User,
  FileText,
  AlertCircle,
  Check,
  RefreshCw,
} from "lucide-react";

// Modal for Rejection / Redirection Reasons
const ActionModal = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel,
  confirmVariant = "danger",
  showDoctorSelect = false,
  doctors = [],
  onSubmit,
}) => {
  const [reason, setReason] = useState("");
  const [targetDoctorId, setTargetDoctorId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide a reason.");
      return;
    }
    if (showDoctorSelect && !targetDoctorId) {
      alert("Please select a doctor to redirect to.");
      return;
    }
    onSubmit({ reason, targetDoctorId });
    setReason("");
    setTargetDoctorId("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-xs text-gray-500 mb-4">{description}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {showDoctorSelect && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Select Specialist / Doctor
              </label>
              <select
                value={targetDoctorId}
                onChange={(e) => setTargetDoctorId(e.target.value)}
                required
                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none"
              >
                <option value="">— Choose a specialist —</option>
                {doctors.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    Dr. {doc.username} ({doc.specialty})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Reason / Medical Note <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this action is being taken (e.g., specialty mismatch, workload, out of office)..."
              required
              className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition ${
                confirmVariant === "danger"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DoctorAppoint = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    doctorAppointments: appointments,
    status,
    actionStatus,
    successMessage,
    error,
  } = useSelector((state) => state.appointments);

  const { items: allDoctors } = useSelector((state) => state.doctors);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [activeTab, setActiveTab] = useState("all");
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [modalType, setModalType] = useState(null); // 'reject' | 'redirectDoctor' | 'redirectAdmin'

  useEffect(() => {
    dispatch(fetchDoctorAppointments());
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearAppointmentMessages());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleAccept = async (appointmentId) => {
    await dispatch(acceptAssignment(appointmentId));
    dispatch(fetchDoctorAppointments());
  };

  const handleComplete = async (appointmentId) => {
    if (window.confirm("Mark this consultation as completed?")) {
      await dispatch(completeAppointment(appointmentId));
      dispatch(fetchDoctorAppointments());
    }
  };

  const handleModalSubmit = async ({ reason, targetDoctorId }) => {
    if (!selectedAppt) return;

    if (modalType === "reject") {
      await dispatch(rejectAssignment({ appointmentId: selectedAppt._id, reason }));
    } else if (modalType === "redirectDoctor") {
      await dispatch(
        redirectDoctor({
          appointmentId: selectedAppt._id,
          targetDoctorId,
          reason,
        })
      );
    } else if (modalType === "redirectAdmin") {
      await dispatch(redirectAdmin({ appointmentId: selectedAppt._id, reason }));
    }

    setModalType(null);
    setSelectedAppt(null);
    dispatch(fetchDoctorAppointments());
  };

  // Filter out the logged-in doctor from the redirect target list
  const otherDoctors = allDoctors.filter((d) => d._id !== currentUser._id);

  // Categorize
  const pendingAcceptance = appointments.filter((a) => a.status === "assigned");
  const acceptedCases = appointments.filter((a) => a.status === "accepted");

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assigned appointment</h1>
          <p className="text-sm text-gray-500">
            Review incoming assignments, accept patient care, or request reassignment.
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchDoctorAppointments())}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition shadow-sm self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Assignments
        </button>
      </div>

      {/* Feedback Messages */}
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
      <div className="flex gap-2 border-b border-gray-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === "all"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          All Assigned ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === "pending"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Awaiting Decision ({pendingAcceptance.length})
        </button>
        <button
          onClick={() => setActiveTab("accepted")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            activeTab === "accepted"
              ? "bg-purple-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-100"
          }`}
        >
          Active appointments ({acceptedCases.length})
        </button>
      </div>

      {/* Content */}
      {status === "loading" && appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-xs">
          Loading assigned consultations...
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-500">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-700 text-sm">No assignments found</h3>
          <p className="text-xs text-gray-400 mt-1">
            You do not currently have any patient appointments assigned by the administration.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeTab === "pending"
            ? pendingAcceptance
            : activeTab === "accepted"
            ? acceptedCases
            : appointments
          ).map((appt) => {
            const patient = appt.userId || {};
            const isPendingDecision = appt.status === "assigned";
            const isAccepted = appt.status === "accepted";

            return (
              <div
                key={appt._id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                        {(patient.username || "P").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {patient.username || "Patient"}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {patient.mrn ? `MRN: ${patient.mrn}` : patient.email}
                          {patient.dob ? ` • Age: ${new Date().getFullYear() - new Date(patient.dob).getFullYear()}` : ""}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isAccepted
                          ? "bg-emerald-100 text-emerald-800"
                          : isPendingDecision
                          ? "bg-amber-100 text-amber-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {isAccepted ? "Accepted" : isPendingDecision ? "Awaiting Decision" : appt.status}
                    </span>
                  </div>

                  {/* Complaint */}
                  <div className="bg-gray-50 p-3 rounded-xl mb-4 space-y-1 text-xs">
                    <div className="text-gray-500">
                      Chief Complaint:{" "}
                      <span className="font-semibold text-gray-800">{appt.reason}</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-500" />
                        Type: <strong className="text-gray-700">{appt.type}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-500" />
                        {appt.appointmentDate
                          ? new Date(appt.appointmentDate).toLocaleString()
                          : new Date(appt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decision Actions */}
                <div className="pt-3 border-t border-gray-100">
                  {isPendingDecision ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {/* ACCEPT BUTTON */}
                        <button
                          onClick={() => handleAccept(appt._id)}
                          className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Accept Case
                        </button>

                        {/* REJECT BUTTON */}
                        <button
                          onClick={() => {
                            setSelectedAppt(appt);
                            setModalType("reject");
                          }}
                          className="flex-1 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject Case
                        </button>
                      </div>
                    </div>
                  ) : isAccepted ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {/* Write Record / Start Consultation */}
                        <button
                          onClick={() =>
                            navigate(`/Doctor/patients/patient/${patient._id}`, {
                              state: { patient, appointment: appt },
                            })
                          }
                          className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Medical Records / Consultation
                        </button>

                        {/* Mark Completed */}
                        <button
                          onClick={() => handleComplete(appt._id)}
                          className="px-3 py-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 text-xs font-semibold transition"
                          title="Mark consultation completed"
                        >
                          Complete
                        </button>
                      </div>

                      {/* Redirection Options */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSelectedAppt(appt);
                            setModalType("redirectDoctor");
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-medium transition flex items-center justify-center gap-1 border border-gray-200"
                        >
                          <ArrowLeftRight className="w-3 h-3 text-purple-600" />
                          Refer to Another Doctor
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAppt(appt);
                            setModalType("redirectAdmin");
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-[11px] font-medium transition flex items-center justify-center gap-1 border border-gray-200"
                        >
                          <CornerUpRight className="w-3 h-3 text-amber-600" />
                          Redirect to Admin
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>Status: {appt.status}</span>
                      <button
                        onClick={() =>
                          navigate(`/Doctor/patients/patient/${patient._id}`, {
                            state: { patient, appointment: appt },
                          })
                        }
                        className="text-purple-600 hover:underline font-semibold"
                      >
                        View Records
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Modal (Reject, Redirect to Doctor, Redirect to Admin) */}
      <ActionModal
        isOpen={!!modalType}
        onClose={() => {
          setModalType(null);
          setSelectedAppt(null);
        }}
        title={
          modalType === "reject"
            ? "Reject Patient Assignment"
            : modalType === "redirectDoctor"
            ? "Refer Patient to Specialist"
            : "Redirect Patient to Admin"
        }
        description={
          modalType === "reject"
            ? "Please provide a valid reason for declining this assignment. The admin will be notified to reassign the patient."
            : modalType === "redirectDoctor"
            ? "Choose another specialist and state the clinical reason for this transfer. Admin will confirm the transfer."
            : "Send this patient back to the administrative queue with your assessment and explanation."
        }
        confirmLabel={
          modalType === "reject"
            ? "Confirm Rejection"
            : modalType === "redirectDoctor"
            ? "Submit Referral"
            : "Send to Admin"
        }
        confirmVariant={modalType === "reject" ? "danger" : "primary"}
        showDoctorSelect={modalType === "redirectDoctor"}
        doctors={otherDoctors}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default DoctorAppoint;

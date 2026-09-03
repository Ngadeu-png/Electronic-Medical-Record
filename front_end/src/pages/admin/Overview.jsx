import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllAppointments,
  assignDoctor,
  unassignDoctor,
  clearAppointmentMessages,
} from "../../redux/slices/appointmentSlice";
import { fetchDoctors } from "../../redux/slices/doctorSlice";
import {
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Stethoscope,
  RefreshCw,
  Search,
  UserX,
} from "lucide-react";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case "pending_admin_assignment":
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "accepted":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "rejected_by_doctor":
        return "bg-red-100 text-red-800 border-red-300";
      case "redirected_to_doctor":
      case "redirected_to_admin":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "unassigned":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "pending_admin_assignment":
      case "pending":
        return "Pending Assignment";
      case "assigned":
        return "Doctor Assigned";
      case "accepted":
        return "Doctor Accepted";
      case "rejected_by_doctor":
        return "Rejected by Doctor";
      case "redirected_to_doctor":
        return "Redirect Requested";
      case "redirected_to_admin":
        return "Sent Back to Admin";
      case "completed":
        return "Completed";
      case "unassigned":
        return "Unassigned";
      default:
        return status || "Unknown";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}
    >
      {getLabel()}
    </span>
  );
};

// Doctor Selection Modal
const DoctorModal = ({ isOpen, onClose, onSelectDoctor, selectedAppointment, doctors }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  if (!isOpen) return null;

  const specialties = [
    "all",
    ...new Set(doctors.map((d) => d.specialty).filter(Boolean)),
  ];

  const filteredDoctors = doctors.filter((doc) => {
    const docName = doc.username || doc.name || "";
    const matchesSearch =
      docName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSpecialty =
      selectedSpecialty === "all" || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Assign Doctor</h2>
            <p className="text-xs text-gray-500 mt-1">
              Patient: <span className="font-semibold text-purple-700">{selectedAppointment?.userId?.username || "Guest"}</span> —{" "}
              Reason: {selectedAppointment?.reason}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Search & Filter */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by doctor name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-2.5 py-1 text-xs rounded-full capitalize whitespace-nowrap transition ${
                  selectedSpecialty === spec
                    ? "bg-purple-600 text-white font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No matching doctors available
            </div>
          ) : (
            filteredDoctors.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex justify-center items-center bg-purple-600 text-white font-bold text-sm">
                    {doc.username ? doc.username.charAt(0).toUpperCase() : "D"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm group-hover:text-purple-700">
                      Dr. {doc.username}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-purple-500" />
                      {doc.specialty || "General Medicine"}
                    </p>
                    <p className="text-[11px] text-gray-400">{doc.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectDoctor(doc)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm"
                >
                  Assign
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Appointment Management Component
const AdminAppointments = () => {
  const dispatch = useDispatch();
  const { items: appointments, status, error, successMessage } = useSelector(
    (state) => state.appointments
  );
  const { items: doctors } = useSelector((state) => state.doctors);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAllAppointments());
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

  const handleOpenAssignModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleSelectDoctor = async (doctor) => {
    if (!selectedAppointment || !doctor) return;
    await dispatch(
      assignDoctor({
        appointmentId: selectedAppointment._id,
        doctorId: doctor._id,
      })
    );
    setIsModalOpen(false);
    dispatch(fetchAllAppointments());
  };

  const handleUnassign = async (appointmentId) => {
    if (window.confirm("Are you sure you want to unassign the doctor from this appointment?")) {
      await dispatch(unassignDoctor(appointmentId));
      dispatch(fetchAllAppointments());
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appt) => {
    const patientName = appt.userId?.username?.toLowerCase() || "";
    const doctorName = appt.doctorId?.username?.toLowerCase() || "";
    const reason = appt.reason?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      patientName.includes(query) || doctorName.includes(query) || reason.includes(query);

    if (!matchesSearch) return false;

    if (activeTab === "pending") {
      return (
        appt.status === "pending_admin_assignment" ||
        appt.status === "pending" ||
        appt.status === "awaiting_reassignment"
      );
    }
    if (activeTab === "attention") {
      return (
        appt.status === "rejected_by_doctor" ||
        appt.status === "redirected_to_doctor" ||
        appt.status === "redirected_to_admin"
      );
    }
    if (activeTab === "active") {
      return appt.status === "assigned" || appt.status === "accepted";
    }
    if (activeTab === "completed") {
      return appt.status === "completed";
    }

    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Appointment Management & Doctor Assignment
          </h1>
          <p className="text-sm text-gray-500">
            Review patient bookings, assign doctors, and manage reassignment workflows.
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchAllAppointments())}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition shadow-sm self-start"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Success / Error alerts */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "Pending Assignment" },
            { id: "attention", label: "Needs Attention / Rejections" },
            { id: "active", label: "Active / Accepted" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Appointments List */}
      {status === "loading" && appointments.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          Loading appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-500">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-700">No appointments found</h3>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery
              ? "Try adjusting your search criteria."
              : "There are currently no appointments in this category."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((appt) => {
            const patient = appt.userId || {};
            const doctor = appt.doctorId;
            const patientInitial = (patient.username || "P").charAt(0).toUpperCase();

            return (
              <div
                key={appt._id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top row: Patient info & status badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full flex justify-center items-center bg-purple-500 text-white font-bold text-base shadow-sm">
                        {patientInitial}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-base">
                          {patient.username || "Guest Patient"}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {patient.mrn ? `MRN: ${patient.mrn}` : patient.email || "No email"}
                          {patient.gender ? ` • ${patient.gender}` : ""}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  {/* Complaint & Appointment Info */}
                  <div className="bg-gray-50 p-3 rounded-xl mb-3 space-y-1.5 text-xs text-gray-600">
                    <div>
                      <span className="font-medium text-gray-700">Complaint: </span>
                      <span className="text-gray-900 font-semibold">{appt.reason}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-500">
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

                  {/* Doctor Assignment Status */}
                  {doctor ? (
                    <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl mb-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-purple-600" />
                        <div>
                          <p className="font-semibold text-purple-900">
                            Dr. {doctor.username}
                          </p>
                          <p className="text-[11px] text-purple-600">{doctor.specialty || "Specialist"}</p>
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-white text-purple-700 border border-purple-200">
                        {appt.status === "accepted" ? "Accepted" : "Assigned"}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-gray-50 border border-dashed border-gray-200 rounded-xl mb-3 text-xs text-gray-500 text-center">
                      No doctor currently assigned
                    </div>
                  )}

                  {/* Rejection / Redirection Alert Box */}
                  {appt.status === "rejected_by_doctor" && appt.rejectionReason && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-3 text-xs text-red-700 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        Doctor Rejection Reason:
                      </div>
                      <p className="pl-5 italic">"{appt.rejectionReason}"</p>
                      <p className="pl-5 text-[10px] text-red-500 font-medium">
                        Action required: Please reassign this patient to another doctor.
                      </p>
                    </div>
                  )}

                  {appt.status === "redirected_to_doctor" && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3 text-xs text-amber-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Doctor Redirection Request:
                      </div>
                      <p className="pl-5">
                        {appt.redirectionReason || "Doctor requested referral to another specialist."}
                      </p>
                    </div>
                  )}

                  {appt.status === "redirected_to_admin" && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3 text-xs text-amber-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Sent Back to Admin:
                      </div>
                      <p className="pl-5">"{appt.redirectionReason || "Returned for reassignment"}"</p>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Assign / Reassign Button */}
                    <button
                      onClick={() => handleOpenAssignModal(appt)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm flex items-center gap-1"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      {doctor ? "Reassign Doctor" : "Assign Doctor"}
                    </button>

                    {/* Unassign Button (only if currently assigned) */}
                    {doctor && appt.status !== "completed" && (
                      <button
                        onClick={() => handleUnassign(appt._id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 transition flex items-center gap-1"
                        title="Unassign current doctor"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Unassign
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] text-gray-400">
                    ID: {appt._id.slice(-6)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Doctor Modal */}
      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectDoctor={handleSelectDoctor}
        selectedAppointment={selectedAppointment}
        doctors={doctors}
      />
    </div>
  );
};

export default AdminAppointments;

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctorAppointments } from "../../redux/slices/appointmentSlice";
import { Search, User, Calendar, Phone, Stethoscope, FileText, CheckCircle, ShieldAlert, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { doctorFetchEmergencyProfile } from "../../redux/slices/patientSlice";
import EmergencyProfileModal from "../../components/EmergencyProfileModal";

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : "—");

export default function DoctorPatientList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const { doctorAppointments, status } = useSelector((state) => state.appointments);
  const { doctorEmergencyPatient, doctorEmergencyStatus } = useSelector(
    (state) => state.patients
  );

  const handleOpenEmergency = (patientId) => {
    dispatch(
      doctorFetchEmergencyProfile({
        patientId,
        reason: "Clinical Emergency Review",
      })
    );
    setIsEmergencyModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchDoctorAppointments());
  }, [dispatch]);

  // Extract unique assigned patients from doctor's active appointments
  const patients = useMemo(() => {
    const patientMap = new Map();
    doctorAppointments.forEach((appt) => {
      const patient = appt.userId;
      if (patient && patient._id && !patientMap.has(patient._id)) {
        patientMap.set(patient._id, {
          ...patient,
          latestAppointment: appt,
        });
      }
    });
    return Array.from(patientMap.values());
  }, [doctorAppointments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patients.filter((p) => {
      if (!q) return true;
      return (
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.mrn && p.mrn.toLowerCase().includes(q))
      );
    });
  }, [patients, query]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Assigned Patients</h1>
          <p className="text-xs text-slate-500">
            Patients currently allocated to your care by hospital administration.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Search patients</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email or MRN..."
              className="pl-9 pr-3 py-2 w-full rounded-xl text-xs border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </label>
        </div>
      </header>

      <main>
        {status === "loading" && patients.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Loading assigned patients...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 p-8">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-700 text-sm">No patients found</h3>
            <p className="text-xs text-gray-400 mt-1">
              {query
                ? "No assigned patient matches your search query."
                : "You do not currently have any active patients assigned to your care."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const appt = p.latestAppointment;
              return (
                <motion.article
                  layout
                  key={p._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between min-w-0"
                >
                  <div>
                    <div className="flex items-start gap-3 mb-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
                        {p.username?.slice(0, 1).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 justify-between">
                          <h2 className="text-sm font-bold text-gray-800 break-words">
                            {p.username}
                          </h2>
                          <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200 shrink-0">
                            {p.gender || "Patient"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 break-all">{p.email}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 space-y-1 mb-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-gray-400">MRN:</span>
                        <span className="font-bold text-purple-800 text-right break-all">{p.mrn || "Pending"}</span>
                      </div>
                      {appt && (
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-gray-400">Reason:</span>
                          <span className="font-medium text-right break-words max-w-[65%]">{appt.reason}</span>
                        </div>
                      )}
                      {p.dob && (
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-gray-400">DOB:</span>
                          <span className="text-right">{fmtDate(p.dob)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex flex-col items-stretch gap-3">
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Authorized Care
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                      <button
                        onClick={() => handleOpenEmergency(p._id)}
                        className="w-full px-2.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition flex items-center justify-center gap-1"
                        title="Emergency Medical Profile"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        Emergency Info
                      </button>

                      <button
                        onClick={() => navigate(`/Doctor/chat?patientId=${p._id}`)}
                        className="w-full px-2.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center justify-center gap-1"
                        title="Message Patient"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Message
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/Doctor/patients/patient/${p._id}`, {
                            state: { patient: p, appointment: appt },
                          })
                        }
                        className="w-full px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Open Record
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-8 text-xs text-slate-400 text-center">
        Showing {filtered.length} authorized patient(s)
      </footer>

      {/* Doctor Emergency Profile Modal */}
      <EmergencyProfileModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        data={doctorEmergencyPatient}
        loading={doctorEmergencyStatus === "loading"}
      />
    </div>
  );
}

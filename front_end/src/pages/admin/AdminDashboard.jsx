import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAppointments } from "../../redux/slices/appointmentSlice";
import { fetchDoctors } from "../../redux/slices/doctorSlice";
import { fetchPatients } from "../../redux/slices/patientSlice";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Stethoscope,
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldCheck,
} from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, subtext, linkTo, isGreenAccent = false }) => (
  <div
    className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between hover:shadow-md transition ${
      isGreenAccent
        ? "bg-gradient-to-br from-white to-emerald-50/40 border-emerald-200"
        : "bg-white border-gray-100"
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className={`text-xs font-bold uppercase tracking-wider ${isGreenAccent ? "text-emerald-700" : "text-gray-400"}`}>
        {title}
      </span>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div>
      <div className={`text-3xl font-extrabold ${isGreenAccent ? "text-emerald-900" : "text-gray-800"}`}>
        {value}
      </div>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
    {linkTo && (
      <Link
        to={linkTo}
        className={`mt-3 text-xs font-semibold flex items-center gap-1 pt-2 border-t transition ${
          isGreenAccent
            ? "text-emerald-700 hover:text-emerald-800 border-emerald-100"
            : "text-purple-600 hover:text-purple-700 border-gray-50"
        }`}
      >
        View details <ArrowRight className="w-3 h-3" />
      </Link>
    )}
  </div>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { items: appointments } = useSelector((state) => state.appointments);
  const { items: doctors } = useSelector((state) => state.doctors);
  const { items: patients } = useSelector((state) => state.patients);

  useEffect(() => {
    dispatch(fetchAllAppointments());
    dispatch(fetchDoctors());
    dispatch(fetchPatients());
  }, [dispatch]);

  // Derived metrics
  const pendingAppointments = appointments.filter(
    (a) => a.status === "pending_admin_assignment" || a.status === "pending"
  );
  const attentionNeeded = appointments.filter(
    (a) =>
      a.status === "rejected_by_doctor" ||
      a.status === "redirected_to_doctor" ||
      a.status === "redirected_to_admin"
  );
  const activeConsultations = appointments.filter(
    (a) => a.status === "accepted" || a.status === "assigned"
  );
  const completedAppointments = appointments.filter((a) => a.status === "completed");

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">Hospital Administration</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Operations
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Central clinical operations console for doctor allocations, patient records, and consultation flow.
          </p>
        </div>

        {/* Quick Summary Pill with Green Accent */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-xs text-emerald-800 shadow-sm self-start">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>
            <strong>{completedAppointments.length}</strong> Completed Visits •{" "}
            <strong>{activeConsultations.length}</strong> Active Cases
          </span>
        </div>
      </div>

      {/* KPI Stats Grid with Emerald Medical Green Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Active Consultations"
          value={activeConsultations.length}
          icon={Activity}
          color="bg-emerald-600"
          subtext="In progress or accepted"
          linkTo="/admin/appointment"
          isGreenAccent={true}
        />
        <StatCard
          title="Completed Visits"
          value={completedAppointments.length}
          icon={CheckCircle}
          color="bg-teal-600"
          subtext="Successfully finalized"
          linkTo="/admin/appointment"
          isGreenAccent={true}
        />
        <StatCard
          title="Pending Allocation"
          value={pendingAppointments.length}
          icon={Clock}
          color="bg-amber-500"
          subtext="Awaiting doctor selection"
          linkTo="/admin/appointment"
        />
        <StatCard
          title="Needs Attention"
          value={attentionNeeded.length}
          icon={AlertCircle}
          color="bg-red-500"
          subtext="Rejections & referrals"
          linkTo="/admin/appointment"
        />
        <StatCard
          title="Active Staff"
          value={doctors.length}
          icon={Stethoscope}
          color="bg-purple-600"
          subtext={`${patients.length} Total Patients`}
          linkTo="/admin/DoctorForm"
        />
      </div>

      {/* Action / Alerts Banner if rejections exist */}
      {attentionNeeded.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900 text-sm">
                {attentionNeeded.length} appointment(s) require administrative reassignment
              </h3>
              <p className="text-xs text-red-700 mt-0.5">
                Doctors have declined or requested specialized referral for pending cases.
              </p>
            </div>
          </div>
          <Link
            to="/admin/appointment"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Main Content: Pending Queue & Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Pending Appointments */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Awaiting Doctor Assignment
              </h2>
              <p className="text-xs text-gray-400">Incoming patient consultations pending clinical specialist selection</p>
            </div>
            <Link
              to="/admin/appointment"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              See All ({pendingAppointments.length})
            </Link>
          </div>

          {pendingAppointments.length === 0 ? (
            <div className="text-center py-10 text-emerald-700 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-sm">All set! No pending appointments</p>
              <p className="text-emerald-600 text-xs mt-0.5">All registered appointments have been assigned to doctors.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAppointments.slice(0, 5).map((appt) => (
                <div
                  key={appt._id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {(appt.userId?.username || "P").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-800">
                        {appt.userId?.username || "Guest Patient"}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {appt.reason} • <span className="font-medium">{appt.type}</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/admin/appointment"
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm"
                  >
                    Assign Doctor
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Quick Actions & Doctor Roster */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Clinical Operations</h3>
            <div className="space-y-2">
              <Link
                to="/admin/appointment"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 hover:bg-emerald-100/70 transition text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Manage Appointments</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </Link>
              <Link
                to="/admin/DoctorForm"
                className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 hover:bg-purple-100 transition text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-purple-600" />
                  <span>Register & Manage Doctors</span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600" />
              </Link>
              <Link
                to="/admin/patients"
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 hover:bg-blue-100 transition text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Patient Medical Index</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </Link>
            </div>
          </div>

          {/* Active Doctor Specialties with Emerald Accents */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">Available Specialists</h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Online
              </span>
            </div>
            <div className="space-y-2.5">
              {doctors.slice(0, 4).map((doc) => (
                <div key={doc._id} className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                      {doc.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Dr. {doc.username}</p>
                      <p className="text-[11px] text-gray-400">{doc.specialty}</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" title="Available for assignment" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

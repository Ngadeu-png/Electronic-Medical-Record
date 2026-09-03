import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAppointments } from "../../redux/slices/appointmentSlice";
import { fetchPatientRecords } from "../../redux/slices/medicalRecordSlice";
import {
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  Stethoscope,
  ArrowRight,
  PlusCircle,
  AlertCircle,
} from "lucide-react";

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
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected_by_doctor":
      case "redirected_to_admin":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "pending_admin_assignment":
      case "pending":
        return "Pending Admin Assignment";
      case "assigned":
        return "Doctor Assigned";
      case "accepted":
        return "Confirmed by Doctor";
      case "completed":
        return "Consultation Completed";
      case "rejected_by_doctor":
        return "Awaiting Reassignment";
      case "redirected_to_admin":
        return "Admin Reassigning";
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}
    >
      {getLabel()}
    </span>
  );
};

const Overview = () => {
  const dispatch = useDispatch();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const { myAppointments, status: apptStatus } = useSelector(
    (state) => state.appointments
  );
  const { records } = useSelector((state) => state.medicalRecords);

  useEffect(() => {
    dispatch(fetchMyAppointments());
    if (currentUser._id) {
      dispatch(fetchPatientRecords(currentUser._id));
    }
  }, [dispatch, currentUser._id]);

  const totalAppointments = myAppointments.length;
  const activeAppointments = myAppointments.filter(
    (a) => a.status === "accepted" || a.status === "assigned"
  );
  const pendingAppointments = myAppointments.filter(
    (a) => a.status === "pending_admin_assignment" || a.status === "pending"
  );
  const completedAppointments = myAppointments.filter(
    (a) => a.status === "completed"
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 mb-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-200 font-semibold">
            Patient Portal
          </span>
          <h1 className="text-2xl font-bold mt-1">
            Welcome, {currentUser.username || "Patient"}
          </h1>
          <p className="text-xs text-purple-100 mt-1">
            {currentUser.mrn ? `Medical Record Number: ${currentUser.mrn}` : "CENTRIC CARE Hospital System"}
          </p>
        </div>

        <Link
          to="/patient/appointment"
          className="px-4 py-2.5 bg-white text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 self-start"
        >
          <PlusCircle className="w-4 h-4 text-purple-700" />
          Book New Consultation
        </Link>
      </div>

      {/* Summary KPI Cards */}
      {/* KPI Cards with Emerald Green Accents on active/completed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Appointments</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-800">{totalAppointments}</div>
          <p className="text-xs text-gray-400 mt-1">All recorded bookings</p>
        </div>

        {/* Emerald Green accent card — Confirmed & Active */}
        <div className="bg-gradient-to-br from-white to-emerald-50/50 p-5 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Confirmed &amp; Active</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-900">{activeAppointments.length}</div>
          <p className="text-xs text-emerald-700/80 mt-1 font-medium">Doctor accepted &amp; scheduled</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Pending Assignment</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-800">{pendingAppointments.length}</div>
          <p className="text-xs text-gray-400 mt-1">Awaiting admin doctor assignment</p>
        </div>

        {/* Emerald Green accent card — Completed Visits */}
        <div className="bg-gradient-to-br from-white to-teal-50/40 p-5 rounded-2xl border border-teal-200 shadow-sm hover:shadow-md transition">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Completed Visits</span>
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-teal-900">{completedAppointments.length}</div>
          <Link
            to="/patient/Myrecord"
            className="text-xs text-teal-700 font-semibold hover:underline mt-1 block"
          >
            View SOAP records →
          </Link>
        </div>
      </div>

      {/* Main Section: Recent Appointments & Assigned Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Consultations Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800">
              My Appointments & Consultation Status
            </h2>
            <Link
              to="/patient/appointment"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700"
            >
              + Book New
            </Link>
          </div>

          {apptStatus === "loading" && myAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              Loading your appointments...
            </div>
          ) : myAppointments.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              You haven't booked any appointments yet. Click "Book New Consultation" above.
            </div>
          ) : (
            <div className="space-y-3">
              {myAppointments.map((appt) => {
                const doctor = appt.doctorId;
                return (
                  <div
                    key={appt._id}
                    className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-800">
                          {appt.reason}
                        </span>
                        <span className="text-xs text-gray-400">• {appt.type}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-500" />
                          {appt.appointmentDate
                            ? new Date(appt.appointmentDate).toLocaleString()
                            : new Date(appt.createdAt).toLocaleDateString()}
                        </span>

                        {doctor && (
                          <span className="flex items-center gap-1 text-purple-700 font-medium">
                            <Stethoscope className="w-3.5 h-3.5" />
                            Dr. {doctor.username} ({doctor.specialty || "Specialist"})
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <StatusBadge status={appt.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Quick Clinical Summary & Navigation */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Clinical Actions</h3>
            <div className="space-y-2.5">
              <Link
                to="/patient/Myrecord"
                className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 hover:bg-purple-100 transition text-xs font-semibold"
              >
                <span>View My Medical Records (SOAP Notes)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/patient/appointment"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 hover:bg-emerald-100 transition text-xs font-semibold"
              >
                <span>Schedule New Doctor Visit</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </div>

          {/* EMR System Online Status — Emerald Green */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-xs font-bold text-emerald-800">CENTRIC CARE EMR — Online</h3>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Appointments are reviewed by hospital administration and assigned to specialized medical practitioners. Once accepted by your doctor, please arrive 15 minutes before your consultation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;

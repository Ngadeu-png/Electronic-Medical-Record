import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyAppointments } from "../../redux/slices/appointmentSlice";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Stethoscope,
} from "lucide-react";
import PaymentModal from "../../components/PaymentModal";

const StatusBadge = ({ status }) => {
  const styles = {
    pending_admin_assignment: "bg-amber-100 text-amber-800 border-amber-300",
    pending: "bg-amber-100 text-amber-800 border-amber-300",
    assigned: "bg-blue-100 text-blue-800 border-blue-300",
    accepted: "bg-emerald-100 text-emerald-800 border-emerald-300",
    completed: "bg-green-100 text-green-800 border-green-300",
    rejected_by_doctor: "bg-yellow-100 text-yellow-800 border-yellow-300",
    redirected_to_admin: "bg-yellow-100 text-yellow-800 border-yellow-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };
  const labels = {
    pending_admin_assignment: "Pending Admin Assignment",
    pending: "Pending Admin Assignment",
    assigned: "Doctor Assigned",
    accepted: "Confirmed by Doctor",
    completed: "Consultation Completed",
    rejected_by_doctor: "Awaiting Reassignment",
    redirected_to_admin: "Admin Reassigning",
    awaiting_reassignment: "Awaiting Reassignment",
    redirected_to_doctor: "Redirected to Doctor",
    unassigned: "Awaiting Assignment",
    cancelled: "Cancelled",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || "bg-gray-100 text-gray-800 border-gray-300"}`}>
      {labels[status] || status}
    </span>
  );
};

const PaymentStatusBadge = ({ status, amount, currency = "XAF" }) => {
  const isPaid = status === "paid";
  const isFailed = status === "failed";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${isPaid ? "bg-emerald-100 text-emerald-800 border-emerald-300" : isFailed ? "bg-red-100 text-red-800 border-red-300" : "bg-amber-100 text-amber-800 border-amber-300"}`}>
      {isPaid ? <CheckCircle className="w-3 h-3" /> : isFailed ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {isPaid ? `Paid (${amount ? `${amount.toLocaleString()} ${currency}` : "Confirmed"})` : isFailed ? "Payment Failed" : "Pending Payment"}
    </span>
  );
};

const MyAppointments = () => {
  const dispatch = useDispatch();
  const { myAppointments, status } = useSelector((state) => state.appointments);
  const [selectedPaymentAppt, setSelectedPaymentAppt] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/patient" className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 mb-3">
             my dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Review your consultation requests, doctor assignments, and payments here.</p>
        </div>
        <Link to="/patient/appointment" className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition">
          Book New Consultation
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        {status === "loading" && myAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">Loading your appointments...</div>
        ) : myAppointments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            You have no appointments yet. Book a consultation to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {myAppointments.map((appt) => {
              const doctor = appt.doctorId;
              return (
                <div key={appt._id} className="p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-800">{appt.reason}</span>
                      <span className="text-xs text-gray-400">• {appt.type}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>{appt.appointmentDate ? new Date(appt.appointmentDate).toLocaleString() : new Date(appt.createdAt).toLocaleDateString()}</span>
                      {doctor && <span className="flex items-center gap-1 text-purple-700 font-medium"><Stethoscope className="w-3.5 h-3.5" /> Dr. {doctor.username} ({doctor.specialty || "Specialist"})</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={appt.status} />
                    <PaymentStatusBadge status={appt.paymentStatus} amount={appt.amount} currency={appt.currency} />
                    {appt.paymentStatus !== "paid" && (
                      <button type="button" onClick={() => { setSelectedPaymentAppt(appt); setIsPaymentModalOpen(true); }} className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1 shadow-sm">
                        <CreditCard className="w-3.5 h-3.5" />
                        {appt.paymentStatus === "failed" ? "Retry Payment" : "Pay Now"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} appointment={selectedPaymentAppt} onSuccess={() => dispatch(fetchMyAppointments())} />
    </div>
  );
};

export default MyAppointments;
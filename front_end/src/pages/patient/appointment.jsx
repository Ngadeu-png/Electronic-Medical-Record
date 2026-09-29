import React, { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { bookAppointment } from "../../redux/slices/appointmentSlice";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Select from "react-select";
import { AuthContext } from "../../api/context/AuthContext";
import { CheckCircle, AlertCircle, CreditCard, ArrowRight } from "lucide-react";
import PaymentModal from "../../components/PaymentModal";

const appointmentTypes = [
  { value: "Outpatient", label: "Outpatient" },
  { value: "Inpatient", label: "Inpatient" },
  { value: "Emergency", label: "Emergency" },
  { value: "Virtual", label: "Virtual" },
  { value: "Preventive", label: "Preventive" },
];

const BookAppointmentForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.username || "",
    age: "",
    type: "Outpatient",
    reason: "",
    appointmentDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const newBody = {
      userId: user?._id || JSON.parse(localStorage.getItem("user") || "{}")._id,
      type: formData.type || "Outpatient",
      reason: formData.reason,
      appointmentDate: formData.appointmentDate,
      name: formData.name,
      age: formData.age,
    };

    if (!newBody.userId) {
      setMessage("Please log in before booking an appointment.");
      setIsSuccess(false);
      setLoading(false);
      return;
    }

    try {
      const resultAction = await dispatch(bookAppointment(newBody));
      if (bookAppointment.fulfilled.match(resultAction)) {
        const appt = resultAction.payload;
        setCreatedAppointment(appt);
        setIsSuccess(true);
        setMessage(
          "Appointment request initiated with pending payment. Please complete the CamPay mobile payment to confirm."
        );
        // Automatically open the CamPay payment popup
        setIsPaymentModalOpen(true);
      } else {
        setIsSuccess(false);
        setMessage(resultAction.payload || "Failed to book appointment.");
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("Network error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsSuccess(true);
    setMessage(
      "Payment successfully confirmed via CamPay! Your appointment is now confirmed and queued for administrative doctor allocation."
    );
    setFormData({
      name: user?.username || "",
      age: "",
      type: "Outpatient",
      reason: "",
      appointmentDate: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-pink-200 px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white/40 p-8 rounded-2xl shadow-2xl backdrop-blur-md border border-white/40"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-purple-900 mb-1">
            Book a Medical Appointment
          </h2>
          <p className="text-xs text-gray-600">
            Submit your consultation request. A qualified hospital physician will be assigned to your case.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-3 rounded-xl text-xs flex items-center gap-2 ${
              isSuccess
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {isSuccess ? (
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
          />

          <InputField
            label="Age"
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter your age"
            required
          />

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Appointment Type
            </label>
            <Select
              options={appointmentTypes}
              placeholder="Select Type"
              value={appointmentTypes.find((t) => t.value === formData.type)}
              onChange={(option) =>
                setFormData((prev) => ({ ...prev, type: option.value }))
              }
              className="rounded-xl text-xs"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Preferred Appointment Date & Time
            </label>
            <input
              type="datetime-local"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/70 text-gray-900 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Chief Complaint / Reason for Consultation
            </label>
            <textarea
              rows={3}
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-white/70 text-gray-900 placeholder-gray-500 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs resize-none"
              placeholder="Describe your current symptoms, how long you've had them, or reason for this visit..."
              required
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Button
            text={loading ? "Booking Consultation..." : "Submit Appointment Request"}
            type="submit"
          />

          {createdAppointment && createdAppointment.paymentStatus !== "paid" && (
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Complete Payment for This Consultation ({createdAppointment.amount || 5000} XAF)
            </button>
          )}

          {isSuccess && (
            <Link
              to="/patient/overview"
              className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 mt-1"
            >
              View My Appointments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </form>

      {/* CamPay Mobile Money Payment Popup */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        appointment={createdAppointment}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BookAppointmentForm;

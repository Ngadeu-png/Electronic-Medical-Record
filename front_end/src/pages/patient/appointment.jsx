import React, { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { bookAppointment } from "../../redux/slices/appointmentSlice";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Select from "react-select";
import { AuthContext } from "../../api/context/AuthContext";
import { CheckCircle, AlertCircle } from "lucide-react";

const appointmentTypes = [
  { value: "Outpatient", label: "Outpatient" },
  { value: "Inpatient", label: "Inpatient" },
  { value: "Emergency", label: "Emergency" },
  { value: "Virtual", label: "Virtual" },
  { value: "Preventive", label: "Preventive" },
];

const BookAppointmentForm = () => {
  const dispatch = useDispatch();
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
        setIsSuccess(true);
        setMessage("Appointment booked successfully! It is now pending administrative doctor assignment.");
        setFormData({
          name: user?.username || "",
          age: "",
          type: "Outpatient",
          reason: "",
          appointmentDate: "",
        });
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

        <div className="mt-8 flex flex-col items-center">
          <Button
            text={loading ? "Booking Consultation..." : "Submit Appointment Request"}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
};

export default BookAppointmentForm;

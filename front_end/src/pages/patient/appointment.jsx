import React, { useContext, useState } from "react";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import Select from "react-select";
import { AuthContext } from "../../api/context/AuthContext";

const appointmentTypes = [
  { value: "Outpatient", label: "Outpatient" },
  { value: "InPatient", label: "InPatient" },
  { value: "Emergency", label: "Emergency" },
  { value: "Virtual", label: "Virtual" },
  { value: "Preventive", label: "Preventive" },
];

const BookAppointmentForm = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    type: "",
    reason: "",
    appointmentDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const newBody = {
      userId: user?._id ?? "",
      type: formData.type,
      reason: formData.reason,
      appointmentDate: formData.appointmentDate,
      name: formData.name,
      age: formData.age,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBody),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("Appointment booked successfully!");
        setFormData({
          name: "",
          age: "",
          type: "Outpatient",
          reason: "",
          appointmentDate: "",
        });
      } else {
        setMessage("Error: " + (data.error || "Failed to book"));
      }
    } catch (error) {
      setMessage("Network error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-pink-200 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white/20 p-8 rounded-xl shadow-2xl backdrop-blur-md border border-white/30"
      >
        <h2 className="text-3xl font-extrabold text-purple-800 mb-8 text-center">
          Book Appointment
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <Select
              options={appointmentTypes}
              placeholder="Select Type"
              value={appointmentTypes.find((t) => t.value === formData.type)}
              onChange={(option) =>
                setFormData((prev) => ({ ...prev, type: option.value }))
              }
              className="rounded-xl"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date & Time
            </label>
            <input
              type="datetime-local"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white/70 text-gray-900 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div className="md-span-2">
            <label className="block text-sm font-medium text-purple-900 mb-1">
              Reason for appointment
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white/70 text-gray-900 placeholder-gray-500 border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Reason for appointment"
              required
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <Button
            text={loading ? "Booking..." : "Book Appointment"}
            type="submit"
          />
          {message && (
            <p className="mt-4 text-sm font-medium text-center text-purple-800">
              {message}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookAppointmentForm;

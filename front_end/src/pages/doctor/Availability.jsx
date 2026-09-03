import React, { useState } from "react";
import { motion } from "framer-motion";

const Availability = () => {
  const days = [
    "Monday", "Tuesday", "Wednesday", "Thursday",
    "Friday", "Saturday", "Sunday"
  ];

  const slots = [
    { label: "Morning (9:00 - 14:00)" },
    { label: "Afternoon (14:00 - 17:00)" },
    { label: "Evening (18:00 - 20:00)" },
  ];
  const [availability, setAvailability] = useState(
    days.reduce((acc, day) => {
      acc[day] = slots.map(() => true); 
      return acc;
    }, {})
  );

  // Toggle function
  const toggleAvailability = (day, index) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].map((status, i) =>
        i === index ? !status : status
      ),
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Doctor Availability
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day, index) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl p-4"
          >
            {/* Day header */}
            <h3 className="text-lg font-semibold text-indigo-600 mb-3 text-center">
              {day}
            </h3>

            <div className="space-y-3">
              {slots.map((slot, i) => {
                const isAvailable = availability[day][i];
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-100"
                  >
                    <span className="text-sm text-gray-700">{slot.label}</span>
                    <button
                      onClick={() => toggleAvailability(day, i)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        isAvailable
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      {isAvailable ? "Available" : "Not Available"}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Availability;

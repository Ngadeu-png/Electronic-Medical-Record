import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const GreenButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 text-xs font-medium rounded-full bg-green-500 text-white hover:bg-green-600 transition"
  >
    {children}
  </button>
);

const RedButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1 text-xs font-medium rounded-full bg-red-500 text-white hover:bg-red-600 transition"
  >
    {children}
  </button>
);
const DoctorModal = ({ isOpen, onClose, onSelectDoctor }) => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/doctors", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.log("Error fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Choose a Doctor
        </h2>

        {doctors.length === 0 ? (
          <p className="text-center">No doctors found</p>
        ) : (
          doctors.map((doc) => (
            <div
              key={doc._id}
              className="flex items-center justify-between p-3 border rounded-lg mb-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {doc.image ? (
                  <img
                    src={doc.image}
                    alt={doc.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex justify-center items-center bg-purple-500 text-white font-semibold">
                    {doc.name ? doc.name.charAt(0).toUpperCase() : "?"}
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{doc.name}</h3>
                  <p className="text-sm text-gray-500">{doc.specialty}</p>
                </div>
              </div>
              <GreenButton onClick={() => onSelectDoctor(doc)}>
                Select
              </GreenButton>
            </div>
          ))
        )}

        <div className="mt-4 flex justify-end">
          <RedButton onClick={onClose}>Close</RedButton>
        </div>
      </div>
    </div>
  );
};

const DoctorList = () => {
  const [appointments, setAppointments] = useState([]);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const navigate = useNavigate();

  const [doctorId, setDoctorId] = useState("");

  const getDoctorId = (receivedID) => {
    setDoctorId(receivedID);
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.log("Error fetching appointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAssignClick = async (patient) => {
    setSelectedPatient(patient);
    setIsDoctorModalOpen(true);
  };

  const handleSelectDoctor = async (doctor) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/approve-appointment?appointmentId=${selectedPatient._id}&doctorID=${doctor?._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "Approve" }),
        }
      );

      const result = await response.json();

      if (result.status === "error") {
        alert(result.message);
      } else {
        alert(result.message);
        console.log(result.message);
        setIsDoctorModalOpen(false);

        setTimeout(() => {
          fetchAppointments(); 
        }, 2000);

        navigate(`/admin/appointment`);
      }
    } catch (err) {
      console.log("Request action faialed");
      console.log(err);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Patient Appointments
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.map((appt) => {
          const patientName = appt.name || "No Name";
          const firstLetter = patientName.charAt(0).toUpperCase();

          return (
            <div
              key={appt._id}
              className="flex items-center justify-between p-4 border rounded-2xl hover:shadow-lg transition bg-white"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex justify-center items-center bg-purple-500 text-white font-semibold">
                  {firstLetter}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">{patientName}</h3>
                  <p className="text-sm text-gray-500">{appt.reason}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="text-xs text-gray-400">
                  {appt.date} at {appt.time}
                </p>
                <GreenButton onClick={() => handleAssignClick(appt)}>
                  Assign patient
                </GreenButton>
                <button
                  className={`text-white text-[10px] flex justify-center items-center p-1 rounded-lg ${
                    appt?.status === "Approve" ? "bg-green-600" : 'bg-red-600'
                  }`}
                >{appt?.status}</button>
              </div>
            </div>
          );
        })}
      </div>

      <DoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        onSelectDoctor={handleSelectDoctor}
      />
    </div>
  );
};

export default DoctorList;

import React, { useState, useEffect } from "react";
import MedicalRecordList from "../../components/Dashboard/MedicalRecordList";


const PatientDashboardRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user")); 
const patientId = user?._id;
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/medical-records/patient/${patientId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        console.log("Fetched recordsb:", data);
        console.log("PATIENT PAGE ID:", patientId);
        console.log("FETCHED RECORDS:", data);

        if (res.ok) setRecords(data.data || []);
        else console.error("Fetch error:", data);
      } catch (err) {
        console.error("Error fetching patient records:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [user._id]);

  return (
    <>
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">My Medical Records</h1>
      <div className="bg-white shadow rounded-xl p-6">
        {loading ? (
          <p className="text-gray-500">Loading records</p>
        ) : records.length === 0 ? (
          <p className="text-gray-500">No records found.</p>
        ) : (
          <MedicalRecordList records={records} />
           
        )}
      </div>
       
    </div>
    </>
  );
};

export default PatientDashboardRecords;

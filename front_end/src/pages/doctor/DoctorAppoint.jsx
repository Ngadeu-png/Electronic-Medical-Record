import React, { useEffect, useState } from "react";

function DoctorAppoint() {
  const [appointments, setAppointments] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const getAppointments = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/admin/my-appointments/${user?.["_id"]}`
        );
        const { status, message } = await response.json();

        if (status === "error") {
          alert("Error: ", message);
        } else {
          console.log("Data fetched successfully");
        }
      } catch (error) {
        console.log("Fqiled to fetch data: ", error.message);
      }
    };

    getAppointments();
  }, []);
  return (
    <div>
      <h1>Recent Appointment here!!</h1>
    </div>
  );
}
export default DoctorAppoint;

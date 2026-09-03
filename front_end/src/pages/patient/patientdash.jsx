import React from "react";
import PatientInfoCard from "./appointment";
import BookAppointmentForm from "./appointment";
import ConsultationJoin from "./consultation";
import HealthRecords from "./health record";

const PatientDashboard = () => {
  return (
    <div className="relative pt-15">
      <BookAppointmentForm />
      <ConsultationJoin />
      <HealthRecords />
    </div>
  );
};

export default PatientDashboard;

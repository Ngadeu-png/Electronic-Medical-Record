import React from "react";
import BookAppointmentForm from "./appointment";
import ConsultationJoin from "./consultation";
import Myrecord from "./Myrecord";

const PatientDashboard = () => {
  return (
    <div className="relative pt-15">
      <BookAppointmentForm />
      <ConsultationJoin />
      <Myrecord />
    </div>
  );
};

export default PatientDashboard;

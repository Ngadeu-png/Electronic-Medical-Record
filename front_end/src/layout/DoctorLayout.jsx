import React from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import DoctorSidebar from "../components/Dashboard/DoctorSidebar";

const DoctorLayout = () => {
  return (
    <div>
      <DoctorSidebar />
      <main className="pl-52">
        <Header />
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorLayout;

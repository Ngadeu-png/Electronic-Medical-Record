import React from "react";
import { Outlet } from "react-router-dom";
import Sidebard from "../components/Dashboard/PatientSidebar";
import Header from "../components/Header";

const PatientLayout = () => {
  return (
    <div>
      <Sidebard />
      <main className="pl-52">
        <Header />
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;

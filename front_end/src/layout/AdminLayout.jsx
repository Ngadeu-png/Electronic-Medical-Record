import React from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import AdminSidebard from "../components/Dashboard/AdminSidebar";

const AdminLayout = () => {
  return (
    <div>
      <AdminSidebard />
      <main className="pl-52">
        <Header />
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

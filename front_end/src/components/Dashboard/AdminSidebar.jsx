import React from "react";
import { NavLink } from "react-router-dom";
import { MdOutlineDashboard } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import { GiMiracleMedecine } from "react-icons/gi";

const AdminSidebard = () => {
  return (
    <aside className="w-52 h-[100vh] fixed bg-purple-400">
      <div className="px-4">
        <div className="text-3xl text-white font-bold mb-8 pt-4">ADMIN</div>
        <ul className="text-white space-y-4">
          <NavLink to="/admin" end>
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <span>
                  <MdOutlineDashboard />
                </span>
                <span>Dashboard</span>
              </li>
            )}
          </NavLink>
          <NavLink to="/admin/appointment">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <span>
                  <CiCalendarDate />
                </span>
                <span>Manage Appointment</span>
              </li>
            )}
          </NavLink>
          <NavLink to="/admin/consultation">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <span>
                  <GiMiracleMedecine />
                </span>
                <span>Consultations</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/admin/DoctorForm">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <span>
                  <GiMiracleMedecine />
                </span>
                <span>Manage Doctors</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/admin/patients" className="group">
            <li
              className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                window.location.pathname === "/admin/patients" ? "bg-white text-black" : ""
              }`}
            >
              <span>
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2zm7.1-5.4a1 1 0 011.4 0l1.4 1.4a1 1 0 01-1.4 1.4L14.6 11H9v2a2 2 0 01-2 2h4l2.7 2.7z"
                  />
                </svg>
              </span>
              <span>Manage Patients</span>
            </li>
          </NavLink>
        </ul>
      </div>
    </aside>
  );
};

export default AdminSidebard;
import React from "react";
import { Link, NavLink } from "react-router-dom";

function DoctorSidebar() {
  return (
    <aside className="w-52 h-[100vh] fixed bg-purple-500 ">
      <div className="px-4">
        <div className="text-3xl text-white font-bold mb-8 pt-4">Logo</div>
        <ul className="text-white space-y-4">
          <NavLink to="/Doctor" end>
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black  p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <span>Dashboard</span>
              </li>
            )}
          </NavLink>
          <NavLink to="/Doctor/DoctorAppoint">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <span>Appointment Page</span>
              </li>
            )}
          </NavLink>
          <NavLink to="/Doctor/Startconsultation">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <span>Startconsultations</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/Doctor/availability">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <span>Availability</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/Doctor/patients">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <span>Patient</span>
              </li>
            )}
          </NavLink>
        </ul>
      </div>
    </aside>
  );
}
export default DoctorSidebar;

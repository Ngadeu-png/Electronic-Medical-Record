import { MdOutlineDashboard } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import { GiMiracleMedecine } from "react-icons/gi";

import { Link, NavLink, useNavigate } from "react-router-dom";

const PatientSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("role");
    navigate("/auths/login"); 
  };

  return (
    <aside className="w-52 h-[100vh] fixed bg-purple-500 flex flex-col justify-between">
      <div className="px-4">
        <div className="text-3xl text-white font-bold mb-8 pt-4">Logo</div>
        <ul className="text-white space-y-4">
          <NavLink to="/patient" end>
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <MdOutlineDashboard />
                <span>Dashboard</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/patient/appointment">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <CiCalendarDate />
                <span>Appointments</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/patient/consultation">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <GiMiracleMedecine />
                <span>Consultations</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/patient/Myrecord">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-4 hover:bg-white hover:text-black cursor-pointer p-3 ${
                  isActive ? "bg-white text-black" : ""
                }`}
              >
                <span>My Record</span>
              </li>
            )}
          </NavLink>
        </ul>
      </div>
      <div className="px-4 mb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-white hover:bg-purple-600 px-3 py-2 rounded-md transition"
        >
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default PatientSidebar;

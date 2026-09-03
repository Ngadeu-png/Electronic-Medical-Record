import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  Clock,
  Users,
  LogOut,
  Sparkles,
} from "lucide-react";

function DoctorSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auths/login");
  };

  return (
    <aside className="w-56 h-screen fixed bg-purple-700 text-white flex flex-col justify-between shadow-xl z-20">
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-white text-purple-700 flex items-center justify-center font-bold text-lg shadow-sm">
            +
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide">CENTRIC CARE</h2>
            <p className="text-[10px] text-purple-200 uppercase tracking-widest font-medium">
              Doctor Portal
            </p>
          </div>
        </div>

        <nav className="space-y-1.5">
          <NavLink
            to="/Doctor"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-white text-purple-800 shadow-sm"
                  : "text-purple-100 hover:bg-purple-600/60"
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/Doctor/DoctorAppoint"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-white text-purple-800 shadow-sm"
                  : "text-purple-100 hover:bg-purple-600/60"
              }`
            }
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Assigned Cases</span>
          </NavLink>

          <NavLink
            to="/Doctor/Availability"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-white text-purple-800 shadow-sm"
                  : "text-purple-100 hover:bg-purple-600/60"
              }`
            }
          >
            <Clock className="w-4 h-4" />
            <span>My Availability</span>
          </NavLink>

          <NavLink
            to="/Doctor/patients"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-white text-purple-800 shadow-sm"
                  : "text-purple-100 hover:bg-purple-600/60"
              }`
            }
          >
            <Users className="w-4 h-4" />
            <span>My Patients</span>
          </NavLink>

          <NavLink
            to="/Doctor/ai"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? "bg-white text-purple-800 shadow-sm"
                  : "text-purple-100 hover:bg-purple-600/60"
              }`
            }
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Assistant</span>
          </NavLink>
        </nav>
      </div>

      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full text-xs font-semibold text-purple-200 hover:text-white hover:bg-purple-600/60 px-3 py-2.5 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default DoctorSidebar;

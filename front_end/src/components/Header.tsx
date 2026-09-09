import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../api/context/AuthContext";
import {
  Search,
  Bell,
  ShieldCheck,
  Stethoscope,
  User,
  Activity,
} from "lucide-react";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useContext(AuthContext);

  const role = user?.role || "user";
  const userInitial = (user?.username || "U").charAt(0).toUpperCase();

  const getRoleBadge = () => {
    switch (role.toLowerCase()) {
      case "admin":
        return {
          label: "Hospital Admin",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: ShieldCheck,
        };
      case "doctor":
        return {
          label: `Dr. (${user?.specialty || "Practitioner"})`,
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: Stethoscope,
        };
      default:
        return {
          label: user?.mrn ? `Patient • ${user.mrn}` : "Patient",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: User,
        };
    }
  };

  const roleInfo = getRoleBadge();
  const RoleIcon = roleInfo.icon;

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-6 py-3.5 flex items-center justify-between gap-4 shadow-sm">
      {/* Left: Search & Context */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records, appointments, patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Right: Hospital System Status, Date, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* System Active Status indicator (nice green accent) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Centric Care EMR</span>
        </div>

        {/* Quick Clinical AI Link */}
        <Link
          to={
            role.toLowerCase() === "admin"
              ? "/admin/ai"
              : role.toLowerCase() === "doctor"
              ? "/Doctor/ai"
              : "/patient/ai"
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold shadow-2xs transition"
          title="Open CentriCare AI Assistant"
        >
          <span>Clinical AI</span>
        </Link>

  

        {/* Notifications Icon with active dot */}
        <button
          className="relative p-2 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            {userInitial}
          </div>

          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-gray-800 leading-tight">
              {user?.username || "Authorized User"}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border mt-0.5 ${roleInfo.bg}`}
            >
              <RoleIcon className="w-2.5 h-2.5" />
              {roleInfo.label}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

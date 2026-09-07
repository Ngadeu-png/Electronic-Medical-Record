import { MdOutlineDashboard } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import { GiMiracleMedecine } from "react-icons/gi";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearAiState } from "../../redux/slices/aiSlice";
import { Sparkles, User, MessageSquare } from "lucide-react";

const PatientSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearAiState());
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/auths/login");
  };

  return (
    <aside className="w-52 h-[100vh] fixed bg-purple-500 flex flex-col justify-between z-40">
      <div className="px-4">
        {/* Replaced Logo with Professional CENTRIC CARE Identity */}
        <div className="flex items-center gap-2.5 mb-8 pt-5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-lg backdrop-blur-sm border border-white/30">
            +
          </div>
          <div>
            <h1 className="text-sm text-white font-extrabold tracking-tight leading-tight">
              CENTRIC CARE
            </h1>
            <p className="text-[10px] text-purple-200 font-medium tracking-wider uppercase">
              Patient Portal
            </p>
          </div>
        </div>

        <ul className="text-white space-y-3 text-sm">
          <NavLink to="/patient" end>
            {({ isActive }) => (
              <li
                className={`flex items-center gap-3 hover:bg-white hover:text-black cursor-pointer p-2.5 rounded-xl transition ${
                  isActive ? "bg-white text-black font-semibold" : ""
                }`}
              >
                <MdOutlineDashboard className="text-lg flex-shrink-0" />
                <span>Dashboard</span>
              </li>
            )}
          </NavLink>

          {/* My Profile Navigation Link */}
          <NavLink to="/patient/profile">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-3 hover:bg-white hover:text-black cursor-pointer p-2.5 rounded-xl transition ${
                  isActive ? "bg-white text-black font-semibold" : ""
                }`}
              >
                <User className="w-4 h-4 flex-shrink-0" />
                <span>My Profile</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/patient/appointment">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-3 hover:bg-white hover:text-black cursor-pointer p-2.5 rounded-xl transition ${
                  isActive ? "bg-white text-black font-semibold" : ""
                }`}
              >
                <CiCalendarDate className="text-lg flex-shrink-0" />
                <span>Appointments</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/patient/consultation">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-3 hover:bg-white hover:text-black cursor-pointer p-2.5 rounded-xl transition ${
                  isActive ? "bg-white text-black font-semibold" : ""
                }`}
              >
                <GiMiracleMedecine className="text-lg flex-shrink-0" />
                <span>Consultations</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/patient/Myrecord">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-3 hover:bg-white hover:text-black cursor-pointer p-2.5 rounded-xl transition ${
                  isActive ? "bg-white text-black font-semibold" : ""
                }`}
              >
                <span className="w-4 text-center font-bold">📄</span>
                <span>My Record</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/patient/chat">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-3 hover:bg-white hover:text-black cursor-pointer p-2.5 rounded-xl transition ${
                  isActive ? "bg-white text-black font-semibold" : ""
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span>Messages</span>
              </li>
            )}
          </NavLink>

          <NavLink to="/patient/ai">
            {({ isActive }) => (
              <li
                className={`flex items-center gap-3 hover:bg-white hover:text-black cursor-pointer p-2.5 rounded-xl transition ${
                  isActive ? "bg-white text-black font-semibold" : ""
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>AI Assistant</span>
              </li>
            )}
          </NavLink>
        </ul>
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-white hover:bg-purple-600 px-3 py-2 rounded-xl transition text-sm font-medium"
        >
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default PatientSidebar;

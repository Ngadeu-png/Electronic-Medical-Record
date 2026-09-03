import React, { useEffect, useState } from "react";
import { CiCalendarDate } from "react-icons/ci";
import { FaUsers, FaCheckCircle, FaClipboardList } from "react-icons/fa";
import DashboardCard from "../../components/Dashboard/DashboardCard";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

const DoctorOverview = () => {
  const [statistics, setStatistics] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    appointmentsByDay: [],
    patientsBySpecialty: [],
    appointmentStatus: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDoctorStatistics();
  }, []);

  const fetchDoctorStatistics = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));

      // Fetch doctor statistics from backend
      const res = await fetch("http://localhost:5000/api/doctors/statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setStatistics(data);
      } else {
        // Fallback with mock data if API doesn't exist yet
        setStatistics({
          totalPatients: 24,
          totalAppointments: 48,
          completedAppointments: 35,
          pendingAppointments: 13,
          appointmentsByDay: [
            { day: "Mon", appointments: 5, completed: 4 },
            { day: "Tue", appointments: 7, completed: 6 },
            { day: "Wed", appointments: 6, completed: 5 },
            { day: "Thu", appointments: 8, completed: 7 },
            { day: "Fri", appointments: 6, completed: 5 },
            { day: "Sat", appointments: 4, completed: 3 },
            { day: "Sun", appointments: 6, completed: 5 },
          ],
          appointmentStatus: [
            { name: "Completed", value: 35, color: "#10b981" },
            { name: "Pending", value: 13, color: "#f59e0b" },
          ],
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Failed to load statistics");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 mt-2 text-center">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 mt-2 border-t border-purple-500 rounded-xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-900 mb-2">
          Doctor Dashboard
        </h1>
        <p className="text-gray-600">Welcome back! Here's your practice overview</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          name="Total Patients"
          total={statistics.totalPatients}
          icon={<FaUsers className="text-blue-500" />}
        />
        <DashboardCard
          name="Total Appointments"
          total={statistics.totalAppointments}
          icon={<CiCalendarDate className="text-purple-500" />}
        />
        <DashboardCard
          name="Completed"
          total={statistics.completedAppointments}
          icon={<FaCheckCircle className="text-green-500" />}
        />
        <DashboardCard
          name="Pending"
          total={statistics.pendingAppointments}
          icon={<FaClipboardList className="text-yellow-500" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Appointments by Day Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Weekly Appointments
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statistics.appointmentsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="#8b5cf6" name="Scheduled" />
              <Bar dataKey="completed" fill="#10b981" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Appointment Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statistics.appointmentStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statistics.appointmentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
        <div className="text-center">
          <p className="text-4xl font-bold text-purple-600">
            {Math.round(
              (statistics.completedAppointments / statistics.totalAppointments) *
                100
            )}
            %
          </p>
          <p className="text-gray-600 mt-2">Completion Rate</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-blue-600">
            {statistics.totalPatients}
          </p>
          <p className="text-gray-600 mt-2">Active Patients</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-green-600">
            {statistics.pendingAppointments}
          </p>
          <p className="text-gray-600 mt-2">Upcoming Appointments</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/Doctor/DoctorAppoint"
            className="bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-lg text-center font-semibold transition"
          >
            View Appointments
          </a>
          <a
            href="/Doctor/patients"
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg text-center font-semibold transition"
          >
            View Patients
          </a>
          <a
            href="/Doctor/Availability"
            className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg text-center font-semibold transition"
          >
            Manage Availability
          </a>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;

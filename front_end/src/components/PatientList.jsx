import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPatients} from "../redux/slices/patientSlice";
import { setViewMode as setViewModeStore } from "../redux/slices/viewModeSlice";
import { GreenButton, RedButton } from "./GreenButton"; // assume you have these buttons styled
import { motion } from "framer-motion";

const PatientList = () => {
  const dispatch = useDispatch();

  // fetch patients on mount
  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  // Redux state
  const patients = useSelector((state) => state.patients.items);
  const viewMode = useSelector((state) => state.viewMode); // 'grid' or 'table'
  const status = useSelector((state) => state.patients.status);

  // toggle view mode
  const toggleView = () => {
    const next = viewMode === "grid" ? "table" : "grid";
    dispatch(setViewMode(next));
    dispatch(setViewModeStore(next));
  };

  if (status === "loading") return <p>Loading patients...</p>;
  if (status === "failed") return <p>Failed to load patients.</p>;

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Patient List
      </h2>

      {/* Toggle button */}
      <div className="mb-4 flex justify-center">
        <button
          onClick={toggleView}
          className={`px-4 py-2 rounded-md ${
            viewMode === "grid" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"
          } transition`}
        >
          {viewMode === "grid" ? "Show as Table" : "Show as Grid"}
        </button>
      </div>

      {/* Grid / Table view */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => (
            <motion.div
              key={patient._id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-medium text-gray-800">{patient.username}</h3>
              <p className="text-sm text-gray-500">Role: {patient.role}</p>
              <p className="text-sm text-gray-500">Email: {patient.email}</p>
              {/* Add more fields as needed */}
            </motion.div>
          ))}
        </div>
      )}

      {viewMode === "table" && (
        <table className="w-full bg-white rounded-lg overflow-hidden shadow">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="p-3 text-left text-xs font-medium text-gray-500">Name</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500">Email</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500">Role</th>
              <th className="p-3 text-left text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient._id} className="border-b border-gray-100">
                <td className="p-3">{patient.username}</td>
                <td className="p-3">{patient.email}</td>
                <td className="p-3">{patient.role}</td>
                <td className="p-3">
                  {/* Buttons for edit/delete/etc */}
                  <button className="text-blue-600 underline">View</button>
                  <button className="text-red-600 ml-2">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {patients.length === 0 && (
        <p className="text-center mt-8">No patients found</p>
      )}
    </div>
  );
};

export default PatientList;
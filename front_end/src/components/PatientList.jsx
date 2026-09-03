import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchPatients } from "../redux/slices/patientSlice";
import { setViewMode as setViewModeStore } from "../redux/slices/viewModeSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  LayoutGrid,
  Table as TableIcon,
  Calendar,
  Phone,
  Mail,
  User,
  ShieldCheck,
  X,
  FileText,
  Filter,
  RefreshCw,
} from "lucide-react";

const PatientList = () => {
  const dispatch = useDispatch();
  const patients = useSelector((state) => state.patients.items);
  const viewMode = useSelector((state) => state.viewMode);
  const status = useSelector((state) => state.patients.status);

  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const toggleView = () => {
    const next = viewMode === "grid" ? "table" : "grid";
    dispatch(setViewModeStore(next));
  };

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.mrn && p.mrn.toLowerCase().includes(q)) ||
        (p.phone && p.phone.includes(q));

      const matchesGender =
        genderFilter === "all" ||
        (p.gender && p.gender.toLowerCase() === genderFilter.toLowerCase());

      return matchesSearch && matchesGender;
    });
  }, [patients, searchQuery, genderFilter]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-800">Patient Management</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {patients.length} Registered Patients
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Complete hospital patient index, medical record numbers (MRN), demographics, and profile information.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(fetchPatients())}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          {/* Grid / Table Toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => dispatch(setViewModeStore("grid"))}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(setViewModeStore("table"))}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "table"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Directory Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by patient name, MRN, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
          />
        </div>

        {/* Gender Filter Chips */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {["all", "male", "female"].map((filter) => (
            <button
              key={filter}
              onClick={() => setGenderFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition ${
                genderFilter === filter
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {status === "loading" && patients.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-xs">
          Loading patient directory...
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-700 text-sm">No patients found</h3>
          <p className="text-xs text-gray-400 mt-1">
            {searchQuery
              ? "No patient records match the search query."
              : "No registered patient accounts found."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((patient) => {
            const initial = (patient.username || "P").charAt(0).toUpperCase();
            return (
              <motion.div
                key={patient._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shadow-sm">
                        {initial}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                          {patient.username}
                        </h3>
                        <p className="text-xs font-semibold text-purple-700">
                          {patient.mrn || "MRN Pending"}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {patient.gender || "Patient"}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>{patient.phone || "No phone provided"}</span>
                    </div>
                    {patient.dob && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Registered: {new Date(patient.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => setSelectedPatient(patient)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm"
                  >
                    View Profile
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Patient Name</th>
                <th className="p-4">MRN</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Gender</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((patient) => (
                <tr key={patient._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {(patient.username || "P").charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-gray-800">{patient.username}</span>
                  </td>
                  <td className="p-4 font-semibold text-purple-700">
                    {patient.mrn || "Pending"}
                  </td>
                  <td className="p-4 text-gray-600">{patient.email}</td>
                  <td className="p-4 text-gray-600">{patient.phone || "—"}</td>
                  <td className="p-4 capitalize text-gray-600">{patient.gender || "—"}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedPatient(patient)}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PATIENT DETAILS MODAL */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">
                    {(selectedPatient.username || "P").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {selectedPatient.username}
                    </h2>
                    <span className="text-xs font-semibold text-purple-700">
                      MRN: {selectedPatient.mrn || "Pending"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Email</span>
                    <span className="font-semibold text-gray-800">{selectedPatient.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Phone</span>
                    <span className="font-semibold text-gray-800">{selectedPatient.phone || "Not recorded"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Gender</span>
                    <span className="font-semibold text-gray-800 capitalize">{selectedPatient.gender || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium mb-0.5">Date of Birth</span>
                    <span className="font-semibold text-gray-800">
                      {selectedPatient.dob ? new Date(selectedPatient.dob).toLocaleDateString() : "Not recorded"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400 block font-medium mb-0.5">Registered Since</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(selectedPatient.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Account is verified and authorized for hospital electronic medical record booking.</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientList;
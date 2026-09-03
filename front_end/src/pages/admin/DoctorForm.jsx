import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  clearDoctorMessages,
} from "../../redux/slices/doctorSlice";
import { setViewMode as setViewModeExplicit } from "../../redux/slices/viewModeSlice";
import {
  Stethoscope,
  Mail,
  Phone,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  X,
  Lock,
  Search,
} from "lucide-react";

const specialitiesList = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Dermatology",
  "General Practice",
  "Oncology",
  "Gynecology",
  "Psychiatry",
  "Ophthalmology",
];

const DoctorForm = () => {
  const dispatch = useDispatch();
  const { items: doctors, status, actionStatus, error, successMessage } = useSelector(
    (state) => state.doctors
  );
  const viewMode = useSelector((state) => state.viewMode);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    specialtySelect: "General Practice",
    customSpecialty: "",
    email: "",
    phone: "",
    password: "",
  });

  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearDoctorMessages());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      specialtySelect: "General Practice",
      customSpecialty: "",
      email: "",
      phone: "",
      password: "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingId(doc._id);
    const isPredefined = specialitiesList.includes(doc.specialty);
    setFormData({
      name: doc.username || "",
      specialtySelect: isPredefined ? doc.specialty : "other",
      customSpecialty: isPredefined ? "" : doc.specialty || "",
      email: doc.email || "",
      phone: doc.phone || "",
      password: "", // empty for edit
    });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const specialty =
      formData.specialtySelect === "other"
        ? formData.customSpecialty.trim()
        : formData.specialtySelect;

    if (!name || !email || !phone || !specialty) {
      setFormError("Please fill out all required fields.");
      return;
    }

    if (!editingId && !formData.password) {
      setFormError("Password is required for newly registered doctors.");
      return;
    }

    const payload = {
      name,
      username: name,
      specialty,
      email,
      phone,
    };

    if (formData.password && formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    let result;
    if (editingId) {
      result = await dispatch(updateDoctor({ id: editingId, doctorData: payload }));
    } else {
      result = await dispatch(createDoctor(payload));
    }

    if (createDoctor.fulfilled.match(result) || updateDoctor.fulfilled.match(result)) {
      handleCloseModal();
    } else if (result.payload) {
      setFormError(result.payload);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove Dr. ${name} from the medical directory?`)) {
      await dispatch(deleteDoctor(id));
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const q = searchTerm.toLowerCase();
    return (
      (doc.username && doc.username.toLowerCase().includes(q)) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(q)) ||
      (doc.email && doc.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-gray-800">Doctor Directory</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {doctors.length} Active {doctors.length === 1 ? "Practitioner" : "Practitioners"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Register new hospital practitioners, update specialist qualifications, and manage medical staff accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => dispatch(setViewModeExplicit("grid"))}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => dispatch(setViewModeExplicit("table"))}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "table"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Doctor
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 ml-2" />
        <input
          type="text"
          placeholder="Search by physician name, clinical specialty, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-xs text-gray-400 hover:text-gray-600 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Content: Grid or Table */}
      {status === "loading" && doctors.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-xs">
          Loading medical staff directory...
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8">
          <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-700 text-sm">No doctors found</h3>
          <p className="text-xs text-gray-400 mt-1">
            {searchTerm
              ? "No physician matches your search filter."
              : "No doctors have been registered yet. Click 'Add Doctor' to begin."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doc) => (
            <motion.div
              key={doc._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base shadow-sm">
                      {doc.username ? doc.username.charAt(0).toUpperCase() : "D"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm">
                        Dr. {doc.username}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 mt-0.5">
                        <Stethoscope className="w-3 h-3" />
                        {doc.specialty}
                      </span>
                    </div>
                  </div>

                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" title="Active Staff" />
                </div>

                <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{doc.phone || "No phone provided"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(doc)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(doc._id, doc.username)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Physician</th>
                <th className="p-4">Clinical Specialty</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDoctors.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50 transition">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {doc.username ? doc.username.charAt(0).toUpperCase() : "D"}
                    </div>
                    <span className="font-bold text-gray-800">Dr. {doc.username}</span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      {doc.specialty}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">{doc.email}</td>
                  <td className="p-4 text-gray-600">{doc.phone || "—"}</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(doc._id, doc.username)}
                      className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD / EDIT DOCTOR MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {editingId ? "Update Doctor Profile" : "Register New Physician"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {editingId
                        ? "Modify clinical credentials and contact details."
                        : "Create an authorized doctor account in Centric Care."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Sarah Jenkins"
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Specialty */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Medical Specialty <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.specialtySelect}
                      onChange={(e) =>
                        setFormData({ ...formData, specialtySelect: e.target.value })
                      }
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    >
                      {specialitiesList.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                      <option value="other">Other / Custom Specialty</option>
                    </select>

                    {formData.specialtySelect === "other" && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={formData.customSpecialty}
                          onChange={(e) =>
                            setFormData({ ...formData, customSpecialty: e.target.value })
                          }
                          placeholder="Type custom specialty (e.g., Pediatric Cardiology)..."
                          required
                          className="w-full text-xs px-3.5 py-2 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Professional Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="doctor@hospital.org"
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  {/* Password */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-purple-600" />
                        Account Password {!editingId && <span className="text-red-500">*</span>}
                      </span>
                      {editingId && (
                        <span className="text-[11px] text-gray-400 font-normal">
                          Leave blank to keep existing password
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={editingId ? "••••••••••••" : "Minimum 8 characters"}
                      required={!editingId}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionStatus === "loading"}
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-sm disabled:opacity-50"
                  >
                    {actionStatus === "loading"
                      ? "Saving..."
                      : editingId
                      ? "Save Changes"
                      : "Register Doctor"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorForm;
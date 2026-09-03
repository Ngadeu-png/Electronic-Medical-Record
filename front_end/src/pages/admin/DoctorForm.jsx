/* ------------------------------------------------------------------
   DoctorForm.jsx  (or .js if you use CommonJS)
   ------------------------------------------------------------------ */
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { fetchDoctors, } from "../../redux/slices/doctorSlice"; // doctorSlice already has fetchDoctors thunk
import { setViewMode as setViewModeExplicit } from "../../redux/slices/viewModeSlice"; // <-- the slice we just created

/* --------------------------------------------------------------
   Helper: small toast (you can replace with any notification lib)
   -------------------------------------------------------------- */
const Toast = ({ message, type = "success" }) => {
  const [open, setOpen] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setOpen(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  if (!open) return null;
  return (
    <div
      className={`fixed top-4 right-4 bg-${type === "success" ? "green-600" : "red-600"} text-white px-4 py-2 rounded shadow px-6 animate-in fade-in-0 zoom-in-90 zoom-out-90 transition-transform duration-300`}
    >
      {message}
    </div>
  );
};

/* --------------------------------------------------------------
   Modal overlay – handles opening/closing, backdrop click, Esc key
   -------------------------------------------------------------- */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  onEsc = () => onClose(),
}) => {
  // trap Esc key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onEsc();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onEsc]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()} // click‑outside
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md transform overflow-y-auto transition-transform duration-200"
        style={{ transform: isOpen ? "scale(1)" : "scale(0)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h3 className="text-xl font-medium text-gray-800 mb-4 text-center">{title}</h3>

        {children}

        {/* ---------- optional toast ---------- */}
        {/** we will render the Toast from the parent component **/}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------
   DoctorForm component
   -------------------------------------------------------------- */
const DoctorForm = () => {
  const dispatch = useDispatch();

  /* --------------------------------------------------------------
     Redux state
     -------------------------------------------------------------- */
  const doctors = useSelector(state => state.doctors.items);
  const viewMode = useSelector(state => state.viewMode); // 'grid' | 'table'

  /* --------------------------------------------------------------
     Local form state
     -------------------------------------------------------------- */
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    image: "",
    password: "",
  });

  const [editingId, setEditingId] = useState(null);   // null => create mode
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState("");

  /* --------------------------------------------------------------
     Load doctors once on mount
     -------------------------------------------------------------- */
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  /* --------------------------------------------------------------
     Specialty handling
     -------------------------------------------------------------- */
  const specialities = [
    "Cardiology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Dermatology",
    "General Practice",
  ];

  const [customSpecialty, setCustomSpecialty] = useState("");

  const handleSpecialtyChange = e => {
    const value = e.target.value;
    if (value === "other") {
      // show the free‑text input
      setCustomSpecialty(e.target.defaultValue); // keep the original value if needed
    } else {
      setCustomSpecialty("");
    }
    setFormData(prev => ({ ...prev, specialty: value === "other" ? customSpecialty : value }));
  };

  /* --------------------------------------------------------------
     CRUD actions – they all end by dispatching fetchDoctors()
     -------------------------------------------------------------- */
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const payload = {
        name: formData.name,
        specialty: formData.specialty || customSpecialty,
        email: formData.email,
        phone: formData.phone,
        // password is optional – you may hash it on the backend
        password: formData.password,
      };

      if (editingId) {
        // UPDATE
        await fetch(`/api/doctors/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        setSuccess("Doctor updated successfully");
      } else {
        // CREATE
        await fetch("/api/doctors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        setSuccess("Doctor added successfully");
      }

      // Refresh list & close modal
      dispatch(fetchDoctors());
      setShowModal(false);
      setSuccess(""); // clear after a few seconds (see Toast above)
    } catch (err) {
      console.error("Doctor save error:", err);
      setSuccess("Error saving doctor – see console");
    }
  };

  const handleEdit = doctor => {
    setEditingId(doctor._id);
    setFormData({
      name: doctor.username,
      specialty: doctor.specialty || "",
      email: doctor.email,
      phone: doctor.phone,
      image: doctor.image || "",
      password: "",
    });
    setShowModal(true); // open modal in “edit” mode
  };

  const handleDelete = async id => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/doctors/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Doctor deleted successfully");
      dispatch(fetchDoctors());
    } catch (err) {
      console.error("Doctor delete error:", err);
      setSuccess("Error deleting doctor – see console");
    } finally {
      setShowModal(false);
    }
  };

  /* --------------------------------------------------------------
     Toggle view mode – two distinct buttons
     -------------------------------------------------------------- */
  const toggleGrid = () => dispatch(setViewModeExplicit("grid"));
  const toggleTable = () => dispatch(setViewModeExplicit("table"));

  const viewModeCurrent = viewMode; // 'grid' | 'table'

  /* --------------------------------------------------------------
     Success toast (simple – you can replace with react‑hot‑toast, etc.)
     -------------------------------------------------------------- */
  const [toastMsg, setToastMsg] = useState("");
  useEffect(() => {
    if (!toastMsg) return;
    const id = setTimeout(() => setToastMsg(""), 3500);
    return () => clearTimeout(id);
  }, [toastMsg]);
  /* -------------------------------------------------------------- */

  /* --------------------------------------------------------------
     Render
     -------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* ------------------------------------------------------
         Header: title + doctor count + add button + view toggles
         ------------------------------------------------------- */}
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Doctor Management
          <span className="text-sm text-gray-500">
            ({doctors.length} {"doctor" + (doctors.length !== 1 ? "s" : "")})
          </span>
        </h2>

        {/* + Add Doctor button – opens modal */}
        <Button
          text="+ Add Doctor"
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white hover:bg-purple-700"
        />

        {/* View‑mode toggles (Grid / Table) */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleGrid}
            className={`px-4 py-2 rounded-md ${
              viewModeCurrent === "grid"
                ? "bg-purple-100 text-purple-800 font-medium"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            } transition`}
          >
            Grid
          </button>

          <button
            onClick={toggleTable}
            className={`px-4 py-2 rounded-md ${
              viewModeCurrent === "table"
                ? "bg-purple-100 text-purple-800 font-medium"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            } transition`}
          >
            Table
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------
         Modal (add / edit doctor)
         ------------------------------------------------------- */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={
        editingId ? "Edit Doctor" : "Add Doctor"
      }>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ---------- Name ---------- */}
          <InputField
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            required
          />

          {/* ---------- Specialty (dropdown + “Other”) ---------- */}
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Specialty</label>

            <select
              value={formData.specialty || customSpecialty}
              onChange={handleSpecialtyChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            >
              <option value="">— Select —</option>
              {specialities.map(spec => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
              <option value="other">Other</option>
            </select>

            {/* Free‑text input that appears when “Other” is selected */}
            {formData.specialty === "other" && (
              <InputField
                label="Other specialty"
                type="text"
                name="customSpecialty"
                value={customSpecialty || ""}
                onChange={e =>
                  setFormData({ ...formData, specialty: e.target.value })
                }
                placeholder="Type the specialty not listed"
              />
            )}
          </div>

          {/* ---------- Email ---------- */}
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={e =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="doctor@example.com"
            required
          />

          {/* ---------- Phone ---------- */}
          <InputField
            label="Phone"
            type="text"
            name="phone"
            value={formData.phone}
            onChange={e =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="+1‑555‑123‑4567"
          />

          {/* ---------- Password (optional) ---------- */}
          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={e =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Leave blank if not needed"
          />

          {/* ---------- Submit / Cancel ---------- */}
          <div className="flex gap-3">
            <Button type="submit">{editingId ? "Update Doctor" : "Add Doctor"}</Button>

            {editingId && (
              <Button
                text="Delete"
                type="button"
                onClick={() => handleDelete(editingId)}
                className="bg-red-500 hover:bg-red-600"
              />
            )}
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------
         Doctor list – grid or table depending on viewMode
         ------------------------------------------------------- */}
      <section className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-font text-gray-700 mb-4 text-center">
          Doctor List
        </h3>

        {/* ---------- GRID view – cards with avatar & truncated text ---------- */}
        {viewModeCurrent === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doc => (
              <motion.div
                key={doc._id}
                className="group bg-gray-50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-medium"
                  >
                    {doc.username
                      .split(" ")
                      .map(w => w[0])
                      .join("")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                </div>

                <h4 className="font-medium text-gray-800 line-clamp-1">
                  {doc.username}
                </h4>

                <p className="text-sm text-gray-500 line-clamp-1">
                  Specialty: {doc.specialty}
                </p>

                {/* Email truncated – never overflows */}
                <p className="mt-2 text-xs text-gray-400 line-clamp-1">
                  Email: {doc.email}
                </p>

                <div className="mt-3 flex gap-2">
                  <Button
                    text="Edit"
                    type="button"
                    onClick={() => handleEdit(doc)}
                    className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1"
                  />
                  <Button
                    text="Delete"
                    type="button"
                    onClick={() => handleDelete(doc._id)}
                    className="bg-red-100 text-red-700 text-sm px-3 py-1"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ---------- TABLE view – simple HTML table ---------- */}
        {viewModeCurrent === "table" && (
          <table className="w-full bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 text-left text-xs font-medium text-gray-500">
                  Name
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500">
                  Specialty
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500">
                  Email
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc._id} className="border-b border-gray-100">
                  <td className="p-3">{doc.username}</td>
                  <td className="p-3">{doc.specialty}</td>
                  <td className="p-3 line-clamp-1">{doc.email}</td>
                  <td className="p-3">
                    <Button
                      text="Edit"
                      type="button"
                      onClick={() => handleEdit(doc)}
                      className="text-blue-600 text-sm underline mr-2"
                    />
                    <Button
                      text="Delete"
                      type="button"
                      onClick={() => handleDelete(doc._id)}
                      className="text-red-600 text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ---------- Empty / loading states ---------- */}
        {status === "loading" && (
          <p className="text-center text-gray-500">Loading doctors…</p>
        )}
        {status === "failed" && (
          <p className="text-center text-red-600">Failed to load doctors.</p>
        )}
        {doctors.length === 0 && (
          <p className="text-center text-gray-400 mt-8">No doctors found</p>
        )}
      </section>

      {/* ------------------------------------------------------
         Simple toast at the top‑right (optional)
         ------------------------------------------------------- */}
      {toastMsg && <Toast message={toastMsg} type="success" />}
    </div>
  );
};

export default DoctorForm;
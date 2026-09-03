import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, Calendar, Phone } from "lucide-react";
import { motion } from "framer-motion";

const fmtDate = (iso) => new Date(iso).toLocaleDateString();

export default function PatientList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showOnlyTop, setShowOnlyTop] = useState(false);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/auths", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log("data:", data.data);
        setPatients(data.data || []);
      } catch (err) {
        console.log("Error fetching patients:", err);
      }
    };

    fetchPatients();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = patients.filter((p) => {
      if (!q) return true;
      return (
        (p.username && p.username.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q)) ||
        (p.mrn && p.mrn.toLowerCase().includes(q))
      );
    });

    return list;
  }, [patients, query]);

 
  const awardIds = useMemo(
    () => filtered.slice(0, 2).map((p) => p._id),
    [filtered]
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="text-sm text-slate-500">
            Minimalistic award-style cards with search
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative block">
            <span className="sr-only">Search patients</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email or MRN..."
              className="pl-10 pr-3 py-2 w-72 rounded-full border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <button
            onClick={() => setShowOnlyTop((s) => !s)}
            className={`px-3 py-2 rounded-md font-medium border transition-shadow shadow-sm ${
              showOnlyTop
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            {showOnlyTop ? "Showing Awards" : "Show Awards"}
          </button>
        </div>
      </header>

      <main>
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            No patients found — try another search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, idx) => {
              const isAward =
                awardIds.includes(p._id) && (!showOnlyTop || showOnlyTop);
              if (showOnlyTop && !isAward) return null;

              return (
                <motion.article
                  layout
                  key={p._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="relative bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-none">
                      <div className="w-14 h-14 rounded-full bg-slate-100 grid place-items-center text-xl font-semibold text-slate-700">
                        {p.username?.slice(0, 1).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-semibold truncate">
                          {p.username}
                        </h2>
                        <span className="text-xs text-slate-500">{p.role}</span>
                      </div>

                      <p className="text-sm text-slate-500 truncate">
                        {p.email}
                      </p>

                      <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{p.dob ? fmtDate(p.dob) : "—"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span className="truncate">{p.phone || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <User className="w-4 h-4" />
                      <span className="text-xs text-slate-500">
                        MRN: {p.mrn || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/Doctor/patients/patient/${p._id}`, {
                            state: { patient: p },
                          })
                        }
                        className="px-3 py-1.5 rounded-md border border-slate-200 text-sm font-medium hover:bg-slate-50"
                      >
                        Open
                      </button>

                      <button
                        onClick={() =>
                          alert(
                            `Quick action: message or attach file\n\nPatient info:\n${JSON.stringify(
                              p,
                              null,
                              2
                            )}`
                          )
                        }
                        className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:opacity-95"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      <footer className="mt-6 text-xs text-slate-400 text-center">
        Showing {filtered.length} patient(s)
      </footer>
    </div>
  );
}

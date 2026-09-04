import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Droplet,
  AlertTriangle,
  Phone,
  Activity,
  User,
  X,
  AlertCircle,
  Clock,
  Heart,
} from "lucide-react";

const EmergencyProfileModal = ({ isOpen, onClose, data, loading }) => {
  if (!isOpen) return null;

  const patient = data?.patient;
  const emergency = data?.emergencyProfile;
  const contacts = data?.emergencyContacts || [];

  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const age = calculateAge(patient?.dob);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-8 border-2 border-red-200"
      >
        {/* Header with High-Visibility Emergency Badge */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900">
                  EMERGENCY MEDICAL PROFILE
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] tracking-wider uppercase animate-pulse">
                  CRITICAL CARE
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Rapid clinical decision summary • Access logged in audit trail
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-gray-400">
            Retrieving emergency medical data and audit logging...
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Patient Identity Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg flex-shrink-0">
                  {(patient?.username || "P").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">
                    {patient?.username || "Unknown Patient"}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-500 text-xs mt-0.5">
                    <span className="font-bold text-purple-700">
                      MRN: {patient?.mrn || "Pending"}
                    </span>
                    <span>•</span>
                    <span className="capitalize">{patient?.gender || "Gender unrecorded"}</span>
                    {age !== null && (
                      <>
                        <span>•</span>
                        <span>{age} years old</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Blood Type Big Badge */}
              <div className="flex items-center gap-2 bg-red-50 border-2 border-red-300 px-4 py-2 rounded-2xl self-start sm:self-auto">
                <Droplet className="w-5 h-5 text-red-600" />
                <div>
                  <span className="text-[10px] font-bold text-red-700 uppercase block leading-none">
                    Blood Type
                  </span>
                  <span className="text-xl font-black text-red-700 leading-tight">
                    {emergency?.bloodType || "Unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Warnings (If Any) */}
            {emergency?.emergencyWarnings && (
              <div className="p-3.5 bg-red-100/80 border-2 border-red-300 rounded-2xl text-red-900 flex items-start gap-2.5 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-red-800">
                    CRITICAL WARNING
                  </h4>
                  <p className="font-bold text-xs mt-0.5">{emergency.emergencyWarnings}</p>
                </div>
              </div>
            )}

            {/* Vitals / Physical Measures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-2xl border border-gray-200 text-center">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Height</span>
                <span className="font-extrabold text-gray-800 text-sm">
                  {emergency?.height ? `${emergency.height} cm` : "Not recorded"}
                </span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-200 text-center">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Weight</span>
                <span className="font-extrabold text-gray-800 text-sm">
                  {emergency?.weight ? `${emergency.weight} kg` : "Not recorded"}
                </span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-200 text-center">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Phone</span>
                <span className="font-extrabold text-gray-800 text-xs truncate block">
                  {patient?.phone || "Not recorded"}
                </span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-200 text-center">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Contacts</span>
                <span className="font-extrabold text-purple-700 text-sm">
                  {contacts.length} Available
                </span>
              </div>
            </div>

            {/* Allergies & Critical Conditions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-red-50/50 rounded-2xl border border-red-100">
                <h4 className="font-bold text-red-800 flex items-center gap-1.5 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Known Allergies
                </h4>
                {(!emergency?.allergies || emergency.allergies.length === 0) ? (
                  <span className="text-gray-400">No known drug/food allergies recorded.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {emergency.allergies.map((a, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold text-[11px]"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100">
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  Critical Conditions
                </h4>
                {(!emergency?.criticalConditions || emergency.criticalConditions.length === 0) ? (
                  <span className="text-gray-400">No critical chronic conditions listed.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {emergency.criticalConditions.map((c, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[11px]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Current Medications & Instructions */}
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <div>
                <span className="font-bold text-gray-700 block mb-1">
                  Current Important Medications:
                </span>
                {(!emergency?.currentImportantMedications ||
                  emergency.currentImportantMedications.length === 0) ? (
                  <span className="text-gray-400">No current medications recorded.</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {emergency.currentImportantMedications.map((m, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 bg-white border border-gray-200 rounded-full text-gray-800 font-semibold text-[11px]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {emergency?.emergencyInstructions && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-700 block mb-0.5">
                    Directives &amp; Instructions:
                  </span>
                  <p className="text-gray-600">{emergency.emergencyInstructions}</p>
                </div>
              )}
            </div>

            {/* Emergency Contacts with Instant Call Action */}
            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-1.5 mb-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Emergency Contacts
              </h4>

              {contacts.length === 0 ? (
                <p className="text-gray-400 bg-gray-50 p-3 rounded-xl">
                  No emergency contacts on file for this patient.
                </p>
              ) : (
                <div className="space-y-2">
                  {contacts.map((c) => (
                    <div
                      key={c._id}
                      className="p-3 rounded-2xl bg-white border border-gray-200 flex items-center justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                          {c.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">
                              {c.firstName} {c.lastName}
                            </span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-gray-100 text-gray-600 font-semibold">
                              {c.relationship}
                            </span>
                            {c.priority === "Primary" && (
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-red-100 text-red-700 font-bold">
                                Primary
                              </span>
                            )}
                          </div>
                          <span className="text-gray-500 text-[11px] block">{c.phone}</span>
                        </div>
                      </div>

                      {/* One-click Call Button */}
                      <a
                        href={`tel:${c.phone}`}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call Emergency Contact
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs"
          >
            Close Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmergencyProfileModal;

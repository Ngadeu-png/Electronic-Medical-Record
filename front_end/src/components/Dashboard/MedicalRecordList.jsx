import React from "react";
import { motion } from "framer-motion";
import { Stethoscope, Calendar, FileText, User } from "lucide-react";

const MedicalRecordList = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No medical records found
      </div>
    );
  }
  console.log("records:", records);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {records.map((rec) => (
        <motion.div
          key={rec._id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {rec.noteType}
                </h2>
                <p className="text-sm text-slate-500">
                  by {rec.doctor?.name} ({rec.doctor?.specialty})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              {new Date(rec.appointment?.appointmentDate).toLocaleDateString()}
            </div>
          </div>

          {/* Appointment info */}
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 flex flex-wrap gap-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Reason:</span>{" "}
              {rec.appointment?.reason}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="font-medium">Type:</span> {rec.appointment?.type}
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  rec.appointment?.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : rec.appointment?.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {rec.appointment?.status}
              </span>
            </div>
          </div>

          {/* SOAP sections */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4">
              <h3 className="text-indigo-700 font-semibold mb-2">
                S - Subjective
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {rec.subjective}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-blue-700 font-semibold mb-2">
                O - Objective
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {rec.objective}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-green-700 font-semibold mb-2">
                A - Assessment
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {rec.assessment}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-purple-700 font-semibold mb-2">P - Plan</h3>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {rec.plan}
              </p>
            </div>
          </div>

          {/* Signed status */}
          <div className="flex justify-end">
            {rec.isSigned ? (
              <span className="text-sm text-green-600 font-medium">
                ✅ Signed at {new Date(rec.signedAt).toLocaleString()}
              </span>
            ) : (
              <span className="text-sm text-red-500 font-medium">
                ❌ Not signed
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MedicalRecordList;

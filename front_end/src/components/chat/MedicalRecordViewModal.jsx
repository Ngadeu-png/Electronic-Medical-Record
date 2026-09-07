import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, Stethoscope, CheckCircle, X, ShieldCheck } from "lucide-react";

const MedicalRecordViewModal = ({ isOpen, onClose, record }) => {
  if (!isOpen || !record) return null;

  const doctorName = record.doctor?.username || record.doctor?.name || "Attending Doctor";
  const specialty = record.doctor?.specialty || "Specialist";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-800">
                  {record.noteType || "Clinical Consultation Note"}
                </h3>
                {record.isSigned && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Signed Record
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                <span>By Dr. {doctorName} ({specialty})</span>
                <span>•</span>
                <span>
                  Date: {new Date(record.createdAt || record.signedAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: SOAP Sections */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* Subjective */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
            <h4 className="font-bold text-purple-900 uppercase tracking-wider text-[11px]">
              Subjective (Patient Chief Complaints &amp; History)
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {record.subjective || "No subjective notes recorded."}
            </p>
          </div>

          {/* Objective */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
            <h4 className="font-bold text-purple-900 uppercase tracking-wider text-[11px]">
              Objective (Vital Signs, Physical Exam &amp; Observations)
            </h4>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {record.objective || "No objective clinical findings recorded."}
            </p>
          </div>

          {/* Assessment */}
          <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-1">
            <h4 className="font-bold text-purple-900 uppercase tracking-wider text-[11px]">
              Assessment (Clinical Evaluation &amp; Diagnosis)
            </h4>
            <p className="text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
              {record.assessment || "No formal assessment recorded."}
            </p>
          </div>

          {/* Plan */}
          <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 space-y-1">
            <h4 className="font-bold text-emerald-900 uppercase tracking-wider text-[11px]">
              Plan (Treatment, Medications &amp; Follow-up)
            </h4>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {record.plan || "No treatment plan recorded."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            Close Record
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MedicalRecordViewModal;

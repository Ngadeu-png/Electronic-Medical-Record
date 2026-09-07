import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatientRecords } from "../../redux/slices/medicalRecordSlice";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Calendar, Stethoscope, X, CheckCircle, Clock } from "lucide-react";

const MedicalRecordSelectorModal = ({ isOpen, onClose, onSelectRecord, recipientDoctorName }) => {
  const dispatch = useDispatch();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const { records, status } = useSelector((state) => state.medicalRecords);

  useEffect(() => {
    if (isOpen && currentUser._id) {
      dispatch(fetchPatientRecords(currentUser._id));
    }
  }, [isOpen, currentUser._id, dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl relative max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Share Medical Record
              </h3>
              <p className="text-xs text-gray-400">
                Select an existing consultation record to send to {recipientDoctorName || "your doctor"}
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

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          {status === "loading" ? (
            <div className="text-center py-12 text-gray-400">
              Loading your medical records...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-600">No medical records on file</p>
              <p className="text-xs mt-1">You do not have any clinical consultation notes yet.</p>
            </div>
          ) : (
            records.map((rec) => (
              <div
                key={rec._id}
                className="p-4 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white shadow-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-sm">{rec.noteType}</span>
                    {rec.isSigned && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Signed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-gray-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
                      Dr. {rec.doctor?.username || rec.doctor?.name || "Physician"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {rec.assessment && (
                    <p className="text-gray-600 text-xs line-clamp-1 italic">
                      "{rec.assessment}"
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onSelectRecord(rec)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition self-start sm:self-auto flex-shrink-0 shadow-xs"
                >
                  Share in Chat
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MedicalRecordSelectorModal;

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPatientRecords } from "../../redux/slices/medicalRecordSlice";
import MedicalRecordList from "../../components/Dashboard/MedicalRecordList";
import { FileText, ShieldCheck, RefreshCw } from "lucide-react";

const PatientDashboardRecords = () => {
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const patientId = user?._id;

  const { records, status, error } = useSelector((state) => state.medicalRecords);

  useEffect(() => {
    if (patientId) {
      dispatch(fetchPatientRecords(patientId));
    }
  }, [patientId, dispatch]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">My Medical Records</h1>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Clinical Notes
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Official SOAP notes and consultation summaries documented by your hospital physicians.
          </p>
        </div>

        {patientId && (
          <button
            onClick={() => dispatch(fetchPatientRecords(patientId))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition shadow-sm self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Records
          </button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
        {status === "loading" ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            Loading your medical records...
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500 text-xs">
            {error}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-600 text-sm">No medical records on file yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Your medical documentation will appear here once a doctor completes your consultation and files a clinical note.
            </p>
          </div>
        ) : (
          <MedicalRecordList records={records} />
        )}
      </div>
    </div>
  );
};

export default PatientDashboardRecords;

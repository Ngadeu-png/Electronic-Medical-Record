import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  queryAiAssistant,
  loadAiHistory,
  resetAiHistory,
  loadContextOptions,
  clearError,
  clearAiState,
} from "../../redux/slices/aiSlice";
import {
  Sparkles,
  Send,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  Loader2,
  FileText,
  Stethoscope,
  Calendar,
  Users,
  Target,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";

const AIAssistant = ({ initialPatientId = "", patientContext = "", onInsertToSOAP = null }) => {
  const dispatch = useDispatch();
  const { history, contextOptions, status, historyStatus, error } = useSelector(
    (state) => state.ai
  );

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser?._id;
  const role = (currentUser.role || "doctor").toLowerCase();

  // Target selectors state
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatientId || "");
  const [selectedRecordId, setSelectedRecordId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");

  const [prompt, setPrompt] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Strictly isolate history per authenticated user ID
  useEffect(() => {
    dispatch(clearAiState());

    if (currentUserId) {
      dispatch(loadAiHistory());
      dispatch(loadContextOptions());
    }

    return () => {
      dispatch(clearAiState());
    };
  }, [dispatch, currentUserId]);

  // Sync initial patient if passed as prop
  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  // Scroll to bottom when history changes or status updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, status]);

  const handleSend = (textToSend = null) => {
    const queryText = (textToSend || prompt).trim();
    if (!queryText) return;

    dispatch(
      queryAiAssistant({
        prompt: queryText,
        targetPatientId: selectedPatientId || undefined,
        targetRecordId: selectedRecordId || undefined,
        targetDoctorId: selectedDoctorId || undefined,
        customContext: patientContext || undefined,
      })
    );

    setPrompt("");
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your conversation history?")) {
      dispatch(resetAiHistory());
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Build dynamic prompt suggestions based on role and selected target
  const getQuickPrompts = () => {
    if (role === "doctor") {
      if (selectedPatientId) {
        return [
          {
            label: "Patient Medical Summary",
            text: "Summarize this patient's medical history, SOAP records, and current health status.",
            icon: FileText,
          },
          {
            label: "Appointments & Treatment Plan",
            text: "What are this patient's upcoming appointments and the recommended treatment plan?",
            icon: Calendar,
          },
          {
            label: "Differential Diagnosis",
            text: "Based on this patient's symptoms and objective clinical data, propose differential diagnoses.",
            icon: Stethoscope,
          },
        ];
      }
      return [
        {
          label: "Which Appointment Now?",
          text: "Which appointment am I having right now or today? Provide patient name, scheduled time, and reason.",
          icon: Clock,
        },
        {
          label: "All Assigned Cases Summary",
          text: "Give me an overview of all patients currently assigned to me and their appointment statuses.",
          icon: Users,
        },
        {
          label: "Draft SOAP Plan Template",
          text: "Provide an evidence-based clinical treatment plan template for consultation documentation.",
          icon: Stethoscope,
        },
      ];
    } else if (role === "patient") {
      if (selectedRecordId) {
        return [
          {
            label: "Explain This Medical Record",
            text: "Explain what my doctor noted in this medical record, including the diagnosis and plan in simple terms.",
            icon: FileText,
          },
          {
            label: "Prescribed Treatment & Advice",
            text: "What medications or care instructions did my doctor prescribe in this record?",
            icon: Stethoscope,
          },
        ];
      }
      return [
        {
          label: "My Upcoming Appointments",
          text: "When is my next upcoming appointment, which doctor am I seeing, and what is the status?",
          icon: Calendar,
        },
        {
          label: "Summary of My Records",
          text: "Provide a simple, clear overview of my medical records and recent health history.",
          icon: FileText,
        },
        {
          label: "General Health Questions",
          text: "How can I best prepare for my upcoming doctor consultation?",
          icon: Sparkles,
        },
      ];
    } else {
      // Admin
      return [
        {
          label: "Hospital Overview",
          text: "Provide a hospital-wide operational overview: pending appointments, active doctor cases, and key metrics.",
          icon: ShieldCheck,
        },
        {
          label: "Pending Reassignments",
          text: "Are there any appointments waiting for assignment or doctor redirection?",
          icon: Calendar,
        },
      ];
    }
  };

  const quickPrompts = getQuickPrompts();

  // Find target patient name for display badge
  const activePatientName = contextOptions.patients.find(
    (p) => p._id === selectedPatientId
  )?.username;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden flex flex-col h-[750px] max-h-[85vh]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 p-4 text-white flex items-center justify-between shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base tracking-tight">
                CentriCare AI Assistant
              </h3>
              <span className="px-2 py-0.5 bg-purple-500/40 text-purple-100 text-[10px] font-semibold rounded-full uppercase tracking-wider border border-white/10">
                Gemini • Live DB Context
              </span>
            </div>
            <p className="text-[11px] text-purple-200">
              Directly answers questions about doctors, patients, appointments, and medical records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1 text-xs text-purple-200 hover:text-white bg-white/10 hover:bg-red-500/80 px-2.5 py-1.5 rounded-lg transition"
              title="Clear Conversation History from Database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear History</span>
            </button>
          )}

          <button
            onClick={() => {
              dispatch(loadAiHistory());
              dispatch(loadContextOptions());
            }}
            className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition"
            title="Refresh Context and History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target Selector Toolbar (Doctor / Patient / Admin) */}
      <div className="bg-purple-50/70 border-b border-purple-100 p-3 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <Target className="w-4 h-4 text-purple-700 flex-shrink-0" />
          <span className="font-semibold text-gray-700 flex-shrink-0">Context Target:</span>

          {/* Doctor Patient Selector */}
          {role === "doctor" && (
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full sm:w-auto flex-1 bg-white border border-purple-200 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">👥 All My Assigned Patients (General Inquiries)</option>
              {contextOptions.patients.map((p) => (
                <option key={p._id} value={p._id}>
                  👤 {p.username} {p.mrn ? `(MRN: ${p.mrn})` : ""}
                </option>
              ))}
            </select>
          )}

          {/* Patient Medical Record Selector */}
          {role === "patient" && (
            <select
              value={selectedRecordId}
              onChange={(e) => setSelectedRecordId(e.target.value)}
              className="w-full sm:w-auto flex-1 bg-white border border-purple-200 rounded-lg px-2.5 py-1 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">📋 All My Medical Records & Appointments</option>
              {contextOptions.records.map((r) => (
                <option key={r._id} value={r._id}>
                  📑 {r.noteType} - {new Date(r.date).toLocaleDateString()} (Dr. {r.doctorName})
                </option>
              ))}
            </select>
          )}

          {/* Admin Target Selectors */}
          {role === "admin" && (
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <select
                value={selectedPatientId}
                onChange={(e) => {
                  setSelectedPatientId(e.target.value);
                  if (e.target.value) setSelectedDoctorId("");
                }}
                className="bg-white border border-purple-200 rounded-lg px-2 py-1 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">👥 All Hospital Patients</option>
                {contextOptions.patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    👤 Patient: {p.username}
                  </option>
                ))}
              </select>

              <select
                value={selectedDoctorId}
                onChange={(e) => {
                  setSelectedDoctorId(e.target.value);
                  if (e.target.value) setSelectedPatientId("");
                }}
                className="bg-white border border-purple-200 rounded-lg px-2 py-1 text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">🩺 All Doctors</option>
                {contextOptions.doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    👨‍⚕️ Dr. {d.username} ({d.specialty || "General"})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Active Target Indicator Badge */}
        <div className="text-[11px] font-medium text-purple-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {selectedPatientId
              ? `Targeting: ${activePatientName || "Selected Patient"}`
              : selectedRecordId
              ? "Targeting: Selected Medical Record"
              : selectedDoctorId
              ? "Targeting: Selected Doctor"
              : role === "doctor"
              ? "Targeting: All Your Assigned Patients & Appointments"
              : "Targeting: General Profile & Hospital Data"}
          </span>
        </div>
      </div>

      {/* Conversation History Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50">
        {historyStatus === "loading" && history.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600 mb-2" />
            Loading conversation history from database...
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 px-4 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3">
              <Bot className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-gray-800">
              Welcome to CentriCare Clinical AI
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Ask about your appointments, medical records, diagnoses, or patients. Select a patient above to target their clinical records specifically.
            </p>
          </div>
        ) : (
          history.map((chat, idx) => (
            <div key={chat._id || idx} className="space-y-3">
              {/* User Message Bubble */}
              <div className="flex items-start justify-end gap-2.5">
                <div className="max-w-[85%] sm:max-w-[75%] space-y-1">
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-gray-400">
                    {chat.targetPatientName && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                        Patient: {chat.targetPatientName}
                      </span>
                    )}
                    <span>
                      {chat.createdAt
                        ? new Date(chat.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>
                  <div className="p-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-sm">
                    {chat.prompt}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                  <UserIcon className="w-4 h-4" />
                </div>
              </div>

              {/* AI Response Bubble */}
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[88%] sm:max-w-[80%] space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <span className="font-semibold text-purple-900">CentriCare AI</span>
                    <span>•</span>
                    <span>
                      {chat.createdAt
                        ? new Date(chat.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </span>
                  </div>

                  <div className="bg-white border border-purple-100 rounded-2xl rounded-tl-none p-4 text-xs text-gray-800 leading-relaxed shadow-xs space-y-2 whitespace-pre-line">
                    {chat.response}

                    {/* Action buttons on AI message */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2 text-[11px]">
                      <button
                        onClick={() => handleCopy(chat.response, idx)}
                        className="flex items-center gap-1 text-gray-500 hover:text-purple-700 px-2 py-1 rounded bg-gray-50 hover:bg-purple-50 transition"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-green-600" />
                            <span className="text-green-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {onInsertToSOAP && role === "doctor" && (
                        <button
                          onClick={() => onInsertToSOAP(chat.response)}
                          className="flex items-center gap-1 text-purple-700 hover:text-white hover:bg-purple-600 px-2.5 py-1 rounded bg-purple-50 transition font-medium"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Insert to Plan</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Bubble while AI generates response */}
        {status === "loading" && (
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-white border border-purple-200 rounded-2xl rounded-tl-none p-4 text-xs shadow-xs flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
              <span className="text-gray-600 font-medium">
                Analyzing database records & generating clinical AI response...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error alert if any */}
      {error && (
        <div className="p-3 mx-4 my-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearError())}
            className="text-xs text-red-500 hover:underline font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Prompt Suggestions */}
      <div className="bg-white border-t border-gray-100 p-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0 pl-1">
            Suggestions:
          </span>
          {quickPrompts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(item.text)}
                disabled={status === "loading"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs flex-shrink-0 transition disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-purple-600" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3.5 bg-white border-t border-gray-200 flex items-center gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <textarea
            rows={1}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              selectedPatientId
                ? `Ask anything about ${activePatientName || "this patient"}'s medical record or appointment...`
                : role === "doctor"
                ? "Ask about your appointments (e.g. 'which appointment am I having now?') or patients..."
                : "Ask about your medical records, appointments, or diagnoses..."
            }
            className="w-full text-xs p-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition resize-none max-h-24"
          />
        </div>

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={status === "loading" || !prompt.trim()}
          className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition disabled:opacity-40 shadow-sm flex items-center justify-center flex-shrink-0"
          title="Send Question"
        >
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;

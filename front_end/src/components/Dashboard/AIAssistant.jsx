import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { queryAiAssistant, clearAiResponse } from "../../redux/slices/aiSlice";
import {
  Sparkles,
  Send,
  Bot,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  Loader2,
  FileText,
  Stethoscope,
  BookOpen,
} from "lucide-react";

const AIAssistant = ({ patientContext = "", onInsertToSOAP = null }) => {
  const dispatch = useDispatch();
  const { response, status, error } = useSelector((state) => state.ai);

  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const quickPrompts = [
    {
      label: "Summarize SOAP Assessment",
      text: "Based on the patient's symptoms, provide a structured clinical assessment and differential diagnosis.",
      icon: Stethoscope,
    },
    {
      label: "Draft Plan & Recommendations",
      text: "Provide an evidence-based clinical treatment plan including medication considerations and monitoring advice.",
      icon: FileText,
    },
    {
      label: "Patient Education Summary",
      text: "Provide a clear, patient-friendly explanation of the diagnosis and home care instructions.",
      icon: BookOpen,
    },
  ];

  const handleSend = (customPrompt = null) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim()) return;

    dispatch(
      queryAiAssistant({
        prompt: textToSend,
        context: patientContext,
      })
    );
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-purple-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base tracking-tight">CentriCare Clinical AI Assistant</h3>
              <span className="px-2 py-0.5 bg-purple-500/40 text-purple-100 text-[10px] font-semibold rounded-full uppercase tracking-wider border border-white/10">
                Gemini Powered
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-0.5">
              Secure, server-side clinical intelligence for medical documentation & diagnostic inquiry.
            </p>
          </div>
        </div>

        {response && (
          <button
            onClick={() => dispatch(clearAiResponse())}
            className="flex items-center gap-1 text-xs text-purple-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
            title="Clear AI Response"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      <div className="p-6 space-y-5">
        {/* Quick prompt suggestions */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Quick Clinical Queries
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {quickPrompts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(item.text);
                    handleSend(item.text);
                  }}
                  disabled={status === "loading"}
                  className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 text-left transition disabled:opacity-50"
                >
                  <Icon className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-gray-800">{item.label}</div>
                    <div className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                      {item.text}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Query Input Box */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700">
            Ask or Describe Clinical Inquiry
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. Analyze symptoms, propose differential diagnoses, or summarize SOAP plan considerations..."
              className="w-full text-xs p-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={status === "loading" || !prompt.trim()}
              className="absolute right-3 bottom-3 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition disabled:opacity-40 disabled:hover:bg-purple-600"
              title="Submit to AI"
            >
              {status === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Output Card */}
        {status === "loading" && (
          <div className="p-8 border border-purple-100 rounded-xl bg-purple-50/40 text-center">
            <Loader2 className="w-7 h-7 text-purple-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium text-purple-800">
              Processing clinical AI query via CentriCare backend...
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Securely synthesizing medical information
            </p>
          </div>
        )}

        {response && status !== "loading" && (
          <div className="border border-purple-200 rounded-xl overflow-hidden bg-gradient-to-b from-purple-50/30 to-white">
            <div className="px-4 py-2.5 bg-purple-100/70 border-b border-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-900">
                <Bot className="w-4 h-4 text-purple-700" />
                AI Clinical Guidance
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-purple-700 hover:text-purple-900 font-medium px-2.5 py-1 rounded bg-white border border-purple-200 shadow-2xs hover:bg-purple-50 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                {onInsertToSOAP && (
                  <button
                    type="button"
                    onClick={() => onInsertToSOAP(response)}
                    className="flex items-center gap-1 text-[11px] text-white font-medium px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 shadow-2xs transition"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Insert to SOAP Plan</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 text-xs text-gray-800 leading-relaxed whitespace-pre-line">
              {response}
            </div>

            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-[11px] text-gray-500 italic">
              Disclaimer: Clinical AI output is decision-support guidance only. Licensed medical practitioners are responsible for all clinical decisions and diagnoses.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;

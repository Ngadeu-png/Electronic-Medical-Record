import React, { useState } from "react";
import { Sparkles, X, Bot, ChevronDown } from "lucide-react";
import AIAssistant from "./AIAssistant";

const FloatingAIButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const context = `User: ${currentUser.username || "Staff"}, Role: ${
    currentUser.role || "Healthcare User"
  }`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Dialog Panel */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[480px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-purple-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Top close bar */}
          <div className="bg-purple-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Bot className="w-4 h-4 text-purple-300" />
              <span>CentriCare AI Assistant (Gemini)</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg text-purple-200 hover:text-white transition"
              title="Close AI Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Assistant Body */}
          <div className="overflow-y-auto max-h-[calc(82vh-50px)]">
            <AIAssistant patientContext={context} />
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-4 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-purple-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-purple-300"
        title={isOpen ? "Close AI Assistant" : "Open Clinical AI Assistant"}
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
          </span>
        </div>

        <span className="text-xs font-bold tracking-wide pr-1">
          {isOpen ? "Close AI" : "Ask AI Assistant"}
        </span>

        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-purple-200" />
        ) : (
          <span className="px-1.5 py-0.5 bg-white/20 text-[10px] font-semibold rounded-full uppercase tracking-wider">
            Gemini
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingAIButton;

import React from "react";
import AIAssistant from "../../components/Dashboard/AIAssistant";
import { Sparkles, BrainCircuit, ShieldAlert, Cpu } from "lucide-react";

const AIPage = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const systemContext = `User: ${currentUser.username || "Staff"}, Role: ${
    currentUser.role || "Healthcare Professional"
  }${currentUser.specialty ? `, Specialty: ${currentUser.specialty}` : ""}.`;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">
                CentriCare AI Clinical Intelligence
              </h1>
              
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Secure, server-side assisted diagnosis, clinical note formulation, and medical documentation support.
            </p>
          </div>
          
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3.5 py-2 rounded-xl border border-gray-200">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>
              Logged in as: <strong className="text-gray-900">{currentUser.username || "User"}</strong> ({currentUser.role || "Staff"})
            </span>
          </div>
        </div>
      </div>

      
      <div className="max-w-4xl mx-auto space-y-6">
        <AIAssistant key={currentUser?._id || "anon"} patientContext={systemContext} />

        
      </div>
    </div>
  );
};

export default AIPage;

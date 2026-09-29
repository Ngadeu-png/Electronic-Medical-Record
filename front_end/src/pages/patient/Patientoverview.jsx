import React from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  ArrowRight,
  PlusCircle,
  ClipboardList,
  UserRoundCheck,
  FileHeart,
} from "lucide-react";

const Overview = () => {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 mb-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-200 font-semibold">
            Patient Portal
          </span>
          <h1 className="text-2xl font-bold mt-1">
            Welcome, {currentUser.username || "Patient"}
          </h1>
          <p className="text-xs text-purple-100 mt-1">
            {currentUser.mrn ? `Medical Record Number: ${currentUser.mrn}` : "CENTRIC CARE Hospital System"}
          </p>
        </div>

        <Link
          to="/patient/appointment"
          className="px-4 py-2.5 bg-white text-purple-700 hover:bg-purple-50 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 self-start"
        >
          <PlusCircle className="w-4 h-4 text-purple-700" />
          Book New Consultation
        </Link>
      </div>

      {/* Patient guide and clinical navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">How your care works</h2>
              <p className="text-xs text-gray-500">A simple guide to using your patient portal.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-purple-50 p-4">
              <ClipboardList className="w-5 h-5 text-purple-600 mb-2" />
              <h3 className="text-sm font-bold text-gray-800">1. Request care</h3>
              <p className="text-xs text-gray-600 mt-1">Book a consultation and describe what you need help with.</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-4">
              <UserRoundCheck className="w-5 h-5 text-blue-600 mb-2" />
              <h3 className="text-sm font-bold text-gray-800">2. Meet your doctor</h3>
              <p className="text-xs text-gray-600 mt-1">The hospital team assigns your request to the right practitioner.</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <FileHeart className="w-5 h-5 text-emerald-600 mb-2" />
              <h3 className="text-sm font-bold text-gray-800">3. Follow your care</h3>
              <p className="text-xs text-gray-600 mt-1">Check your records and messages after your consultation.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Clinical Actions</h3>
            <div className="space-y-2.5">
              <Link
                to="/patient/profile"
                className="flex items-center justify-between p-3 rounded-xl bg-red-50/70 border border-red-100 text-red-900 hover:bg-red-100/70 transition text-xs font-semibold"
              >
                <span>Emergency Profile &amp; Trusted Contacts</span>
                <ArrowRight className="w-4 h-4 text-red-600" />
              </Link>
              <Link
                to="/patient/Myrecord"
                className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 hover:bg-purple-100 transition text-xs font-semibold"
              >
                <span>View My Medical Records (SOAP Notes)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/patient/appointment"
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 hover:bg-emerald-100 transition text-xs font-semibold"
              >
                <span>Schedule New Doctor Visit</span>
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </Link>
            </div>
          </div>

          {/* EMR System Online Status — Emerald Green */}
          <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-xs font-bold text-emerald-800">CENTRIC CARE EMR </h3>
            </div>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Appointments are reviewed by hospital administration and assigned to specialized medical practitioners. Once accepted by your doctor, please arrive 15 minutes before your consultation.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Overview;

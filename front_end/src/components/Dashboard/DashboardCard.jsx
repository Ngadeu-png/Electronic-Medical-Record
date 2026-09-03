import React from "react";

const DashboardCard = ({ name, total, icon, bgGradient = "bg-purple-600", subtext = "" }) => {
  return (
    <div className={`${bgGradient} w-full rounded-2xl text-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between`}>
      <div className="flex justify-between items-center text-white/90">
        <span className="text-xs font-bold uppercase tracking-wider">{name}</span>
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-extrabold py-3">{total}</div>
      {subtext && <div className="text-[11px] text-white/80">{subtext}</div>}
    </div>
  );
};

export default DashboardCard;

import React from "react";
import { CiCalendarDate } from "react-icons/ci";

const DashboardCard = ({ name, total, icon }) => {
  return (
    <div className="bg-purple-500 w-1/4 rounded-xl text-white p-4">
      <div className="flex justify-between items-center">
        <span>{name}</span>
        {icon}
      </div>
      <div className="text-4xl py-4">{total}</div>
    </div>
  );
};

export default DashboardCard;

import React from "react";
import { CiCalendarDate } from "react-icons/ci";
import DashboardCard from "../../components/Dashboard/DashboardCard";
import { FaHospital } from "react-icons/fa";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const Overview = () => {
  return (
    <div className="p-4 mt-2 border-t border-purple-500 rounded-xl ">
      <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
      <div className="flex justify-center gap-4">
        <DashboardCard
          name="Total appointments"
          total={24}
          icon={<CiCalendarDate />}
        />
        <DashboardCard
          name="Total consultations"
          total={19}
          icon={<FaHospital />}
        />
        <DashboardCard
          name="Total consultations"
          total={19}
          icon={<FaHospital />}
        />
        <DashboardCard
          name="Total consultations"
          total={19}
          icon={<FaHospital />}
        />
      </div>
      <div className="mt-10">
        <BarChart
          width={1000}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="pv"
            fill="#8884d8"
            activeBar={<Rectangle fill="pink" stroke="blue" />}
          />
          <Bar
            dataKey="uv"
            fill="#82ca9d"
            activeBar={<Rectangle fill="gold" stroke="purple" />}
          />
        </BarChart>
      </div>
    </div>
  );
};

export default Overview;

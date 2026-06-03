"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const trendData = [
  { month: "Jan", nilai: 68 },
  { month: "Feb", nilai: 70 },
  { month: "Mar", nilai: 73 },
  { month: "Apr", nilai: 72 },
  { month: "May", nilai: 76 },
  { month: "Jun", nilai: 78 },
];

export default function TrendLineChart() {
  return (
    <div className="rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-dark dark:text-white">
          Tren Perkembangan
        </h2>
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Perubahan nilai rata-rata per bulan (mock data).
        </p>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="nilai"
              stroke="#3BA99C"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

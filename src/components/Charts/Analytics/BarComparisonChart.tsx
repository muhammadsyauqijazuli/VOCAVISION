"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const barData = [
  { name: "Kelas X", skor: 72 },
  { name: "Kelas XI", skor: 78 },
  { name: "Kelas XII", skor: 74 },
  { name: "Kelas XIII", skor: 69 },
];

export default function BarComparisonChart() {
  return (
    <div className="rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-dark dark:text-white">
          Perbandingan Rata-rata
        </h2>
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Rata-rata skor berdasarkan kelas (mock data).
        </p>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="skor" fill="#1F6F5F" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

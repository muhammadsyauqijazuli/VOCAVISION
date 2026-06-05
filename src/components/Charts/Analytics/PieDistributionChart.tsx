"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const pieData = [
  { name: "Rendah", value: 18 },
  { name: "Netral", value: 32 },
  { name: "Tinggi", value: 50 },
];

const COLORS = ["#E74C3C", "#F39C12", "#3BA99C"];

export default function PieDistributionChart() {
  return (
    <div className="rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-dark dark:text-white">
          Distribusi Risiko
        </h2>
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Persentase status risiko siswa (mock data).
        </p>
      </div>

      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={45}
              outerRadius={80}
            >
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={24} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

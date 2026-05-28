"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

const shapData = [
  { feature: "Jam belajar", impact: 0.34 },
  { feature: "Kehadiran", impact: 0.28 },
  { feature: "Motivasi", impact: 0.2 },
  { feature: "Screen time", impact: -0.18 },
  { feature: "Stress level", impact: -0.25 },
  { feature: "Time management", impact: 0.15 },
];

export default function ShapChart() {
  return (
    <div className="rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-dark dark:text-white">
          SHAP Summary Plot
        </h2>
        <p className="text-sm text-dark-4 dark:text-dark-6">
          Dampak fitur terhadap prediksi skor (mock data).
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shapData} layout="vertical" margin={{ left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[-0.4, 0.4]} />
            <YAxis dataKey="feature" type="category" width={120} />
            <Tooltip />
            <Bar dataKey="impact" radius={[6, 6, 6, 6]}>
              {shapData.map((entry) => (
                <Cell
                  key={entry.feature}
                  fill={entry.impact >= 0 ? "#3BA99C" : "#E74C3C"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

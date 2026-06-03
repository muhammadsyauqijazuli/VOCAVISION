"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export type SHAPDataItem = {
  feature_name: string;
  impact_value: number;
  suggestion_text?: string;
};

type SHAPChartProps = {
  data: SHAPDataItem[];
};

export function SHAPChart({ data }: SHAPChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2">
        <p className="text-sm text-dark-4 dark:text-dark-6">Data SHAP tidak tersedia.</p>
      </div>
    );
  }

  // Ensure data is sorted by absolute impact
  const sortedData = [...data].sort(
    (a, b) => Math.abs(b.impact_value) - Math.abs(a.impact_value)
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as SHAPDataItem;
      const isPositive = dataPoint.impact_value > 0;
      return (
        <div className="rounded-lg border border-stroke bg-white p-3 shadow-lg dark:border-dark-3 dark:bg-dark-2">
          <p className="mb-1 font-bold text-dark dark:text-white">
            {dataPoint.feature_name}
          </p>
          <p
            className={`text-sm font-semibold ${
              isPositive ? "text-green" : "text-red"
            }`}
          >
            Dampak: {dataPoint.impact_value.toFixed(4)}
          </p>
          {dataPoint.suggestion_text && (
            <p className="mt-2 text-xs text-dark-4 dark:text-dark-6 max-w-xs">
              {dataPoint.suggestion_text}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
          <XAxis
            type="number"
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={{ stroke: "#E2E8F0" }}
          />
          <YAxis
            type="category"
            dataKey="feature_name"
            tick={{ fill: "#64748B", fontSize: 12 }}
            axisLine={{ stroke: "#E2E8F0" }}
            width={120}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
          <Bar dataKey="impact_value" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.impact_value > 0 ? "#10B981" : "#EF4444"} // green for positive, red for negative
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

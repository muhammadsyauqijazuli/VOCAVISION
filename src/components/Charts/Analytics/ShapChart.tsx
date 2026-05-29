"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

type ApiShapChartItem = {
  feature_name: string;
  impact_value: number | string;
  suggestion_text?: string | null;
};

type LegacyShapChartItem = {
  feature: string;
  impact: number;
};

type ShapChartInput = ApiShapChartItem | LegacyShapChartItem;

type ChartItem = {
  feature: string;
  impact: number;
};

type ShapChartProps = {
  data?: ShapChartInput[];
  title?: string;
  description?: string;
};

const FALLBACK_DATA: LegacyShapChartItem[] = [
  { feature: "Jam belajar", impact: 0.34 },
  { feature: "Kehadiran", impact: 0.28 },
  { feature: "Motivasi", impact: 0.2 },
  { feature: "Screen time", impact: -0.18 },
  { feature: "Stress level", impact: -0.25 },
  { feature: "Time management", impact: 0.15 },
];

const COLORS = {
  positive: "#3BA99C",
  negative: "#E74C3C",
  grid: "rgba(148, 163, 184, 0.25)",
  tick: "#6B7280",
};

function formatFeatureLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeData(source: ShapChartInput[]): ChartItem[] {
  return source
    .map((item) => {
      if ("feature_name" in item) {
        return {
          feature: item.feature_name,
          impact: Number(item.impact_value ?? 0),
        };
      }

      return {
        feature: item.feature,
        impact: Number(item.impact ?? 0),
      };
    })
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
}

export default function ShapChart({
  data,
  title = "SHAP Summary Plot",
  description = "Dampak fitur terhadap prediksi skor.",
}: ShapChartProps) {
  const chartData = useMemo(() => {
    return normalizeData((data ?? FALLBACK_DATA) as ShapChartInput[]);
  }, [data]);

  const maxAbs = useMemo(() => {
    const values = chartData.map((item) => Math.abs(item.impact));
    return Math.max(0.4, ...values);
  }, [chartData]);

  return (
    <div className="rounded-2xl border border-stroke bg-white p-5 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-dark dark:text-white">{title}</h2>
        <p className="text-sm text-dark-4 dark:text-dark-6">{description}</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
            <ReferenceLine x={0} stroke="#94A3B8" strokeWidth={1} />
            <XAxis
              type="number"
              domain={[-maxAbs, maxAbs]}
              tickFormatter={(value) => Number(value).toFixed(2)}
              tick={{ fill: COLORS.tick, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="feature"
              type="category"
              width={180}
              tickFormatter={formatFeatureLabel}
              tick={{ fill: COLORS.tick, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(87, 80, 241, 0.06)" }}
              formatter={(value: number) => [Number(value).toFixed(3), "Impact"]}
              labelFormatter={(label) => `Fitur: ${formatFeatureLabel(String(label))}`}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(148, 163, 184, 0.25)",
                background: "rgba(255, 255, 255, 0.98)",
                boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
              }}
            />
            <Bar dataKey="impact" barSize={20}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.feature}
                  fill={entry.impact >= 0 ? COLORS.positive : COLORS.negative}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
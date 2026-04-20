'use client';

import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface Stats {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  topCategories: { category: string; count: number }[];
  averageConfidence: number;
}

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#22c55e',
  Negative: '#ef4444',
  Neutral: '#94a3b8',
};

interface PieLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

function PieLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: PieLabelProps) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function ChartPlaceholder() {
  return <div className="h-[220px] animate-pulse rounded-xl bg-gray-100" />;
}

export default function ChartsSection({
  stats,
  loading,
}: {
  stats: Stats | null;
  loading: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (loading) {
    return (
      <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 h-4 w-36 animate-pulse rounded bg-gray-100" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ChartPlaceholder />
          <ChartPlaceholder />
        </div>
      </div>
    );
  }

  if (!stats || stats.total === 0) return null;

  const pieData = [
    { name: 'Positive', value: stats.positive },
    { name: 'Negative', value: stats.negative },
    { name: 'Neutral', value: stats.neutral },
  ].filter((d) => d.value > 0);

  const barData = stats.topCategories.map(({ category, count }) => ({ category, count }));

  return (
    <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-sm font-semibold text-gray-700">Insights Overview</h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Pie chart — sentiment distribution */}
        <div>
          <p className="mb-3 text-xs font-medium text-gray-400">Sentiment Distribution</p>
          {mounted ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  dataKey="value"
                  labelLine={false}
                  label={(props) => <PieLabel {...props} />}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, 'Entries']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder />
          )}
          <div className="mt-3 flex justify-center gap-5">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SENTIMENT_COLORS[entry.name] }}
                />
                <span className="text-xs text-gray-500">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar chart — top categories */}
        <div>
          <p className="mb-3 text-xs font-medium text-gray-400">Top Categories</p>
          {mounted && barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [value, 'Entries']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}

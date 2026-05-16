'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { StatsResponse } from '../../types';

const SENTIMENT_COLORS: Record<string, string> = {
  Positive: '#34d399',
  Negative: '#f87171',
  Neutral: '#94a3b8',
};

const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#e2e8f0',
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
      fill="#0f172a"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function SentimentPie({ stats }: { stats: StatsResponse }) {
  const data = [
    { name: 'Positive', value: stats.positive },
    { name: 'Negative', value: stats.negative },
    { name: 'Neutral', value: stats.neutral },
  ].filter((d) => d.value > 0);

  return (
    <div>
      <p className="mb-3 text-xs font-medium text-slate-400">Sentiment Distribution</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={85}
            dataKey="value"
            labelLine={false}
            label={(props) => <PieLabel {...props} />}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Entries']} contentStyle={TOOLTIP_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: SENTIMENT_COLORS[entry.name] }}
            />
            <span className="text-xs text-slate-400">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

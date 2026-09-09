import React, { useMemo } from 'react';
import { BarChart2, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function StatsCharts({ logs }) {
  
  // Last 14 Days Trend Data
  const dailyTrendData = useMemo(() => {
    const today = new Date();
    const daysMap = {};

    // Initialize last 14 days with 0
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
      daysMap[dateStr] = { dateStr, displayLabel, totalPages: 0 };
    }

    // Aggregate logs
    logs.forEach((log) => {
      if (daysMap[log.log_date]) {
        daysMap[log.log_date].totalPages += log.page_count;
      }
    });

    return Object.values(daysMap);
  }, [logs]);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Son 14 Günün Okuma Eğilimi
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Grupça günlük okunan toplam sayfa sayıları grafiği
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <BarChart2 className="h-5 w-5" />
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="displayLabel" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '13px'
              }}
              formatter={(value) => [`${value} sayfa`, 'Toplam Okunan']}
            />
            <Area
              type="monotone"
              dataKey="totalPages"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPages)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

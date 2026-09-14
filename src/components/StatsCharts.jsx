import React, { useState, useEffect, useMemo } from 'react';
import { BarChart2, TrendingUp, Lock, Clock } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function StatsCharts({ logs }) {
  // Chart is unlocked only between 23:30 and 23:59:59
  const [isUnlocked, setIsUnlocked] = useState(() => {
    const now = new Date();
    return now.getHours() === 23 && now.getMinutes() >= 30;
  });

  useEffect(() => {
    const checkVisibility = () => {
      const now = new Date();
      setIsUnlocked(now.getHours() === 23 && now.getMinutes() >= 30);
    };

    checkVisibility();
    const interval = setInterval(checkVisibility, 5000);
    return () => clearInterval(interval);
  }, []);
  
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
            {!isUnlocked && <Lock className="h-4 w-4 text-amber-400 inline ml-1" />}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Grupça günlük okunan toplam sayfa sayıları grafiği
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <BarChart2 className="h-5 w-5" />
        </div>
      </div>

      {!isUnlocked ? (
        <div className="text-center py-16 px-4 border border-dashed border-amber-500/30 bg-slate-900/60 rounded-2xl space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-white">Okuma Grafik Verileri Kilitlidir</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Günlük toplam okunan sayfa eğilim grafiği veri girişleri tamamlandıktan sonra her gece <span className="text-amber-400 font-semibold">23:30 - 00:00</span> saatleri arasında erişime açılacaktır.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <span>Açılış Saati: 23:30</span>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}

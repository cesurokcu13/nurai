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
    <div className="paper-card rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200/80">
        <div>
          <h3 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-sage-50 text-sage-700 border border-sage-200/80">
              <TrendingUp className="h-4.5 w-4.5" />
            </span>
            Son 14 Günün Okuma Eğilimi
            {!isUnlocked && <Lock className="h-4 w-4 text-amber-600 inline ml-1" />}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Halka genelinde günlük okunan toplam sayfa sayıları grafiği
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-stone-100 text-stone-700 border border-stone-200/80 shadow-2xs">
          <BarChart2 className="h-5 w-5" />
        </div>
      </div>

      {!isUnlocked ? (
        <div className="text-center py-14 px-4 border border-dashed border-amber-300 bg-[#FAF8F5] rounded-2xl space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
            <Lock className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold font-serif text-stone-900">Okuma Grafik Verileri Kilitlidir</h4>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            Günlük toplam okunan sayfa eğilim grafiği veri girişleri tamamlandıktan sonra her gece <span className="text-amber-800 font-semibold">23:30 - 00:00</span> saatleri arasında erişime açılacaktır.
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 font-mono shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-amber-700" />
            <span>Açılış Saati: 23:30</span>
          </div>
        </div>
      ) : (
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4A6B53" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4A6B53" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="displayLabel" stroke="#78716C" fontSize={12} tickLine={false} />
              <YAxis stroke="#78716C" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E7E5E4',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.06)',
                  color: '#1C1917',
                  fontSize: '13px'
                }}
                formatter={(value) => [`${value} sayfa`, 'Toplam Okunan']}
              />
              <Area
                type="monotone"
                dataKey="totalPages"
                stroke="#4A6B53"
                strokeWidth={2.5}
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

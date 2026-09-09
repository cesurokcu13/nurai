import React, { useMemo } from 'react';
import { BarChart2, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const PIE_COLORS = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#A855F7', '#06B6D4', '#F97316'];

export default function StatsCharts({ logs }) {
  
  // 1. Last 14 Days Trend Data
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

  // 2. Book Distribution Pie Data
  const bookDistributionData = useMemo(() => {
    const bookMap = {};
    logs.forEach((log) => {
      const book = log.book_title || 'Genel / Risale-i Nur';
      bookMap[book] = (bookMap[book] || 0) + log.page_count;
    });

    return Object.entries(bookMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7); // Top 7 books
  }, [logs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. Daily Reading Trend Area Chart */}
      <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Son 14 Günün Okuma Eğilimi
            </h3>
            <p className="text-xs text-slate-400">Grupça günlük okunan toplam sayfa sayıları</p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <BarChart2 className="h-5 w-5" />
          </div>
        </div>

        <div className="h-64 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="displayLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
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

      {/* 2. Book Distribution Pie Chart */}
      <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-blue-400" />
              Eser Dağılımı
            </h3>
            <p className="text-xs text-slate-400">Okunan Risale-i Nur eserlerinin oranı</p>
          </div>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          {bookDistributionData.length === 0 ? (
            <p className="text-xs text-slate-500">Henüz veri bulunmuyor.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {bookDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`${val} sayfa`, 'Okunan']}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Calendar, Award, Flame, Clock, ShieldCheck, BookOpen } from 'lucide-react';
import { getBadgeStyleForNickname, sanitizeToLettersOnly } from '../utils/nicknameGenerator';

export default function TablesSection({ logs }) {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper date functions
  const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(date.setDate(diff));
  };

  const getStartOfMonth = (d) => {
    const date = new Date(d);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Process Daily Logs
  const todayLogs = useMemo(() => {
    return logs
      .filter((l) => l.log_date === todayStr)
      .sort((a, b) => b.page_count - a.page_count);
  }, [logs, todayStr]);

  // Process Weekly Leaderboard
  const weeklyLeaderboard = useMemo(() => {
    const startOfWeek = getStartOfWeek(new Date());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    const userMap = {};
    logs.forEach((log) => {
      if (log.log_date >= startOfWeekStr) {
        const userId = log.user_id;
        const nickname = sanitizeToLettersOnly(log.profiles?.color_nickname || 'Anonim Okuyucu');
        const badgeColor = log.profiles?.badge_color || '#10B981';

        if (!userMap[userId]) {
          userMap[userId] = {
            userId,
            nickname,
            badgeColor,
            totalPages: 0,
            daysActiveSet: new Set()
          };
        }
        userMap[userId].totalPages += log.page_count;
        userMap[userId].daysActiveSet.add(log.log_date);
      }
    });

    return Object.values(userMap)
      .map((u) => ({ ...u, daysActive: u.daysActiveSet.size }))
      .sort((a, b) => b.totalPages - a.totalPages);
  }, [logs]);

  // Process Monthly Leaderboard
  const monthlyLeaderboard = useMemo(() => {
    const startOfMonth = getStartOfMonth(new Date());
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    const userMap = {};
    logs.forEach((log) => {
      if (log.log_date >= startOfMonthStr) {
        const userId = log.user_id;
        const nickname = sanitizeToLettersOnly(log.profiles?.color_nickname || 'Anonim Okuyucu');
        const badgeColor = log.profiles?.badge_color || '#10B981';

        if (!userMap[userId]) {
          userMap[userId] = {
            userId,
            nickname,
            badgeColor,
            totalPages: 0,
            daysActiveSet: new Set()
          };
        }
        userMap[userId].totalPages += log.page_count;
        userMap[userId].daysActiveSet.add(log.log_date);
      }
    });

    return Object.values(userMap)
      .map((u) => ({ ...u, daysActive: u.daysActiveSet.size }))
      .sort((a, b) => b.totalPages - a.totalPages);
  }, [logs]);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Okuma Tabloları & Sıralama
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sadece harflerden oluşan anonim takma adlar ile günlük, haftalık ve aylık okuma takibi.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Günlük Tablo
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'weekly'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            Haftalık Özet
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'monthly'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            Aylık Özet
          </button>
        </div>
      </div>

      {/* 1. GÜNLÜK TABLO */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Bugünün Kayıtları ({todayStr})</span>
            <span className="font-semibold text-emerald-400">
              Toplam: {todayLogs.reduce((acc, curr) => acc + curr.page_count, 0)} Sayfa
            </span>
          </div>

          {todayLogs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
              <BookOpen className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-400">Bugün henüz okuma kaydı girilmedi.</p>
              <p className="text-xs text-slate-500 mt-1">Yukarıdaki formdan ilk kaydı siz oluşturun!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Sıra</th>
                    <th className="pb-3 px-3">Anonim Okuyucu</th>
                    <th className="pb-3 px-3 text-right">Sayfa Sayısı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {todayLogs.map((log, index) => {
                    const nickname = sanitizeToLettersOnly(log.profiles?.color_nickname || 'Anonim Okuyucu');
                    const badgeStyle = getBadgeStyleForNickname(nickname);
                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-3 font-semibold text-slate-400 text-xs">
                          {index === 0 ? '🥇 1.' : index === 1 ? '🥈 2.' : index === 2 ? '🥉 3.' : `${index + 1}.`}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-block px-3 py-1 rounded-xl border text-xs font-semibold ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}>
                            {nickname}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-extrabold text-emerald-400">
                          {log.page_count} sayfa
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 2. HAFTALIK ÖZET */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Bu Haftanın En Çok Okuyanları</span>
            <span className="font-semibold text-amber-400">
              {weeklyLeaderboard.length} Aktif Okuyucu
            </span>
          </div>

          {weeklyLeaderboard.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-sm font-medium text-slate-400">Bu hafta henüz okuma verisi yok.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Derece</th>
                    <th className="pb-3 px-3">Anonim Okuyucu</th>
                    <th className="pb-3 px-3 text-center">Aktif Gün</th>
                    <th className="pb-3 px-3 text-right">Haftalık Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {weeklyLeaderboard.map((item, index) => {
                    const badgeStyle = getBadgeStyleForNickname(item.nickname);
                    return (
                      <tr key={item.userId} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-3 font-semibold text-xs">
                          {index === 0 ? (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">🥇 1. Sıra</span>
                          ) : index === 1 ? (
                            <span className="px-2 py-0.5 rounded-lg bg-slate-300/10 text-slate-300 border border-slate-300/20 font-bold">🥈 2. Sıra</span>
                          ) : index === 2 ? (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-700/10 text-amber-600 border border-amber-700/20 font-bold">🥉 3. Sıra</span>
                          ) : (
                            <span className="text-slate-400">{index + 1}.</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-block px-3 py-1 rounded-xl border text-xs font-semibold ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}>
                            {item.nickname}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center text-xs text-slate-300">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                            {item.daysActive} gün
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-extrabold text-amber-400 text-base">
                          {item.totalPages.toLocaleString('tr-TR')} sayfa
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. AYLIK ÖZET */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Bu Ayın Genel Okuma Sıralaması</span>
            <span className="font-semibold text-blue-400">
              {monthlyLeaderboard.length} Aktif Okuyucu
            </span>
          </div>

          {monthlyLeaderboard.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-sm font-medium text-slate-400">Bu ay henüz okuma verisi yok.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Sıra</th>
                    <th className="pb-3 px-3">Anonim Okuyucu</th>
                    <th className="pb-3 px-3 text-center">Okuma Gün Sayısı</th>
                    <th className="pb-3 px-3 text-right">Aylık Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {monthlyLeaderboard.map((item, index) => {
                    const badgeStyle = getBadgeStyleForNickname(item.nickname);
                    return (
                      <tr key={item.userId} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-3 font-semibold text-xs text-slate-400">
                          {index + 1}.
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`inline-block px-3 py-1 rounded-xl border text-xs font-semibold ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}>
                            {item.nickname}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center text-xs text-slate-300">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                            {item.daysActive} gün
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-extrabold text-blue-400 text-base">
                          {item.totalPages.toLocaleString('tr-TR')} sayfa
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Privacy note bottom bar */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          Kullanıcı isimleri ve e-postaları gizlidir. Sadece harflerden oluşan renkli takma adlar gösterilir.
        </span>
      </div>

    </div>
  );
}

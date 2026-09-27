import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Award, Flame, Clock, ShieldCheck, BookOpen, Lock } from 'lucide-react';
import { getBadgeStyleForNickname, getGuaranteedUniqueLetterMap } from '../utils/nicknameGenerator';

export default function TablesSection({ logs }) {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'weekly' | 'monthly'

  // Tables are unlocked only between 23:30 and 23:59:59
  const [isUnlocked, setIsUnlocked] = useState(() => {
    const now = new Date();
    return now.getHours() === 23 && now.getMinutes() >= 30;
  });

  useEffect(() => {
    const checkVisibility = () => {
      const now = new Date();
      const visible = now.getHours() === 23 && now.getMinutes() >= 30;
      setIsUnlocked(visible);
    };

    checkVisibility();
    const interval = setInterval(checkVisibility, 5000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Guaranteed 100% Unique Letter Mapping per User ID
  const uniqueLetterMap = useMemo(() => {
    return getGuaranteedUniqueLetterMap(logs);
  }, [logs]);

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
        const nickname = log.profiles?.color_nickname || 'Anonim';
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
        const nickname = log.profiles?.color_nickname || 'Anonim';
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
    <div className="paper-card rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
        <div>
          <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80">
              <Award className="h-4.5 w-4.5" />
            </span>
            Okuma Tabloları & Sıralama
            {!isUnlocked && <Lock className="h-4 w-4 text-amber-600 inline ml-1" />}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Her okuyucu için tamamen gizli ve çakışmasız, %100 eşsiz baş harf rozeti gösterilmektedir.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 border border-stone-200/80 self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-sage-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Günlük Tablo
            {!isUnlocked && (
              <Lock className="h-3 w-3 text-amber-400 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'weekly'
                ? 'bg-sage-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            Haftalık Özet
            {!isUnlocked && (
              <Lock className="h-3 w-3 text-amber-400 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'monthly'
                ? 'bg-sage-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-sky-600" />
            Aylık Özet
            {!isUnlocked && (
              <Lock className="h-3 w-3 text-amber-400 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* 1. GÜNLÜK TABLO */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          {!isUnlocked ? (
            <div className="text-center py-12 px-4 border border-dashed border-amber-300 bg-[#FAF8F5] rounded-2xl space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold font-serif text-stone-900">Günlük Sıralama Tablosu Kilitlidir</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Günlük okuma sıralaması veri girişleri tamamlandıktan sonra her gece <span className="text-amber-800 font-semibold">23:30 - 00:00</span> saatleri arasında erişime açılacaktır.
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 font-mono shadow-2xs">
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                <span>Açılış Saati: 23:30</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>Bugünün Kayıtları ({todayStr})</span>
                <span className="font-semibold text-sage-800">
                  Toplam: {todayLogs.reduce((acc, curr) => acc + curr.page_count, 0)} Sayfa
                </span>
              </div>

              {todayLogs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-200 bg-[#FAF8F5] rounded-2xl">
                  <BookOpen className="h-10 w-10 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-stone-700">Bugün henüz okuma kaydı girilmedi.</p>
                  <p className="text-xs text-stone-500 mt-1">Yukarıdaki formdan ilk kaydı siz oluşturun!</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200/80">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50/80">
                      <tr className="border-b border-stone-200 text-xs text-stone-600 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-3.5">Sıra</th>
                        <th className="py-3 px-3.5">Okuyucu Kodu</th>
                        <th className="py-3 px-3.5 text-right">Sayfa Sayısı</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {todayLogs.map((log, index) => {
                        const letter = uniqueLetterMap[log.user_id] || 'A';
                        const badgeStyle = getBadgeStyleForNickname(letter);

                        return (
                          <tr key={log.id} className="hover:bg-stone-50/80 transition">
                            <td className="py-3 px-3.5 font-semibold text-stone-600 text-xs">
                              {index === 0 ? '🥇 1.' : index === 1 ? '🥈 2.' : index === 2 ? '🥉 3.' : `${index + 1}.`}
                            </td>
                            <td className="py-3 px-3.5">
                              <span className={`h-8 w-8 rounded-full inline-flex items-center justify-center font-bold text-sm border shadow-2xs ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}>
                                {letter}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-right font-serif font-bold text-sage-800 text-base">
                              {log.page_count} sayfa
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 2. HAFTALIK ÖZET */}
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          {!isUnlocked ? (
            <div className="text-center py-12 px-4 border border-dashed border-amber-300 bg-[#FAF8F5] rounded-2xl space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold font-serif text-stone-900">Haftalık Sıralama Tablosu Kilitlidir</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Haftalık okuma özeti ve sıralaması veri girişleri tamamlandıktan sonra her gece <span className="text-amber-800 font-semibold">23:30 - 00:00</span> saatleri arasında erişime açılacaktır.
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 font-mono shadow-2xs">
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                <span>Açılış Saati: 23:30</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>Bu Haftanın En Çok Okuyanları</span>
                <span className="font-semibold text-amber-800">
                  {weeklyLeaderboard.length} Aktif Okuyucu
                </span>
              </div>

              {weeklyLeaderboard.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-200 bg-[#FAF8F5] rounded-2xl">
                  <p className="text-sm font-medium text-stone-600">Bu hafta henüz okuma verisi yok.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200/80">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50/80">
                      <tr className="border-b border-stone-200 text-xs text-stone-600 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-3.5">Derece</th>
                        <th className="py-3 px-3.5">Okuyucu Kodu</th>
                        <th className="py-3 px-3.5 text-center">Aktif Gün</th>
                        <th className="py-3 px-3.5 text-right">Haftalık Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {weeklyLeaderboard.map((item, index) => {
                        const letter = uniqueLetterMap[item.userId] || 'A';
                        const badgeStyle = getBadgeStyleForNickname(letter);

                        return (
                          <tr key={item.userId} className="hover:bg-stone-50/80 transition">
                            <td className="py-3 px-3.5 font-semibold text-xs">
                              {index === 0 ? (
                                <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">🥇 1. Sıra</span>
                              ) : index === 1 ? (
                                <span className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 font-bold">🥈 2. Sıra</span>
                              ) : index === 2 ? (
                                <span className="px-2 py-0.5 rounded-lg bg-amber-100/50 text-amber-900 border border-amber-200 font-bold">🥉 3. Sıra</span>
                              ) : (
                                <span className="text-stone-500">{index + 1}.</span>
                              )}
                            </td>
                            <td className="py-3 px-3.5">
                              <span className={`h-8 w-8 rounded-full inline-flex items-center justify-center font-bold text-sm border shadow-2xs ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}>
                                {letter}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-center text-xs text-stone-600">
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold border border-stone-200/60">
                                {item.daysActive} gün
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-right font-serif font-bold text-stone-900 text-base">
                              {item.totalPages.toLocaleString('tr-TR')} sayfa
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 3. AYLIK ÖZET */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {!isUnlocked ? (
            <div className="text-center py-12 px-4 border border-dashed border-amber-300 bg-[#FAF8F5] rounded-2xl space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto shadow-2xs">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold font-serif text-stone-900">Aylık Sıralama Tablosu Kilitlidir</h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                Aylık okuma özeti ve sıralaması veri girişleri tamamlandıktan sonra her gece <span className="text-amber-800 font-semibold">23:30 - 00:00</span> saatleri arasında erişime açılacaktır.
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-700 font-mono shadow-2xs">
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                <span>Açılış Saati: 23:30</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>Bu Ayın Genel Okuma Sıralaması</span>
                <span className="font-semibold text-sky-800">
                  {monthlyLeaderboard.length} Aktif Okuyucu
                </span>
              </div>

              {monthlyLeaderboard.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-stone-200 bg-[#FAF8F5] rounded-2xl">
                  <p className="text-sm font-medium text-stone-600">Bu ay henüz okuma verisi yok.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200/80">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50/80">
                      <tr className="border-b border-stone-200 text-xs text-stone-600 uppercase tracking-wider font-semibold">
                        <th className="py-3 px-3.5">Sıra</th>
                        <th className="py-3 px-3.5">Okuyucu Kodu</th>
                        <th className="py-3 px-3.5 text-center">Okuma Gün Sayısı</th>
                        <th className="py-3 px-3.5 text-right">Aylık Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {monthlyLeaderboard.map((item, index) => {
                        const letter = uniqueLetterMap[item.userId] || 'A';
                        const badgeStyle = getBadgeStyleForNickname(letter);

                        return (
                          <tr key={item.userId} className="hover:bg-stone-50/80 transition">
                            <td className="py-3 px-3.5 font-semibold text-xs text-stone-600">
                              {index + 1}.
                            </td>
                            <td className="py-3 px-3.5">
                              <span className={`h-8 w-8 rounded-full inline-flex items-center justify-center font-bold text-sm border shadow-2xs ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}>
                                {letter}
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-center text-xs text-stone-600">
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold border border-stone-200/60">
                                {item.daysActive} gün
                              </span>
                            </td>
                            <td className="py-3 px-3.5 text-right font-serif font-bold text-stone-900 text-base">
                              {item.totalPages.toLocaleString('tr-TR')} sayfa
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Privacy note bottom bar */}
      <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-sage-700" />
          Kullanıcı isimleri gizlidir. Her okuyucu için %100 eşsiz ve çakışmasız tek bir baş harf gösterilmektedir.
        </span>
      </div>

    </div>
  );
}

import React, { useMemo } from 'react';
import { UserCheck, Flame, BookOpen, Calendar, History, Sparkles } from 'lucide-react';
import { getBadgeStyleForNickname } from '../utils/nicknameGenerator';

export default function PersonalProfile({ userProfile, logs, onOpenAuth }) {
  if (!userProfile) {
    return (
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 text-center shadow-xl">
        <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
          <UserCheck className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-white">Kişisel İstatistiklerinizi Görün</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
          Giriş yaparak veya kayıt olarak kendi okuma serinizi (streak), toplam sayfanızı ve kişisel geçmişinizi takip edin.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/25 inline-flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Anonim Kimliğinle Katıl / Giriş Yap
        </button>
      </div>
    );
  }

  // Filter logs for current user
  const userLogs = useMemo(() => {
    return logs
      .filter((l) => l.user_id === userProfile.id)
      .sort((a, b) => new Date(b.log_date) - new Date(a.log_date));
  }, [logs, userProfile.id]);

  // Calculate total pages
  const totalUserPages = useMemo(() => {
    return userLogs.reduce((acc, curr) => acc + curr.page_count, 0);
  }, [userLogs]);

  // Calculate Streak (Consecutive days reading)
  const currentStreak = useMemo(() => {
    if (userLogs.length === 0) return 0;
    
    const datesSet = new Set(userLogs.map((l) => l.log_date));
    let streak = 0;
    let curr = new Date();

    // Check today or yesterday as start
    let todayStr = curr.toISOString().split('T')[0];
    if (!datesSet.has(todayStr)) {
      curr.setDate(curr.getDate() - 1);
      let yestStr = curr.toISOString().split('T')[0];
      if (!datesSet.has(yestStr)) return 0;
    }

    while (true) {
      let dateStr = curr.toISOString().split('T')[0];
      if (datesSet.has(dateStr)) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [userLogs]);

  const badgeStyle = getBadgeStyleForNickname(userProfile.color_nickname);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
      
      {/* Profile Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold border border-slate-700" style={{ backgroundColor: userProfile.badge_color || badgeStyle.hex }}>
            📖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-base font-bold ${badgeStyle.text}`}>
                {userProfile.color_nickname}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
                Profiliniz
              </span>
            </div>
            <p className="text-xs text-slate-400">Gizli E-posta: ••••••••••••</p>
          </div>
        </div>

        {/* Personal Quick Stats Cards */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5">
            <Flame className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-[10px] text-amber-300 font-semibold uppercase">Okuma Serisi</p>
              <p className="text-base font-extrabold text-amber-400">{currentStreak} Gün Aralıksız</p>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-[10px] text-emerald-300 font-semibold uppercase">Toplam Sayfa</p>
              <p className="text-base font-extrabold text-emerald-400">{totalUserPages.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal History Table */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-blue-400" />
          Kişisel Okuma Geçmişiniz
        </h4>

        {userLogs.length === 0 ? (
          <p className="text-xs text-slate-500">Henüz hiç okuma kaydınız yok.</p>
        ) : (
          <div className="overflow-x-auto max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 uppercase">
                <tr>
                  <th className="py-2 px-3">Tarih</th>
                  <th className="py-2 px-3">Okunan Eser</th>
                  <th className="py-2 px-3 text-right">Sayfa Sayısı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {userLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-medium flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      {log.log_date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {log.book_title || 'Genel / Risale-i Nur'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                      {log.page_count} sayfa
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

import React, { useMemo } from 'react';
import { UserCheck, Flame, BookOpen, Calendar, History, Sparkles } from 'lucide-react';
import { getBadgeStyleForNickname } from '../utils/nicknameGenerator';

export default function PersonalProfile({ userProfile, logs, onOpenAuth }) {
  if (!userProfile) {
    return (
      <div className="paper-card rounded-3xl p-8 border border-stone-200/80 text-center shadow-sm">
        <div className="inline-flex p-3.5 rounded-2xl bg-amber-50 text-amber-800 mb-3 border border-amber-200 shadow-2xs">
          <UserCheck className="h-7 w-7 text-amber-700" />
        </div>
        <h3 className="text-lg font-bold font-serif text-stone-900">Kişisel İstatistiklerinizi Görün</h3>
        <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 mb-5 leading-relaxed">
          Giriş yaparak veya kayıt olarak kendi okuma serinizi (streak), toplam sayfanızı ve kişisel geçmişinizi takip edin.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 rounded-xl bg-sage-700 hover:bg-sage-800 text-white font-semibold text-sm transition shadow-sm inline-flex items-center gap-2"
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
    <div className="paper-card rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
      
      {/* Profile Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold border border-stone-300 shadow-2xs" style={{ backgroundColor: userProfile.badge_color || badgeStyle.hex }}>
            📖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-base font-bold ${badgeStyle.text}`}>
                {userProfile.color_nickname}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sage-50 text-sage-800 text-[10px] font-semibold border border-sage-200">
                Profiliniz
              </span>
            </div>
            <p className="text-xs text-stone-500">Gizli E-posta: ••••••••••••</p>
          </div>
        </div>

        {/* Personal Quick Stats Cards */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center gap-2.5 shadow-2xs">
            <Flame className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-[10px] text-amber-800 font-semibold uppercase">Okuma Serisi</p>
              <p className="text-base font-extrabold font-serif text-amber-950">{currentStreak} Gün Aralıksız</p>
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-sage-50 border border-sage-200/90 flex items-center gap-2.5 shadow-2xs">
            <BookOpen className="h-5 w-5 text-sage-700" />
            <div>
              <p className="text-[10px] text-sage-800 font-semibold uppercase">Toplam Sayfa</p>
              <p className="text-base font-extrabold font-serif text-sage-950">{totalUserPages.toLocaleString('tr-TR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal History Table */}
      <div>
        <h4 className="text-sm font-bold font-serif text-stone-900 mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-sky-700" />
          Kişisel Okuma Geçmişiniz
        </h4>

        {userLogs.length === 0 ? (
          <p className="text-xs text-stone-500">Henüz hiç okuma kaydınız yok.</p>
        ) : (
          <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-xl border border-stone-200/80">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3.5">Tarih</th>
                  <th className="py-2.5 px-3.5 text-right">Sayfa Sayısı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800 bg-white">
                {userLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-2.5 px-3.5 font-medium flex items-center gap-1.5 text-stone-700">
                      <Calendar className="h-3.5 w-3.5 text-stone-400" />
                      {log.log_date}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-serif font-bold text-sage-800 text-sm">
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

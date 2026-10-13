import React, { useMemo } from 'react';
import { 
  Trophy, 
  Sparkles, 
  BookOpenCheck, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Layers, 
  Dices,
  Lock,
  LogIn,
  ChevronRight,
  BookmarkCheck
} from 'lucide-react';
import { calculatePersonalHatimStats, getJuzInfo } from '../../utils/quranData';
import { getBadgeStyleForNickname } from '../../utils/nicknameGenerator';

export default function PersonalJuzTracker({
  userProfile,
  personalHistory = [],
  activeRoundAssignments = [],
  onOpenAuth,
  onRequestSpecificJuz
}) {
  const badgeStyle = userProfile ? getBadgeStyleForNickname(userProfile.color_nickname) : null;

  // Extract all juz numbers read by this user
  const readJuzNumbers = useMemo(() => {
    return personalHistory.map((item) => item.juzNumber);
  }, [personalHistory]);

  // Frequency of each juz number read
  const juzReadCounts = useMemo(() => {
    const counts = {};
    readJuzNumbers.forEach((num) => {
      counts[num] = (counts[num] || 0) + 1;
    });
    return counts;
  }, [readJuzNumbers]);

  // Calculate detailed stats and Hatim Level
  const stats = useMemo(() => {
    return calculatePersonalHatimStats(readJuzNumbers);
  }, [readJuzNumbers]);

  // Find missing numbers that are available in current active round right now
  const availableMissingInActiveRound = useMemo(() => {
    const availableNumbers = new Set(
      activeRoundAssignments
        .filter((a) => a.status === 'available')
        .map((a) => a.juz_number)
    );
    return stats.missingJuzNumbers.filter((num) => availableNumbers.has(num));
  }, [activeRoundAssignments, stats.missingJuzNumbers]);

  if (!userProfile) {
    return (
      <div className="rounded-3xl border border-stone-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-6 sm:p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <BookOpenCheck className="h-7 w-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-white">
            Kişisel Cüz & Hatim Takibinizi Kaydedin
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400">
            Anonim renk takma adınızla giriş yaptığınızda okuduğunuz tüm cüzler profilinize işlenir, bireysel hatim seviyeniz ve eksik cüzleriniz otomatik hesaplanır.
          </p>
        </div>
        <div>
          <button
            type="button"
            onClick={onOpenAuth}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-sage-700 hover:bg-sage-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-2xs transition"
          >
            <LogIn className="h-4 w-4" />
            <span>Giriş Yap veya Kayıt Ol</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Personal Level Overview */}
      <div className="rounded-3xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* User badge + Level Title */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs ${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text}`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: badgeStyle.hex }} />
                <span>{userProfile.color_nickname}</span>
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shadow-2xs ${stats.levelColor}`}>
                <Trophy className="h-3.5 w-3.5" />
                <span>{stats.levelTitle}</span>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-white">
              Bireysel Hatim Yolculuğunuz
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400">
              {stats.levelDescription}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            <div className="p-3 sm:p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200/70 dark:border-slate-700/60 text-center">
              <div className="text-lg sm:text-2xl font-bold font-serif text-stone-900 dark:text-white">
                {stats.totalCount}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-stone-500 dark:text-slate-400">
                Toplam Cüz
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-center">
              <div className="text-lg sm:text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-300">
                {stats.uniqueCount}/30
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-emerald-800 dark:text-emerald-400">
                Farklı Cüz
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-center">
              <div className="text-lg sm:text-2xl font-bold font-serif text-amber-700 dark:text-amber-300">
                {stats.fullHatimsCount}
              </div>
              <div className="text-[10px] sm:text-xs font-medium text-amber-800 dark:text-amber-400">
                Tam Hatim
              </div>
            </div>
          </div>

        </div>

        {/* Progress Bar towards 30 Unique Juz */}
        <div className="mt-6 pt-5 border-t border-stone-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              1 Tam Hatim Hedefi (30/30 Cüz)
            </span>
            <span className="text-stone-900 dark:text-white font-mono">
              %{stats.uniquePercent} ({stats.uniqueCount} / 30)
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-stone-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-stone-200 dark:border-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${stats.uniquePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-400 pt-1">
            <span>
              {stats.missingJuzNumbers.length === 0
                ? '🌟 Tebrikler! 30 cüzün tamamını okudunuz, tam bir hatim tamamlandı!'
                : `Tam bir hatim için ${stats.missingJuzNumbers.length} farklı cüz kaldı.`}
            </span>
            {availableMissingInActiveRound.length > 0 && (
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                Bu hatimde {availableMissingInActiveRound.length} eksik cüzünüz boşta!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 30'luk Bireysel Cüz Matrisi (1 - 30 Grid) */}
      <div className="rounded-3xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              30 Cüz Hatim Haritanız
            </h3>
            <p className="text-xs text-stone-500 dark:text-slate-400">
              Hangi cüzleri okuduğunuzu buradan görebilir, eksiklerinizi tamamlayabilirsiniz.
            </p>
          </div>

          {/* Quick Filter / Missing Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" />
              <span>Okundu ({stats.uniqueCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-md bg-stone-200 dark:bg-slate-700 inline-block" />
              <span>Henüz Okunmadı ({stats.missingJuzNumbers.length})</span>
            </div>
          </div>
        </div>

        {/* 30 Interactive Mini Cards */}
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 sm:gap-2.5 pt-2">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
            const isRead = stats.uniqueNumbers.includes(juzNum);
            const count = juzReadCounts[juzNum] || 0;
            const juzInfo = getJuzInfo(juzNum);
            const isAvailableNow = activeRoundAssignments.some(
              (a) => a.juz_number === juzNum && a.status === 'available'
            );

            return (
              <button
                key={juzNum}
                type="button"
                onClick={() => {
                  if (!isRead && isAvailableNow && onRequestSpecificJuz) {
                    onRequestSpecificJuz(juzNum);
                  }
                }}
                className={`relative group rounded-xl p-2 sm:p-2.5 flex flex-col items-center justify-center transition-all text-center border ${
                  isRead
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 shadow-2xs'
                    : isAvailableNow
                    ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700/70 hover:border-amber-500 hover:scale-105 cursor-pointer text-stone-700 dark:text-slate-300'
                    : 'bg-stone-50 dark:bg-slate-800/40 border-stone-200 dark:border-slate-800 text-stone-400 dark:text-slate-500 cursor-default'
                }`}
                title={`${juzInfo.name} (${juzInfo.pageRange}) ${
                  isRead ? `- ${count} kez okundu` : isAvailableNow ? '- Şu anki hatimde boşta (Tıkla ve Al)' : '- Henüz okunmadı'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold font-serif leading-none">
                  {juzNum}
                </span>

                <span className="text-[9px] mt-1 font-mono leading-none">
                  {isRead ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                      {count > 1 ? `x${count}` : '✓'}
                    </span>
                  ) : isAvailableNow ? (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold text-[8px]">
                      Al
                    </span>
                  ) : (
                    <span className="text-stone-300 dark:text-slate-600">•</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kişisel Okuma Geçmişi (Tabular Logs) */}
      <div className="rounded-3xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-white flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              Okuma Geçmişiniz
            </h3>
            <p className="text-xs text-stone-500 dark:text-slate-400">
              Ortak hatimlerde okuyup tamamladığınız tüm cüz kayıtları.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300">
            {personalHistory.length} Kayıt
          </span>
        </div>

        {personalHistory.length === 0 ? (
          <div className="py-8 text-center text-xs sm:text-sm text-stone-500 dark:text-slate-400">
            Henüz tamamlanmış bir cüz kaydınız bulunmuyor. Panodan bir cüz alıp okumaya başlayabilirsiniz.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-slate-800 text-stone-400 dark:text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Cüz</th>
                  <th className="py-2.5 px-3">Sayfa & Sure</th>
                  <th className="py-2.5 px-3">Hatim</th>
                  <th className="py-2.5 px-3 text-right">Tarih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60 font-medium">
                {personalHistory.map((item) => {
                  const info = getJuzInfo(item.juzNumber);
                  const dateStr = item.completedAt
                    ? new Date(item.completedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '—';

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 font-bold font-serif text-stone-900 dark:text-white">
                          <span className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-xs">
                            {item.juzNumber}
                          </span>
                          <span>{item.juzNumber}. Cüz</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-600 dark:text-slate-400 text-xs">
                        {info.pageRange ? `s. ${info.pageRange} (${info.surahRange})` : '—'}
                      </td>
                      <td className="py-3 px-3 text-stone-700 dark:text-slate-300">
                        {item.roundTitle || `${item.roundNumber}. Hatm-i Şerif`}
                      </td>
                      <td className="py-3 px-3 text-right text-stone-500 dark:text-slate-400 font-mono text-xs">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

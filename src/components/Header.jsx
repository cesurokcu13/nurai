import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Sparkles, LogIn, LogOut, ShieldCheck, Clock, Lock, Sun, Moon, ClipboardList, Crown } from 'lucide-react';
import { getBadgeStyleForNickname } from '../utils/nicknameGenerator';

export default function Header({ 
  userProfile, 
  onOpenAuth, 
  onSignOut, 
  stats, 
  theme = 'light', 
  onToggleTheme,
  activeTab = 'reading',
  onSelectTab
}) {
  const badgeStyle = userProfile ? getBadgeStyleForNickname(userProfile.color_nickname) : null;
  const isAdmin = userProfile?.role === 'admin';

  // Countdown timer for 23:30 Deadline
  const [countdownText, setCountdownText] = useState('00:00:00');
  const [isPastDeadline, setIsPastDeadline] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const deadline = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30, 0);
      const diffMs = deadline.getTime() - now.getTime();

      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        const pad = (n) => n.toString().padStart(2, '0');
        setCountdownText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        setIsPastDeadline(false);
      } else {
        setCountdownText('00:00:00');
        setIsPastDeadline(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Sticky Top Navbar */}
      <header className="relative border-b border-stone-200/80 dark:border-slate-800 bg-[#FAF8F5]/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
        {/* Top ambient line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-stone-300 via-sage-600 to-amber-500 dark:from-emerald-500 dark:via-teal-400 dark:to-cyan-500"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
            
            {/* Logo, Title & Main Tab Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-sage-700 dark:bg-gradient-to-tr dark:from-emerald-600 dark:to-teal-500 flex items-center justify-center shadow-sm text-white shrink-0">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-white tracking-tight">
                      Risale-i Nur Okuma Halkası
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-50 dark:bg-emerald-500/10 text-sage-800 dark:text-emerald-400 border border-sage-200 dark:border-emerald-500/20">
                      <ShieldCheck className="h-3 w-3" /> Anonim
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-slate-400">
                    Birlikte Okuyoruz — Günlük Takip & Ortak Vazifeler
                  </p>
                </div>
              </div>

              {/* Seçenek A: Tab Navigation Switcher */}
              <nav className="flex items-center p-1 rounded-2xl bg-stone-200/60 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 shadow-2xs self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => onSelectTab?.('reading')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'reading'
                      ? 'bg-white dark:bg-slate-900 text-stone-900 dark:text-white shadow-2xs'
                      : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="h-4 w-4 text-sage-700 dark:text-emerald-400" />
                  <span>Okuma Takibi</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab?.('tasks')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'tasks'
                      ? 'bg-white dark:bg-slate-900 text-stone-900 dark:text-white shadow-2xs'
                      : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <ClipboardList className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Görev Panosu</span>
                </button>
              </nav>
            </div>

            {/* Right Header Controls, Theme Toggle & Live Countdown Pill */}
            <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5 sm:gap-3">
              
              {/* Live 23:30 Countdown Pill */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs ${
                isPastDeadline
                  ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-400'
                  : 'bg-amber-50/90 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-400'
              }`}>
                <Clock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                <span className="hidden sm:inline">Giriş Kapanışı 23:30</span>
                <span className="font-mono text-stone-900 dark:text-white font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-200 dark:border-slate-700 shadow-2xs">
                  {isPastDeadline ? 'Kapadı' : countdownText}
                </span>
              </div>

              {/* Day / Night (Dark/Light) Mode Toggle Button */}
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-xl border border-stone-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-700 dark:text-amber-400 hover:bg-stone-100 dark:hover:bg-slate-700 transition shadow-2xs flex items-center justify-center active:scale-95"
                title={theme === 'dark' ? 'Gündüz Moduna Geç (Açık Tema)' : 'Gece Moduna Geç (Koyu Tema)'}
                aria-label="Gece/Gündüz Modu Değiştir"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4.5 w-4.5 text-amber-400 transition-transform" />
                ) : (
                  <Moon className="h-4.5 w-4.5 text-stone-700 transition-transform" />
                )}
              </button>

              {/* Auth Status */}
              {userProfile ? (
                <div className="flex items-center gap-2">
                  {/* Admin Badge */}
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 shadow-2xs" title="Yönetici Yetkisi Aktif">
                      <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Admin
                    </span>
                  )}

                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-2xs ${badgeStyle.bg} ${badgeStyle.border}`}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: userProfile.badge_color || badgeStyle.hex }}></span>
                    <span className={`text-xs font-semibold ${badgeStyle.text}`}>
                      {userProfile.color_nickname}
                    </span>
                  </div>
                  <button
                    onClick={onSignOut}
                    className="p-2 text-stone-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-slate-800 rounded-xl transition"
                    title="Çıkış Yap"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sage-700 dark:bg-emerald-600 hover:bg-sage-800 dark:hover:bg-emerald-500 text-white font-medium text-sm transition shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  Katıl / Giriş Yap
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Live Summary Stats Cards - Only shown on Reading Tracker tab */}
      {activeTab === 'reading' && (
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="paper-card dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition hover:border-stone-300 dark:hover:border-slate-700">
            <div className="p-3 rounded-xl bg-sage-50 dark:bg-emerald-500/10 text-sage-700 dark:text-emerald-400 border border-sage-200/80 dark:border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Bugün Okunan</p>
              <div className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-white mt-0.5">
                {isPastDeadline ? (
                  `${stats.todayPages.toLocaleString('tr-TR')} Sayfa`
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 text-sm font-sans font-semibold">
                    <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" /> 23:30'da Açılacak
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="paper-card dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition hover:border-stone-300 dark:hover:border-slate-700">
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-blue-500/10 text-sky-700 dark:text-blue-400 border border-sky-200/80 dark:border-blue-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Bugünkü Okuyucu</p>
              <div className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-white mt-0.5">
                {isPastDeadline ? (
                  `${stats.todayReadersCount} Kişi`
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 text-sm font-sans font-semibold">
                    <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" /> 23:30'da Açılacak
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="paper-card dark:bg-slate-900 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition hover:border-stone-300 dark:hover:border-slate-700">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Toplam Okunan</p>
              <div className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-white mt-0.5">
                {isPastDeadline ? (
                  `${stats.totalAllTimePages.toLocaleString('tr-TR')} Sayfa`
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-400 text-sm font-sans font-semibold">
                    <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" /> 23:30'da Açılacak
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
}

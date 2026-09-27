import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Sparkles, LogIn, LogOut, ShieldCheck, Clock, Lock } from 'lucide-react';
import { getBadgeStyleForNickname } from '../utils/nicknameGenerator';

export default function Header({ userProfile, onOpenAuth, onSignOut, stats }) {
  const badgeStyle = userProfile ? getBadgeStyleForNickname(userProfile.color_nickname) : null;

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
      <header className="relative border-b border-stone-200/80 bg-[#FAF8F5]/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
        {/* Top ambient line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-stone-300 via-sage-600 to-amber-500"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-sage-700 flex items-center justify-center shadow-sm text-white shrink-0">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
                    Risale-i Nur Okuma Halkası
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-50 text-sage-800 border border-sage-200">
                    <ShieldCheck className="h-3 w-3" /> Anonim
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-500">
                  Birlikte Okuyoruz — Günlük, Haftalık ve Aylık Takip
                </p>
              </div>
            </div>

            {/* Right Header Controls & Live Countdown Pill */}
            <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5 sm:gap-3">
              
              {/* Live 23:30 Countdown Pill */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs ${
                isPastDeadline
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-amber-50/90 border-amber-200 text-amber-900'
              }`}>
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                <span>Giriş Kapanışı 23:30</span>
                <span className="font-mono text-stone-900 font-bold bg-white px-2 py-0.5 rounded border border-amber-200 shadow-2xs">
                  {isPastDeadline ? 'Kapadı' : countdownText}
                </span>
              </div>

              {/* Auth Status */}
              {userProfile ? (
                <div className="flex items-center gap-2.5">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-2xs ${badgeStyle.bg} ${badgeStyle.border}`}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: userProfile.badge_color || badgeStyle.hex }}></span>
                    <span className={`text-xs font-semibold ${badgeStyle.text}`}>
                      {userProfile.color_nickname}
                    </span>
                  </div>
                  <button
                    onClick={onSignOut}
                    className="p-2 text-stone-500 hover:text-rose-600 hover:bg-stone-100 rounded-xl transition"
                    title="Çıkış Yap"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sage-700 hover:bg-sage-800 text-white font-medium text-sm transition shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  Katıl / Giriş Yap
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Live Summary Stats Cards - Scrolls naturally with content */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="paper-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition hover:border-stone-300">
            <div className="p-3 rounded-xl bg-sage-50 text-sage-700 border border-sage-200/80">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Bugün Okunan</p>
              <div className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-0.5">
                {isPastDeadline ? (
                  `${stats.todayPages.toLocaleString('tr-TR')} Sayfa`
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-800 text-sm font-sans font-semibold">
                    <Lock className="h-4 w-4 text-amber-600" /> 23:30'da Açılacak
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="paper-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition hover:border-stone-300">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/80">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Bugünkü Okuyucu</p>
              <div className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-0.5">
                {isPastDeadline ? (
                  `${stats.todayReadersCount} Kişi`
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-800 text-sm font-sans font-semibold">
                    <Lock className="h-4 w-4 text-amber-600" /> 23:30'da Açılacak
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="paper-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition hover:border-stone-300">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider font-semibold">Toplam Okunan</p>
              <div className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-0.5">
                {isPastDeadline ? (
                  `${stats.totalAllTimePages.toLocaleString('tr-TR')} Sayfa`
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-800 text-sm font-sans font-semibold">
                    <Lock className="h-4 w-4 text-amber-600" /> 23:30'da Açılacak
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

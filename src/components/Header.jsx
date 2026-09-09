import React from 'react';
import { BookOpen, Users, Sparkles, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { getBadgeStyleForNickname } from '../utils/nicknameGenerator';

export default function Header({ userProfile, onOpenAuth, onSignOut, stats }) {
  const badgeStyle = userProfile ? getBadgeStyleForNickname(userProfile.color_nickname) : null;

  return (
    <header className="relative border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      {/* Top ambient glow */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Risale-i Nur Okuma Halkası
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" /> Anonim
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Birlikte Okuyoruz — Günlük, Haftalık ve Aylık Takip
              </p>
            </div>
          </div>

          {/* User Auth Status / Anonymous Identity */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            {userProfile ? (
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${badgeStyle.bg} ${badgeStyle.border}`}>
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: userProfile.badge_color || badgeStyle.hex }}></span>
                  <span className={`text-sm font-semibold ${badgeStyle.text}`}>
                    {userProfile.color_nickname}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
                  title="Çıkış Yap"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-600/25"
              >
                <LogIn className="h-4 w-4" />
                Katıl / Giriş Yap
              </button>
            )}
          </div>
        </div>

        {/* Global Live Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Bugün Okunan</p>
              <p className="text-xl font-extrabold text-white">{stats.todayPages.toLocaleString('tr-TR')} Sayfa</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Bugünkü Okuyucu</p>
              <p className="text-xl font-extrabold text-white">{stats.todayReadersCount} Kişi</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Toplam Okunan</p>
              <p className="text-xl font-extrabold text-white">{stats.totalAllTimePages.toLocaleString('tr-TR')} Sayfa</p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { BookPlus, Calendar, CheckCircle2, Lock, Sparkles, Clock, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getBadgeStyleForNickname } from '../utils/nicknameGenerator';

export default function DailyInputForm({ userProfile, onSaveLog, logs, onOpenAuth }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateStr, setDateStr] = useState(todayStr);
  const [pageCount, setPageCount] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Live Timer State for 23:30 Deadline
  const [timeRemaining, setTimeRemaining] = useState({
    formatted: '00:00:00',
    isPastDeadline: false,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Countdown Interval Effect (Updates every second)
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
        setTimeRemaining({
          formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
          isPastDeadline: false,
          hours,
          minutes,
          seconds
        });
      } else {
        setTimeRemaining({
          formatted: '00:00:00',
          isPastDeadline: true,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-fill existing entry if user already logged for selected date
  useEffect(() => {
    if (userProfile && logs) {
      const userTodayLog = logs.find(
        (l) => l.user_id === userProfile.id && l.log_date === dateStr
      );
      if (userTodayLog) {
        setPageCount(userTodayLog.page_count.toString());
      } else {
        setPageCount('');
      }
    }
  }, [userProfile, logs, dateStr]);

  const isTodaySelected = dateStr === todayStr;
  const isInputDisabled = isTodaySelected && timeRemaining.isPastDeadline;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    if (isInputDisabled) {
      alert('Bugün için veri girişi saat 23:30 itibarıyla kapanmıştır.');
      return;
    }

    if (!pageCount || parseInt(pageCount, 10) <= 0) return;

    try {
      setSaving(true);
      await onSaveLog({
        dateStr,
        pageCount: parseInt(pageCount, 10)
      });

      setSuccessMsg('Okumanız başarıyla kaydedildi! Maşallah 🌟');
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Kaydedilirken hata oluştu: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const badgeStyle = userProfile ? getBadgeStyleForNickname(userProfile.color_nickname) : null;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-xl space-y-6">
      
      {/* Background Glow */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BookPlus className="h-5 w-5 text-emerald-400" />
              Bugünkü Okumanı Kaydet
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Okuduğun sayfa sayısını girerek grup takibine katkıda bulun.
          </p>
        </div>

        {userProfile ? (
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${badgeStyle.bg} ${badgeStyle.border} self-start md:self-auto`}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: userProfile.badge_color || badgeStyle.hex }}></span>
            <span className={`text-xs font-semibold ${badgeStyle.text}`}>
              Aktif Profil: {userProfile.color_nickname}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium border border-amber-500/20 self-start md:self-auto transition"
          >
            <Lock className="h-3.5 w-3.5" />
            Kayıt Girmek İçin Giriş Yapın
          </button>
        )}
      </div>

      {/* ⏳ LIVE COUNTDOWN TIMER CARD (23:30 DEADLINE) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        timeRemaining.isPastDeadline
          ? 'bg-red-500/10 border-red-500/30 text-red-300'
          : 'bg-slate-900/90 border-amber-500/30 text-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              timeRemaining.isPastDeadline
                ? 'bg-red-500/20 text-red-400'
                : 'bg-amber-500/10 text-amber-400'
            }`}>
              {timeRemaining.isPastDeadline ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5 animate-pulse" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Son Veri Girişi Saati:</span>
                <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  23:30
                </span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {timeRemaining.isPastDeadline
                  ? 'Bugünkü okuma girişi 23:30 itibarıyla tamamlanmıştır. Yeni kayıtlar 00:00 itibarıyla başlayacaktır.'
                  : 'Günün verilerini kaydetmek için kalan süreniz:'}
              </p>
            </div>
          </div>

          {/* Countdown Clock Display */}
          {!timeRemaining.isPastDeadline && (
            <div className="flex items-center gap-1.5 bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/30 self-stretch sm:self-auto justify-center">
              <span className="font-mono text-lg font-extrabold text-amber-400 tracking-wider">
                {timeRemaining.formatted}
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase ml-1">Kalan Süre</span>
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Date Selector */}
        <div className="sm:col-span-5">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Tarih
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="date"
              required
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Page Count */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Okunan Sayfa Sayısı
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="1000"
              required
              disabled={isInputDisabled}
              placeholder={isInputDisabled ? 'Kapanmıştır' : 'Örn: 20'}
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3.5 top-3 text-xs text-slate-500 font-medium">sayfa</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sm:col-span-3 flex items-end">
          <button
            type="submit"
            disabled={saving || isInputDisabled}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="animate-spin">⏳</span>
            ) : isInputDisabled ? (
              <>
                <Lock className="h-4 w-4" />
                Giriş Kapanmıştır (23:30)
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {userProfile ? 'Kaydet / Güncelle' : 'Giriş Yap ve Kaydet'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

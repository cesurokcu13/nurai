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

  // Countdown Interval Effect (Target: 23:30:00)
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
    <div className="paper-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-stone-200/80 shadow-sm space-y-6">
      
      {/* Background Soft Accent */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-100/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Info Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-sage-50 text-sage-700 border border-sage-200/80">
                <BookPlus className="h-4.5 w-4.5" />
              </span>
              Bugünkü Okumanı Kaydet
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Okuduğun sayfa sayısını girerek halka takibine katkıda bulun.
          </p>
        </div>

        {userProfile ? (
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${badgeStyle.bg} ${badgeStyle.border} self-start md:self-auto shadow-2xs`}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: userProfile.badge_color || badgeStyle.hex }}></span>
            <span className={`text-xs font-semibold ${badgeStyle.text}`}>
              Aktif Profil: {userProfile.color_nickname}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium border border-amber-200/80 self-start md:self-auto transition shadow-2xs"
          >
            <Lock className="h-3.5 w-3.5 text-amber-700" />
            Kayıt Girmek İçin Giriş Yapın
          </button>
        )}
      </div>

      {/* ⏳ LIVE COUNTDOWN TIMER CARD (23:30 DEADLINE) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        timeRemaining.isPastDeadline
          ? 'bg-rose-50 border-rose-200 text-rose-900'
          : 'bg-[#FAF8F5] border-amber-200/80 text-stone-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              timeRemaining.isPastDeadline
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100/80 text-amber-800'
            }`}>
              {timeRemaining.isPastDeadline ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5 animate-pulse text-amber-700" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <span>Son Veri Girişi Saati:</span>
                <span className="text-amber-900 font-bold bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
                  23:30 ⏳
                </span>
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {timeRemaining.isPastDeadline
                  ? 'Bugünkü okuma girişi 23:30 itibarıyla tamamlanmıştır. Yeni kayıtlar 00:00 itibarıyla başlayacaktır.'
                  : 'Bugünlük veri girişi 23:30\'a kadar yapılabilir:'}
              </p>
            </div>
          </div>

          {/* Countdown Clock Display */}
          {!timeRemaining.isPastDeadline && (
            <div className="flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-xl border border-amber-200 shadow-2xs self-stretch sm:self-auto justify-center">
              <span className="font-mono text-base sm:text-lg font-extrabold text-amber-900 tracking-wider">
                {timeRemaining.formatted}
              </span>
              <span className="text-[10px] text-stone-500 font-semibold uppercase ml-1">Kalan Süre</span>
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-sage-50 border border-sage-200 text-sage-800 text-sm font-semibold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-700" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Date Selector */}
        <div className="sm:col-span-5">
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Tarih
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="date"
              required
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-300 text-stone-900 text-sm focus:outline-none focus:border-sage-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Page Count */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
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
              className="w-full px-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-stone-300 text-stone-900 text-sm font-semibold placeholder-stone-400 focus:outline-none focus:border-sage-600 focus:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3.5 top-3 text-xs text-stone-400 font-medium">sayfa</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sm:col-span-3 flex items-end">
          <button
            type="submit"
            disabled={saving || isInputDisabled}
            className="w-full py-2.5 px-4 rounded-xl bg-sage-700 hover:bg-sage-800 text-white font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

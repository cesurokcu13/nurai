import React, { useState, useEffect } from 'react';
import { BookPlus, Calendar, CheckCircle2, Lock, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getBadgeStyleForNickname } from '../utils/nicknameGenerator';

const RISALE_BOOKS = [
  'Genel / Risale-i Nur',
  'Sözler',
  'Mektubat',
  'Lem\'alar',
  'Şualar',
  'Tarihçe-i Hayat',
  'Asa-yı Musa',
  'Barla Lâhikası',
  'Kastamonu Lâhikası',
  'Emirdağ Lâhikası',
  'Mesnevi-i Nuriye',
  'İşaratü\'l-İ\'caz',
  'Sikke-i Tasdik-i Gaybî'
];

export default function DailyInputForm({ userProfile, onSaveLog, logs, onOpenAuth }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateStr, setDateStr] = useState(todayStr);
  const [pageCount, setPageCount] = useState('');
  const [bookTitle, setBookTitle] = useState(RISALE_BOOKS[0]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-fill existing entry if user already logged for selected date
  useEffect(() => {
    if (userProfile && logs) {
      const userTodayLog = logs.find(
        (l) => l.user_id === userProfile.id && l.log_date === dateStr
      );
      if (userTodayLog) {
        setPageCount(userTodayLog.page_count.toString());
        if (userTodayLog.book_title) setBookTitle(userTodayLog.book_title);
      } else {
        setPageCount('');
      }
    }
  }, [userProfile, logs, dateStr]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    if (!pageCount || parseInt(pageCount, 10) <= 0) return;

    try {
      setSaving(true);
      await onSaveLog({
        dateStr,
        pageCount: parseInt(pageCount, 10),
        bookTitle
      });

      setSuccessMsg('Okumanız başarıyla kaydedildi! Maşallah 🌟');
      
      // Trigger celebrate confetti
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
    <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-xl">
      {/* Subtle background gradient glow */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
        {/* Date Selector */}
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Tarih
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="date"
              required
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Page Count */}
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Okunan Sayfa Sayısı
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="1000"
              required
              placeholder="Örn: 20"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-semibold placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
            <span className="absolute right-3 top-3 text-xs text-slate-500 font-medium">sayfa</span>
          </div>
        </div>

        {/* Optional Book Title */}
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Eser (Opsiyonel)
          </label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
            <select
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500 transition appearance-none cursor-pointer"
            >
              {RISALE_BOOKS.map((b) => (
                <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sm:col-span-3 flex items-end">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <span className="animate-spin">⏳</span>
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

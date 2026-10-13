import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BookOpen, 
  Dices, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Bookmark, 
  Layers, 
  Trophy, 
  RefreshCw, 
  AlertCircle,
  Filter,
  Check,
  ChevronRight,
  UserCheck,
  BookMarked,
  History,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import JuzBox from './JuzBox';
import PersonalJuzTracker from './PersonalJuzTracker';
import { juzService } from '../../lib/juzService';
import { QURAN_JUZ_LIST, getJuzInfo } from '../../utils/quranData';

export default function JuzTracker({ userProfile, onOpenAuth }) {
  const [activeRound, setActiveRound] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [allRounds, setAllRounds] = useState([]);
  const [personalHistory, setPersonalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'available' | 'taken' | 'completed' | 'my'
  const [subView, setSubView] = useState('board'); // 'board' | 'personal' | 'history'

  // Completion Notification / Next Juz Prompt Modal State
  const [completionModal, setCompletionModal] = useState({
    isOpen: false,
    completedJuzNumber: null,
    isHatimCompleted: false,
    roundNumber: 1
  });

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Load All Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [activeData, roundsData] = await Promise.all([
        juzService.fetchActiveRound(userProfile?.id),
        juzService.fetchAllRounds()
      ]);

      if (activeData) {
        setActiveRound(activeData.round);
        setAssignments(activeData.assignments || []);
      }
      setAllRounds(roundsData || []);

      if (userProfile?.id) {
        const history = await juzService.fetchUserPersonalHistory(userProfile.id);
        setPersonalHistory(history || []);
      }
    } catch (err) {
      console.error('Cüz verileri yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Computed Counts for Active Round
  const counts = useMemo(() => {
    let completed = 0;
    let taken = 0;
    let available = 0;
    let myCount = 0;

    assignments.forEach((a) => {
      if (a.status === 'completed') completed++;
      else if (a.status === 'taken') taken++;
      else available++;

      if (userProfile && a.user_id === userProfile.id) {
        myCount++;
      }
    });

    const percent = Math.min(100, Math.round((completed / 30) * 100));

    return {
      completed,
      taken,
      available,
      myCount,
      percent
    };
  }, [assignments, userProfile]);

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (filter === 'available') return a.status === 'available';
      if (filter === 'taken') return a.status === 'taken';
      if (filter === 'completed') return a.status === 'completed';
      if (filter === 'my') return userProfile && a.user_id === userProfile.id;
      return true;
    });
  }, [assignments, filter, userProfile]);

  // Handle Pick / Take Specific Juz
  const handleTakeJuz = async (juzNumber) => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    if (!activeRound) return;

    try {
      setActionLoading(true);
      await juzService.takeJuz({
        roundId: activeRound.id,
        juzNumber,
        userProfile
      });

      showToast(`Tebrikler! ${juzNumber}. Cüz adınıza ayrıldı. İyi okumalar! 🌸`);
      await loadData();
    } catch (err) {
      alert(err.message || 'Cüz alınamadı.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Random Juz Assignment ("sistem rastgele atasın")
  const handleRandomJuz = async () => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    if (!activeRound) return;

    // Check if user already has taken but unread juz in this round
    const existingTaken = assignments.find(
      (a) => a.user_id === userProfile.id && a.status === 'taken'
    );

    if (existingTaken) {
      const confirmExtra = window.confirm(
        `Şu an zaten okumakta olduğunuz ${existingTaken.juz_number}. Cüz bulunuyor. İlave olarak bir cüz daha almak istiyor musunuz?`
      );
      if (!confirmExtra) return;
    }

    try {
      setActionLoading(true);
      const userReadNumbers = personalHistory.map((h) => h.juzNumber);
      const assigned = await juzService.assignRandomJuz({
        roundId: activeRound.id,
        userProfile,
        userPersonalReadNumbers: userReadNumbers
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      showToast(`🎲 Harika! Sistem size ${assigned.juz_number}. Cüzü atadı. Allah kabul etsin!`);
      await loadData();
    } catch (err) {
      alert(err.message || 'Rastgele cüz atanamadı.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Release / Cancel Juz
  const handleReleaseJuz = async (juzNumber) => {
    if (!userProfile) return;
    const confirmRelease = window.confirm(`${juzNumber}. Cüzü bırakmak istediğinize emin misiniz?`);
    if (!confirmRelease) return;

    try {
      setActionLoading(true);
      await juzService.releaseJuz({
        roundId: activeRound.id,
        juzNumber,
        userId: userProfile.id,
        isAdmin: userProfile.role === 'admin'
      });

      showToast(`${juzNumber}. Cüz boşa çıkarıldı.`);
      await loadData();
    } catch (err) {
      alert(err.message || 'Cüz bırakılamadı.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Complete Juz ("okuduktan sonra okuduğunu belirterek kutu yeşil olur")
  const handleCompleteJuz = async (juzNumber) => {
    if (!userProfile) {
      onOpenAuth();
      return;
    }

    try {
      setActionLoading(true);
      const res = await juzService.completeJuz({
        roundId: activeRound.id,
        juzNumber,
        userProfile,
        isAdmin: userProfile.role === 'admin'
      });

      // Confetti celebration!
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.5 }
      });

      if (res.isHatimCompleted) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 }
        });
      }

      // Prompt to take next juz or celebrate
      setCompletionModal({
        isOpen: true,
        completedJuzNumber: juzNumber,
        isHatimCompleted: res.isHatimCompleted,
        roundNumber: res.roundNumber
      });

      await loadData();
    } catch (err) {
      alert(err.message || 'Cüz tamamlanırken bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Start New Round manually
  const handleStartNewRound = async () => {
    try {
      setActionLoading(true);
      await juzService.startNewRound(activeRound?.round_number || 1);
      showToast('🎉 Yeni Hatm-i Şerif döngüsü başlatıldı! Bismillah.');
      setCompletionModal({ isOpen: false, completedJuzNumber: null, isHatimCompleted: false, roundNumber: 1 });
      await loadData();
    } catch (err) {
      alert(err.message || 'Yeni hatim başlatılamadı.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-900 text-white dark:bg-emerald-600 shadow-xl border border-stone-800 text-xs sm:text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Banner / Hatim Statistics Card */}
      <section className="relative overflow-hidden rounded-3xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs">
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Title & Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 shadow-2xs">
                <BookMarked className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                {activeRound?.title || `${activeRound?.round_number || 1}. Ortak Hatm-i Şerif`}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-700">
                <Layers className="h-3 w-3" /> 30 Cüz Takibi
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 dark:text-white tracking-tight">
              Kur'an-ı Kerim Ortak Hatim Halkası
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400 max-w-xl">
              Okumak istediğiniz Cüzü kutucuklardan seçin veya sistem size rastgele bir cüz atasın. Hep birlikte Kur'an-ı Kerimi baştan sona hatmedelim.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            {/* Yeşil: Okunan */}
            <div className="p-3 sm:p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800/40 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-lg sm:text-2xl font-bold font-serif">{counts.completed}</span>
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-emerald-800 dark:text-emerald-400 mt-0.5">
                Okundu (Yeşil)
              </div>
            </div>

            {/* Sarı: Okunuyor */}
            <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-800/40 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-300">
                <Clock className="h-4 w-4" />
                <span className="text-lg sm:text-2xl font-bold font-serif">{counts.taken}</span>
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-amber-800 dark:text-amber-400 mt-0.5">
                Okunuyor (Sarı)
              </div>
            </div>

            {/* Gri: Boşta */}
            <div className="p-3 sm:p-4 rounded-2xl bg-stone-50 dark:bg-slate-800/80 border border-stone-200/90 dark:border-slate-700/60 text-center">
              <div className="flex items-center justify-center gap-1 text-stone-700 dark:text-slate-300">
                <Bookmark className="h-4 w-4" />
                <span className="text-lg sm:text-2xl font-bold font-serif">{counts.available}</span>
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-stone-600 dark:text-slate-400 mt-0.5">
                Alınabilir (Boş)
              </div>
            </div>
          </div>

        </div>

        {/* Global Hatim Progress Bar */}
        <div className="mt-6 pt-5 border-t border-stone-100 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Ortak Hatim İlerlemesi
            </span>
            <span className="text-stone-900 dark:text-white font-mono">
              %{counts.percent} ({counts.completed} / 30 Cüz Okundu)
            </span>
          </div>

          {/* Segmented Bar: Green (Completed), Yellow (Taken), Gray (Available) */}
          <div className="h-3.5 w-full rounded-full bg-stone-100 dark:bg-slate-800 overflow-hidden flex p-0.5 border border-stone-200 dark:border-slate-700">
            <div
              className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
              style={{ width: `${(counts.completed / 30) * 100}%` }}
              title={`Okunan: ${counts.completed} Cüz`}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: `${(counts.taken / 30) * 100}%` }}
              title={`Okunmakta Olan: ${counts.taken} Cüz`}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-400">
            <span>
              {counts.completed === 30
                ? '🎉 Elhamdülillah! Tüm cüzler tamamlandı, hatm-i şerif bitti.'
                : `Hatm-i şerifin tamamlanmasına ${30 - counts.completed} cüz kaldı.`}
            </span>
            <span className="font-medium text-amber-700 dark:text-amber-400">
              {counts.available > 0 ? `${counts.available} cüz yeni okuyucularını bekliyor` : 'Tüm cüzler dağıtıldı'}
            </span>
          </div>
        </div>

      </section>

      {/* Sub Navigation Bar & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-2 rounded-2xl border border-stone-200 dark:border-slate-800 shadow-2xs">
        
        {/* View Switcher: Panoya Bak / Kişisel Takip / Geçmiş */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSubView('board')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              subView === 'board'
                ? 'bg-sage-700 text-white shadow-2xs'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Ortak Hatim Panosu</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('personal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              subView === 'personal'
                ? 'bg-sage-700 text-white shadow-2xs'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>Kişisel Cüz & Hatim Takibim</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('history')}
            className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              subView === 'history'
                ? 'bg-sage-700 text-white shadow-2xs'
                : 'text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-800'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Tüm Hatimler ({allRounds.length})</span>
          </button>
        </div>

        {/* Right CTA: "🎲 Rastgele Cüz Ata" (Primary Feature) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={actionLoading || counts.available === 0}
            onClick={handleRandomJuz}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 ${
              counts.available > 0
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white ring-2 ring-amber-400/40 animate-pulse'
                : 'bg-stone-200 dark:bg-slate-800 text-stone-400 cursor-not-allowed'
            }`}
            title="Sistem boşta olan cüzlerden size rastgele bir tane atasın"
          >
            <Dices className="h-4.5 w-4.5" />
            <span>Rastgele Cüz Ata</span>
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-700 transition"
            title="Yenile"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* VIEW 1: ORTAK HATİM PANOSU (The 30 Boxes) */}
      {subView === 'board' && (
        <section className="space-y-4">
          
          {/* Quick Filters & Legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  filter === 'all'
                    ? 'bg-stone-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                    : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 hover:bg-stone-200'
                }`}
              >
                Tümü (30)
              </button>

              <button
                type="button"
                onClick={() => setFilter('available')}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  filter === 'available'
                    ? 'bg-stone-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                    : 'bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-400 hover:bg-stone-200'
                }`}
              >
                Boş Olanlar ({counts.available})
              </button>

              <button
                type="button"
                onClick={() => setFilter('taken')}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  filter === 'taken'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                }`}
              >
                Okunuyor ({counts.taken})
              </button>

              <button
                type="button"
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-xl font-semibold transition ${
                  filter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                }`}
              >
                Okunanlar ({counts.completed})
              </button>

              {userProfile && (
                <button
                  type="button"
                  onClick={() => setFilter('my')}
                  className={`px-3 py-1 rounded-xl font-semibold transition ${
                    filter === 'my'
                      ? 'bg-sage-700 text-white shadow-2xs'
                      : 'bg-sage-50 dark:bg-emerald-950/40 text-sage-800 dark:text-emerald-300 border border-sage-200 dark:border-emerald-800/40'
                  }`}
                >
                  Benim Cüzlerim ({counts.myCount})
                </button>
              )}
            </div>

            {/* Visual Legend / Renk Anlamları */}
            <div className="flex items-center gap-3 text-[11px] font-medium text-stone-500 dark:text-slate-400 self-end sm:self-center">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-slate-600" /> Boş
              </span>
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Sarı: Alındı (Okunuyor)
              </span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Yeşil: Okundu
              </span>
            </div>

          </div>

          {/* 30 Cüz Kutucukları Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {filteredAssignments.map((assignment) => {
              const info = getJuzInfo(assignment.juz_number);

              return (
                <JuzBox
                  key={assignment.id || assignment.juz_number}
                  assignment={assignment}
                  juzInfo={info}
                  userProfile={userProfile}
                  onTakeJuz={handleTakeJuz}
                  onReleaseJuz={handleReleaseJuz}
                  onCompleteJuz={handleCompleteJuz}
                  isActionLoading={actionLoading}
                />
              );
            })}
          </div>

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12 rounded-3xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-stone-500 dark:text-slate-400 text-xs sm:text-sm">
              Seçilen filtreye uygun cüz bulunamadı.
            </div>
          )}

        </section>
      )}

      {/* VIEW 2: KİŞİSEL CÜZ & HATİM TAKİBİM */}
      {subView === 'personal' && (
        <PersonalJuzTracker
          userProfile={userProfile}
          personalHistory={personalHistory}
          activeRoundAssignments={assignments}
          onOpenAuth={onOpenAuth}
          onRequestSpecificJuz={(juzNumber) => {
            setSubView('board');
            handleTakeJuz(juzNumber);
          }}
        />
      )}

      {/* VIEW 3: TÜM HATİMLER GEÇMİŞİ */}
      {subView === 'history' && (
        <section className="rounded-3xl border border-stone-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-white flex items-center gap-2">
                <History className="h-5 w-5 text-sage-700 dark:text-emerald-400" />
                Hatm-i Şerif Döngüleri
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                Topluluk olarak tamamlanan ve devam eden tüm ortak hatimler.
              </p>
            </div>
            {counts.completed === 30 && (
              <button
                type="button"
                onClick={handleStartNewRound}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
              >
                Yeni Hatim Başlat
              </button>
            )}
          </div>

          <div className="divide-y divide-stone-100 dark:divide-slate-800">
            {allRounds.map((rnd) => {
              const isCurrent = rnd.id === activeRound?.id;
              return (
                <div key={rnd.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white">
                        {rnd.title || `${rnd.round_number}. Ortak Hatm-i Şerif`}
                      </h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          Aktif
                        </span>
                      )}
                      {rnd.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          Tamamlandı
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                      Başlangıç: {new Date(rnd.created_at).toLocaleDateString('tr-TR')}
                      {rnd.completed_at && ` • Bitiş: ${new Date(rnd.completed_at).toLocaleDateString('tr-TR')}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-stone-700 dark:text-slate-300">
                      30 Cüz
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Completion Modal ("ve isterse hiç okunmamış yeni cüz alır") */}
      {completionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-5 text-center">
            
            {/* Modal Icon */}
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              {completionModal.isHatimCompleted ? (
                <PartyPopper className="h-8 w-8 text-amber-500 animate-bounce" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              )}
            </div>

            {/* Modal Heading */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold font-serif text-stone-900 dark:text-white">
                {completionModal.isHatimCompleted
                  ? '🎉 Elhamdülillah! Hatm-i Şerif Tamamlandı!'
                  : `Tebrikler! ${completionModal.completedJuzNumber}. Cüz Tamamlandı`}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-slate-400">
                {completionModal.isHatimCompleted ? (
                  <span>
                    Topluluk olarak {completionModal.roundNumber}. Hatm-i Şerif'in son cüzünü de tamamladınız. Cenâb-ı Hak okunan her harfi kabul buyursun.
                  </span>
                ) : (
                  <span>
                    Okumanız hayır hanenize kaydedildi ve cüz kutucuğu yeşile döndü. Yeni bir cüz alarak okumaya devam etmek ister misiniz?
                  </span>
                )}
              </p>
            </div>

            {/* Modal Action Buttons */}
            <div className="space-y-2.5 pt-2">
              {completionModal.isHatimCompleted ? (
                <button
                  type="button"
                  onClick={handleStartNewRound}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Yeni Hatm-i Şerif Başlat</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      setCompletionModal({ isOpen: false, completedJuzNumber: null, isHatimCompleted: false, roundNumber: 1 });
                      await handleRandomJuz();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition active:scale-98"
                  >
                    <Dices className="h-4 w-4" />
                    <span>🎲 Rastgele Yeni Cüz Al</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCompletionModal({ isOpen: false, completedJuzNumber: null, isHatimCompleted: false, roundNumber: 1 });
                      setFilter('available');
                    }}
                    className="w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold border border-stone-200 dark:border-slate-700 text-stone-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-800 transition"
                  >
                    Panodan Kendim Seçeceğim
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setCompletionModal({ isOpen: false, completedJuzNumber: null, isHatimCompleted: false, roundNumber: 1 })}
                className="w-full py-2 text-xs text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-white transition"
              >
                Şimdilik Kapat
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

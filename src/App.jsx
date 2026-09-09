import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import DailyInputForm from './components/DailyInputForm';
import TablesSection from './components/TablesSection';
import StatsCharts from './components/StatsCharts';
import PersonalProfile from './components/PersonalProfile';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { apiService, isSupabaseConfigured } from './lib/supabase';
import { Info, Database } from 'lucide-react';

export default function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial Load: User session & all reading logs
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load Current User Session
      const sessionData = await apiService.getCurrentUser();
      if (sessionData?.profile) {
        setUserProfile(sessionData.profile);
      } else {
        setUserProfile(null);
      }

      // Load All Logs
      const allLogs = await apiService.fetchAllLogs();
      setLogs(allLogs);
    } catch (err) {
      console.error('Veri yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auth Handlers
  const handleSignIn = async (email, password) => {
    const res = await apiService.signInWithEmail(email, password);
    setUserProfile(res.profile);
    await loadData();
  };

  const handleSignOut = async () => {
    await apiService.signOut();
    setUserProfile(null);
    await loadData();
  };

  // Save Daily Reading Log
  const handleSaveLog = async ({ dateStr, pageCount, bookTitle }) => {
    if (!userProfile) return;
    await apiService.saveReadingLog({
      userId: userProfile.id,
      dateStr,
      pageCount,
      bookTitle,
      profile: userProfile
    });
    await loadData();
  };

  // Computed Global Stats
  const globalStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let todayPages = 0;
    const todayUserSet = new Set();
    let totalAllTimePages = 0;

    logs.forEach((log) => {
      totalAllTimePages += log.page_count;
      if (log.log_date === todayStr) {
        todayPages += log.page_count;
        todayUserSet.add(log.user_id);
      }
    });

    return {
      todayPages,
      todayReadersCount: todayUserSet.size,
      totalAllTimePages
    };
  }, [logs]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header */}
      <Header
        userProfile={userProfile}
        onOpenAuth={() => setAuthModalOpen(true)}
        onSignOut={handleSignOut}
        stats={globalStats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Backend Demo Mode Notice Banner (if Supabase env vars not set) */}
        {!isSupabaseConfigured && (
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 flex items-start sm:items-center gap-3 text-xs text-slate-300 shadow-lg">
            <Database className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <span className="font-semibold text-emerald-400">Önizleme / Demo Modu Aktif:</span> Bu uygulama şu anda tarayıcı yerel hafızasında (LocalStorage) tam fonksiyonel çalışmaktadır. Kendi Supabase URL ve Key bilgilerinizi <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono">.env</code> dosyasına eklediğinizde canlı bulut veritabanına otomatik bağlanacaktır.
            </div>
          </div>
        )}

        {/* 1. Daily Reading Submission Form */}
        <section id="giris">
          <DailyInputForm
            userProfile={userProfile}
            onSaveLog={handleSaveLog}
            logs={logs}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        </section>

        {/* 2. Tables Section (Daily, Weekly, Monthly) */}
        <section id="tablolar">
          <TablesSection logs={logs} />
        </section>

        {/* 3. Visual Charts Section */}
        <section id="grafikler">
          <StatsCharts logs={logs} />
        </section>

        {/* 4. Personal Profile & Streak Section */}
        <section id="profil">
          <PersonalProfile
            userProfile={userProfile}
            logs={logs}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        </section>

      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSignIn={handleSignIn}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}

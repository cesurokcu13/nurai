import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import DailyInputForm from './components/DailyInputForm';
import TablesSection from './components/TablesSection';
import StatsCharts from './components/StatsCharts';
import PersonalProfile from './components/PersonalProfile';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { apiService, isSupabaseConfigured } from './lib/supabase';
import { Database, ShieldCheck, AlertCircle } from 'lucide-react';

export default function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initial Load: User session & all reading logs from Supabase
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load Current User Session from Supabase
      const sessionData = await apiService.getCurrentUser();
      if (sessionData?.profile) {
        setUserProfile(sessionData.profile);
      } else {
        setUserProfile(null);
      }

      // Load All Logs from Supabase
      const allLogs = await apiService.fetchAllLogs();
      setLogs(allLogs);
    } catch (err) {
      console.error('Supabase verileri yüklenirken hata:', err);
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

  // Save Daily Reading Log directly to Supabase
  const handleSaveLog = async ({ dateStr, pageCount }) => {
    if (!userProfile) return;
    await apiService.saveReadingLog({
      userId: userProfile.id,
      dateStr,
      pageCount
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
        
        {/* Supabase Connection Status Banner */}
        {isSupabaseConfigured ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-400 shadow-lg">
            <div className="flex items-center gap-2 font-medium">
              <Database className="h-4 w-4 text-emerald-400" />
              <span>🟢 Supabase Canlı Veritabanı Bağlantısı Aktif</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400/80 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="h-3.5 w-3.5" /> %100 Anonim Veri Güvenliği
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start sm:items-center gap-3 text-xs text-amber-300 shadow-lg">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <span className="font-semibold text-amber-400">Supabase Bağlantı Uyarısı:</span> Canlı veritabanı bağlantısı için GitHub Repository ayarlarınızdan <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">Settings -&gt; Secrets -&gt; Actions</code> kısmına <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">VITE_SUPABASE_URL</code> ve <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">VITE_SUPABASE_ANON_KEY</code> ekleyiniz.
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

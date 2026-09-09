import { createClient } from '@supabase/supabase-js';
import { generateRandomColorNickname } from '../utils/nicknameGenerator';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// LOCAL STORAGE MOCK BACKEND (Fallback Mode)
// Used when Supabase env vars are not set
// ==========================================

const INITIAL_DEMO_PROFILES = [
  { id: 'demo-u1', email: 'user1@example.com', color_nickname: 'Zümrüt Yeşil #412', badge_color: '#10B981' },
  { id: 'demo-u2', email: 'user2@example.com', color_nickname: 'Safir Mavi #891', badge_color: '#3B82F6' },
  { id: 'demo-u3', email: 'user3@example.com', color_nickname: 'Yakut Kırmızı #305', badge_color: '#EF4444' },
  { id: 'demo-u4', email: 'user4@example.com', color_nickname: 'Kehribar Sarı #774', badge_color: '#F59E0B' },
  { id: 'demo-u5', email: 'user5@example.com', color_nickname: 'Turkuaz Işık #118', badge_color: '#06B6D4' },
  { id: 'demo-u6', email: 'user6@example.com', color_nickname: 'Erguvan Mor #902', badge_color: '#A855F7' },
];

// Generate last 14 days demo logs
function getInitialDemoLogs() {
  const logs = [];
  const today = new Date();
  
  INITIAL_DEMO_PROFILES.forEach((profile, index) => {
    for (let d = 0; d < 14; d++) {
      const dateObj = new Date(today);
      dateObj.setDate(dateObj.getDate() - d);
      const dateStr = dateObj.toISOString().split('T')[0];

      // Skip some random days to simulate real reading behavior
      if ((d + index) % 3 === 0 && d !== 0) continue;

      const pageCount = 10 + Math.floor(Math.random() * 40);

      logs.push({
        id: `demo-log-${profile.id}-${dateStr}`,
        user_id: profile.id,
        log_date: dateStr,
        page_count: pageCount,
        created_at: new Date(dateObj).toISOString(),
        profiles: {
          color_nickname: profile.color_nickname,
          badge_color: profile.badge_color
        }
      });
    }
  });

  return logs;
}

function getStoredProfiles() {
  const local = localStorage.getItem('nurai_mock_profiles');
  if (local) return JSON.parse(local);
  localStorage.setItem('nurai_mock_profiles', JSON.stringify(INITIAL_DEMO_PROFILES));
  return INITIAL_DEMO_PROFILES;
}

function getStoredLogs() {
  const local = localStorage.getItem('nurai_mock_logs');
  if (local) return JSON.parse(local);
  const initial = getInitialDemoLogs();
  localStorage.setItem('nurai_mock_logs', JSON.stringify(initial));
  return initial;
}

function getCurrentMockUser() {
  const local = localStorage.getItem('nurai_mock_current_user');
  return local ? JSON.parse(local) : null;
}

// ==========================================
// UNIFIED DATA SERVICE (Supabase or Mock)
// ==========================================

export const apiService = {
  /**
   * Register or Sign in with Email
   */
  async signInWithEmail(email, password) {
    if (isSupabaseConfigured) {
      let { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        authData = signUpData;

        if (authData.user) {
          const { nickname, hex } = generateRandomColorNickname();
          await supabase.from('profiles').insert([
            {
              id: authData.user.id,
              color_nickname: nickname,
              badge_color: hex,
            }
          ]);
        }
      } else if (signInError) {
        throw signInError;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      return { user: authData.user, profile };
    } else {
      const profiles = getStoredProfiles();
      let profile = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());

      if (!profile) {
        const { nickname, hex } = generateRandomColorNickname();
        profile = {
          id: `user-${Date.now()}`,
          email,
          color_nickname: nickname,
          badge_color: hex,
        };
        profiles.push(profile);
        localStorage.setItem('nurai_mock_profiles', JSON.stringify(profiles));
      }

      const mockUser = { id: profile.id, email: profile.email };
      localStorage.setItem('nurai_mock_current_user', JSON.stringify({ user: mockUser, profile }));
      return { user: mockUser, profile };
    }
  },

  /**
   * Get Current Session User & Profile
   */
  async getCurrentUser() {
    if (isSupabaseConfigured) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      return { user: session.user, profile };
    } else {
      return getCurrentMockUser();
    }
  },

  /**
   * Sign Out
   */
  async signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('nurai_mock_current_user');
    }
  },

  /**
   * Save Daily Reading Log
   */
  async saveReadingLog({ userId, dateStr, pageCount, profile }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reading_logs')
        .upsert({
          user_id: userId,
          log_date: dateStr,
          page_count: parseInt(pageCount, 10)
        }, { onConflict: 'user_id,log_date' })
        .select();

      if (error) throw error;
      return data;
    } else {
      const logs = getStoredLogs();
      const existingIndex = logs.findIndex(l => l.user_id === userId && l.log_date === dateStr);

      const logObj = {
        id: existingIndex >= 0 ? logs[existingIndex].id : `log-${Date.now()}`,
        user_id: userId,
        log_date: dateStr,
        page_count: parseInt(pageCount, 10),
        created_at: new Date().toISOString(),
        profiles: {
          color_nickname: profile?.color_nickname || 'Anonim Okuyucu',
          badge_color: profile?.badge_color || '#10B981'
        }
      };

      if (existingIndex >= 0) {
        logs[existingIndex] = logObj;
      } else {
        logs.unshift(logObj);
      }

      localStorage.setItem('nurai_mock_logs', JSON.stringify(logs));
      return logObj;
    }
  },

  /**
   * Fetch All Reading Logs
   */
  async fetchAllLogs() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('reading_logs')
        .select(`
          id,
          user_id,
          log_date,
          page_count,
          created_at,
          profiles (
            color_nickname,
            badge_color
          )
        `)
        .order('log_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } else {
      return getStoredLogs();
    }
  }
};

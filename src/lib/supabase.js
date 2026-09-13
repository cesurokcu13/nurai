import { createClient } from '@supabase/supabase-js';
import { generateRandomColorNickname, getInitialLetter } from '../utils/nicknameGenerator';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ========================================================
// PURE SUPABASE SERVICE (With Unique Initial Letter Logic)
// ========================================================

/**
 * Self-healing helper: Checks all profiles in Supabase for duplicate initial letters
 * and updates any duplicates so every single user has a unique initial letter.
 */
async function fixDuplicateProfiles(profiles = []) {
  if (!supabase || !profiles || profiles.length <= 1) return profiles;

  const usedLetters = new Set();
  const duplicatesToFix = [];

  profiles.forEach((p) => {
    const letter = getInitialLetter(p.color_nickname);
    if (usedLetters.has(letter)) {
      duplicatesToFix.push(p);
    } else {
      usedLetters.add(letter);
    }
  });

  if (duplicatesToFix.length === 0) return profiles;

  console.log(`Bilinçli Düzeltme: ${duplicatesToFix.length} adet mükerrer baş harfli profil eşsizleştiriliyor...`);

  const updatedProfiles = [...profiles];
  for (const dup of duplicatesToFix) {
    const existingNicknames = Array.from(usedLetters).map((l) => `${l} Profile`);
    const { nickname, hex } = generateRandomColorNickname(existingNicknames);
    
    // Add newly assigned letter to set
    usedLetters.add(getInitialLetter(nickname));

    // Update in Supabase
    await supabase.from('profiles').update({
      color_nickname: nickname,
      badge_color: hex
    }).eq('id', dup.id);

    // Update local profile object
    const index = updatedProfiles.findIndex((p) => p.id === dup.id);
    if (index >= 0) {
      updatedProfiles[index].color_nickname = nickname;
      updatedProfiles[index].badge_color = hex;
    }
  }

  return updatedProfiles;
}

export const apiService = {
  /**
   * Register or Sign in with Email strictly using Supabase Auth
   */
  async signInWithEmail(email, password) {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase yapılandırılmadı! Lütfen .env veya GitHub Secrets içerisine VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini ekleyin.'
      );
    }

    // 1. Try signing in with Supabase Auth
    let { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 2. If user doesn't exist, sign up in Supabase
    if (signInError && (signInError.message.includes('Invalid login credentials') || signInError.status === 400)) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      authData = signUpData;

      // Create profile in Supabase `profiles` table with UNIQUE initial letter
      if (authData.user) {
        const { data: existingProfiles } = await supabase.from('profiles').select('color_nickname');
        const existingNicknames = (existingProfiles || []).map((p) => p.color_nickname);
        const { nickname, hex } = generateRandomColorNickname(existingNicknames);

        const { error: profileErr } = await supabase.from('profiles').upsert([
          {
            id: authData.user.id,
            color_nickname: nickname,
            badge_color: hex,
          }
        ]);
        if (profileErr) console.error('Profil kaydedilirken hata:', profileErr);
      }
    } else if (signInError) {
      throw signInError;
    }

    // 3. Fetch profile from Supabase
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!profile && authData.user) {
      const { data: existingProfiles } = await supabase.from('profiles').select('color_nickname');
      const existingNicknames = (existingProfiles || []).map((p) => p.color_nickname);
      const { nickname, hex } = generateRandomColorNickname(existingNicknames);

      profile = { id: authData.user.id, color_nickname: nickname, badge_color: hex };
      await supabase.from('profiles').upsert([profile]);
    }

    return { user: authData.user, profile };
  },

  /**
   * Get Current Session User & Profile from Supabase
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured) return null;

    const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !session?.user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return { user: session.user, profile };
  },

  /**
   * Sign Out from Supabase
   */
  async signOut() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  },

  /**
   * Save Daily Reading Log directly to Supabase
   */
  async saveReadingLog({ userId, dateStr, pageCount }) {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase veritabanı bağlantısı bulunamadı.');
    }

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
  },

  /**
   * Fetch All Reading Logs directly from Supabase (with unique initial letter check)
   */
  async fetchAllLogs() {
    if (!isSupabaseConfigured) return [];

    // Check & Fix duplicate profiles in database
    const { data: allProfiles } = await supabase.from('profiles').select('*');
    if (allProfiles && allProfiles.length > 0) {
      await fixDuplicateProfiles(allProfiles);
    }

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

    if (error) {
      console.error('Supabase okuma kayıtları çekilirken hata:', error);
      return [];
    }

    return data || [];
  }
};

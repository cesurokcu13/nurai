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

    const isAdminUser = email.toLowerCase() === 'salihwhitestone2@gmail.com';

    if (!profile && authData.user) {
      const { data: existingProfiles } = await supabase.from('profiles').select('color_nickname');
      const existingNicknames = (existingProfiles || []).map((p) => p.color_nickname);
      const { nickname, hex } = generateRandomColorNickname(existingNicknames);

      profile = { 
        id: authData.user.id, 
        color_nickname: nickname, 
        badge_color: hex,
        role: isAdminUser ? 'admin' : 'user'
      };
      await supabase.from('profiles').upsert([profile]);
    } else if (profile && isAdminUser && profile.role !== 'admin') {
      profile.role = 'admin';
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', profile.id);
    }

    if (profile && !profile.role) {
      profile.role = isAdminUser ? 'admin' : 'user';
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

    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const isAdminUser = session.user.email?.toLowerCase() === 'salihwhitestone2@gmail.com';

    if (profile) {
      if (isAdminUser && profile.role !== 'admin') {
        profile.role = 'admin';
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', profile.id);
      } else if (!profile.role) {
        profile.role = isAdminUser ? 'admin' : 'user';
      }
    }

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

// ========================================================
// TASKS & SUBTASKS SERVICE (Shared Task Board)
// ========================================================

export const tasksService = {
  /**
   * Fetch all tasks with subtasks and completed_by profiles
   */
  async fetchTasks() {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        difficulty,
        status,
        created_at,
        created_by,
        subtasks (
          id,
          task_id,
          title,
          is_completed,
          completed_by,
          completed_at,
          order_index,
          profiles:completed_by (
            color_nickname,
            badge_color
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Görevler yüklenirken hata:', error);
      return [];
    }

    return (data || []).map((task) => ({
      ...task,
      subtasks: (task.subtasks || []).sort((a, b) => a.order_index - b.order_index)
    }));
  },

  /**
   * Create new task with subtasks (Admin only)
   */
  async createTask({ title, description, difficulty = 1, subtaskTitles = [], userId }) {
    if (!isSupabaseConfigured) throw new Error('Supabase bağlantısı yok.');

    // 1. Create parent task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert({
        title: title.trim(),
        description: description ? description.trim() : null,
        difficulty: Math.min(Math.max(Number(difficulty) || 1, 1), 5),
        created_by: userId,
        status: 'todo'
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // 2. Create subtasks
    const cleanTitles = subtaskTitles.filter((t) => t && t.trim().length > 0);
    if (cleanTitles.length > 0) {
      const subtaskRecords = cleanTitles.map((stTitle, idx) => ({
        task_id: task.id,
        title: stTitle.trim(),
        order_index: idx,
        is_completed: false
      }));

      const { error: subtaskError } = await supabase
        .from('subtasks')
        .insert(subtaskRecords);

      if (subtaskError) throw subtaskError;
    }

    return task;
  },

  /**
   * Update task and sync its subtasks (Admin only)
   */
  async updateTask(taskId, { title, description, difficulty = 1, subtasks = [] }) {
    if (!isSupabaseConfigured) throw new Error('Supabase bağlantısı yok.');

    // 1. Update task fields
    const { error: taskError } = await supabase
      .from('tasks')
      .update({
        title: title.trim(),
        description: description ? description.trim() : null,
        difficulty: Math.min(Math.max(Number(difficulty) || 1, 1), 5),
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (taskError) throw taskError;

    // 2. Fetch current subtasks for reconciliation
    const { data: existingSubtasks } = await supabase
      .from('subtasks')
      .select('id')
      .eq('task_id', taskId);

    const existingIds = new Set((existingSubtasks || []).map((s) => s.id));
    const submittedIds = new Set(subtasks.filter((s) => s.id).map((s) => s.id));

    // Delete removed subtasks
    const idsToDelete = [...existingIds].filter((id) => !submittedIds.has(id));
    if (idsToDelete.length > 0) {
      await supabase.from('subtasks').delete().in('id', idsToDelete);
    }

    // Insert or update subtasks
    for (let i = 0; i < subtasks.length; i++) {
      const st = subtasks[i];
      if (!st.title || !st.title.trim()) continue;

      if (st.id && existingIds.has(st.id)) {
        await supabase
          .from('subtasks')
          .update({
            title: st.title.trim(),
            order_index: i
          })
          .eq('id', st.id);
      } else {
        await supabase
          .from('subtasks')
          .insert({
            task_id: taskId,
            title: st.title.trim(),
            order_index: i,
            is_completed: false
          });
      }
    }
  },

  /**
   * Delete task (Cascade deletes subtasks) (Admin only)
   */
  async deleteTask(taskId) {
    if (!isSupabaseConfigured) throw new Error('Supabase bağlantısı yok.');
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
  },

  /**
   * Toggle a subtask completion (All authenticated users)
   * Automatically updates parent task status
   */
  async toggleSubtask({ subtaskId, taskId, isCompleted, userId }) {
    if (!isSupabaseConfigured) throw new Error('Supabase bağlantısı yok.');

    const updatePayload = {
      is_completed: isCompleted,
      completed_by: isCompleted ? userId : null,
      completed_at: isCompleted ? new Date().toISOString() : null
    };

    const { error: subtaskError } = await supabase
      .from('subtasks')
      .update(updatePayload)
      .eq('id', subtaskId);

    if (subtaskError) throw subtaskError;

    // Check all subtasks to sync parent task status
    const { data: allSubtasks } = await supabase
      .from('subtasks')
      .select('is_completed')
      .eq('task_id', taskId);

    if (allSubtasks && allSubtasks.length > 0) {
      const allDone = allSubtasks.every((s) => s.is_completed);
      await supabase
        .from('tasks')
        .update({ 
          status: allDone ? 'done' : 'todo', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', taskId);
    }
  }
};

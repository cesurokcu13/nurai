import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY = 'nurai_hatim_juz_v1';

/**
 * Helper to initialize 30 empty juz assignments for a given round
 */
function createInitial30Assignments(roundId) {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `local-assign-${roundId}-${i + 1}`,
    round_id: roundId,
    juz_number: i + 1,
    status: 'available', // 'available' | 'taken' | 'completed'
    user_id: null,
    taken_at: null,
    completed_at: null,
    profiles: null
  }));
}

/**
 * LocalStorage Fallback State Manager
 */
function getLocalState() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.rounds && Array.isArray(parsed.rounds) && parsed.rounds.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('LocalStorage okuma hatası:', err);
  }

  // Initialize fresh local state with Round 1
  const initialRoundId = 'local-round-1';
  const defaultState = {
    rounds: [
      {
        id: initialRoundId,
        round_number: 1,
        title: '1. Ortak Hatm-i Şerif',
        status: 'active',
        created_at: new Date().toISOString(),
        completed_at: null,
        assignments: createInitial30Assignments(initialRoundId)
      }
    ]
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultState));
  } catch (e) {
    // ignore
  }

  return defaultState;
}

function saveLocalState(state) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('LocalStorage yazma hatası:', err);
  }
}

export const juzService = {
  /**
   * Fetch Active Hatim Round with all 30 Juz assignments.
   * If none exists, creates Round 1.
   * Ensures strict privacy: only the current user's own profile is attached; others are hidden.
   */
  async fetchActiveRound(currentUserId = null) {
    if (isSupabaseConfigured && supabase) {
      try {
        // 1. Check for an active round
        let { data: activeRound, error: roundError } = await supabase
          .from('hatim_rounds')
          .select('*')
          .eq('status', 'active')
          .order('round_number', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (roundError) {
          console.warn('Supabase hatim_rounds tablosu henüz mevcut olmayabilir, yerel depolama kullanılıyor:', roundError.message);
          return this.getLocalActiveRound();
        }

        // 2. If no active round exists, check total count to create next round
        if (!activeRound) {
          const { count, error: countErr } = await supabase
            .from('hatim_rounds')
            .select('*', { count: 'exact', head: true });

          const nextRoundNum = (countErr || count === null || count === 0) ? 1 : count + 1;

          const { data: newRound, error: createRoundErr } = await supabase
            .from('hatim_rounds')
            .insert({
              round_number: nextRoundNum,
              title: `${nextRoundNum}. Ortak Hatm-i Şerif`,
              status: 'active'
            })
            .select()
            .single();

          if (createRoundErr) {
            console.warn('Hatim turu oluşturulurken hata:', createRoundErr);
            return this.getLocalActiveRound();
          }

          activeRound = newRound;

          // Create 30 assignments for this new round
          const initial30 = Array.from({ length: 30 }, (_, i) => ({
            round_id: activeRound.id,
            juz_number: i + 1,
            status: 'available'
          }));

          const { error: insert30Err } = await supabase
            .from('juz_assignments')
            .insert(initial30);

          if (insert30Err) {
            console.warn('30 Cüz eklenirken hata:', insert30Err);
          }
        }

        // 3. Fetch all 30 assignments with profile badges
        const { data: assignments, error: assignError } = await supabase
          .from('juz_assignments')
          .select(`
            id,
            round_id,
            juz_number,
            status,
            user_id,
            taken_at,
            completed_at,
            notes,
            profiles:user_id (
              id,
              color_nickname,
              badge_color
            )
          `)
          .eq('round_id', activeRound.id)
          .order('juz_number', { ascending: true });

        if (assignError) {
          console.warn('Cüz atamaları çekilemedi, yerel veri kullanılıyor:', assignError);
          return this.getLocalActiveRound();
        }

        // If assignments are missing or fewer than 30, heal and populate
        let fullAssignments = assignments || [];
        if (fullAssignments.length < 30) {
          const existingNums = new Set(fullAssignments.map((a) => a.juz_number));
          const missing = [];
          for (let i = 1; i <= 30; i++) {
            if (!existingNums.has(i)) {
              missing.push({
                round_id: activeRound.id,
                juz_number: i,
                status: 'available'
              });
            }
          }
          if (missing.length > 0) {
            await supabase.from('juz_assignments').insert(missing);
            const { data: refreshed } = await supabase
              .from('juz_assignments')
              .select(`
                id,
                round_id,
                juz_number,
                status,
                user_id,
                taken_at,
                completed_at,
                notes,
                profiles:user_id (
                  id,
                  color_nickname,
                  badge_color
                )
              `)
              .eq('round_id', activeRound.id)
              .order('juz_number', { ascending: true });
            fullAssignments = refreshed || fullAssignments;
          }
        }

        const sanitized = fullAssignments.map((a) => {
          const isMine = currentUserId && a.user_id === currentUserId;
          return {
            ...a,
            profiles: isMine ? a.profiles : null
          };
        });

        return {
          round: activeRound,
          assignments: sanitized,
          isLiveDb: true
        };
      } catch (err) {
        console.warn('Supabase cüz servisi hatası:', err);
        return this.getLocalActiveRound(currentUserId);
      }
    }

    return this.getLocalActiveRound(currentUserId);
  },

  /**
   * LocalStorage Fallback for Active Round
   */
  getLocalActiveRound(currentUserId = null) {
    const state = getLocalState();
    let active = state.rounds.find((r) => r.status === 'active');

    if (!active) {
      const nextNum = state.rounds.length + 1;
      const newRoundId = `local-round-${nextNum}`;
      active = {
        id: newRoundId,
        round_number: nextNum,
        title: `${nextNum}. Ortak Hatm-i Şerif`,
        status: 'active',
        created_at: new Date().toISOString(),
        completed_at: null,
        assignments: createInitial30Assignments(newRoundId)
      };
      state.rounds.push(active);
      saveLocalState(state);
    }

    const sanitized = (active.assignments || []).map((a) => {
      const isMine = currentUserId && a.user_id === currentUserId;
      return {
        ...a,
        profiles: isMine ? a.profiles : null
      };
    });

    return {
      round: active,
      assignments: sanitized,
      isLiveDb: false
    };
  },

  /**
   * Fetch all rounds (active + completed) for history viewing
   */
  async fetchAllRounds() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: rounds, error } = await supabase
          .from('hatim_rounds')
          .select('*')
          .order('round_number', { ascending: false });

        if (!error && rounds && rounds.length > 0) {
          return rounds;
        }
      } catch (e) {
        // fallback
      }
    }

    const state = getLocalState();
    return [...state.rounds].sort((a, b) => b.round_number - a.round_number);
  },

  /**
   * User picks / claims an available Juz -> status becomes 'taken' (SARI)
   */
  async takeJuz({ roundId, juzNumber, userProfile }) {
    if (!userProfile) throw new Error('Cüz almak için lütfen giriş yapınız.');

    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        // Try atomic update where status is 'available'
        const { data, error } = await supabase
          .from('juz_assignments')
          .update({
            status: 'taken',
            user_id: userProfile.id,
            taken_at: nowIso
          })
          .eq('round_id', roundId)
          .eq('juz_number', juzNumber)
          .eq('status', 'available')
          .select(`
            id,
            round_id,
            juz_number,
            status,
            user_id,
            taken_at,
            completed_at,
            profiles:user_id (
              id,
              color_nickname,
              badge_color
            )
          `)
          .single();

        if (error) {
          throw new Error('Cüz alınamadı veya başkası tarafından alındı.');
        }

        return data;
      } catch (err) {
        console.warn('Supabase takeJuz hatası, yerel güncelleme yapılıyor:', err);
      }
    }

    // LocalStorage Fallback
    const state = getLocalState();
    const round = state.rounds.find((r) => r.id === roundId);
    if (!round) throw new Error('Hatim turu bulunamadı.');

    const assign = round.assignments.find((a) => a.juz_number === juzNumber);
    if (!assign) throw new Error('Cüz bulunamadı.');

    if (assign.status !== 'available') {
      throw new Error('Bu cüz zaten başka bir okuyucu tarafından alınmış.');
    }

    assign.status = 'taken';
    assign.user_id = userProfile.id;
    assign.taken_at = nowIso;
    assign.profiles = {
      id: userProfile.id,
      color_nickname: userProfile.color_nickname,
      badge_color: userProfile.badge_color
    };

    saveLocalState(state);
    return assign;
  },

  /**
   * Release a taken juz back to 'available'
   */
  async releaseJuz({ roundId, juzNumber, userId, isAdmin = false }) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('juz_assignments')
          .update({
            status: 'available',
            user_id: null,
            taken_at: null
          })
          .eq('round_id', roundId)
          .eq('juz_number', juzNumber);

        if (!isAdmin) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query.select().single();
        if (!error) return data;
      } catch (err) {
        console.warn('Supabase releaseJuz hatası:', err);
      }
    }

    // Local fallback
    const state = getLocalState();
    const round = state.rounds.find((r) => r.id === roundId);
    if (round) {
      const assign = round.assignments.find((a) => a.juz_number === juzNumber);
      if (assign && (isAdmin || assign.user_id === userId)) {
        assign.status = 'available';
        assign.user_id = null;
        assign.taken_at = null;
        assign.profiles = null;
        saveLocalState(state);
        return assign;
      }
    }
    return null;
  },

  /**
   * Mark taken Juz as read / completed -> status becomes 'completed' (YEŞİL)
   * Also checks if this completed the entire Hatim (all 30 read).
   */
  async completeJuz({ roundId, juzNumber, userProfile, isAdmin = false }) {
    if (!userProfile) throw new Error('Giriş yapmanız gerekmektedir.');

    const nowIso = new Date().toISOString();
    let isHatimCompleted = false;
    let roundNumber = 1;

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from('juz_assignments')
          .update({
            status: 'completed',
            completed_at: nowIso
          })
          .eq('round_id', roundId)
          .eq('juz_number', juzNumber);

        if (!isAdmin) {
          query = query.eq('user_id', userProfile.id);
        }

        const { data, error } = await query
          .select(`
            id,
            round_id,
            juz_number,
            status,
            user_id,
            taken_at,
            completed_at,
            profiles:user_id (
              id,
              color_nickname,
              badge_color
            )
          `)
          .single();

        if (!error && data) {
          // Check if all 30 juz in this round are completed
          const { count } = await supabase
            .from('juz_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('round_id', roundId)
            .eq('status', 'completed');

          if (count >= 30) {
            isHatimCompleted = true;
            await supabase
              .from('hatim_rounds')
              .update({
                status: 'completed',
                completed_at: nowIso
              })
              .eq('id', roundId);
          }

          // Fetch current round info for message
          const { data: curRound } = await supabase
            .from('hatim_rounds')
            .select('round_number')
            .eq('id', roundId)
            .single();

          if (curRound) roundNumber = curRound.round_number;

          return {
            assignment: data,
            isHatimCompleted,
            roundNumber
          };
        }
      } catch (err) {
        console.warn('Supabase completeJuz hatası:', err);
      }
    }

    // Local fallback
    const state = getLocalState();
    const round = state.rounds.find((r) => r.id === roundId);
    if (!round) throw new Error('Hatim turu bulunamadı.');

    const assign = round.assignments.find((a) => a.juz_number === juzNumber);
    if (!assign) throw new Error('Cüz bulunamadı.');

    assign.status = 'completed';
    assign.completed_at = nowIso;
    roundNumber = round.round_number;

    const completedCount = round.assignments.filter((a) => a.status === 'completed').length;
    if (completedCount >= 30) {
      isHatimCompleted = true;
      round.status = 'completed';
      round.completed_at = nowIso;
    }

    saveLocalState(state);

    return {
      assignment: assign,
      isHatimCompleted,
      roundNumber
    };
  },

  /**
   * Randomly assign an unread / available Juz to the user ("sistem rastgele atasın")
   */
  async assignRandomJuz({ roundId, userProfile, userPersonalReadNumbers = [] }) {
    if (!userProfile) throw new Error('Rastgele cüz almak için giriş yapınız.');

    // 1. Fetch current assignments
    const { assignments } = await this.fetchActiveRound();
    const available = assignments.filter((a) => a.status === 'available');

    if (available.length === 0) {
      throw new Error('Bu hatimdeki tüm cüzler şu anda alınmış veya tamamlanmış! Yeni hatim başladığında cüz alabilirsiniz.');
    }

    // Prioritize juz numbers the user hasn't personally read yet
    const unreadByUser = available.filter((a) => !userPersonalReadNumbers.includes(a.juz_number));
    const candidatePool = unreadByUser.length > 0 ? unreadByUser : available;

    // Pick random from candidate pool
    const selected = candidatePool[Math.floor(Math.random() * candidatePool.length)];

    return await this.takeJuz({
      roundId,
      juzNumber: selected.juz_number,
      userProfile
    });
  },

  /**
   * Start a brand new Hatim round after previous completes
   */
  async startNewRound(currentRoundNumber = 1) {
    const nextRoundNumber = currentRoundNumber + 1;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: newRound, error: roundErr } = await supabase
          .from('hatim_rounds')
          .insert({
            round_number: nextRoundNumber,
            title: `${nextRoundNumber}. Ortak Hatm-i Şerif`,
            status: 'active'
          })
          .select()
          .single();

        if (!roundErr && newRound) {
          const initial30 = Array.from({ length: 30 }, (_, i) => ({
            round_id: newRound.id,
            juz_number: i + 1,
            status: 'available'
          }));

          await supabase.from('juz_assignments').insert(initial30);
          return newRound;
        }
      } catch (err) {
        console.warn('Supabase startNewRound hatası:', err);
      }
    }

    // Local fallback
    const state = getLocalState();
    const newRoundId = `local-round-${nextRoundNumber}`;
    const newRound = {
      id: newRoundId,
      round_number: nextRoundNumber,
      title: `${nextRoundNumber}. Ortak Hatm-i Şerif`,
      status: 'active',
      created_at: new Date().toISOString(),
      completed_at: null,
      assignments: createInitial30Assignments(newRoundId)
    };

    state.rounds.push(newRound);
    saveLocalState(state);
    return newRound;
  },

  /**
   * Fetch all completed Juz read by this specific user across all Hatim rounds.
   */
  async fetchUserPersonalHistory(userId) {
    if (!userId) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('juz_assignments')
          .select(`
            id,
            round_id,
            juz_number,
            status,
            taken_at,
            completed_at,
            hatim_rounds:round_id (
              round_number,
              title
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'completed')
          .order('completed_at', { ascending: false });

        if (!error && data) {
          return data.map((item) => ({
            id: item.id,
            roundNumber: item.hatim_rounds?.round_number || 1,
            roundTitle: item.hatim_rounds?.title || 'Hatm-i Şerif',
            juzNumber: item.juz_number,
            completedAt: item.completed_at
          }));
        }
      } catch (e) {
        // fallback
      }
    }

    // Fallback: search all local rounds
    const state = getLocalState();
    const history = [];

    state.rounds.forEach((round) => {
      (round.assignments || []).forEach((a) => {
        if (a.user_id === userId && a.status === 'completed') {
          history.push({
            id: a.id,
            roundNumber: round.round_number,
            roundTitle: round.title,
            juzNumber: a.juz_number,
            completedAt: a.completed_at
          });
        }
      });
    });

    return history.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }
};

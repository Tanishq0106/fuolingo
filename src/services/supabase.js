import { createClient } from '@supabase/supabase-js';
import { formatLocalDate, formatYearMonth } from '../utils/streak.js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://uetsffgopygchakgvhdz.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_9_Yrtx2tg9Qp-ZInU8GgIw_UIXMGaWJ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Helpers ──────────────────────────────────────────────

/** Get the current authenticated user's ID, or null */
async function getAuthUserId() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

// ── Demo Defaults (for demo mode without login) ─────────

const DEMO_USER_ID = 'demo-user-id';
const DEFAULT_PROFILE = {
  id: DEMO_USER_ID,
  email: 'athlete@fuolingo.app',
  display_name: 'Alex Mercer',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
  start_weight_kg: 84.0,
  target_weight_kg: 72.0,
  current_weight_kg: 79.8,
  goal: 'fat_loss',
  subscription_plan: 'pro',
  subscription_status: 'trialing',
  trial_ends_at: new Date(Date.now() + 14 * 86400000).toISOString(),
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
};

function generateInitialWeightLogs() {
  const logs = [];
  const start = 84.0;
  const days = 28;
  const today = new Date();
  for (let i = days; i >= 0; i -= 2) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - i);
    const dayStr = formatLocalDate(dt);
    const progressFactor = (days - i) / days;
    const expected = start - progressFactor * 4.2;
    const jitter = (Math.sin(i * 1.5) * 0.25);
    const weightKg = Number((expected + jitter).toFixed(1));
    logs.push({
      id: `wlog-${i}`,
      user_id: DEMO_USER_ID,
      weight_kg: weightKg,
      day: dayStr,
      date: dt.toISOString(),
      notes: i === 0 ? 'Feeling energized and strong!' : null
    });
  }
  return logs;
}

function generateInitialCompletions() {
  const completions = [];
  const today = new Date();
  for (let d = 4; d >= 1; d--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - d);
    const dayStr = formatLocalDate(dt);
    ['workout', 'calories', 'water', 'sleep'].slice(0, d === 2 ? 3 : 4).forEach((m) => {
      completions.push({
        id: `mc-${dayStr}-${m}`,
        user_id: DEMO_USER_ID,
        mission_key: m,
        day: dayStr,
        created_at: dt.toISOString()
      });
    });
  }
  const todayStr = formatLocalDate(today);
  ['workout', 'water'].forEach((m) => {
    completions.push({
      id: `mc-${todayStr}-${m}`,
      user_id: DEMO_USER_ID,
      mission_key: m,
      day: todayStr,
      created_at: new Date().toISOString()
    });
  });
  return completions;
}

// ── Local Fallback Store ────────────────────────────────

class LocalStore {
  constructor() {
    this.profile = { ...DEFAULT_PROFILE, ...this.load('pf_profile', DEFAULT_PROFILE) };
    this.weightLogs = this.load('pf_weight_logs', generateInitialWeightLogs());
    this.completions = this.load('pf_completions', generateInitialCompletions());
    this.badges = this.load('pf_badges', [
      { id: 'b1', user_id: DEMO_USER_ID, badge_key: 'first_mission', earned_at: new Date(Date.now() - 10 * 86400000).toISOString(), seen_at: new Date().toISOString() },
      { id: 'b2', user_id: DEMO_USER_ID, badge_key: 'first_kg', earned_at: new Date(Date.now() - 5 * 86400000).toISOString(), seen_at: new Date().toISOString() }
    ]);
    this.streakState = this.load('pf_streak', {
      user_id: DEMO_USER_ID,
      current_streak: 4,
      longest_streak: 7,
      freezes_available: 1,
      last_freeze_grant: formatYearMonth(),
      last_active_day: formatLocalDate(new Date(Date.now() - 86400000))
    });
    this.freezeUses = this.load('pf_freeze_uses', []);
  }

  load(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  }

  save(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  }
}

export const localStore = new LocalStore();

// ── Unified API ──────────────────────────────────────────
// When authenticated → reads/writes via Supabase with RLS.
// When in demo mode → uses localStorage exclusively.

export const api = {
  /** Whether the app is in demo mode (no authentication) */
  _demoMode: false,

  setDemoMode(enabled) {
    this._demoMode = enabled;
  },

  /** Check if we should use Supabase (authenticated) or local fallback */
  async _shouldUseSupabase() {
    if (this._demoMode) return false;
    const uid = await getAuthUserId();
    return !!uid;
  },

  // ── Profile ──

  async getProfile() {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', uid)
          .maybeSingle();
        if (!error && data) return data;
      } catch {}
    }
    return localStore.profile;
  },

  async updateProfile(updates) {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', uid)
          .select()
          .maybeSingle();
        if (!error && data) return data;
      } catch {}
    }
    // Local fallback
    localStore.profile = { ...localStore.profile, ...updates };
    localStore.save('pf_profile', localStore.profile);
    return localStore.profile;
  },

  // ── Missions ──

  async getCompletions() {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        const { data, error } = await supabase
          .from('mission_completions')
          .select('*')
          .eq('user_id', uid);
        if (!error && data) return data;
      } catch {}
    }
    return localStore.completions;
  },

  async toggleMission(missionKey, dayStr = formatLocalDate()) {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();

        // Check if already exists
        const { data: existing } = await supabase
          .from('mission_completions')
          .select('id')
          .eq('user_id', uid)
          .eq('mission_key', missionKey)
          .eq('day', dayStr)
          .maybeSingle();

        if (existing) {
          // Untick — delete the row
          await supabase
            .from('mission_completions')
            .delete()
            .eq('id', existing.id);
        } else {
          // Tick — insert
          await supabase
            .from('mission_completions')
            .insert({ user_id: uid, mission_key: missionKey, day: dayStr });
        }

        // Re-fetch all completions so state is clean
        const { data: allCompletions } = await supabase
          .from('mission_completions')
          .select('*')
          .eq('user_id', uid);

        return {
          isCompletedNow: !existing,
          completions: allCompletions || []
        };
      } catch (err) {
        console.error('toggleMission supabase error:', err);
      }
    }

    // Local fallback
    const existingIndex = localStore.completions.findIndex(
      c => c.mission_key === missionKey && c.day === dayStr
    );
    let isCompletedNow = false;

    if (existingIndex >= 0) {
      localStore.completions.splice(existingIndex, 1);
      isCompletedNow = false;
    } else {
      localStore.completions.push({
        id: `mc-${dayStr}-${missionKey}-${Date.now()}`,
        user_id: localStore.profile.id,
        mission_key: missionKey,
        day: dayStr,
        created_at: new Date().toISOString()
      });
      isCompletedNow = true;
    }

    localStore.save('pf_completions', localStore.completions);
    return { isCompletedNow, completions: [...localStore.completions] };
  },

  // ── Streaks & Freezes ──

  async getStreakState() {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        const { data, error } = await supabase
          .from('streaks')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle();
        if (!error && data) return data;
      } catch {}
    }
    return localStore.streakState;
  },

  async saveStreakState(streakData) {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        const payload = {
          user_id: uid,
          current_streak: streakData.current_streak,
          longest_streak: streakData.longest_streak,
          freezes_available: streakData.freezes_available,
          last_freeze_grant: streakData.last_freeze_grant,
          last_active_day: streakData.last_active_day,
          updated_at: new Date().toISOString(),
        };
        await supabase
          .from('streaks')
          .upsert(payload, { onConflict: 'user_id' });
        return payload;
      } catch (err) {
        console.error('saveStreakState supabase error:', err);
      }
    }
    // Local fallback
    localStore.streakState = { ...localStore.streakState, ...streakData };
    localStore.save('pf_streak', localStore.streakState);
    return localStore.streakState;
  },

  async getFreezeUses() {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        const { data, error } = await supabase
          .from('streak_freeze_uses')
          .select('day')
          .eq('user_id', uid);
        if (!error && data) return data.map(d => d.day);
      } catch {}
    }
    return localStore.freezeUses;
  },

  async recordFreezeUse(dayStr) {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        await supabase
          .from('streak_freeze_uses')
          .upsert(
            { user_id: uid, day: dayStr },
            { onConflict: 'user_id,day' }
          );
        return;
      } catch {}
    }
    // Local fallback
    if (!localStore.freezeUses.includes(dayStr)) {
      localStore.freezeUses.push(dayStr);
      localStore.save('pf_freeze_uses', localStore.freezeUses);
    }
  },

  // ── Badges ──

  async getUserBadges() {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        const { data, error } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', uid);
        if (!error && data) return data;
      } catch {}
    }
    return localStore.badges;
  },

  async awardBadge(badgeKey) {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();

        // Idempotent: check existing first
        const { data: existing } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', uid)
          .eq('badge_key', badgeKey)
          .maybeSingle();

        if (existing) return existing;

        const { data: newBadge, error } = await supabase
          .from('user_badges')
          .upsert(
            { user_id: uid, badge_key: badgeKey, earned_at: new Date().toISOString(), seen_at: null },
            { onConflict: 'user_id,badge_key' }
          )
          .select()
          .maybeSingle();

        if (!error && newBadge) return newBadge;
      } catch {}
    }

    // Local fallback
    const existing = localStore.badges.find(b => b.badge_key === badgeKey);
    if (existing) return existing;

    const newBadge = {
      id: `ub-${badgeKey}-${Date.now()}`,
      user_id: localStore.profile.id,
      badge_key: badgeKey,
      earned_at: new Date().toISOString(),
      seen_at: null
    };
    localStore.badges.push(newBadge);
    localStore.save('pf_badges', localStore.badges);
    return newBadge;
  },

  async markBadgeSeen(badgeKey) {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        const seenAt = new Date().toISOString();
        await supabase
          .from('user_badges')
          .update({ seen_at: seenAt })
          .eq('user_id', uid)
          .eq('badge_key', badgeKey);

        const { data } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', uid);
        return data || [];
      } catch {}
    }
    // Local fallback
    const badge = localStore.badges.find(b => b.badge_key === badgeKey);
    if (badge && !badge.seen_at) {
      badge.seen_at = new Date().toISOString();
      localStore.save('pf_badges', localStore.badges);
    }
    return localStore.badges;
  },

  // ── Weight Logs ──

  async getWeightLogs() {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', uid)
          .order('day', { ascending: true });
        if (!error && data) {
          return data.map(d => ({
            ...d,
            weightKg: Number(d.weight_kg),
            date: d.logged_at || d.day
          }));
        }
      } catch {}
    }
    return localStore.weightLogs.map(d => ({
      ...d,
      weightKg: Number(d.weight_kg),
      date: d.date || d.day
    }));
  },

  async addWeightLog({ weightKg, day = formatLocalDate(), notes = '' }) {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        const { data: newLog, error } = await supabase
          .from('weight_logs')
          .insert({ user_id: uid, weight_kg: Number(weightKg), day, notes })
          .select()
          .single();

        if (!error && newLog) {
          // Update current weight in profile
          await supabase
            .from('profiles')
            .update({ current_weight_kg: Number(weightKg) })
            .eq('id', uid);

          return {
            ...newLog,
            weightKg: Number(newLog.weight_kg),
            date: newLog.logged_at || newLog.day
          };
        }
      } catch {}
    }

    // Local fallback
    const newLog = {
      id: `wlog-${Date.now()}`,
      user_id: localStore.profile.id,
      weight_kg: Number(weightKg),
      weightKg: Number(weightKg),
      day,
      date: new Date().toISOString(),
      notes
    };

    localStore.weightLogs.push(newLog);
    localStore.weightLogs.sort((a, b) => new Date(a.day) - new Date(b.day));
    localStore.save('pf_weight_logs', localStore.weightLogs);
    localStore.profile.current_weight_kg = Number(weightKg);
    localStore.save('pf_profile', localStore.profile);

    return newLog;
  },

  async deleteWeightLog(id) {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        await supabase.from('weight_logs').delete().eq('id', id);

        // Re-fetch remaining logs
        const { data: remaining } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', uid)
          .order('day', { ascending: true });

        if (remaining && remaining.length > 0) {
          const latest = remaining[remaining.length - 1];
          await supabase
            .from('profiles')
            .update({ current_weight_kg: Number(latest.weight_kg) })
            .eq('id', uid);
        }

        return (remaining || []).map(d => ({
          ...d,
          weightKg: Number(d.weight_kg),
          date: d.logged_at || d.day
        }));
      } catch {}
    }

    // Local fallback
    localStore.weightLogs = localStore.weightLogs.filter(l => l.id !== id);
    localStore.save('pf_weight_logs', localStore.weightLogs);

    if (localStore.weightLogs.length > 0) {
      const latest = localStore.weightLogs[localStore.weightLogs.length - 1];
      localStore.profile.current_weight_kg = Number(latest.weight_kg);
      localStore.save('pf_profile', localStore.profile);
    }

    return localStore.weightLogs;
  },

  // ── Privacy & Account Deletion ──

  async deleteAccount() {
    if (await this._shouldUseSupabase()) {
      try {
        const uid = await getAuthUserId();
        if (uid) {
          await supabase.from('weight_logs').delete().eq('user_id', uid);
          await supabase.from('mission_completions').delete().eq('user_id', uid);
          await supabase.from('user_badges').delete().eq('user_id', uid);
          await supabase.from('streak_freeze_uses').delete().eq('user_id', uid);
          await supabase.from('streaks').delete().eq('user_id', uid);
          await supabase.from('profiles').delete().eq('id', uid);
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.error('deleteAccount supabase error:', err);
      }
    }

    try {
      const keys = ['pf_profile', 'pf_weight_logs', 'pf_completions', 'pf_badges', 'pf_streak', 'pf_freeze_uses'];
      keys.forEach(k => localStorage.removeItem(k));
    } catch {}
  }
};

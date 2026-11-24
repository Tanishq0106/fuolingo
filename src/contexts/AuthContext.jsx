import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (mounted) {
        setSession(s);
        setUser(s?.user ?? null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);

        // On first sign-up, create a profile row
        if (event === 'SIGNED_IN' && newSession?.user) {
          await ensureProfileExists(newSession.user);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Ensure a profile row exists for the user
  async function ensureProfileExists(authUser) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!error && !data) {
        // Create profile on first login
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const displayName = authUser.user_metadata?.display_name || 'Athlete';

        await supabase.from('profiles').insert({
          id: authUser.id,
          email: authUser.email,
          display_name: displayName,
          timezone,
          start_weight_kg: 75.0,
          target_weight_kg: 70.0,
          current_weight_kg: 75.0,
          goal: 'fat_loss',
        });

        // Create initial streak row
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        await supabase.from('streaks').insert({
          user_id: authUser.id,
          current_streak: 0,
          longest_streak: 0,
          freezes_available: 1,
          last_freeze_grant: monthStr,
          last_active_day: null,
        });
      }
    } catch (err) {
      console.error('Profile creation error:', err);
    }
  }

  const signUp = useCallback(async ({ email, password, displayName }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || 'Athlete',
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      return { error };
    }

    return { data };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      return { error };
    }

    return { data };
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
    }
    // Clear local demo data on sign-out
    try {
      const keysToRemove = ['pf_profile', 'pf_weight_logs', 'pf_completions', 'pf_badges', 'pf_streak', 'pf_freeze_uses'];
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  const value = {
    user,
    session,
    loading,
    authError,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

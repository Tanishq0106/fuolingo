import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Home from './pages/Home.jsx';
import Log from './pages/Log.jsx';
import Profile from './pages/Profile.jsx';
import Workouts from './pages/Workouts.jsx';
import Coach from './pages/Coach.jsx';
import Contact from './pages/Contact.jsx';
import Privacy from './pages/Privacy.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AnalyticsScript, SiteMeta, track } from './components/SiteMeta.jsx';
import { ToastProvider, useToast } from './components/ToastProvider.jsx';
import { ConfettiProvider } from './components/Confetti.jsx';
import { CelebrationProvider, useCelebrations } from './hooks/useCelebrations.jsx';
import { useBadges } from './hooks/useBadges.js';
import { api } from './services/supabase.js';
import {
  formatLocalDate,
  formatYearMonth,
  calculateStreak,
  checkMonthlyFreezeGrant,
  evaluateMissedDays
} from './utils/streak.js';
import { milestoneInfo } from './utils/milestones.js';
import {
  STREAK_QUALIFY_COUNT,
  DAILY_MISSION_COUNT,
  MAX_FREEZES,
  FREEZE_MILESTONE_REWARDS
} from './constants.js';

// ── Auth Gate ────────────────────────────────────────────
// Shows Login/Signup when not authenticated, otherwise the main app.

function PublicPageGate({ page }) {
  const [currentPage, setCurrentPage] = useState(page);
  const navigate = (next) => {
    setCurrentPage(next);
    window.history.pushState({}, '', next === 'privacy' ? '/privacy' : next === 'contact' ? '/contact' : '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return <div className="min-h-screen bg-background text-slate-100"><SiteMeta page={currentPage} /><header className="border-b border-white/5 bg-background/80 px-4 py-4"><div className="mx-auto flex max-w-5xl items-center justify-between"><a href="/" className="text-xl font-extrabold text-white">Fuo<span className="text-accent">lingo</span></a><a href="/" className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-slate-950">Back to Fuolingo</a></div></header><main>{currentPage === 'privacy' ? <Privacy onNavigate={navigate} /> : <Contact onNavigate={navigate} />}</main></div>;
}

function PublicMarketingGate({ onLaunch }) {
  return <div className="min-h-screen bg-background text-slate-100"><SiteMeta page="landing" /><header className="border-b border-white/5 bg-background/80 px-4 py-4"><div className="mx-auto flex max-w-7xl items-center justify-between"><a href="/" className="text-xl font-extrabold text-white">Fuo<span className="text-accent">lingo</span></a><button type="button" onClick={onLaunch} className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-slate-950">Start free</button></div></header><LandingPage onLaunchApp={onLaunch} /></div>;
}

function AuthGate() {
  const { isAuthenticated, loading, signOut } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const [demoMode, setDemoMode] = useState(false);
  const publicPath = window.location.pathname;

  // If loading auth state, show a branded loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent to-emerald-400 text-slate-950 mb-4 shadow-accent-glow animate-pulse-slow">
            <svg className="w-9 h-9 fill-slate-950" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium">Loading Fuolingo…</p>
        </div>
      </div>
    );
  }

  if (publicPath === '/contact' || publicPath === '/privacy') {
    return <PublicPageGate page={publicPath.slice(1)} />;
  }

  if (publicPath === '/' && authView === 'login') {
    return <PublicMarketingGate onLaunch={() => setAuthView('signup')} />;
  }

  // Demo mode — launch the full app without auth
  if (demoMode) {
    api.setDemoMode(true);
    return (
      <FuolingoMain
        isDemoMode={true}
        onExitDemo={() => {
          setDemoMode(false);
          api.setDemoMode(false);
        }}
      />
    );
  }

  // Authenticated — show main app
  if (isAuthenticated) {
    api.setDemoMode(false);
    return (
      <FuolingoMain
        isDemoMode={false}
        onSignOut={signOut}
      />
    );
  }

  // Not authenticated — show login or signup
  if (authView === 'signup') {
    return (
      <Signup
        onSwitchToLogin={() => setAuthView('login')}
        onDemoMode={() => setDemoMode(true)}
      />
    );
  }

  return (
    <Login
      onSwitchToSignup={() => setAuthView('signup')}
      onDemoMode={() => setDemoMode(true)}
    />
  );
}

// ── Main App ─────────────────────────────────────────────

function FuolingoMain({ isDemoMode = false, onSignOut, onExitDemo }) {
  const initialPage = ({ '/dashboard': 'home', '/coach': 'coach', '/workouts': 'workouts', '/weight-log': 'log', '/profile': 'profile', '/contact': 'contact', '/privacy': 'privacy' }[window.location.pathname] || 'landing');
  const [activePage, setActivePage] = useState(initialPage);
  const [profile, setProfile] = useState({});
  const [completions, setCompletions] = useState([]);
  const [streakState, setStreakState] = useState({
    current_streak: 0,
    longest_streak: 0,
    freezes_available: 1,
    last_freeze_grant: formatYearMonth(),
    last_active_day: null
  });
  const [frozenDays, setFrozenDays] = useState(new Set());
  const [weightLogs, setWeightLogs] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const { celebrate } = useCelebrations();
  const { showToast } = useToast();
  const todayStr = useMemo(() => formatLocalDate(), []);
  const seoPage = activePage === 'home' ? 'home' : activePage;

  useEffect(() => {
    const pagePath = { landing: '/', home: '/dashboard', coach: '/coach', workouts: '/workouts', log: '/weight-log', profile: '/profile', contact: '/contact', privacy: '/privacy' }[activePage] || '/';
    if (window.location.pathname !== pagePath) window.history.pushState({ page: activePage }, '', pagePath);
    track('page_view', { page_path: pagePath, page_title: document.title });
  }, [activePage]);

  // Compute completions grouped by day
  const countsByDay = useMemo(() => {
    const map = {};
    for (const c of completions) {
      map[c.day] = (map[c.day] ?? 0) + 1;
    }
    return map;
  }, [completions]);

  // Completions for today
  const todayCompletions = useMemo(() => {
    return completions.filter(c => c.day === todayStr);
  }, [completions, todayStr]);

  // Total stats for badges
  const stats = useMemo(() => {
    const totalMissions = completions.length;
    const workouts = completions.filter(c => c.mission_key === 'workout').length;
    const longestStreak = streakState.longest_streak ?? 0;
    
    const startKg = profile.start_weight_kg || 84.0;
    const currentKg = profile.current_weight_kg || 79.8;
    const targetKg = profile.target_weight_kg || 72.0;
    const goal = profile.goal || 'fat_loss';
    const mInfo = milestoneInfo({ startKg, currentKg, targetKg, goal });

    return {
      totalMissions,
      longestStreak,
      workouts,
      kgProgress: mInfo.kgProgress
    };
  }, [completions, streakState, profile]);

  // Badges hook
  const handleNewBadgeAwarded = useCallback((badgeKey) => {
    if (FREEZE_MILESTONE_REWARDS[badgeKey]) {
      const rewardAmount = FREEZE_MILESTONE_REWARDS[badgeKey];
      setStreakState(prev => {
        const updated = {
          ...prev,
          freezes_available: Math.min(MAX_FREEZES, (prev.freezes_available || 0) + rewardAmount)
        };
        api.saveStreakState(updated);
        celebrate([{ type: 'freeze_earned' }]);
        return updated;
      });
    }
  }, [celebrate]);

  const { userBadges, checkAndAwardBadges, markBadgeSeen } = useBadges({
    stats,
    onNewBadgeAwarded: handleNewBadgeAwarded
  });

  // Initial Load & Lazy Freeze Application
  useEffect(() => {
    let active = true;

    async function initializeApp() {
      try {
        const [prof, compl, strk, frzUses, wLogs] = await Promise.all([
          api.getProfile(),
          api.getCompletions(),
          api.getStreakState(),
          api.getFreezeUses(),
          api.getWeightLogs()
        ]);

        if (!active) return;

        setProfile(prof);
        setCompletions(compl);
        setWeightLogs(wLogs);

        const currentFrozenSet = new Set(frzUses);
        let updatedFreezes = strk.freezes_available ?? 1;
        let lastGrantMonth = strk.last_freeze_grant;
        const eventsToCelebrate = [];

        // 1. Monthly grant check
        const currentMonth = formatYearMonth();
        const monthlyCheck = checkMonthlyFreezeGrant(updatedFreezes, lastGrantMonth, currentMonth);
        if (monthlyCheck.granted) {
          updatedFreezes = monthlyCheck.newFreezes;
          lastGrantMonth = monthlyCheck.updatedMonth;
          eventsToCelebrate.push({ type: 'freeze_earned' });
        }

        // Group completions by day
        const dayCounts = {};
        for (const c of compl) {
          dayCounts[c.day] = (dayCounts[c.day] ?? 0) + 1;
        }

        // 2. Evaluate missed days
        const missedCheck = evaluateMissedDays({
          countsByDay: dayCounts,
          frozenDays: currentFrozenSet,
          freezesAvailable: updatedFreezes,
          lastActiveDay: strk.last_active_day,
          todayStr
        });

        for (const day of missedCheck.newFrozenDays) {
          currentFrozenSet.add(day);
          await api.recordFreezeUse(day);
          eventsToCelebrate.push({ type: 'freeze_used', streak: strk.current_streak });
        }

        updatedFreezes = missedCheck.remainingFreezes;
        setFrozenDays(currentFrozenSet);

        // 3. Derive streak
        const streakCalc = calculateStreak({
          countsByDay: dayCounts,
          frozenDays: currentFrozenSet,
          todayStr,
          qualifyCount: STREAK_QUALIFY_COUNT
        });

        const newCurrent = streakCalc.currentStreak;
        const newLongest = Math.max(strk.longest_streak || 0, newCurrent);

        const finalStreakState = {
          ...strk,
          current_streak: newCurrent,
          longest_streak: newLongest,
          freezes_available: updatedFreezes,
          last_freeze_grant: lastGrantMonth,
          last_active_day: streakCalc.qualifiesToday ? todayStr : strk.last_active_day
        };

        setStreakState(finalStreakState);
        await api.saveStreakState(finalStreakState);

        if (eventsToCelebrate.length > 0) {
          celebrate(eventsToCelebrate);
        }

        setIsInitialized(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setIsInitialized(true);
      }
    }

    initializeApp();

    return () => {
      active = false;
    };
  }, [todayStr, celebrate]);

  // Toggle mission completion handler with Optimistic Rollback
  const handleToggleMission = useCallback(async (missionKey) => {
    const backupCompletions = [...completions];
    const backupStreakState = { ...streakState };

    const todayCompletedCountBefore = todayCompletions.length;
    const isQualifyingBefore = todayCompletedCountBefore >= STREAK_QUALIFY_COUNT;
    const isPerfectBefore = todayCompletedCountBefore === DAILY_MISSION_COUNT;

    try {
      const { isCompletedNow, completions: updatedCompletions } = await api.toggleMission(missionKey, todayStr);
      setCompletions(updatedCompletions);

      const updatedToday = updatedCompletions.filter(c => c.day === todayStr);
      const todayCompletedCountAfter = updatedToday.length;

      const updatedCounts = {};
      for (const c of updatedCompletions) {
        updatedCounts[c.day] = (updatedCounts[c.day] ?? 0) + 1;
      }

      const { currentStreak, qualifiesToday } = calculateStreak({
        countsByDay: updatedCounts,
        frozenDays,
        todayStr,
        qualifyCount: STREAK_QUALIFY_COUNT
      });

      const newLongest = Math.max(streakState.longest_streak || 0, currentStreak);
      const newStreakState = {
        ...streakState,
        current_streak: currentStreak,
        longest_streak: newLongest,
        last_active_day: qualifiesToday ? todayStr : streakState.last_active_day
      };

      setStreakState(newStreakState);
      await api.saveStreakState(newStreakState);

      const eventsToTrigger = [];

      if (!isQualifyingBefore && todayCompletedCountAfter >= STREAK_QUALIFY_COUNT) {
        eventsToTrigger.push({ type: 'streak_locked', streak: currentStreak });
      }

      if (!isPerfectBefore && todayCompletedCountAfter === DAILY_MISSION_COUNT) {
        eventsToTrigger.push({ type: 'perfect_day' });
      }

      const currentStats = {
        totalMissions: updatedCompletions.length,
        workouts: updatedCompletions.filter(c => c.mission_key === 'workout').length,
        longestStreak: newLongest,
        kgProgress: stats.kgProgress
      };

      const newlyAwardedBadges = await checkAndAwardBadges(currentStats);
      for (const b of newlyAwardedBadges) {
        eventsToTrigger.push({ type: 'badge_unlocked', title: b.badge_key });
      }

      if (eventsToTrigger.length > 0) {
        celebrate(eventsToTrigger);
      }
    } catch (err) {
      console.error('Mission toggle error, rolling back:', err);
      // Rollback to prior state
      setCompletions(backupCompletions);
      setStreakState(backupStreakState);
      showToast({
        message: 'Could not sync mission changes with server. Rolled back.',
        type: 'streak'
      });
    }
  }, [
    completions,
    todayCompletions,
    todayStr,
    frozenDays,
    streakState,
    stats.kgProgress,
    checkAndAwardBadges,
    celebrate,
    showToast
  ]);

  const handleCompleteWorkout = useCallback(async () => {
    const alreadyDone = todayCompletions.some(c => c.mission_key === 'workout');
    if (!alreadyDone) {
      await handleToggleMission('workout');
    }
  }, [todayCompletions, handleToggleMission]);

  const handleAddWater = useCallback(async () => {
    const alreadyDone = todayCompletions.some(c => c.mission_key === 'water');
    if (!alreadyDone) {
      await handleToggleMission('water');
    }
  }, [todayCompletions, handleToggleMission]);

  // Add weight log with validation and rollback
  const handleAddWeightLog = useCallback(async (newLogData) => {
    const previousLogs = [...weightLogs];
    const previousCurrentWeight = profile.current_weight_kg;

    try {
      const created = await api.addWeightLog(newLogData);
      setWeightLogs(prev => [...prev, created]);
      setProfile(prev => ({ ...prev, current_weight_kg: created.weightKg }));

      const mInfo = milestoneInfo({
        startKg: profile.start_weight_kg || 84.0,
        currentKg: created.weightKg,
        targetKg: profile.target_weight_kg || 72.0,
        goal: profile.goal || 'fat_loss'
      });

      const updatedStats = { ...stats, kgProgress: mInfo.kgProgress };

      const newBadges = await checkAndAwardBadges(updatedStats);
      if (newBadges.length > 0) {
        celebrate(newBadges.map(b => ({ type: 'badge_unlocked', title: b.badge_key })));
      }
    } catch (err) {
      console.error('Add weight log failed, rolling back:', err);
      setWeightLogs(previousLogs);
      setProfile(prev => ({ ...prev, current_weight_kg: previousCurrentWeight }));
      showToast({ message: 'Failed to record weigh-in. Changes rolled back.' });
    }
  }, [weightLogs, profile, stats, checkAndAwardBadges, celebrate, showToast]);

  const handleDeleteWeightLog = useCallback(async (id) => {
    const remaining = await api.deleteWeightLog(id);
    setWeightLogs(remaining);
  }, []);

  const handleUpdateProfile = useCallback(async (updates) => {
    const updated = await api.updateProfile(updates);
    setProfile(updated);
    showToast({ message: 'Profile & goals updated! ✨' });
  }, [showToast]);

  // Data Portability & Export
  const handleExportData = useCallback(() => {
    const exportArchive = {
      app: 'Fuolingo',
      version: '1.0',
      exported_at: new Date().toISOString(),
      user: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        timezone: profile.timezone,
        stats
      },
      data: {
        profile,
        streaks: streakState,
        completions,
        weightLogs,
        badges: userBadges,
        frozenDays: Array.from(frozenDays)
      }
    };

    const blob = new Blob([JSON.stringify(exportArchive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuolingo-health-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast({ message: 'Personal health data export downloaded! 📁' });
  }, [profile, streakState, stats, completions, weightLogs, userBadges, frozenDays, showToast]);

  // Delete Account
  const handleDeleteAccount = useCallback(async () => {
    try {
      await api.deleteAccount();
      showToast({ message: 'Your account and health data have been permanently deleted.' });
      if (onSignOut) {
        onSignOut();
      } else if (onExitDemo) {
        onExitDemo();
      }
    } catch (err) {
      console.error('Account deletion error:', err);
      showToast({ message: 'Could not complete deletion. Please try again.' });
    }
  }, [onSignOut, onExitDemo, showToast]);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-accent selection:text-slate-950">
      <SiteMeta page={seoPage} />
      <Navbar
        currentStreak={streakState.current_streak ?? 0}
        freezesAvailable={streakState.freezes_available ?? 1}
        plan={profile.subscription_plan || 'free'}
        activePage={activePage}
        onNavigate={(pageId) => {
          setActivePage(pageId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDemoMode={isDemoMode}
        onSignOut={onSignOut}
        onExitDemo={onExitDemo}
      />

      <main className="flex-1">
        {activePage === 'landing' && (
          <LandingPage onLaunchApp={(page) => setActivePage(page || 'home')} />
        )}

        {activePage === 'home' && (
          <Home
            profile={profile}
            streakState={streakState}
            countsByDay={countsByDay}
            frozenDays={frozenDays}
            todayStr={todayStr}
            todayCompletions={todayCompletions}
            userBadges={userBadges}
            stats={stats}
            onToggleMission={handleToggleMission}
            onNavigate={setActivePage}
            onAddWater={handleAddWater}
          />
        )}

        {activePage === 'workouts' && (
          <Workouts onCompleteWorkout={handleCompleteWorkout} />
        )}

        {activePage === 'log' && (
          <Log
            weightLogs={weightLogs}
            profile={profile}
            onAddLog={handleAddWeightLog}
            onDeleteLog={handleDeleteWeightLog}
          />
        )}

        {activePage === 'coach' && (
          <Coach
            profile={profile}
            stats={stats}
            streakState={streakState}
            isDemoMode={isDemoMode}
            onNavigate={setActivePage}
          />
        )}

        {activePage === 'contact' && <Contact onNavigate={setActivePage} />}

        {activePage === 'privacy' && <Privacy onNavigate={setActivePage} />}

        {activePage === 'profile' && (
          <Profile
            profile={profile}
            streakState={streakState}
            userBadges={userBadges}
            stats={stats}
            onUpdateProfile={handleUpdateProfile}
            onBadgeSeen={markBadgeSeen}
            onExportData={handleExportData}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>
    </div>
  );
}

// ── Root App Component ───────────────────────────────────

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <ConfettiProvider>
            <CelebrationProvider>
              <AnalyticsScript />
              <AuthGate />
            </CelebrationProvider>
          </ConfettiProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

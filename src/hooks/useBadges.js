import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/supabase.js';
import { evaluateBadges } from '../utils/badges.js';
import { FREEZE_MILESTONE_REWARDS } from '../constants.js';

export function useBadges({ stats, onNewBadgeAwarded = () => {} }) {
  const [userBadges, setUserBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch badges on mount
  useEffect(() => {
    let mounted = true;
    async function loadBadges() {
      try {
        const badges = await api.getUserBadges();
        if (mounted) {
          setUserBadges(badges);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load user badges:', err);
        if (mounted) setIsLoading(false);
      }
    }
    loadBadges();
    return () => {
      mounted = false;
    };
  }, []);

  // Evaluates and awards any newly qualified badges
  const checkAndAwardBadges = useCallback(async (currentStats) => {
    const statsToUse = currentStats || stats;
    const earnedKeys = userBadges.map(b => b.badge_key);
    const newBadgeKeys = evaluateBadges(statsToUse, earnedKeys);

    if (newBadgeKeys.length === 0) return [];

    const newlyAwarded = [];
    for (const key of newBadgeKeys) {
      const awarded = await api.awardBadge(key);
      if (awarded) {
        newlyAwarded.push(awarded);
        onNewBadgeAwarded(key);
      }
    }

    if (newlyAwarded.length > 0) {
      setUserBadges(prev => [...prev, ...newlyAwarded]);
    }

    return newlyAwarded;
  }, [userBadges, stats, onNewBadgeAwarded]);

  // Mark badge seen
  const markBadgeSeen = useCallback(async (badgeKey) => {
    await api.markBadgeSeen(badgeKey);
    setUserBadges(prev =>
      prev.map(b => (b.badge_key === badgeKey ? { ...b, seen_at: new Date().toISOString() } : b))
    );
  }, []);

  return {
    userBadges,
    isLoading,
    checkAndAwardBadges,
    markBadgeSeen
  };
}

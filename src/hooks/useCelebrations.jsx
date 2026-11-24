import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useToast } from '../components/ToastProvider.jsx';
import { useConfetti } from '../components/Confetti.jsx';
import { formatLocalDate } from '../utils/streak.js';

const CelebrationContext = createContext(null);

export function CelebrationProvider({ children }) {
  const { toast } = useToast();
  const { burst } = useConfetti();
  const queueTimeoutRef = useRef(null);

  /**
   * Evaluates and dispatches an array of celebration events
   * @param {Array<{ type: string, [key: string]: any }>} events
   * @param {string} [todayStr]
   */
  const celebrate = useCallback((events = [], todayStr = formatLocalDate()) => {
    if (!events || events.length === 0) return;

    const storageKey = `pf_celebrated_${todayStr}`;
    const celebratedState = JSON.parse(localStorage.getItem(storageKey) || '{"streak": false, "perfect": false}');
    const toastsToQueue = [];

    for (const evt of events) {
      if (evt.type === 'streak_locked') {
        if (!celebratedState.streak) {
          celebratedState.streak = true;
          toastsToQueue.push({
            message: `Day ${evt.streak} streak locked in! 🔥`,
            toastType: 'success',
            confettiIntensity: 'normal'
          });
        }
      } else if (evt.type === 'perfect_day') {
        if (!celebratedState.perfect) {
          celebratedState.perfect = true;
          toastsToQueue.push({
            message: 'Perfect day! All 4 missions done 🎯',
            toastType: 'success',
            confettiIntensity: 'large'
          });
        }
      } else if (evt.type === 'badge_unlocked') {
        toastsToQueue.push({
          message: `Badge unlocked: ${evt.title}`,
          toastType: 'success',
          confettiIntensity: 'small'
        });
      } else if (evt.type === 'freeze_used') {
        toastsToQueue.push({
          message: `Streak freeze used. Your ${evt.streak}-day streak is safe 🛡️`,
          toastType: 'info',
          confettiIntensity: null
        });
      } else if (evt.type === 'freeze_earned') {
        toastsToQueue.push({
          message: 'You earned a streak freeze 🛡️',
          toastType: 'info',
          confettiIntensity: null
        });
      }
    }

    // Persist updated celebrated state
    localStorage.setItem(storageKey, JSON.stringify(celebratedState));

    // Stagger toasts with ~600ms gap
    toastsToQueue.forEach((item, index) => {
      setTimeout(() => {
        toast({ message: item.message, type: item.toastType });
        if (item.confettiIntensity) {
          burst({ intensity: item.confettiIntensity });
        }
      }, index * 600);
    });
  }, [toast, burst]);

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
    </CelebrationContext.Provider>
  );
}

export function useCelebrations() {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebrations must be used within a CelebrationProvider');
  }
  return context;
}

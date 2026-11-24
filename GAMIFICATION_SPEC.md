# Fuolingo — Gamification & Engagement Spec ("Duolingo for Fitness" core)

> Companion to `SPEC.md`. Read `SPEC.md` first (design tokens, rules for the coding agent, data model). If the two files disagree, **this file wins for gamification topics** and `SPEC.md` should be updated to match (see section 11).

---

## 1. Purpose and principles

The core loop is: **do a mission → get instant feedback → build a streak → unlock rewards → come back tomorrow.** Four features strengthen that loop:

| # | Feature | Where | Why it matters |
|---|---|---|---|
| A | Trophy case / badges | `/profile`, `/home` | Visible goals and a sense of collection |
| B | Micro-celebrations | anywhere a mission is ticked | Immediate reward for the habit action |
| C | Streak freeze | `/home` (StreakCard), `/profile` | Life happens; one missed day should not erase weeks of effort |
| D | Weight progression chart | `/log` | Makes slow progress visible |

**Principles**
1. **Reward effort, never punish.** No guilt messages, no shaming copy. A broken streak says "Start a new streak today".
2. **Celebrate once, on action.** Celebrations fire only when the user's own action causes a change. Never on page load, refresh, or navigation.
3. **Subtle, dark-theme friendly.** Short animations (under 2 seconds), accent-colored, no sound, no full-screen blocking.
4. **Accessible.** Respect `prefers-reduced-motion`. Never rely on color alone (icons and text for locked vs unlocked). Toasts are announced to screen readers.
5. **Safe and honest.** Do not encourage unhealthy behavior: no rewards for extreme weight loss speed, and the weight chart must never push the user toward unsafe targets.
6. **No new dependencies.** Confetti and charts are built with a small canvas component and plain SVG. Do not install chart or confetti libraries.

---

## 2. Shared constants (`src/constants.js`)

```js
// Streak rules
export const STREAK_QUALIFY_COUNT = 3;      // missions needed in a day to count toward the streak
export const DAILY_MISSION_COUNT = 4;       // total missions per day (workout, water, calories, sleep)

// Streak freeze rules
export const MAX_FREEZES = 2;               // inventory cap
export const MONTHLY_FREEZE_GRANT = 1;      // granted on first app open of each calendar month
export const FREEZE_MILESTONE_REWARDS = {   // granted when the badge is earned
  streak_7: 1,
  streak_30: 1,
};
export const FREEZE_COVERS = 'below_threshold'; // 'below_threshold' | 'zero_only'

// Weight chart
export const MILESTONE_STEP_KG = 1;         // one milestone per kg of progress
export const CHART_DEFAULT_RANGE_DAYS = 90;

// Celebration
export const TOAST_DURATION_MS = 4000;
export const CONFETTI_DURATION_MS = 1800;
export const CONFETTI_MAX_PARTICLES = 80;
```

### 2.1 Badge catalog

```js
export const BADGES = [
  { key: 'first_mission',  title: 'First Step',      icon: 'spark',    metric: 'totalMissions', target: 1,
    description: 'Complete your first daily mission.',   requirement: 'Complete 1 mission' },
  { key: 'streak_3',       title: 'On a Roll',       icon: 'flame',    metric: 'longestStreak', target: 3,
    description: 'Reach a 3-day streak.',                requirement: 'Hit a 3-day streak' },
  { key: 'streak_7',       title: 'Week Warrior',    icon: 'calendar', metric: 'longestStreak', target: 7,
    description: 'Reach a 7-day streak.',                requirement: 'Hit a 7-day streak' },
  { key: 'streak_30',      title: 'Unstoppable',     icon: 'crown',    metric: 'longestStreak', target: 30,
    description: 'Reach a 30-day streak.',               requirement: 'Hit a 30-day streak' },
  { key: 'first_kg',       title: 'First Kilo',      icon: 'scale',    metric: 'kgProgress',    target: 1,
    description: 'Move 1 kg toward your target weight.', requirement: 'Move 1 kg toward your target' },
  { key: 'five_workouts',  title: 'Getting Strong',  icon: 'dumbbell', metric: 'workouts',      target: 5,
    description: 'Complete 5 workout missions.',         requirement: 'Complete 5 workouts' },
];
```

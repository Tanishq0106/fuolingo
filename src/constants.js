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

// Badges catalog
export const BADGES = [
  {
    key: 'first_mission',
    title: 'First Step',
    icon: 'spark',
    metric: 'totalMissions',
    target: 1,
    description: 'Complete your first daily mission.',
    requirement: 'Complete 1 mission'
  },
  {
    key: 'streak_3',
    title: 'On a Roll',
    icon: 'flame',
    metric: 'longestStreak',
    target: 3,
    description: 'Reach a 3-day streak.',
    requirement: 'Hit a 3-day streak'
  },
  {
    key: 'streak_7',
    title: 'Week Warrior',
    icon: 'calendar',
    metric: 'longestStreak',
    target: 7,
    description: 'Reach a 7-day streak.',
    requirement: 'Hit a 7-day streak'
  },
  {
    key: 'streak_30',
    title: 'Unstoppable',
    icon: 'crown',
    metric: 'longestStreak',
    target: 30,
    description: 'Reach a 30-day streak.',
    requirement: 'Hit a 30-day streak'
  },
  {
    key: 'first_kg',
    title: 'First Kilo',
    icon: 'scale',
    metric: 'kgProgress',
    target: 1,
    description: 'Move 1 kg toward your target weight.',
    requirement: 'Move 1 kg toward your target'
  },
  {
    key: 'five_workouts',
    title: 'Getting Strong',
    icon: 'dumbbell',
    metric: 'workouts',
    target: 5,
    description: 'Complete 5 workout missions.',
    requirement: 'Complete 5 workouts'
  },
];

// Daily missions list
export const DEFAULT_MISSIONS = [
  {
    key: 'workout',
    title: 'Daily Training Session',
    subtitle: 'Hit 30+ min of workout or active movement',
    icon: 'dumbbell',
    category: 'Exercise',
    xp: 50
  },
  {
    key: 'calories',
    title: 'Nutrition & Calorie Target',
    subtitle: 'Stay within ±10% of your daily calorie goal',
    icon: 'apple',
    category: 'Nutrition',
    xp: 35
  },
  {
    key: 'water',
    title: 'Hydration Target (2.5L)',
    subtitle: 'Drink at least 2,500ml of water throughout the day',
    icon: 'droplet',
    category: 'Hydration',
    xp: 25
  },
  {
    key: 'sleep',
    title: 'Recovery & Sleep (7.5h+)',
    subtitle: 'Hit restorative 7.5+ hours of sleep',
    icon: 'moon',
    category: 'Recovery',
    xp: 30
  }
];

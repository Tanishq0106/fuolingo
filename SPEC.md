# Fuolingo — Technical Specification & Architecture

> Fitness SaaS Website & Habit Engine ("Duolingo for Fitness" Core)

## 1. Overview & Vision
Fuolingo is a modern, high-conversion Fitness SaaS platform and daily habit engine engineered using behavioral psychology principles. Instead of cumbersome calorie counting and punitive streak mechanics, Fuolingo implements a rewarding habit loop:
$$\text{Do a mission} \longrightarrow \text{Instant feedback \& micro-celebration} \longrightarrow \text{Lock in streak} \longrightarrow \text{Unlock permanent trophies} \longrightarrow \text{Return tomorrow}$$

---

## 2. Design Tokens & Styling
Dark-theme friendly, sleek, modern SaaS aesthetic with energetic neon accents:
- **Background**: `#090D16` (Deep Obsidian)
- **Surface**: `#111827` / `#131B2E` (Card Dark Navy)
- **Border**: `rgba(255, 255, 255, 0.08)`
- **Accent (Primary)**: `#10E774` (Energetic Neon Lime)
- **Violet (Secondary)**: `#8B5CF6` (Electric Violet)
- **Streak**: `#F97316` (Fiery Orange)
- **Shield**: `#0EA5E9` (Protective Sky Blue)
- **Muted Text**: `#94A3B8` (Slate Muted)
- **Typography**: `Plus Jakarta Sans`, `Inter`, sans-serif

---

## 3. Data Model & Supabase Schema
The database schema is fully defined in [supabase/schema.sql](file:///c:/Users/Asus/OneDrive%20-%20K%20L%20University/Desktop/Fuolingo/supabase/schema.sql) with Row Level Security (RLS) enabled.

1. `profiles`: `id`, `email`, `display_name`, `avatar_url`, `timezone`, `start_weight_kg`, `target_weight_kg`, `current_weight_kg`, `goal` (`fat_loss` | `muscle_gain` | `stay_fit`).
2. `streaks`: `id`, `user_id`, `current_streak`, `longest_streak`, `last_active_day`, `freezes_available`, `last_freeze_grant`.
3. `streak_freeze_uses`: `id`, `user_id`, `day` (date), `created_at`. Unique constraint `(user_id, day)`.
4. `user_badges`: `id`, `user_id`, `badge_key`, `earned_at`, `seen_at`. Unique constraint `(user_id, badge_key)`.
5. `mission_completions`: `id`, `user_id`, `mission_key`, `day` (date), `created_at`. Unique constraint `(user_id, mission_key, day)`.
6. `weight_logs`: `id`, `user_id`, `weight_kg`, `day` (date), `notes`, `logged_at`.

---

## 4. Gamification & Engagement Core
*Refer to [GAMIFICATION_SPEC.md](file:///c:/Users/Asus/OneDrive%20-%20K%20L%20University/Desktop/Fuolingo/GAMIFICATION_SPEC.md) for detailed gamification specs.*

### A. Trophy Case & Badges Showcase
- **Catalog**: `first_mission`, `streak_3`, `streak_7`, `streak_30`, `first_kg`, `five_workouts`.
- **States**:
  - Unlocked: Accent-colored icon, soft glow, accent border, earned date.
  - Locked: Muted gray icon, lock glyph, requirement text, progress bar (`3 / 7`).
  - Unlocked & Unseen: "NEW" pill cleared when `BadgeDetailModal` opens.
- **Home Widget**: `TrophyWidget` renders up to 4 icons (up to 3 recent unlocked + closest locked badge).

### B. Micro-Celebrations
- **Events**:
  - `streak_locked`: User ticks 3rd mission -> "Day {n} streak locked in! 🔥" + Normal confetti.
  - `perfect_day`: User ticks 4th mission -> "Perfect day! All 4 missions done 🎯" + Large confetti.
  - `badge_unlocked`: New badge earned -> "Badge unlocked: {title}" + Small confetti.
  - `freeze_used`: Missed day covered -> "Streak freeze used. Your {n}-day streak is safe 🛡️".
  - `freeze_earned`: Monthly or milestone grant -> "You earned a streak freeze 🛡️".
- **Zero External Confetti/Chart Libraries**: Pure HTML5 Canvas confetti using `requestAnimationFrame`, reduced-motion check.

### C. Streak Freeze & Shields
- **Inventory**: `freezes_available` (0 to 2, starts at 1).
- **Monthly Grant**: +1 freeze on first open of new month.
- **Milestone Rewards**: `streak_7` grants +1 freeze; `streak_30` grants +1 freeze.
- **Derive-Then-Cache Streak**: Missed days covered by free streak freezes when available. Frozen days keep the streak alive but add 0 to the count.

### D. Weight Progression Chart (`/log`)
- Pure SVG line chart (`viewBox="0 0 800 320"`).
- Logged weight dots + 7-day moving average trend curve (Catmull-Rom to cubic Bezier curve).
- Dashed Start Weight line and Target Weight line.
- Next 1kg Milestone marker flag ("Next: 79.0 kg, 0.8 kg to go").
- Range selector: 30D / 90D / All.
- Collapsible "View all entries" table.

---

## 5. Application Structure
```
fuolingo/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── server/
│   ├── index.js                     (Express backend & static production server)
│   ├── testAcceptance.js            (19-point acceptance test suite)
│   └── testSupabase.js              (Supabase verification script)
├── supabase/
│   └── schema.sql                   (Supabase PostgreSQL migration & RLS)
└── src/
    ├── constants.js                 (Rules, badge catalog, missions)
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── utils/
    │   ├── badges.js                (Badge evaluation & closest locked badge)
    │   ├── streak.js                (Derive-then-cache streak & freeze evaluator)
    │   ├── milestones.js            (1kg milestone math)
    │   ├── chart.js                 (Pure SVG layout, scales, Catmull-Rom path)
    │   └── testGamification.js      (Pure math test script)
    ├── hooks/
    │   ├── useBadges.js             (Badge state & award listener)
    │   ├── useCelebrations.jsx      (Toast & confetti queue & once-per-day guard)
    │   └── useConfetti.jsx          (Canvas confetti hook)
    ├── services/
    │   └── supabase.js              (Supabase client + seamless local fallback store)
    ├── components/
    │   ├── Navbar.jsx               (Navigation, streak counter & shield pill)
    │   ├── StreakCard.jsx           (Flame counter, 7-day week dots & legend)
    │   ├── StreakShield.jsx         (Shield counter & tooltip)
    │   ├── ToastProvider.jsx        (Accessible toast container)
    │   ├── Confetti.jsx             (Canvas confetti component)
    │   ├── WeightChart.jsx          (Pure SVG line chart)
    │   └── badges/
    │       ├── BadgeIcon.jsx        (Inline SVG icons)
    │       ├── BadgeCard.jsx        (Interactive badge button)
    │       ├── BadgeGrid.jsx        (Profile badges grid)
    │       ├── BadgeDetailModal.jsx (Accessible modal with focus trap)
    │       └── TrophyWidget.jsx     (Home mini trophy widget)
    └── pages/
        ├── LandingPage.jsx          (Figma Fitness SaaS Marketing Landing Page)
        ├── Home.jsx                 (Fuolingo Dashboard with Missions & Streak)
        ├── Workouts.jsx             (Workout engine & Guided Routine player)
        ├── Log.jsx                  (Weight Chart & Collapsible Logs)
        └── Profile.jsx              (Trophy Case, Goals, and Shield Status)
```

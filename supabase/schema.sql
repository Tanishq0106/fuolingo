-- ==========================================================
-- Fuolingo Supabase Database Schema (Idempotent)
-- Safe to run multiple times in Supabase SQL Editor
-- ==========================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  display_name TEXT DEFAULT 'Athlete',
  avatar_url TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  start_weight_kg NUMERIC DEFAULT 84.0,
  target_weight_kg NUMERIC DEFAULT 72.0,
  current_weight_kg NUMERIC DEFAULT 79.8,
  goal TEXT DEFAULT 'fat_loss', -- 'fat_loss' | 'muscle_gain' | 'stay_fit'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Streaks Table
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active_day TEXT,
  freezes_available INT DEFAULT 1,
  last_freeze_grant TEXT, -- 'YYYY-MM'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT streaks_user_id_unique UNIQUE (user_id)
);

-- 3. Streak Freeze Uses
CREATE TABLE IF NOT EXISTS public.streak_freeze_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT streak_freeze_uses_user_day_unique UNIQUE (user_id, day)
);

-- 4. User Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  seen_at TIMESTAMPTZ,
  CONSTRAINT user_badges_user_badge_unique UNIQUE (user_id, badge_key)
);

-- 5. Mission Completions
CREATE TABLE IF NOT EXISTS public.mission_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_key TEXT NOT NULL,
  day DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT mission_completions_user_mission_day_unique UNIQUE (user_id, mission_key, day)
);

-- 6. Weight Logs
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  weight_kg NUMERIC NOT NULL,
  day DATE NOT NULL,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_freeze_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first to prevent 42710 "already exists" errors
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;
DROP POLICY IF EXISTS "Public streaks access" ON public.streaks;
DROP POLICY IF EXISTS "Public streak_freeze_uses access" ON public.streak_freeze_uses;
DROP POLICY IF EXISTS "Public user_badges access" ON public.user_badges;
DROP POLICY IF EXISTS "Public mission_completions access" ON public.mission_completions;
DROP POLICY IF EXISTS "Public weight_logs access" ON public.weight_logs;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can read own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can delete own streaks" ON public.streaks;

DROP POLICY IF EXISTS "Users can read own freeze uses" ON public.streak_freeze_uses;
DROP POLICY IF EXISTS "Users can insert own freeze uses" ON public.streak_freeze_uses;
DROP POLICY IF EXISTS "Users can delete own freeze uses" ON public.streak_freeze_uses;

DROP POLICY IF EXISTS "Users can read own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can insert own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can update own badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can delete own badges" ON public.user_badges;

DROP POLICY IF EXISTS "Users can read own completions" ON public.mission_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON public.mission_completions;
DROP POLICY IF EXISTS "Users can delete own completions" ON public.mission_completions;

DROP POLICY IF EXISTS "Users can read own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can insert own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can update own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can delete own weight logs" ON public.weight_logs;

-- ==========================================================
-- Hardened Auth-based RLS Policies
-- Ensures users can only access their own data: auth.uid() = user_id
-- ==========================================================

-- PROFILES
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- STREAKS
CREATE POLICY "Users can read own streaks"
  ON public.streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own streaks"
  ON public.streaks FOR DELETE
  USING (auth.uid() = user_id);

-- STREAK FREEZE USES
CREATE POLICY "Users can read own freeze uses"
  ON public.streak_freeze_uses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own freeze uses"
  ON public.streak_freeze_uses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own freeze uses"
  ON public.streak_freeze_uses FOR DELETE
  USING (auth.uid() = user_id);

-- USER BADGES
CREATE POLICY "Users can read own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own badges"
  ON public.user_badges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own badges"
  ON public.user_badges FOR DELETE
  USING (auth.uid() = user_id);

-- MISSION COMPLETIONS
CREATE POLICY "Users can read own completions"
  ON public.mission_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.mission_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON public.mission_completions FOR DELETE
  USING (auth.uid() = user_id);

-- WEIGHT LOGS
CREATE POLICY "Users can read own weight logs"
  ON public.weight_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight logs"
  ON public.weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight logs"
  ON public.weight_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight logs"
  ON public.weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================================
-- Safety Check Constraints
-- ==========================================================

ALTER TABLE public.weight_logs
  DROP CONSTRAINT IF EXISTS weight_logs_weight_positive;
ALTER TABLE public.weight_logs
  ADD CONSTRAINT weight_logs_weight_positive CHECK (weight_kg > 0 AND weight_kg < 500);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_start_weight_positive;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_start_weight_positive CHECK (start_weight_kg > 0 AND start_weight_kg < 500);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_target_weight_positive;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_target_weight_positive CHECK (target_weight_kg > 0 AND target_weight_kg < 500);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_current_weight_positive;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_current_weight_positive CHECK (current_weight_kg > 0 AND current_weight_kg < 500);

ALTER TABLE public.streaks
  DROP CONSTRAINT IF EXISTS streaks_current_nonneg;
ALTER TABLE public.streaks
  ADD CONSTRAINT streaks_current_nonneg CHECK (current_streak >= 0);

ALTER TABLE public.streaks
  DROP CONSTRAINT IF EXISTS streaks_longest_nonneg;
ALTER TABLE public.streaks
  ADD CONSTRAINT streaks_longest_nonneg CHECK (longest_streak >= 0);

ALTER TABLE public.streaks
  DROP CONSTRAINT IF EXISTS streaks_freezes_nonneg;
ALTER TABLE public.streaks
  ADD CONSTRAINT streaks_freezes_nonneg CHECK (freezes_available >= 0);

ALTER TABLE public.mission_completions
  DROP CONSTRAINT IF EXISTS mission_completions_valid_key;
ALTER TABLE public.mission_completions
  ADD CONSTRAINT mission_completions_valid_key
  CHECK (mission_key IN ('workout', 'calories', 'water', 'sleep'));

-- ==========================================================
-- Performance Indexes
-- ==========================================================

CREATE INDEX IF NOT EXISTS idx_mission_completions_user_day
  ON public.mission_completions (user_id, day);

CREATE INDEX IF NOT EXISTS idx_weight_logs_user_day
  ON public.weight_logs (user_id, day);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id
  ON public.user_badges (user_id);

CREATE INDEX IF NOT EXISTS idx_streak_freeze_uses_user_id
  ON public.streak_freeze_uses (user_id);

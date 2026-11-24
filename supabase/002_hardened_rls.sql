-- ==========================================================
-- Fuolingo Hardened RLS Migration
-- Run AFTER schema.sql in Supabase SQL Editor
-- Replaces open "USING (true)" policies with auth-based policies
-- ==========================================================

-- ============================================
-- 1. PROFILES — key change: id = auth.uid()
-- ============================================

-- Drop open policy
DROP POLICY IF EXISTS "Public profiles access" ON public.profiles;

-- Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (id must match auth.uid())
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile (for account deletion)
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);


-- ============================================
-- 2. STREAKS — user_id = auth.uid()
-- ============================================

DROP POLICY IF EXISTS "Public streaks access" ON public.streaks;

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


-- ============================================
-- 3. STREAK FREEZE USES — user_id = auth.uid()
-- ============================================

DROP POLICY IF EXISTS "Public streak_freeze_uses access" ON public.streak_freeze_uses;

CREATE POLICY "Users can read own freeze uses"
  ON public.streak_freeze_uses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own freeze uses"
  ON public.streak_freeze_uses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own freeze uses"
  ON public.streak_freeze_uses FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- 4. USER BADGES — user_id = auth.uid()
-- ============================================

DROP POLICY IF EXISTS "Public user_badges access" ON public.user_badges;

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


-- ============================================
-- 5. MISSION COMPLETIONS — user_id = auth.uid()
-- ============================================

DROP POLICY IF EXISTS "Public mission_completions access" ON public.mission_completions;

CREATE POLICY "Users can read own completions"
  ON public.mission_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON public.mission_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON public.mission_completions FOR DELETE
  USING (auth.uid() = user_id);


-- ============================================
-- 6. WEIGHT LOGS — user_id = auth.uid()
-- ============================================

DROP POLICY IF EXISTS "Public weight_logs access" ON public.weight_logs;

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


-- ============================================
-- 7. CHECK CONSTRAINTS (safety bounds)
-- ============================================

-- Weight must be positive and reasonable
ALTER TABLE public.weight_logs
  DROP CONSTRAINT IF EXISTS weight_logs_weight_positive;
ALTER TABLE public.weight_logs
  ADD CONSTRAINT weight_logs_weight_positive CHECK (weight_kg > 0 AND weight_kg < 500);

-- Profile weight bounds
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

-- Streak values cannot be negative
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

-- Mission key must be one of the known keys
ALTER TABLE public.mission_completions
  DROP CONSTRAINT IF EXISTS mission_completions_valid_key;
ALTER TABLE public.mission_completions
  ADD CONSTRAINT mission_completions_valid_key
  CHECK (mission_key IN ('workout', 'calories', 'water', 'sleep'));


-- ============================================
-- 8. PERFORMANCE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_mission_completions_user_day
  ON public.mission_completions (user_id, day);

CREATE INDEX IF NOT EXISTS idx_weight_logs_user_day
  ON public.weight_logs (user_id, day);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id
  ON public.user_badges (user_id);

CREATE INDEX IF NOT EXISTS idx_streak_freeze_uses_user_id
  ON public.streak_freeze_uses (user_id);

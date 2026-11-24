-- Fuolingo revenue + AI coach migration
-- Run after schema.sql. Safe to run more than once.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_plan_valid;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_plan_valid
  CHECK (subscription_plan IN ('free', 'pro', 'coach'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_status_valid;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_valid
  CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'paused'));

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'coach')),
  status TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT,
  provider_payment_id TEXT,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT subscriptions_user_unique UNIQUE (user_id)
);

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS provider_order_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.ai_daily_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INT NOT NULL DEFAULT 0 CHECK (message_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ai_daily_usage_user_day_unique UNIQUE (user_id, usage_date)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_daily_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own AI usage" ON public.ai_daily_usage;
CREATE POLICY "Users can read own AI usage"
  ON public.ai_daily_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_order
  ON public.subscriptions (provider_order_id);
CREATE INDEX IF NOT EXISTS idx_ai_daily_usage_user_date
  ON public.ai_daily_usage (user_id, usage_date);

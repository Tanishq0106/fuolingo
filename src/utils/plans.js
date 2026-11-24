export const PLAN_DETAILS = Object.freeze({
  free: {
    name: 'Starter',
    shortName: 'FREE',
    monthlyPrice: '₹0',
    annualPrice: '₹0',
    aiLimit: 1,
    description: 'Build the habit and preview your daily coach.'
  },
  pro: {
    name: 'Pro Coach',
    shortName: 'PRO',
    monthlyPrice: '₹799',
    annualPrice: '₹599',
    aiLimit: 8,
    description: 'Daily adaptive guidance for committed athletes.'
  },
  coach: {
    name: 'Coach & Team',
    shortName: 'COACH',
    monthlyPrice: '₹2,499',
    annualPrice: '₹1,999',
    aiLimit: 30,
    description: 'High-touch guidance for trainers and small teams.'
  }
});

export function normalizePlan(profile = {}) {
  const requested = profile.subscription_plan;
  const plan = PLAN_DETAILS[requested] ? requested : 'free';
  const status = profile.subscription_status || 'active';
  const planExpiresAt = profile.plan_expires_at ? new Date(profile.plan_expires_at).getTime() : 0;
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0;
  const trialActive = status === 'trialing' && (!trialEndsAt || trialEndsAt > Date.now());
  const paidActive = ['active', 'trialing', 'past_due'].includes(status);

  if (plan !== 'free' && (paidActive || trialActive) && (!planExpiresAt || planExpiresAt > Date.now())) return plan;
  return 'free';
}

export function getPlanDetails(profile = {}) {
  const key = normalizePlan(profile);
  return { key, ...PLAN_DETAILS[key] };
}

export function getDailyAiLimit(profile = {}) {
  return getPlanDetails(profile).aiLimit;
}

export function isPaidPlan(profile = {}) {
  return normalizePlan(profile) !== 'free';
}

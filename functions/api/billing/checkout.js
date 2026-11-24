import { authUser, json, options, profileForUser, razorpay, RAZORPAY_PLANS, supabaseRest } from '../../../_lib/fuolingo.js';

export async function onRequest(context) {
  const { request, env } = context;
  const preflight = options(request, env); if (preflight) return preflight;
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, env);
  const user = await authUser(request, env);
  if (!user) return json({ error: 'Please sign in before choosing a plan.' }, 401, env);
  const body = await request.json().catch(() => ({}));
  const plan = body.plan;
  const billing = body.billing === 'annual' ? 'annual' : 'monthly';
  const pricing = RAZORPAY_PLANS[plan]?.[billing];
  if (!pricing) return json({ error: 'Choose a valid Fuolingo plan.' }, 400, env);
  try {
    const order = await razorpay(env, '/orders', { method: 'POST', body: JSON.stringify({ amount: pricing.amount, currency: 'INR', receipt: `fuolingo_${user.id.slice(0, 8)}_${Date.now()}`, payment_capture: 1, notes: { user_id: user.id, plan, billing } }) });
    await supabaseRest(env, 'subscriptions', '?on_conflict=user_id', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify({ user_id: user.id, plan, status: 'created', provider: 'razorpay', provider_order_id: order.id, billing_cycle: billing, updated_at: new Date().toISOString() }) });
    const profile = await profileForUser(env, user);
    return json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: env.RAZORPAY_KEY_ID, plan, billing, name: profile.display_name || 'Fuolingo Athlete', email: user.email }, 200, env);
  } catch (error) { return json({ error: error.message, code: 'BILLING_NOT_CONFIGURED' }, 503, env); }
}

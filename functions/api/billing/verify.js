import { authUser, hmacHex, json, options, supabaseRest, RAZORPAY_PLANS } from '../../_lib/fuolingo.js';

export async function onRequest(context) {
  const { request, env } = context;
  const preflight = options(request, env); if (preflight) return preflight;
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, env);
  const user = await authUser(request, env);
  if (!user) return json({ error: 'Please sign in before verifying payment.' }, 401, env);
  const body = await request.json().catch(() => ({}));
  const orderId = body.razorpay_order_id; const paymentId = body.razorpay_payment_id; const signature = body.razorpay_signature;
  const expected = await hmacHex(`${orderId}|${paymentId}`, env.RAZORPAY_KEY_SECRET || '');
  if (!orderId || !paymentId || !signature || expected !== signature) return json({ error: 'Payment verification failed. No plan access was granted.' }, 400, env);
  const rows = await supabaseRest(env, 'subscriptions', `?user_id=eq.${encodeURIComponent(user.id)}&provider_order_id=eq.${encodeURIComponent(orderId)}&select=*`);
  const pending = rows?.[0];
  if (!pending) return json({ error: 'Payment order could not be matched to this account.' }, 400, env);
  const duration = RAZORPAY_PLANS[pending.plan]?.[pending.billing_cycle || 'monthly'] || RAZORPAY_PLANS[pending.plan]?.monthly;
  const expires = new Date(Date.now() + duration.days * 86400000).toISOString();
  await supabaseRest(env, 'subscriptions', `?user_id=eq.${encodeURIComponent(user.id)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'active', provider_payment_id: paymentId, current_period_end: expires, updated_at: new Date().toISOString() }) });
  await supabaseRest(env, 'profiles', `?id=eq.${encodeURIComponent(user.id)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ subscription_plan: pending.plan, subscription_status: 'active', plan_expires_at: expires }) });
  return json({ success: true, plan: pending.plan, status: 'active', plan_expires_at: expires }, 200, env);
}

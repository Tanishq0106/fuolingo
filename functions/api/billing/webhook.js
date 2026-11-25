import { hmacHex, json, options, RAZORPAY_PLANS, supabaseRest } from '../../_lib/fuolingo.js';

export async function onRequest(context) {
  const { request, env } = context;
  const preflight = options(request, env); if (preflight) return preflight;
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, env);
  const raw = await request.text();
  const expected = await hmacHex(raw, env.RAZORPAY_WEBHOOK_SECRET || '');
  if (!env.RAZORPAY_WEBHOOK_SECRET || expected !== request.headers.get('x-razorpay-signature')) return json({ error: 'Invalid Razorpay webhook signature.' }, 400, env);
  let event; try { event = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON.' }, 400, env); }
  const entity = event.payload?.payment?.entity || event.payload?.order?.entity || {};
  const orderId = entity.order_id || entity.id;
  if (['payment.captured', 'order.paid'].includes(event.event) && orderId) {
    const rows = await supabaseRest(env, 'subscriptions', `?provider_order_id=eq.${encodeURIComponent(orderId)}&select=*`);
    const pending = rows?.[0];
    if (pending) {
      const duration = RAZORPAY_PLANS[pending.plan]?.[pending.billing_cycle || 'monthly'] || RAZORPAY_PLANS[pending.plan]?.monthly;
      const expires = new Date(Date.now() + duration.days * 86400000).toISOString();
      await supabaseRest(env, 'subscriptions', `?user_id=eq.${encodeURIComponent(pending.user_id)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status: 'active', provider_payment_id: entity.id || null, current_period_end: expires, updated_at: new Date().toISOString() }) });
      await supabaseRest(env, 'profiles', `?id=eq.${encodeURIComponent(pending.user_id)}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ subscription_plan: pending.plan, subscription_status: 'active', plan_expires_at: expires }) });
    }
  }
  return json({ received: true }, 200, env);
}

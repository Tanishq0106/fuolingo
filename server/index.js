import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { registerContactRoute } from './contact.js';

try { process.loadEnvFile?.(); } catch { /* Cloudflare/Cloud Run inject environment values directly. */ }

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3001);
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || process.env.APP_ORIGIN || 'http://localhost:5173';
const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

const allowedOrigin = process.env.APP_ORIGIN || true;
app.use(cors({ origin: allowedOrigin, credentials: false }));

const rateLimits = new Map();
function createRateLimiter({ windowMs = 60000, maxRequests = 60, message = 'Too many requests. Please slow down.' }) {
  return (req, res, next) => {
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-client').split(',')[0].trim();
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const state = rateLimits.get(key) || { count: 0, resetTime: now + windowMs };
    if (now > state.resetTime) { state.count = 0; state.resetTime = now + windowMs; }
    state.count += 1;
    rateLimits.set(key, state);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - state.count));
    if (state.count > maxRequests) return res.status(429).json({ error: message, retryAfter: Math.ceil((state.resetTime - now) / 1000) });
    next();
  };
}
const globalLimiter = createRateLimiter({ maxRequests: 120 });
const strictLimiter = createRateLimiter({ maxRequests: 15, message: 'Too many sensitive requests. Please wait a minute.' });
app.use('/api/', globalLimiter);
setInterval(() => {
  const now = Date.now();
  for (const [key, state] of rateLimits.entries()) if (now > state.resetTime) rateLimits.delete(key);
}, 300000).unref();

const defaultProfile = {
  id: 'demo-user-id', email: 'athlete@fuolingo.app', display_name: 'Alex Mercer',
  timezone: 'Asia/Kolkata', start_weight_kg: 84, target_weight_kg: 72, current_weight_kg: 79.8,
  goal: 'fat_loss', subscription_plan: 'free', subscription_status: 'active'
};
let serverProfile = { ...defaultProfile };
let serverStreak = { current_streak: 4, longest_streak: 7, freezes_available: 1, last_freeze_grant: '2026-11' };
let serverCompletions = [];
let serverWeightLogs = [];
let serverBadges = [];
const memoryAiUsage = new Map();

function jsonError(res, status, error, extra = {}) { return res.status(status).json({ error, ...extra }); }
function today() { return new Date().toISOString().slice(0, 10); }
function planLimit(plan) { return plan === 'coach' ? 30 : plan === 'pro' ? 8 : 1; }
function resolvePlan(profile = {}) {
  const plan = ['pro', 'coach'].includes(profile.subscription_plan) ? profile.subscription_plan : 'free';
  const expires = profile.plan_expires_at ? new Date(profile.plan_expires_at).getTime() : 0;
  const activeStatus = ['active', 'trialing', 'past_due'].includes(profile.subscription_status || 'active');
  if (plan !== 'free' && activeStatus && (!expires || expires > Date.now())) return plan;
  return 'free';
}

async function getAuthUser(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } });
  if (!response.ok) return null;
  return response.json();
}

async function getProfile(user) {
  if (!user) return { ...serverProfile };
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) return data;
  }
  return { ...defaultProfile, id: user.id, email: user.email, display_name: user.user_metadata?.display_name || 'Athlete' };
}

async function requireUser(req, res) {
  const user = await getAuthUser(req);
  if (!user) { jsonError(res, 401, 'Please sign in to use this feature.'); return null; }
  return user;
}

async function consumeAiUsage(userId, limit) {
  const date = today();
  if (!supabaseAdmin) {
    const key = `${userId}:${date}`;
    const used = memoryAiUsage.get(key) || 0;
    if (used >= limit) return { allowed: false, used, limit };
    memoryAiUsage.set(key, used + 1);
    return { allowed: true, used: used + 1, limit };
  }
  try {
    const { data: existing } = await supabaseAdmin.from('ai_daily_usage').select('message_count').eq('user_id', userId).eq('usage_date', date).maybeSingle();
    const used = Number(existing?.message_count || 0);
    if (used >= limit) return { allowed: false, used, limit };
    const next = used + 1;
    const { error } = await supabaseAdmin.from('ai_daily_usage').upsert({ user_id: userId, usage_date: date, message_count: next, updated_at: new Date().toISOString() }, { onConflict: 'user_id,usage_date' });
    if (error) throw error;
    return { allowed: true, used: next, limit };
  } catch (error) {
    console.warn('AI usage persistence unavailable:', error.message);
    const key = `${userId}:${date}`;
    const used = memoryAiUsage.get(key) || 0;
    if (used >= limit) return { allowed: false, used, limit };
    memoryAiUsage.set(key, used + 1);
    return { allowed: true, used: used + 1, limit };
  }
}

function fallbackCoach(question, context = {}) {
  const goal = String(context.goal || 'stay_fit').replace('_', ' ');
  const streak = Number(context.currentStreak || 0);
  const next = streak > 0
    ? `Protect your ${streak}-day streak with one small win in the next 30 minutes: complete the easiest unfinished mission.`
    : 'Start with a 10-minute movement block and a glass of water. Momentum matters more than intensity today.';
  return `Here is your practical focus for today: ${next}\n\nBecause your goal is ${goal}, keep the plan simple and repeatable. For “${question.slice(0, 120)}”, choose the smallest version you can complete even on a busy day, then reassess your energy afterward. This is habit guidance, not medical advice.`;
}

async function generateCoachAnswer(question, context) {
  if (!GEMINI_API_KEY) return { answer: fallbackCoach(question, context), source: 'fallback' };
  const system = `You are Fuolingo Coach, a supportive fitness habit assistant. Give concise, practical, non-judgmental guidance. Use the member context, but do not diagnose, prescribe medication, recommend dangerous restriction, or claim certainty about medical issues. For pain, injury, eating-disorder concerns, or serious symptoms, recommend a qualified professional. Always end with one small next action. Member context: ${JSON.stringify(context)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: question }] }], generationConfig: { temperature: 0.65, maxOutputTokens: 700 } })
  });
  if (!response.ok) throw new Error('Gemini could not answer right now. Please try again shortly.');
  const payload = await response.json();
  const answer = payload.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
  if (!answer) throw new Error('The coach returned an empty answer. Please try again.');
  return { answer, source: 'gemini' };
}

const RAZORPAY_PLANS = {
  pro: { monthly: { amount: 79900, days: 30 }, annual: { amount: 599900, days: 365 } },
  coach: { monthly: { amount: 249900, days: 30 }, annual: { amount: 1999900, days: 365 } }
};
async function razorpayRequest(endpoint, { method = 'GET', body } = {}) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) throw new Error('Razorpay is not configured yet. Add the Razorpay keys to the server environment.');
  const response = await fetch(`https://api.razorpay.com/v1${endpoint}`, { method, headers: { Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.description || 'Razorpay request failed.');
  return payload;
}
function verifyHmac(message, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(message).digest('hex');
  const a = Buffer.from(expected); const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
async function savePaidPlan({ userId, plan, billing, orderId, paymentId, status = 'active' }) {
  const duration = RAZORPAY_PLANS[plan]?.[billing] || RAZORPAY_PLANS[plan]?.monthly;
  const expiresAt = new Date(Date.now() + duration.days * 86400000).toISOString();
  if (supabaseAdmin) {
    await supabaseAdmin.from('subscriptions').upsert({ user_id: userId, plan, status, provider: 'razorpay', provider_order_id: orderId, provider_payment_id: paymentId || null, billing_cycle: billing, current_period_end: expiresAt, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    await supabaseAdmin.from('profiles').update({ subscription_plan: plan, subscription_status: status, plan_expires_at: expiresAt }).eq('id', userId);
  }
  if (userId === serverProfile.id) serverProfile = { ...serverProfile, subscription_plan: plan, subscription_status: status, plan_expires_at: expiresAt };
  return { plan, status, plan_expires_at: expiresAt };
}

// Razorpay webhooks must receive the raw body before JSON parsing.
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');
  if (!verifyHmac(rawBody, req.headers['x-razorpay-signature'], RAZORPAY_WEBHOOK_SECRET)) return jsonError(res, 400, 'Invalid Razorpay webhook signature.');
  res.json({ received: true });
  try {
    const event = JSON.parse(rawBody);
    const entity = event.payload?.payment?.entity || event.payload?.order?.entity || {};
    const orderId = entity.order_id || entity.id;
    if (['payment.captured', 'order.paid'].includes(event.event) && orderId && supabaseAdmin) {
      const { data: subscription } = await supabaseAdmin.from('subscriptions').select('*').eq('provider_order_id', orderId).maybeSingle();
      if (subscription) await savePaidPlan({ userId: subscription.user_id, plan: subscription.plan, billing: subscription.billing_cycle || 'monthly', orderId, paymentId: entity.id });
    }
  } catch (error) { console.error('Razorpay webhook processing error:', error); }
});

app.use(express.json({ limit: '32kb' }));
registerContactRoute(app);

app.post('/api/ai/coach', strictLimiter, async (req, res) => {
  const question = String(req.body?.question || '').trim();
  if (!question || question.length > 1000) return jsonError(res, 400, 'Ask a question between 1 and 1000 characters.');
  if (req.body?.demo) return res.json({ answer: fallbackCoach(question, req.body.context || {}), source: 'demo', usage: { used: 1, limit: 1 } });
  const user = await requireUser(req, res); if (!user) return;
  const profile = await getProfile(user);
  const plan = resolvePlan(profile);
  const usage = await consumeAiUsage(user.id, planLimit(plan));
  if (!usage.allowed) return jsonError(res, 429, `You have used today's ${plan === 'free' ? 'Starter preview' : 'coach'} allowance.`, { code: 'AI_DAILY_LIMIT', upgradeRequired: plan === 'free', usage, retryAfter: 86400 });
  try {
    const result = await generateCoachAnswer(question, { ...(req.body.context || {}), plan, email: undefined });
    return res.json({ ...result, plan, usage });
  } catch (error) { return jsonError(res, 502, error.message, { usage }); }
});

app.post('/api/billing/checkout', strictLimiter, async (req, res) => {
  const user = await requireUser(req, res); if (!user) return;
  const plan = req.body?.plan; const billing = req.body?.billing === 'annual' ? 'annual' : 'monthly';
  const pricing = RAZORPAY_PLANS[plan]?.[billing];
  if (!pricing) return jsonError(res, 400, 'Choose a valid Fuolingo plan.');
  try {
    const order = await razorpayRequest('/orders', { method: 'POST', body: { amount: pricing.amount, currency: 'INR', receipt: `fuolingo_${user.id.slice(0, 8)}_${Date.now()}`, payment_capture: 1, notes: { user_id: user.id, plan, billing } } });
    if (supabaseAdmin) await supabaseAdmin.from('subscriptions').upsert({ user_id: user.id, plan, status: 'created', provider: 'razorpay', provider_order_id: order.id, billing_cycle: billing, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    return res.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: RAZORPAY_KEY_ID, plan, billing, name: user.user_metadata?.display_name || 'Fuolingo Athlete', email: user.email });
  } catch (error) { return jsonError(res, 503, error.message, { code: 'BILLING_NOT_CONFIGURED' }); }
});

app.post('/api/billing/verify', strictLimiter, async (req, res) => {
  const user = await requireUser(req, res); if (!user) return;
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
  if (!orderId || !paymentId || !verifyHmac(`${orderId}|${paymentId}`, signature, RAZORPAY_KEY_SECRET)) return jsonError(res, 400, 'Payment verification failed. No plan access was granted.');
  if (supabaseAdmin) {
    const { data: pending } = await supabaseAdmin.from('subscriptions').select('*').eq('user_id', user.id).eq('provider_order_id', orderId).maybeSingle();
    if (!pending) return jsonError(res, 400, 'Payment order could not be matched to this account.');
    const payment = await razorpayRequest(`/payments/${paymentId}`);
    if (!['captured', 'authorized'].includes(payment.status)) return jsonError(res, 402, 'Payment is not captured yet. We will activate your plan from the Razorpay webhook.');
    const result = await savePaidPlan({ userId: user.id, plan: pending.plan, billing: pending.billing_cycle || 'monthly', orderId, paymentId });
    return res.json({ success: true, ...result });
  }
  return jsonError(res, 503, 'Payment storage is not configured.');
});

app.post('/api/validate/mission', (req, res) => {
  const { mission_key: missionKey, day } = req.body || {};
  if (!['workout', 'calories', 'water', 'sleep'].includes(missionKey)) return jsonError(res, 400, 'Invalid mission key.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day || '')) return jsonError(res, 400, 'Invalid day format. Expected YYYY-MM-DD.');
  if (new Date(day) > new Date(Date.now() + 36 * 60 * 60 * 1000)) return jsonError(res, 400, 'Cannot complete missions too far in the future.');
  res.json({ valid: true, mission_key: missionKey, day, serverTimestamp: new Date().toISOString() });
});
app.post('/api/validate/weight', (req, res) => {
  const value = Number(req.body?.weight_kg); const day = req.body?.day || today();
  if (!Number.isFinite(value) || value <= 20 || value >= 500) return jsonError(res, 400, 'Weight must be between 20 kg and 500 kg.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return jsonError(res, 400, 'Invalid day format. Expected YYYY-MM-DD.');
  res.json({ valid: true, weight_kg: Number(value.toFixed(1)), day });
});
app.post('/api/privacy/export', strictLimiter, (req, res) => { res.json({ service: 'Fuolingo Fitness SaaS', export_version: '1.0', exported_at: new Date().toISOString(), data: req.body?.user_data || { profile: serverProfile, streak: serverStreak, completions: serverCompletions, weight_logs: serverWeightLogs, badges: serverBadges } }); });
app.post('/api/privacy/delete-account', strictLimiter, (req, res) => { if (req.body?.confirmation !== 'DELETE_MY_ACCOUNT') return jsonError(res, 400, 'Confirmation string required.'); serverCompletions = []; serverWeightLogs = []; serverBadges = []; res.json({ success: true, deleted_at: new Date().toISOString() }); });
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Fuolingo Fitness SaaS', timestamp: new Date().toISOString(), aiConfigured: Boolean(GEMINI_API_KEY), razorpayConfigured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET), supabaseAdminConfigured: Boolean(supabaseAdmin) }));
app.get('/api/profile', (req, res) => res.json(serverProfile));
app.put('/api/profile', (req, res) => { serverProfile = { ...serverProfile, ...req.body }; res.json(serverProfile); });
app.get('/api/streaks', (req, res) => res.json(serverStreak));
app.put('/api/streaks', (req, res) => { serverStreak = { ...serverStreak, ...req.body }; res.json(serverStreak); });
app.use('/api', (req, res) => jsonError(res, 404, 'API route not found.'));

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
app.listen(PORT, '0.0.0.0', () => console.log(`Fuolingo backend listening on port ${PORT}`));

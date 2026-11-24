const encoder = new TextEncoder();

export function json(data, status = 200, env = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', ...corsHeaders(env) } });
}

export function corsHeaders(env = {}) {
  return { 'access-control-allow-origin': env.APP_ORIGIN || '*', 'access-control-allow-headers': 'Content-Type, Authorization', 'access-control-allow-methods': 'GET, POST, OPTIONS' };
}

export function options(request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(env) });
  return null;
}

export function planLimit(plan) { return plan === 'coach' ? 30 : plan === 'pro' ? 8 : 1; }
export function resolvePlan(profile = {}) {
  const plan = ['pro', 'coach'].includes(profile.subscription_plan) ? profile.subscription_plan : 'free';
  const expires = profile.plan_expires_at ? new Date(profile.plan_expires_at).getTime() : 0;
  if (plan !== 'free' && ['active', 'trialing', 'past_due'].includes(profile.subscription_status || 'active') && (!expires || expires > Date.now())) return plan;
  return 'free';
}

export async function authUser(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ') || !env.SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return null;
  const response = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: auth } });
  return response.ok ? response.json() : null;
}

function adminHeaders(env, extra = {}) { return { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, 'content-type': 'application/json', ...extra }; }
export async function supabaseRest(env, table, query = '', init = {}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase server configuration is missing.');
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}${query}`, { ...init, headers: adminHeaders(env, init.headers || {}) });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || 'Supabase request failed.');
  return payload;
}

export async function profileForUser(env, user) {
  const rows = await supabaseRest(env, 'profiles', `?id=eq.${encodeURIComponent(user.id)}&select=*`);
  return rows?.[0] || { id: user.id, email: user.email, display_name: user.user_metadata?.display_name || 'Athlete', goal: 'fat_loss', subscription_plan: 'free', subscription_status: 'active' };
}

export async function hmacHex(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export async function validHmac(value, signature, secret) { return Boolean(signature && secret && (await hmacHex(value, secret)) === signature); }

export function fallbackCoach(question, context = {}) {
  const streak = Number(context.currentStreak || 0);
  const next = streak > 0 ? `protect your ${streak}-day streak with the easiest unfinished mission` : 'start with ten minutes of movement and a glass of water';
  return `Your next best move is to ${next}. Keep it deliberately small so you can repeat it tomorrow. For “${question.slice(0, 120)}”, choose the version that fits your current energy, then reassess. This is educational habit guidance, not medical advice.`;
}

export async function geminiAnswer(env, question, context) {
  if (!env.GEMINI_API_KEY) return { answer: fallbackCoach(question, context), source: 'fallback' };
  const model = env.GEMINI_MODEL || 'gemini-2.0-flash';
  const system = `You are Fuolingo Coach, a supportive fitness habit assistant. Give concise, practical, non-judgmental guidance. Never diagnose, prescribe medication, recommend dangerous restriction, or claim certainty about medical issues. Refer pain, injury, eating-disorder concerns, or serious symptoms to a qualified professional. Always end with one small next action. Member context: ${JSON.stringify(context)}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ system_instruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: question }] }], generationConfig: { temperature: 0.65, maxOutputTokens: 700 } }) });
  if (!response.ok) throw new Error('Gemini could not answer right now.');
  const payload = await response.json();
  const answer = payload.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
  if (!answer) throw new Error('The coach returned an empty answer.');
  return { answer, source: 'gemini' };
}

export const RAZORPAY_PLANS = { pro: { monthly: { amount: 79900, days: 30 }, annual: { amount: 599900, days: 365 } }, coach: { monthly: { amount: 249900, days: 30 }, annual: { amount: 1999900, days: 365 } } };
export async function razorpay(env, endpoint, init = {}) {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) throw new Error('Razorpay is not configured yet.');
  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);
  const response = await fetch(`https://api.razorpay.com/v1${endpoint}`, { ...init, headers: { Authorization: `Basic ${auth}`, 'content-type': 'application/json', ...(init.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error?.description || 'Razorpay request failed.');
  return payload;
}

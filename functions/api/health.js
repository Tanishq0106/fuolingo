import { json, options } from '../_lib/fuolingo.js';

export async function onRequest(context) {
  const { request, env } = context;
  const preflight = options(request, env); if (preflight) return preflight;
  return json({ status: 'ok', service: 'Fuolingo Cloudflare Pages Functions', timestamp: new Date().toISOString(), aiConfigured: Boolean(env.GEMINI_API_KEY), razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET), supabaseAdminConfigured: Boolean(env.SUPABASE_SERVICE_ROLE_KEY) }, 200, env);
}

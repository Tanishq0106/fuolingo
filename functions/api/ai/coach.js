import { authUser, fallbackCoach, geminiAnswer, json, options, planLimit, profileForUser, resolvePlan, supabaseRest } from '../../_lib/fuolingo.js';

export async function onRequest(context) {
  const { request, env } = context;
  const preflight = options(request, env); if (preflight) return preflight;
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, env);
  const body = await request.json().catch(() => ({}));
  const question = String(body.question || '').trim();
  if (!question || question.length > 1000) return json({ error: 'Ask a question between 1 and 1000 characters.' }, 400, env);
  if (body.demo) return json({ answer: fallbackCoach(question, body.context || {}), source: 'demo', usage: { used: 1, limit: 1 } }, 200, env);
  const user = await authUser(request, env);
  if (!user) return json({ error: 'Please sign in to use this feature.' }, 401, env);
  const profile = await profileForUser(env, user);
  const plan = resolvePlan(profile);
  const date = new Date().toISOString().slice(0, 10);
  const rows = await supabaseRest(env, 'ai_daily_usage', `?user_id=eq.${encodeURIComponent(user.id)}&usage_date=eq.${date}&select=message_count`);
  const used = Number(rows?.[0]?.message_count || 0);
  const limit = planLimit(plan);
  if (used >= limit) return json({ error: `You have used today's ${plan === 'free' ? 'Starter preview' : 'coach'} allowance.`, code: 'AI_DAILY_LIMIT', upgradeRequired: plan === 'free', usage: { used, limit } }, 429, env);
  const usage = { used: used + 1, limit };
  await supabaseRest(env, 'ai_daily_usage', '?on_conflict=user_id,usage_date', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' }, body: JSON.stringify({ user_id: user.id, usage_date: date, message_count: usage.used, updated_at: new Date().toISOString() }) });
  try {
    const result = await geminiAnswer(env, question, { ...(body.context || {}), plan });
    return json({ ...result, plan, usage }, 200, env);
  } catch (error) { return json({ error: error.message, usage }, 502, env); }
}

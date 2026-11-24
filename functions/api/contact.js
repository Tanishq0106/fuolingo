import { json, options } from '../_lib/fuolingo.js';

export async function onRequest(context) {
  const { request, env } = context;
  const preflight = options(request, env); if (preflight) return preflight;
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, env);
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || '').trim(); const email = String(body.email || '').trim(); const message = String(body.message || '').trim(); const topic = String(body.topic || 'support');
  if (body.website) return json({ success: true }, 200, env);
  if (name.length < 2 || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length < 10 || message.length > 3000) return json({ error: 'Please provide a valid name, email, and message.' }, 400, env);
  if (env.CONTACT_WEBHOOK_URL) { await fetch(env.CONTACT_WEBHOOK_URL, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content: `Fuolingo contact — ${topic}\nFrom: ${name} <${email}>\n\n${message}` }) }).catch(() => {}); }
  return json({ success: true }, 200, env);
}

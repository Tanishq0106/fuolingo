import React, { useMemo, useState } from 'react';
import { askCoach, startCheckout } from '../services/coach.js';
import { getPlanDetails, isPaidPlan } from '../utils/plans.js';

const SUGGESTIONS = [
  'What should I focus on today to protect my streak?',
  'Give me a realistic workout for a low-energy day.',
  'How can I make my evening meal support my goal?',
  'Review my progress and give me one next best action.'
];

function formatTime(value) {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
  } catch {
    return '';
  }
}

export default function Coach({
  profile = {},
  stats = {},
  streakState = {},
  isDemoMode = false,
  onNavigate = () => {}
}) {
  const plan = useMemo(() => getPlanDetails(profile), [profile]);
  const paid = isPaidPlan(profile);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hey ${profile.display_name || 'Athlete'} — I’m your Fuolingo Coach. Tell me what feels hardest today and I’ll turn it into one clear next move.`,
      createdAt: new Date().toISOString()
    }
  ]);
  const [usage, setUsage] = useState({ used: 0, limit: plan.aiLimit });
  const [isSending, setIsSending] = useState(false);
  const [billingBusy, setBillingBusy] = useState('');
  const [error, setError] = useState('');

  const context = useMemo(() => ({
    displayName: profile.display_name || 'Athlete',
    goal: profile.goal || 'fat_loss',
    currentWeightKg: profile.current_weight_kg,
    targetWeightKg: profile.target_weight_kg,
    currentStreak: streakState.current_streak || 0,
    longestStreak: streakState.longest_streak || 0,
    totalMissions: stats.totalMissions || 0,
    workouts: stats.workouts || 0,
    kgProgress: stats.kgProgress || 0
  }), [profile, stats, streakState]);

  async function submitQuestion(value = question) {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;
    setQuestion('');
    setError('');
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString()
    }]);
    setIsSending(true);

    try {
      const response = await askCoach({ question: trimmed, context, isDemo: isDemoMode });
      setUsage(response.usage || usage);
      setMessages(prev => [...prev, {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        createdAt: new Date().toISOString(),
        source: response.source
      }]);
    } catch (err) {
      setError(err.message);
      if (err.upgradeRequired) {
        setMessages(prev => [...prev, {
          id: `upgrade-${Date.now()}`,
          role: 'assistant',
          content: 'You have used today’s Starter preview. Upgrade to Pro Coach for daily adaptive guidance, streak-aware plans, and a higher message allowance.',
          createdAt: new Date().toISOString()
        }]);
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handleCheckout(planKey, billing) {
    if (isDemoMode) {
      setError('Create a free account before starting a paid plan. Demo mode never collects payment details.');
      return;
    }
    setBillingBusy(`${planKey}-${billing}`);
    setError('');
    try {
      await startCheckout({ plan: planKey, billing });
    } catch (err) {
      setError(err.message);
    } finally {
      setBillingBusy('');
    }
  }

  function handlePortal() {
    setError('Razorpay plan changes are handled from your billing email. Contact support if you need to renew or change plans.');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-br from-[#132b2a] via-surface-card to-[#19153a] p-6 sm:p-9 shadow-2xl">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
              <span className="h-2 w-2 rounded-full bg-accent shadow-accent-glow" />
              Daily Coach
              <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 tracking-normal text-slate-300">{plan.shortName}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Make today easier to win.</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-300 sm:text-base">Personalized, streak-aware guidance for the moment you are actually in — not a generic plan you will abandon next week.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Streak</div><div className="mt-1 text-2xl font-black text-white">{streakState.current_streak || 0}d</div></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Progress</div><div className="mt-1 text-2xl font-black text-accent">{stats.kgProgress || 0}kg</div></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Today</div><div className="mt-1 text-2xl font-black text-white">{usage.used}/{usage.limit}</div></div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mode</div><div className="mt-1 text-sm font-black text-violet-light">{isDemoMode ? 'Preview' : paid ? 'Personal' : 'Starter'}</div></div>
          </div>
        </div>
      </section>

      {error && <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200 sm:flex-row sm:items-center sm:justify-between"><span>{error}</span><button type="button" onClick={() => setError('')} className="self-start rounded-lg border border-amber-300/30 px-3 py-1 text-xs font-bold hover:bg-amber-300/10 sm:self-auto">Dismiss</button></div>}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-surface-card shadow-xl">
          <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div><h2 className="text-lg font-extrabold text-white">Your private coaching room</h2><p className="mt-1 text-xs text-slate-400">Ask about workouts, meals, energy, or keeping your streak alive.</p></div>
            <div className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold text-accent">{Math.max(0, usage.limit - usage.used)} guidance left today</div>
          </div>
          <div className="min-h-[390px] space-y-4 p-5 sm:p-6">
            {messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'rounded-br-md bg-accent text-slate-950' : 'rounded-bl-md border border-white/10 bg-surface text-slate-200'}`}>
                  <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-60"><span>{message.role === 'user' ? 'You' : 'Fuolingo Coach'}</span><span>{formatTime(message.createdAt)}</span></div>
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            ))}
            {isSending && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent"><span className="inline-flex gap-1"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:150ms]" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:300ms]" /></span> Coach is thinking</div></div>}
          </div>
          <div className="border-t border-white/10 p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap gap-2">{SUGGESTIONS.map(prompt => <button key={prompt} type="button" onClick={() => submitQuestion(prompt)} className="rounded-full border border-white/10 bg-surface px-3 py-1.5 text-left text-[11px] font-semibold text-slate-300 transition hover:border-accent/40 hover:text-white">{prompt}</button>)}</div>
            <form onSubmit={(event) => { event.preventDefault(); submitQuestion(); }} className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="coach-question">Ask your coach</label>
              <input id="coach-question" value={question} onChange={event => setQuestion(event.target.value)} maxLength={1000} placeholder="What would make today easier?" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-accent/50" />
              <button type="submit" disabled={isSending || !question.trim()} className="rounded-xl bg-accent px-5 py-3 text-sm font-black text-slate-950 shadow-accent-glow transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50">{isSending ? 'Thinking…' : 'Ask coach'}</button>
            </form>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-surface-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Your plan</p><h2 className="mt-1 text-2xl font-black text-white">{plan.name}</h2></div><span className="rounded-xl bg-accent/15 px-2.5 py-1 text-xs font-black text-accent">{plan.shortName}</span></div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{plan.description}</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, (usage.used / Math.max(usage.limit, 1)) * 100)}%` }} /></div>
            <p className="mt-2 text-xs text-slate-500">{usage.used} of {usage.limit} daily coach messages used</p>
            {paid ? <button type="button" onClick={handlePortal} disabled={billingBusy === 'portal'} className="mt-5 w-full rounded-xl border border-white/10 bg-surface-light px-4 py-3 text-xs font-bold text-white hover:border-accent/40 disabled:opacity-50">Manage plan</button> : <div className="mt-5 rounded-xl border border-accent/20 bg-accent/5 p-4"><p className="text-sm font-bold text-white">Want your coach every day?</p><p className="mt-1 text-xs leading-5 text-slate-400">Unlock more guidance and make your streak easier to protect.</p><button type="button" onClick={() => handleCheckout('pro', 'monthly')} disabled={Boolean(billingBusy)} className="mt-3 w-full rounded-xl bg-accent px-4 py-3 text-xs font-black text-slate-950 shadow-accent-glow disabled:opacity-50">{billingBusy === 'pro-monthly' ? 'Opening checkout…' : 'Upgrade to Pro — ₹799/mo'}</button></div>}
          </div>

          <div className="rounded-[2rem] border border-violet/25 bg-gradient-to-br from-violet/10 to-surface-card p-6 shadow-xl"><p className="text-xs font-bold uppercase tracking-wider text-violet-light">Built for consistency</p><h3 className="mt-2 text-lg font-extrabold text-white">Advice that knows your streak.</h3><ul className="mt-4 space-y-3 text-xs leading-5 text-slate-300"><li className="flex gap-2"><span className="text-accent">✓</span> Uses your real progress, not generic advice</li><li className="flex gap-2"><span className="text-accent">✓</span> Turns overwhelm into one next action</li><li className="flex gap-2"><span className="text-accent">✓</span> Protects privacy with server-side prompts</li></ul></div>

          {!paid && !isDemoMode && <div className="rounded-[2rem] border border-white/10 bg-surface-card p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Need more room?</p><h3 className="mt-1 text-lg font-extrabold text-white">Coach & Team</h3></div><span className="text-lg font-black text-white">₹2,499</span></div><p className="mt-2 text-xs leading-5 text-slate-400">Up to 30 AI guidance messages per day for trainers and small teams.</p><button type="button" onClick={() => handleCheckout('coach', 'monthly')} disabled={Boolean(billingBusy)} className="mt-4 w-full rounded-xl border border-violet/40 px-4 py-3 text-xs font-bold text-violet-light hover:bg-violet/10 disabled:opacity-50">{billingBusy === 'coach-monthly' ? 'Opening checkout…' : 'Choose Coach & Team'}</button></div>}

          <div className="rounded-2xl border border-white/5 bg-surface-card/50 p-4 text-[11px] leading-5 text-slate-500"><strong className="text-slate-300">Health note:</strong> Fuolingo is for education and habit support, not diagnosis or treatment. Talk to a qualified professional about medical, nutrition, or exercise decisions.</div>
          <button type="button" onClick={() => onNavigate('home')} className="w-full text-center text-xs font-semibold text-accent hover:underline">Back to today’s missions →</button>
        </aside>
      </div>
    </div>
  );
}

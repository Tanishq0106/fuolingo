import React, { useState } from 'react';
import { track } from '../components/SiteMeta.jsx';

export default function Contact({ onNavigate = () => {} }) {
  const [form, setForm] = useState({ name: '', email: '', topic: 'support', message: '' });
  const [state, setState] = useState({ status: 'idle', message: '' });
  async function submit(event) {
    event.preventDefault();
    setState({ status: 'sending', message: '' });
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'We could not send your message.');
      track('contact_form_submit', { topic: form.topic });
      setForm({ name: '', email: '', topic: 'support', message: '' });
      setState({ status: 'success', message: 'Thanks — your message is in the Fuolingo inbox. We’ll reply to your email.' });
    } catch (error) { setState({ status: 'error', message: error.message }); }
  }
  return <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <nav aria-label="Breadcrumb" className="mb-8 text-xs text-slate-400"><a href="/" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }} className="hover:text-accent">Fuolingo</a><span className="mx-2">/</span><span aria-current="page">Contact</span></nav>
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <section><p className="text-xs font-bold uppercase tracking-wider text-accent">We’re listening</p><h1 className="mt-3 text-4xl font-black text-white">Contact Fuolingo</h1><p className="mt-4 leading-7 text-slate-300">Need help with your account, a Razorpay payment, the AI Coach, or a partnership? Send the team a note and we’ll get back to you.</p><div className="mt-8 rounded-3xl border border-white/10 bg-surface-card p-6"><h2 className="text-lg font-bold text-white">What we can help with</h2><ul className="mt-4 space-y-3 text-sm text-slate-300"><li>Account, Supabase sign-in, and data export</li><li>Razorpay payments, plan access, and billing</li><li>AI Coach feedback and safety questions</li><li>Trainer, club, and product partnerships</li></ul></div></section>
      <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-surface-card p-6 sm:p-8" noValidate><h2 className="text-xl font-bold text-white">Send a message</h2><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Name<input required minLength={2} maxLength={80} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-surface px-3 py-3 text-white outline-none focus:border-accent" /></label><label className="text-sm text-slate-300">Email<input required type="email" maxLength={160} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-surface px-3 py-3 text-white outline-none focus:border-accent" /></label></div><label className="mt-4 block text-sm text-slate-300">Topic<select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="mt-2 w-full rounded-xl border border-white/10 bg-surface px-3 py-3 text-white outline-none focus:border-accent"><option value="support">Account support</option><option value="billing">Razorpay billing</option><option value="coach">AI Coach feedback</option><option value="partnership">Partnership</option><option value="feedback">Product feedback</option></select></label><label className="mt-4 block text-sm text-slate-300">Message<textarea required minLength={10} maxLength={3000} rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-surface px-3 py-3 text-white outline-none focus:border-accent" /></label>{state.message && <p role="status" className={`mt-4 text-sm ${state.status === 'success' ? 'text-accent' : 'text-red-300'}`}>{state.message}</p>}<button disabled={state.status === 'sending'} className="mt-5 w-full rounded-xl bg-accent px-4 py-3 font-bold text-slate-950 hover:bg-accent-hover disabled:opacity-50">{state.status === 'sending' ? 'Sending…' : 'Send message'}</button></form>
    </div>
  </div>;
}

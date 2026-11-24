import React from 'react';

export default function PrivacyModal({ isOpen, onClose, onExportData, onDeleteAccount }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
    >
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl bg-surface-card border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-lg font-bold text-white">
                Privacy Policy & Health Data
              </h2>
              <p className="text-xs text-slate-400">Your health data is private, encrypted, and yours alone.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-light hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 text-xs sm:text-sm text-slate-300 pr-1">
          <section className="bg-surface/50 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-accent">
              1. Sensitive Health Data Notice
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We store only the health metrics necessary to power your habit loops: weight logs, habit check-offs, and streak history. We never sell, rent, or monetize your health data with advertisers, third-party brokers, or insurers.
            </p>
          </section>

          <section className="bg-surface/50 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-accent">
              2. Medical & Safe Fitness Disclaimer
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fuolingo is an engagement tool, not medical software. The guidelines and milestones provided do not substitute for professional medical advice, diagnosis, or treatment. Safe, sustainable weight progress is typically 0.5 – 1.0 kg per week. Always consult a licensed healthcare professional before starting an intensive fitness or diet regimen.
            </p>
          </section>

          <section className="bg-surface/50 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-accent">
              3. Data Encryption & Row-Level Security
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              All data transmitted over TLS 1.3 is encrypted in transit and protected at rest. Database access is guarded with Supabase Row-Level Security (RLS) ensuring that only your authenticated account token can read or write your personal records.
            </p>
          </section>

          <section className="bg-surface/50 p-3.5 rounded-2xl border border-white/5 space-y-1.5">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider text-accent">
              4. Your GDPR & CCPA Rights
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You maintain the absolute right to export a complete copy of your personal data archive at any time, or request permanent deletion of your account and all associated logs with zero lingering copies.
            </p>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportData}
              className="px-3.5 py-2 rounded-xl bg-surface-light hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Archive (JSON)
            </button>

            <button
              type="button"
              onClick={onDeleteAccount}
              className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Account
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 text-xs font-bold transition-all shadow-accent-glow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import BadgeIcon from './BadgeIcon.jsx';

export default function BadgeDetailModal({
  badge,
  isUnlocked = false,
  earnedAt = null,
  progress = { value: 0, target: 1, percent: 0 },
  onClose
}) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    // Focus close button on mount
    closeButtonRef.current?.focus();

    // Trap focus and handle ESC key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!badge) return null;

  const formattedEarnedDate = earnedAt
    ? new Date(earnedAt).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-modal-title"
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-surface border text-center transition-all ${
          isUnlocked
            ? 'border-accent/40 shadow-accent-glow'
            : 'border-white/10'
        }`}
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Close dialog"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Large Badge Icon */}
        <div className="mx-auto my-4 w-24 h-24 rounded-2xl flex items-center justify-center bg-surface-light/60 border border-white/10 shadow-2xl relative">
          <div
            className={`w-20 h-20 rounded-xl flex items-center justify-center ${
              isUnlocked ? 'bg-accent/20 text-accent' : 'bg-slate-800 text-slate-500'
            }`}
          >
            <BadgeIcon icon={badge.icon} className="w-12 h-12" strokeWidth={2.2} />
          </div>

          {isUnlocked && (
            <span className="absolute -top-2 -right-2 text-lg animate-bounce">
              ✨
            </span>
          )}
        </div>

        {/* Badge Title */}
        <h3 id="badge-modal-title" className="text-2xl font-bold text-white mt-4">
          {badge.title}
        </h3>

        {/* Description */}
        <p className="text-slate-300 text-sm mt-2 leading-relaxed">
          {badge.description}
        </p>

        {/* Unlock Status / Requirements */}
        <div className="mt-6 p-4 rounded-xl bg-surface-card border border-white/5 text-left">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Requirement
          </div>
          <p className="text-sm font-medium text-slate-200">
            {badge.requirement}
          </p>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400">Status</span>
            {isUnlocked ? (
              <span className="text-accent font-semibold flex items-center gap-1">
                ✓ Unlocked {formattedEarnedDate && `on ${formattedEarnedDate}`}
              </span>
            ) : (
              <span className="text-slate-400 font-mono">
                Progress: {progress.value} / {progress.target} ({progress.percent}%)
              </span>
            )}
          </div>

          {!isUnlocked && (
            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-3 px-4 rounded-xl font-semibold text-sm bg-surface-light hover:bg-slate-700 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Close
        </button>
      </div>
    </div>
  );
}

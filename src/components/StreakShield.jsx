import React, { useState } from 'react';
import { MAX_FREEZES } from '../constants.js';

export default function StreakShield({
  freezesAvailable = 1,
  maxFreezes = MAX_FREEZES,
  className = ''
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setShowTooltip(prev => !prev)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/50 border border-sky-500/30 text-sky-400 hover:border-sky-400 text-xs font-semibold tracking-wide transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        aria-label={`Streak Shields: ${freezesAvailable} of ${maxFreezes} available. A shield protects your streak if you miss a day.`}
      >
        <svg className="w-4 h-4 fill-sky-400/20 stroke-sky-400" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Shields {freezesAvailable} / {maxFreezes}</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-xl bg-slate-900 border border-sky-500/30 text-xs text-slate-200 shadow-xl z-20 pointer-events-none text-center leading-relaxed">
          <strong className="text-sky-300 block mb-0.5">Streak Shield Active</strong>
          A shield automatically protects your streak if you miss a day. Refreshes monthly!
        </div>
      )}
    </div>
  );
}

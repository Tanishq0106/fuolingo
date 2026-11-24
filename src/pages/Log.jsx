import React, { useState } from 'react';
import WeightChart from '../components/WeightChart.jsx';
import { formatLocalDate } from '../utils/streak.js';

export default function Log({
  weightLogs = [],
  profile = {},
  onAddLog = () => {},
  onDeleteLog = () => {}
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.current_weight_kg || '79.5');
  const [logDate, setLogDate] = useState(formatLocalDate());
  const [logNotes, setLogNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [inputError, setInputError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = parseFloat(newWeight);
    if (!newWeight || isNaN(parsed)) {
      setInputError('Please enter a valid weight in kilograms.');
      return;
    }
    if (parsed < 20 || parsed > 500) {
      setInputError('Weight must be between 20 kg and 500 kg.');
      return;
    }

    setInputError('');
    setSubmitting(true);
    await onAddLog({
      weightKg: parsed,
      day: logDate,
      notes: logNotes.trim()
    });
    setSubmitting(false);
    setShowAddModal(false);
    setLogNotes('');
  };

  // Sort logs descending for the table
  const sortedDesc = [...weightLogs].sort((a, b) => new Date(b.date || b.day) - new Date(a.date || a.day));

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <span>Weight & Metric Progression</span>
            <span className="text-accent text-sm font-semibold py-0.5 px-2.5 rounded-full bg-accent/10 border border-accent/20">
              Noise-Filtered
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Focus on the 7-day trend curve, not daily water weight swings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setInputError('');
            setShowAddModal(true);
          }}
          className="px-5 py-3 rounded-2xl font-bold text-sm bg-accent hover:bg-accent-hover text-slate-950 shadow-accent-glow transition-all active:scale-95 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Log New Weigh-In</span>
        </button>
      </div>

      {/* Feature D: Pure SVG Weight Progression Chart */}
      <div>
        <WeightChart
          logs={weightLogs}
          startKg={profile.start_weight_kg || 84.0}
          targetKg={profile.target_weight_kg || 72.0}
          goal={profile.goal || 'fat_loss'}
        />

        {/* Section 6.1 Safety Note */}
        <div className="mt-3 text-center">
          <p className="text-xs text-slate-400">
            🌱 Healthy progress is gradual. Talk to a doctor before aggressive changes.
          </p>
        </div>
      </div>

      {/* Collapsible "View all entries" section */}
      <div className="bg-surface-card rounded-3xl border border-white/5 shadow-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAllEntries(prev => !prev)}
          className="w-full p-6 flex items-center justify-between hover:bg-surface-light/40 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">📋</span>
            <div>
              <h3 className="font-bold text-white text-base">
                View All Weigh-In Entries ({weightLogs.length})
              </h3>
              <p className="text-xs text-slate-400">
                Inspect, review, or remove individual historical logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>{showAllEntries ? 'Collapse' : 'Expand'}</span>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${showAllEntries ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showAllEntries && (
          <div className="p-6 pt-0 border-t border-white/5 animate-fade-in">
            {sortedDesc.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
                No entries logged yet. Click "Log New Weigh-In" to begin!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Weight (kg)</th>
                      <th className="py-3 px-4">Delta from Start</th>
                      <th className="py-3 px-4">Notes</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortedDesc.map((log) => {
                      const delta = log.weightKg - (profile.start_weight_kg || 84.0);
                      const isLoss = delta < 0;

                      return (
                        <tr key={log.id} className="hover:bg-surface-light/30 transition-colors">
                          <td className="py-3 px-4 text-slate-300 font-medium">
                            {new Date(log.date || log.day).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-white text-base">
                            {log.weightKg} kg
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">
                            <span className={isLoss ? 'text-accent' : 'text-slate-400'}>
                              {isLoss ? '' : '+'}{delta.toFixed(1)} kg
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 text-xs italic">
                            {log.notes || '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => onDeleteLog(log.id)}
                              className="text-xs text-red-400 hover:text-red-300 font-semibold p-1.5 hover:bg-red-950/30 rounded-lg transition-colors"
                              title="Delete entry"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Log Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md bg-surface border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>⚖️ Log Weigh-In</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {inputError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
                {inputError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Weight (Kilograms)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="500"
                    required
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-surface-card border border-white/10 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-accent"
                    placeholder="79.5"
                  />
                  <span className="absolute right-4 top-3.5 text-slate-400 font-mono text-sm">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-card border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Optional Notes
                </label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="e.g. Morning fasted weigh-in"
                  className="w-full px-4 py-3 bg-surface-card border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-surface-light text-slate-300 font-semibold text-sm hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-bold text-sm shadow-accent-glow transition-all"
                >
                  {submitting ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

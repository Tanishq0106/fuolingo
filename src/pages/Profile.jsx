import React, { useState } from 'react';
import BadgeGrid from '../components/badges/BadgeGrid.jsx';
import StreakShield from '../components/StreakShield.jsx';
import PrivacyModal from '../components/PrivacyModal.jsx';
import { MAX_FREEZES } from '../constants.js';

export default function Profile({
  profile = {},
  streakState = {},
  userBadges = [],
  stats = {},
  onUpdateProfile = () => {},
  onBadgeSeen = () => {},
  onDeleteAccount = () => {},
  onExportData = () => {}
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile.display_name || 'Alex Mercer',
    goal: profile.goal || 'fat_loss',
    start_weight_kg: profile.start_weight_kg || 84.0,
    target_weight_kg: profile.target_weight_kg || 72.0
  });

  const handleSave = async (e) => {
    e.preventDefault();
    await onUpdateProfile({
      display_name: formData.display_name,
      goal: formData.goal,
      start_weight_kg: parseFloat(formData.start_weight_kg),
      target_weight_kg: parseFloat(formData.target_weight_kg)
    });
    setIsEditing(false);
  };

  const weightDiff = Math.abs((formData.start_weight_kg || 84) - (formData.target_weight_kg || 72));
  const isExtremeTarget = weightDiff > 25;

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Profile Header & Stats */}
      <div className="bg-surface-card rounded-3xl p-6 sm:p-8 border border-white/5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                alt="Profile Avatar"
                loading="lazy"
                decoding="async"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-accent/40 shadow-accent-glow"
              />
              <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-accent text-slate-950 text-[10px] font-black uppercase tracking-wider">
                {(profile.subscription_plan || 'free').toUpperCase()}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {profile.display_name || 'Alex Mercer'}
                </h1>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 border border-white/10 text-slate-300 font-medium">
                  🌐 {profile.timezone || 'Asia/Kolkata'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {profile.email || 'athlete@fuolingo.app'} • {profile.subscription_plan === 'free' ? 'Starter Member' : 'Active Member'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-accent uppercase tracking-wider">
                  Goal: {profile.goal?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-surface-light hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Privacy & Data
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(prev => !prev)}
              className="px-4 py-2.5 rounded-xl bg-surface-light hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Target Goals'}
            </button>
          </div>
        </div>

        {/* Goal Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} className="py-6 border-b border-white/5 space-y-4 animate-fade-in">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Update Goals & Weights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Fitness Goal</label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-accent focus:outline-none"
                >
                  <option value="fat_loss">Fat Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="stay_fit">Stay Fit</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Start Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
                  value={formData.start_weight_kg}
                  onChange={(e) => setFormData({ ...formData, start_weight_kg: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
                  value={formData.target_weight_kg}
                  onChange={(e) => setFormData({ ...formData, target_weight_kg: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {isExtremeTarget && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <span>💡</span>
                <span>
                  <strong>Healthy Reminder:</strong> A large target difference ({weightDiff.toFixed(1)} kg) is best approached in progressive 4-8 week phases. Aim for sustainable changes of 0.5–1.0 kg/week.
                </span>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-bold text-xs shadow-accent-glow"
            >
              Save Changes
            </button>
          </form>
        )}

        {/* Athletic Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Streak</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 flex items-center gap-1">
              <span>{streakState.current_streak ?? 0}</span>
              <span className="text-xl text-streak">🔥</span>
            </div>
            <span className="text-[10px] text-slate-400">Best: {streakState.longest_streak ?? 0} days</span>
          </div>

          <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Missions</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {stats.totalMissions ?? 0}
            </div>
            <span className="text-[10px] text-slate-400">Completed wins</span>
          </div>

          <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Workouts Done</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {stats.workouts ?? 0}
            </div>
            <span className="text-[10px] text-slate-400">Training sessions</span>
          </div>

          <div className="bg-surface/50 border border-white/5 p-4 rounded-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Kg Progress</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-accent mt-1">
              {stats.kgProgress ?? 0} <span className="text-sm font-normal text-slate-300">kg</span>
            </div>
            <span className="text-[10px] text-slate-400">Toward goal</span>
          </div>
        </div>
      </div>

      {/* Feature C: Streak Shields Status Row */}
      <div className="bg-surface-card rounded-3xl p-6 sm:p-7 border border-white/5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-2xl shadow-shield-glow">
            🛡️
          </div>
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>Streak Shields Inventory</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950 border border-sky-400/30 text-sky-400 font-mono">
                {streakState.freezes_available ?? 1} of {MAX_FREEZES} Ready
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Next monthly grant arrives on the 1st of next month (+1 shield). Milestone rewards granted at 7-day and 30-day streaks.
            </p>
          </div>
        </div>

        <StreakShield freezesAvailable={streakState.freezes_available ?? 1} maxFreezes={MAX_FREEZES} />
      </div>

      {/* Feature A: Trophy Case / Badges Showcase Grid */}
      <BadgeGrid
        userBadges={userBadges}
        stats={stats}
        onBadgeSeen={onBadgeSeen}
      />

      {/* Medical & Health Data Disclaimer Footer */}
      <div className="bg-surface-card/60 rounded-3xl p-5 border border-white/5 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-base">🩺</span>
          <div>
            <p className="text-slate-300 font-semibold">Medical Safety & Responsibility Disclaimer</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Fuolingo promotes sustainable lifestyle habits. Content is for educational purposes and is not a medical prescription. Consult a healthcare provider before starting any rigorous diet or training routine.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPrivacyModal(true)}
          className="text-accent hover:underline text-xs whitespace-nowrap shrink-0 font-medium"
        >
          View Privacy Rights & Data Policy →
        </button>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-surface-card border border-red-500/30 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-xl">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-white">Permanently Delete Account?</h3>
            <p className="text-xs text-slate-400">
              This will permanently wipe your profile, weight history, streaks, shields, and trophy case. This action is irreversible.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-surface-light text-slate-200 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteAccount();
                }}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onExportData={() => {
          setShowPrivacyModal(false);
          onExportData();
        }}
        onDeleteAccount={() => {
          setShowPrivacyModal(false);
          setShowDeleteConfirm(true);
        }}
      />
    </div>
  );
}

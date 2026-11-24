import React, { useState } from 'react';
import StreakShield from './StreakShield.jsx';

export default function Navbar({
  currentStreak = 0,
  freezesAvailable = 1,
  plan = 'free',
  activePage = 'landing',
  onNavigate = () => {},
  isDemoMode = false,
  onSignOut,
  onExitDemo
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navLinks = [
    { id: 'landing', label: 'Overview' },
    { id: 'home', label: 'Dashboard' },
    { id: 'coach', label: 'Coach' },
    { id: 'workouts', label: 'Workouts' },
    { id: 'log', label: 'Weight Log' },
    { id: 'profile', label: 'Trophy Case' },
    { id: 'contact', label: 'Contact' }
  ];

  function handleSignOut() {
    setShowUserMenu(false);
    if (isDemoMode && onExitDemo) {
      onExitDemo();
    } else if (onSignOut) {
      onSignOut();
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 focus:outline-none group text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-accent-glow transition-transform group-hover:scale-105">
            <svg className="w-6 h-6 fill-slate-950" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-white tracking-tight">
                Fuo<span className="text-accent">lingo</span>
              </span>
              {isDemoMode && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-streak/15 text-streak border border-streak/20">
                  Demo
                </span>
              )}
              {!isDemoMode && (
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-accent/15 text-accent border border-accent/20">
                  {plan === 'free' ? 'Starter' : plan}
                </span>
              )}
            </div>
            <span className="hidden md:block text-[10px] text-slate-400 font-medium">
              Habit & Streak Engine
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-card/60 p-1.5 rounded-full border border-white/5">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onNavigate(link.id)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activePage === link.id
                  ? 'bg-accent text-slate-950 shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right section */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Streak Counter */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-white/5 hover:border-streak/40 text-xs font-semibold text-slate-200 transition-all"
            title={`${currentStreak} day streak active`}
          >
            <span className="text-streak animate-flame">🔥</span>
            <span>{currentStreak}d</span>
          </button>

          {/* Streak Shield */}
          <StreakShield freezesAvailable={freezesAvailable} />

          {activePage === 'landing' ? (
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-accent hover:bg-accent-hover text-slate-950 shadow-accent-glow transition-all active:scale-95"
            >
              Launch App
            </button>
          ) : (
            /* User Menu Button */
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(prev => !prev)}
                className="w-9 h-9 rounded-xl bg-surface-light border border-white/10 flex items-center justify-center text-slate-300 hover:text-accent hover:border-accent/40 transition-colors"
                title="Account"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <>
                  {/* Backdrop to close on click outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 py-2 rounded-xl bg-surface-card border border-white/10 shadow-xl z-50 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => { setShowUserMenu(false); onNavigate('profile'); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile & Trophies
                    </button>
                    <div className="my-1 border-t border-white/5" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {isDemoMode ? 'Exit Demo' : 'Sign Out'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-white/5 text-xs font-bold text-streak"
          >
            <span>🔥 {currentStreak}d</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-xl bg-surface-light text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-surface p-4 space-y-2 animate-fade-in">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => {
                onNavigate(link.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                activePage === link.id
                  ? 'bg-accent text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{link.label}</span>
              {link.id === 'home' && <span className="text-xs">🔥 {currentStreak}d</span>}
            </button>
          ))}

          {/* Mobile sign out */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isDemoMode ? 'Exit Demo' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

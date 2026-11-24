import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Signup({ onSwitchToLogin, onDemoMode }) {
  const { signUp, authError, clearError } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  function validate() {
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return false;
    }
    setLocalError('');
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    const { error } = await signUp({ email, password, displayName: displayName || 'Athlete' });
    setIsLoading(false);

    if (!error) {
      setSignupSuccess(true);
    }
  }

  const displayError = localError || authError;

  // Success state — email confirmation notice
  if (signupSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet/5 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10 text-center">
          <div className="glass-panel rounded-2xl p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/15 text-accent mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Check your email</h2>
            <p className="text-slate-400 text-sm mb-6">
              We sent a confirmation link to <span className="text-white font-semibold">{email}</span>.
              Click the link in the email to activate your account.
            </p>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-accent hover:bg-accent-hover text-slate-950 transition-all active:scale-[0.98]"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-violet/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet to-purple-400 text-white mb-4 shadow-violet-glow">
            <svg className="w-9 h-9 fill-white" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Join <span className="text-accent">Fuolingo</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Start your fitness journey — Duolingo style
          </p>
        </div>

        {/* Signup Card */}
        <div className="glass-panel rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Banner */}
            {displayError && (
              <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-red-300 flex-1">{displayError}</p>
                <button type="button" onClick={() => { setLocalError(''); clearError(); }} className="text-red-400 hover:text-red-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Display Name */}
            <div>
              <label htmlFor="signup-name" className="block text-sm font-semibold text-slate-300 mb-1.5">
                Display name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  id="signup-name"
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Athlete"
                  autoComplete="name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/30 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" className="block text-sm font-semibold text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setLocalError(''); clearError(); }}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/30 transition-colors text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="signup-password" className="block text-sm font-semibold text-slate-300 mb-1.5">
                Password <span className="text-slate-500 font-normal">(min 8 characters)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setLocalError(''); }}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-surface border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/30 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map(level => {
                    const strength = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
                      : password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3
                      : password.length >= 8 ? 2
                      : 1;
                    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-accent'];
                    return (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= strength ? colors[strength - 1] : 'bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" className="block text-sm font-semibold text-slate-300 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  id="signup-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setLocalError(''); }}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl bg-surface border text-white placeholder-slate-500 focus:outline-none transition-colors text-sm ${
                    confirmPassword && confirmPassword === password
                      ? 'border-accent/50 focus:ring-1 focus:ring-accent/30'
                      : confirmPassword && confirmPassword !== password
                      ? 'border-red-500/50 focus:ring-1 focus:ring-red-500/30'
                      : 'border-white/10 focus:border-violet/50 focus:ring-1 focus:ring-violet/30'
                  }`}
                />
                {confirmPassword && confirmPassword === password && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !email || !password || !confirmPassword}
              className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-violet to-purple-500 hover:from-violet-hover hover:to-purple-600 text-white shadow-violet-glow transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Demo Mode */}
          <button
            type="button"
            onClick={onDemoMode}
            className="w-full py-3 rounded-xl text-sm font-semibold bg-surface-light border border-white/10 text-slate-300 hover:text-white hover:border-violet/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Try Demo Mode
          </button>

          {/* Switch to Login */}
          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-violet-light font-semibold hover:underline focus:outline-none"
            >
              Sign in
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
          <br />
          Your health data is encrypted and never shared.
        </p>
      </div>
    </div>
  );
}

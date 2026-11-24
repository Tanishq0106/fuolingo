import React, { useState } from 'react';
import { useConfetti } from '../components/Confetti.jsx';
import { useToast } from '../components/ToastProvider.jsx';

export default function LandingPage({ onLaunchApp = () => {} }) {
  const { burst } = useConfetti();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [interactiveMissions, setInteractiveMissions] = useState([
    { id: 'm1', title: '30-min HIIT Workout', done: true, icon: '⚡' },
    { id: 'm2', title: '2.5L Hydration Goal', done: true, icon: '💧' },
    { id: 'm3', title: 'Nutrition Calorie Target', done: false, icon: '🥗' },
    { id: 'm4', title: '7.5h Rest & Recovery', done: false, icon: '🌙' },
  ]);
  const [demoStreak, setDemoStreak] = useState(5);

  const handleToggleDemoMission = (id) => {
    setInteractiveMissions((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m));
      const doneCount = updated.filter((m) => m.done).length;

      if (doneCount === 3) {
        setDemoStreak(6);
        toast({ message: 'Day 6 streak locked in! 🔥', type: 'success' });
        burst({ intensity: 'normal' });
      } else if (doneCount === 4) {
        toast({ message: 'Perfect day! All 4 missions completed 🎯', type: 'success' });
        burst({ intensity: 'large' });
      } else if (doneCount < 3) {
        setDemoStreak(5);
      }

      return updated;
    });
  };

  const faqs = [
    {
      q: 'How does Fuolingo keep me motivated compared to normal fitness apps?',
      a: 'Traditional fitness apps overwhelm you with complex spreadsheets and guilt-tripping notifications. Fuolingo uses the proven habit loop: 4 micro-missions per day, instant dopamine feedback, streak momentum, and unlockable achievement trophies.'
    },
    {
      q: 'What is a Streak Freeze and how does it protect my progress?',
      a: 'Life happens—sick days, travel, or emergencies shouldn’t wipe away 30 days of discipline. Fuolingo provides automatic Streak Shields. If you miss a day, a shield is consumed silently and your streak remains alive.'
    },
    {
      q: 'Can I connect my Supabase cloud backend?',
      a: 'Yes! Fuolingo comes pre-configured for Supabase with zero setup. You can plug in your Supabase credentials or use our full-stack local storage mode with zero external dependencies.'
    },
    {
      q: 'Why use a 7-day moving average for weight tracking?',
      a: 'Daily weigh-ins fluctuate by up to 2 kg due to water retention, salt intake, and digestion. Our pure SVG trend curve calculates a mathematical moving average to filter out the noise and show your genuine biological progress.'
    }
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 overflow-hidden">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-r from-accent/15 via-violet/15 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-card border border-accent/30 text-accent text-xs sm:text-sm font-semibold shadow-accent-glow">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
            <span>The "Duolingo for Fitness" Habit Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Gamify Your Fitness. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-accent via-emerald-300 to-accent-light bg-clip-text text-transparent">
              Build Streaks That Actually Last.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Stop starting over every Monday. Complete 4 daily micro-missions, protect your consistency with streak shields, unlock badges, and track genuine fat loss with noise-free trend curves.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => onLaunchApp('home')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-accent hover:bg-accent-hover text-slate-950 shadow-accent-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              <span>Launch Fuolingo App</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('demo-playground');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base bg-surface-card hover:bg-surface-light text-white border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <span>Try Interactive Demo</span>
              <span className="text-accent font-mono text-sm">↓</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center -space-x-2">
              {[
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
                'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80'
              ].map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="User avatar"
                  loading="lazy"
                  decoding="async"
                  className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover"
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400">★★★★★</span>
              <span className="text-white font-semibold">4.9/5</span>
              <span>from 20,000+ athletes & coaches</span>
            </div>
            <div className="hidden sm:block text-slate-600">•</div>
            <div>🛡️ 98.4% streak preservation rate with Streak Shields</div>
          </div>
        </div>
      </section>

      {/* Interactive Hero Playground Card */}
      <section id="demo-playground" className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-surface-card border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-accent/15 border-b border-l border-accent/30 rounded-bl-2xl text-[11px] font-bold text-accent uppercase tracking-wider">
            Live Interactive Habit Simulator
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Left: Streak card simulation */}
            <div className="md:col-span-5 bg-surface/90 border border-white/5 rounded-2xl p-6 text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Streak Status
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-6xl font-black text-white">{demoStreak}</span>
                <span className="text-4xl animate-flame">🔥</span>
              </div>
              <p className="text-xs text-slate-300">
                {interactiveMissions.filter(m => m.done).length >= 3 ? (
                  <span className="text-accent font-semibold">
                    ✓ Day {demoStreak} locked in! Consistency guaranteed.
                  </span>
                ) : (
                  <span>Tick 1 more mission below to lock in today's streak!</span>
                )}
              </p>
              <div className="pt-2 flex justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/60 border border-sky-400/30 text-sky-400 text-xs font-semibold">
                  <span>🛡️ 2 Streak Shields Active</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive 4-Missions Checklist */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white text-base">
                  Today's Daily 4 Missions
                </h3>
                <span className="text-xs text-accent font-mono font-medium">
                  {interactiveMissions.filter(m => m.done).length} of 4 Complete
                </span>
              </div>

              {interactiveMissions.map((mission) => (
                <button
                  key={mission.id}
                  type="button"
                  onClick={() => handleToggleDemoMission(mission.id)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    mission.done
                      ? 'bg-accent/10 border-accent/40 text-white'
                      : 'bg-surface/50 border-white/5 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{mission.icon}</span>
                    <span className={`text-sm font-semibold ${mission.done ? 'text-white' : 'text-slate-300'}`}>
                      {mission.title}
                    </span>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                      mission.done
                        ? 'bg-accent border-accent text-slate-950 font-bold'
                        : 'border-slate-600'
                    }`}
                  >
                    {mission.done && '✓'}
                  </div>
                </button>
              ))}

              <p className="text-[11px] text-slate-400 pt-2 text-center italic">
                👆 Click the missions above to experience the micro-celebrations and confetti!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Engineered For Adherence
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Built on Behavioral Psychology, Not Just Calorie Counting.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every feature in Fuolingo has one mission: removing friction so healthy habits compound into lifelong changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: 4 Missions */}
          <div className="bg-surface-card border border-white/5 rounded-3xl p-8 space-y-4 relative overflow-hidden group hover:border-accent/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-accent/15 text-accent flex items-center justify-center text-2xl font-black">
              4
            </div>
            <h3 className="text-xl font-bold text-white">
              Daily Habit Micro-Missions
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              No endless logs. Simply check off your 4 foundational anchors: Workout, Calorie Target, Hydration (2.5L), and 7.5h Rest. 3 out of 4 locks your streak.
            </p>
          </div>

          {/* Card 2: Streak Shields */}
          <div className="bg-surface-card border border-white/5 rounded-3xl p-8 space-y-4 relative overflow-hidden group hover:border-sky-400/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center text-2xl font-black">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-white">
              Smart Streak Shields
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Never let one bad day destroy 30 days of effort. Fuolingo automatically deploys your monthly shield inventory to protect missed days seamlessly.
            </p>
          </div>

          {/* Card 3: Trophy Case */}
          <div className="bg-surface-card border border-white/5 rounded-3xl p-8 space-y-4 relative overflow-hidden group hover:border-amber-400/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-2xl font-black">
              🏆
            </div>
            <h3 className="text-xl font-bold text-white">
              Verifiable Trophy Case
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Permanent badges that celebrate real progress: First Step, 7-Day Week Warrior, Unstoppable 30-Day Streak, and First Kilo Lost.
            </p>
          </div>

          {/* Card 4: Moving Average Chart (Wide) */}
          <div className="md:col-span-2 bg-surface-card border border-white/5 rounded-3xl p-8 space-y-4 relative overflow-hidden group hover:border-violet/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet/15 text-violet flex items-center justify-center text-2xl font-black">
                📈
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Noise-Filtered 7-Day Trend Curves
                </h3>
                <span className="text-xs text-violet font-semibold">Pure SVG • Zero external bloat</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Water fluctuations shouldn't induce anxiety. Our custom Catmull-Rom cubic Bezier algorithm draws smooth 7-day moving averages and marks your exact next 1 kg milestone flag.
            </p>
          </div>

          {/* Card 5: Full Stack & Supabase Ready */}
          <div className="bg-surface-card border border-white/5 rounded-3xl p-8 space-y-4 relative overflow-hidden group hover:border-emerald-400/30 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-2xl font-black">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white">
              Supabase & Offline-First
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Zero lag. Data updates instantly in client state and syncs to Supabase with full Row-Level-Security (RLS) and persistent local fallbacks.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
            Invest in Your Health Habit.
          </h2>
          <p className="text-slate-400 text-sm">
            Choose the plan that fits your athletic journey.
          </p>

          {/* Monthly / Annual Toggle */}
          <div className="inline-flex items-center bg-surface-card border border-white/10 p-1.5 rounded-full mt-4">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-accent text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-accent text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-accent text-[10px] font-extrabold">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Free Tier */}
          <div className="bg-surface border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Starter Habit</h3>
              <p className="text-xs text-slate-400">Great for individuals starting their daily routine.</p>
              <div className="text-4xl font-extrabold text-white">₹0</div>
              <ul className="space-y-3 pt-4 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ 4 Daily habit micro-missions</li>
                <li className="flex items-center gap-2">✓ 1 Monthly streak shield</li>
                <li className="flex items-center gap-2">✓ Standard trophy case badges</li>
                <li className="flex items-center gap-2">✓ 30-Day weight tracking chart</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onLaunchApp('home')}
              className="w-full mt-8 py-3 rounded-xl bg-surface-light hover:bg-slate-700 text-white font-bold text-sm transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="bg-surface-card border-2 border-accent rounded-3xl p-8 flex flex-col justify-between relative shadow-accent-glow">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-slate-950 text-[10px] font-black uppercase tracking-wider">
              Most Popular
            </span>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Pro Athlete</h3>
              <p className="text-xs text-slate-300">For committed fitness enthusiasts building permanent streaks.</p>
              <div className="text-4xl font-extrabold text-white">
                {billingCycle === 'annual' ? '₹599' : '₹799'}
                <span className="text-sm font-normal text-slate-400"> / month</span>
              </div>
              <ul className="space-y-3 pt-4 text-xs text-slate-200">
                <li className="flex items-center gap-2 font-medium">✓ Everything in Starter</li>
                <li className="flex items-center gap-2 font-medium">✓ 2 Streak shields with milestone refills</li>
                <li className="flex items-center gap-2 font-medium">✓ Unlimited weight chart history & milestones</li>
                <li className="flex items-center gap-2 font-medium">✓ Interactive Workout Library & player</li>
                <li className="flex items-center gap-2 font-medium">✓ Cloud sync with Supabase</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onLaunchApp('coach')}
              className="w-full mt-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-slate-950 font-bold text-sm shadow-accent-glow transition-all"
            >
              Explore Pro Coach
            </button>
          </div>

          {/* Team / Coach Tier */}
          <div className="bg-surface border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Coach & Team</h3>
              <p className="text-xs text-slate-400">For trainers and athletic clubs managing client streaks.</p>
              <div className="text-4xl font-extrabold text-white">
                {billingCycle === 'annual' ? '₹1,999' : '₹2,499'}
                <span className="text-sm font-normal text-slate-400"> / month</span>
              </div>
              <ul className="space-y-3 pt-4 text-xs text-slate-300">
                <li className="flex items-center gap-2">✓ Up to 15 client profiles</li>
                <li className="flex items-center gap-2">✓ Team leaderboard & challenge board</li>
                <li className="flex items-center gap-2">✓ Custom mission builder</li>
                <li className="flex items-center gap-2">✓ Priority athletic support</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onLaunchApp('coach')}
              className="w-full mt-8 py-3 rounded-xl bg-surface-light hover:bg-slate-700 text-white font-bold text-sm transition-colors"
            >
              Explore Coach & Team
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">Everything you need to know about Fuolingo.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-surface-card border border-white/5 rounded-2xl p-6 space-y-2">
              <h4 className="text-base font-bold text-white">{faq.q}</h4>
              <p className="text-sm text-slate-300 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-emerald-950 via-slate-900 to-violet/20 border border-accent/30 rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Start Your Unbreakable Fitness Streak Today.
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Join thousands of athletes who turned their workout and nutrition goals into an effortless daily habit.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onLaunchApp('home')}
              className="px-8 py-4 rounded-2xl font-extrabold text-base bg-accent hover:bg-accent-hover text-slate-950 shadow-accent-glow transition-all transform hover:scale-105"
            >
              Launch Fuolingo Free →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 pt-12 pb-8 text-slate-500 text-xs max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 Fuolingo Inc. All rights reserved. The Duolingo for Fitness.</div>
          <div className="flex gap-6">
            <span className="text-slate-400">Encrypted Health Data</span>
            <span className="text-slate-400">Zero Ad-Targeting</span>
            <span className="text-slate-400">GDPR Compliant</span>
          </div>
        </div>
        <div className="flex justify-center gap-5 text-xs"><a href="/privacy" className="text-slate-400 hover:text-accent">Privacy Policy</a><a href="/contact" className="text-slate-400 hover:text-accent">Contact</a></div>
        <p className="text-[11px] text-slate-600 text-center sm:text-left leading-relaxed">
          *Medical Disclaimer: Fuolingo is an athletic habit tracking platform designed for educational and motivation purposes. It does not provide medical diagnosis, treatment, or individualized medical prescriptions. Always consult a qualified physician or healthcare professional before embarking on a weight modification or intensive physical exercise program.
        </p>
      </footer>
    </div>
  );
}

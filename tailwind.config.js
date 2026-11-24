/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090D16',
        surface: {
          DEFAULT: '#111827',
          light: '#1E293B',
          card: '#131B2E',
        },
        border: 'rgba(255, 255, 255, 0.08)',
        accent: {
          DEFAULT: '#10E774',
          hover: '#05D665',
          light: '#3BF18F',
          dim: 'rgba(16, 231, 116, 0.15)',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          hover: '#7C3AED',
          light: '#A78BFA',
          dim: 'rgba(139, 92, 246, 0.15)',
        },
        streak: {
          DEFAULT: '#F97316',
          glow: 'rgba(249, 115, 22, 0.35)',
        },
        shield: {
          DEFAULT: '#0EA5E9',
          dim: 'rgba(14, 165, 233, 0.15)',
        },
        muted: '#94A3B8',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'accent-glow': '0 0 25px rgba(16, 231, 116, 0.35)',
        'violet-glow': '0 0 25px rgba(139, 92, 246, 0.35)',
        'streak-glow': '0 0 25px rgba(249, 115, 22, 0.35)',
        'shield-glow': '0 0 25px rgba(14, 165, 233, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flame': 'flame 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        flame: {
          '0%': { transform: 'scale(1) rotate(-2deg)' },
          '100%': { transform: 'scale(1.08) rotate(2deg)' },
        }
      }
    },
  },
  plugins: [],
}

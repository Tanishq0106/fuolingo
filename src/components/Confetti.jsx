import React, { createContext, useContext, useRef, useCallback, useEffect } from 'react';
import {
  CONFETTI_MAX_PARTICLES,
  CONFETTI_DURATION_MS
} from '../constants.js';

const ConfettiContext = createContext(null);

const THEME_COLORS = [
  '#10E774', // accent
  '#8B5CF6', // violet
  '#F97316', // streak orange
  'rgba(255, 255, 255, 0.85)' // white
];

export function ConfettiProvider({ children }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);

  const isReducedMotion = () => {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  };

  const burst = useCallback(({ intensity = 'normal', origin = { x: 0.5, y: 0.3 } } = {}) => {
    if (isReducedMotion()) return;

    const countMap = {
      large: CONFETTI_MAX_PARTICLES,
      normal: Math.floor(CONFETTI_MAX_PARTICLES * 0.6),
      small: Math.floor(CONFETTI_MAX_PARTICLES * 0.3),
    };
    const count = countMap[intensity] || countMap.normal;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const startX = rect.width * (origin.x ?? 0.5);
    const startY = rect.height * (origin.y ?? 0.3);

    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      newParticles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3, // upward bias
        size: 4 + Math.random() * 6,
        color: THEME_COLORS[Math.floor(Math.random() * THEME_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        isCircle: Math.random() > 0.5,
        alpha: 1,
        life: 0,
        maxLife: CONFETTI_DURATION_MS
      });
    }

    particlesRef.current.push(...newParticles);

    if (!animFrameRef.current) {
      let lastTime = performance.now();

      const animate = (time) => {
        const dt = time - lastTime;
        lastTime = time;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const activeParticles = [];

        for (const p of particlesRef.current) {
          p.life += dt;
          if (p.life < p.maxLife) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25; // gravity
            p.vx *= 0.98; // air resistance
            p.rotation += p.rotationSpeed;
            p.alpha = Math.max(0, 1 - p.life / p.maxLife);

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);

            if (p.isCircle) {
              ctx.beginPath();
              ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
            }

            ctx.restore();
            activeParticles.push(p);
          }
        }

        particlesRef.current = activeParticles;

        if (activeParticles.length > 0) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          animFrameRef.current = null;
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    }
  }, []);

  // Resize canvas responsively and cap DPR at 2
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext('2d');
      ctx?.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <ConfettiContext.Provider value={{ burst }}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />
    </ConfettiContext.Provider>
  );
}

export function useConfetti() {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error('useConfetti must be used within a ConfettiProvider');
  }
  return context;
}

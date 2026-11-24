import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { TOAST_DURATION_MS } from '../constants.js';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ message, type = 'info', duration = TOAST_DURATION_MS }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      // Max 3 visible at once
      const updated = [...prev, { id, message, type }];
      if (updated.length > 3) {
        return updated.slice(updated.length - 3);
      }
      return updated;
    });

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  // Handle escape key to dismiss top toast
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        removeToast(toasts[toasts.length - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toasts, removeToast]);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast container: bottom-center mobile, bottom-right desktop */}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-50 flex flex-col gap-2.5 pointer-events-none w-[90vw] max-w-sm"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => removeToast(t.id)}
            className={`pointer-events-auto cursor-pointer p-4 rounded-2xl bg-surface border border-white/10 shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
              t.type === 'success'
                ? 'border-l-4 border-l-accent'
                : t.type === 'error'
                ? 'border-l-4 border-l-red-500'
                : 'border-l-4 border-l-blue-400'
            }`}
          >
            {/* Indicator Icon */}
            <div className="shrink-0 mt-0.5">
              {t.type === 'success' ? (
                <span className="text-accent text-lg">⚡</span>
              ) : t.type === 'error' ? (
                <span className="text-red-400 text-lg">⚠️</span>
              ) : (
                <span className="text-blue-400 text-lg">ℹ️</span>
              )}
            </div>

            {/* Message */}
            <div className="flex-1 text-sm font-medium text-white leading-snug">
              {t.message}
            </div>

            {/* Close cross */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeToast(t.id);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-md"
              aria-label="Dismiss notification"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

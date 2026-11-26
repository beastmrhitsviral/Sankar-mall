import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface AnimatedNavigateOptions {
  delayMs?: number;
  onBeforeNavigate?: () => void;
}

interface MotionNavContextValue {
  animatedNavigate: (to: string, options?: AnimatedNavigateOptions) => void;
}

const MotionNavContext = createContext<MotionNavContextValue | null>(null);

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function MotionNavProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Zero-reflow GPU compositor micro-spring reaction on pointerdown
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (prefersReducedMotion()) return;
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest('button, a[href], [role="button"]') as HTMLElement | null;
      if (!interactive) return;
      if ((interactive as HTMLButtonElement).disabled) return;
      if (interactive.hasAttribute('data-motion-tap')) return;
      if (typeof interactive.animate !== 'function') return;

      interactive.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.96)' },
          { transform: 'scale(1)' },
        ],
        {
          duration: 145,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }
      );
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const animatedNavigate = useCallback(
    (to: string, options?: AnimatedNavigateOptions) => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const reduced = prefersReducedMotion();
      const delay = reduced ? 0 : (options?.delayMs ?? 0);

      if (delay <= 0) {
        options?.onBeforeNavigate?.();
        navigate(to);
        return;
      }

      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        options?.onBeforeNavigate?.();
        navigate(to);
      }, delay);
    },
    [navigate]
  );

  return (
    <MotionNavContext.Provider value={{ animatedNavigate }}>
      {children}
    </MotionNavContext.Provider>
  );
}

export function useMotionNav(): MotionNavContextValue {
  const ctx = useContext(MotionNavContext);
  if (!ctx) {
    throw new Error('useMotionNav must be used inside MotionNavProvider');
  }
  return ctx;
}

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Delete, Lock, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useMotionNav } from '../context/MotionNavContext';

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Clear', '0', 'Back'] as const;

export function ManagerPinModal() {
  const { isPinModalOpen, setPinModalOpen, unlockManagerWithPin } = useStore();
  const { animatedNavigate } = useMotionNav();

  const [digits, setDigits] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shakeCount, setShakeCount] = useState(0);

  const closeModal = useCallback(() => {
    setPinModalOpen(false);
    setDigits('');
    setErrorMsg('');
  }, [setPinModalOpen]);

  const tryPin = useCallback(
    (candidate: string) => {
      if (candidate.length < 4) return;
      const ok = unlockManagerWithPin(candidate);
      if (ok) {
        setDigits('');
        setErrorMsg('');
        animatedNavigate('/manager', {
          delayMs: 180,
          onBeforeNavigate: () => setPinModalOpen(false),
        });
      } else {
        setErrorMsg('Incorrect PIN');
        setShakeCount((c) => c + 1);
        window.setTimeout(() => {
          setDigits('');
        }, 320);
      }
    },
    [animatedNavigate, setPinModalOpen, unlockManagerWithPin]
  );

  const handleKeyPress = useCallback(
    (key: (typeof KEYPAD_KEYS)[number]) => {
      if (key === 'Clear') {
        setDigits('');
        setErrorMsg('');
        return;
      }
      if (key === 'Back') {
        setDigits((prev) => prev.slice(0, -1));
        setErrorMsg('');
        return;
      }
      setErrorMsg('');
      setDigits((prev) => {
        if (prev.length >= 4) return prev;
        const next = prev + key;
        if (next.length === 4) {
          window.setTimeout(() => tryPin(next), 90);
        }
        return next;
      });
    },
    [tryPin]
  );

  useEffect(() => {
    if (!isPinModalOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key as (typeof KEYPAD_KEYS)[number]);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyPress('Back');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeModal, handleKeyPress, isPinModalOpen]);

  return (
    <AnimatePresence>
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeModal}
            aria-hidden="true"
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs"
          />

          <motion.div
            key={shakeCount}
            role="dialog"
            aria-modal="true"
            aria-label="Shankar Mall Manager PIN Entry"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={
              shakeCount > 0
                ? {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    x: [0, -10, 10, -8, 8, -4, 4, 0],
                  }
                : { opacity: 1, scale: 1, y: 0, x: 0 }
            }
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: shakeCount > 0 ? 0.32 : 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-xs rounded-[30px] bg-slate-900/72 backdrop-blur-xl border border-white/30 ring-1 ring-inset ring-white/15 shadow-[0_24px_64px_rgba(15,23,42,0.5)] p-6 text-white will-change-transform"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-full bg-white/15 border border-white/25 inline-flex items-center justify-center">
                  <Lock className="w-4 h-4 text-amber-300" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold leading-tight">
                    Shankar Mall Access
                  </h2>
                  <p className="text-[11px] text-white/75">Enter 4-digit PIN</p>
                </div>
              </div>

              <motion.button
                type="button"
                data-motion-tap
                whileTap={{ scale: 0.88 }}
                onClick={closeModal}
                aria-label="Close PIN modal"
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 inline-flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* 4-Digit Masked Input Slots */}
            <div
              aria-label="Entered PIN digits"
              className="grid grid-cols-4 gap-3 mb-3 px-2"
            >
              {[0, 1, 2, 3].map((idx) => {
                const filled = idx < digits.length;
                return (
                  <motion.div
                    key={idx}
                    animate={{
                      scale: filled ? [1, 1.12, 1] : 1,
                    }}
                    transition={{ duration: 0.16 }}
                    className={`h-12 rounded-2xl border flex items-center justify-center transition-colors ${
                      errorMsg
                        ? 'border-rose-400/80 bg-rose-500/20'
                        : filled
                        ? 'border-amber-300/80 bg-white/25'
                        : 'border-white/25 bg-white/10'
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full transition-transform duration-150 ${
                        filled ? 'bg-white scale-100' : 'bg-white/20 scale-75'
                      }`}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Error state */}
            <div className="h-6 flex items-center justify-center mb-3">
              {errorMsg && (
                <p role="alert" className="text-xs font-semibold text-rose-300">
                  {errorMsg}
                </p>
              )}
            </div>

            {/* Tactile Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2.5">
              {KEYPAD_KEYS.map((key) => {
                const isAction = key === 'Clear' || key === 'Back';
                return (
                  <motion.button
                    key={key}
                    type="button"
                    data-motion-tap
                    whileTap={{ scale: 0.88 }}
                    onClick={() => handleKeyPress(key)}
                    aria-label={key === 'Back' ? 'Backspace' : key}
                    className={`h-12 rounded-2xl border flex items-center justify-center font-mono text-base font-semibold transition-colors cursor-pointer select-none ${
                      isAction
                        ? 'bg-white/10 hover:bg-white/20 border-white/20 text-xs font-sans text-white/85'
                        : 'bg-white/15 hover:bg-white/25 border-white/25 text-white shadow-xs'
                    }`}
                  >
                    {key === 'Back' ? <Delete className="w-4 h-4" /> : key}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

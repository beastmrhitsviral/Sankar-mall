import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Camera, Home, LayoutGrid, Search, Sparkles, X } from 'lucide-react';
import { SECTIONS } from '../lib/catalog';
import { AnimatedLink } from './AnimatedLink';
import { ResilientImage } from './ResilientImage';

function isTextInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (el as HTMLElement).isContentEditable
  );
}

export function MobilePillDock() {
  const { pathname } = useLocation();
  const [isBigDockOpen, setBigDockOpen] = useState(false);

  // Close sections menu box on navigation away from Home
  useEffect(() => {
    setBigDockOpen(false);
  }, [pathname]);

  // Lock dock at its resting screen position when soft keyboard opens or overlays appear
  const baseViewportHeightRef = useRef<number>(
    typeof window !== 'undefined' ? window.innerHeight : 844
  );
  const [keyboardOffsetPx, setKeyboardOffsetPx] = useState(0);

  useEffect(() => {
    const syncDockPosition = () => {
      const currentInnerHeight = window.innerHeight;
      const focused = isTextInputFocused();

      if (!focused && currentInnerHeight >= baseViewportHeightRef.current - 40) {
        baseViewportHeightRef.current = currentInnerHeight;
        setKeyboardOffsetPx(0);
        return;
      }

      if (focused) {
        const shrinkDelta = Math.max(0, baseViewportHeightRef.current - currentInnerHeight);
        setKeyboardOffsetPx(shrinkDelta > 80 ? shrinkDelta : 0);
      } else {
        setKeyboardOffsetPx(0);
      }
    };

    const onOrientationChange = () => {
      window.setTimeout(() => {
        if (!isTextInputFocused()) {
          baseViewportHeightRef.current = window.innerHeight;
          setKeyboardOffsetPx(0);
        }
      }, 250);
    };

    window.addEventListener('resize', syncDockPosition);
    window.addEventListener('orientationchange', onOrientationChange);
    window.addEventListener('focusin', syncDockPosition);
    window.addEventListener('focusout', syncDockPosition);
    window.visualViewport?.addEventListener('resize', syncDockPosition);

    return () => {
      window.removeEventListener('resize', syncDockPosition);
      window.removeEventListener('orientationchange', onOrientationChange);
      window.removeEventListener('focusin', syncDockPosition);
      window.removeEventListener('focusout', syncDockPosition);
      window.visualViewport?.removeEventListener('resize', syncDockPosition);
    };
  }, []);

  if (pathname !== '/') {
    return null;
  }

  const closeBigDock = () => setBigDockOpen(false);

  return (
    <div className="md:hidden">
      {/* Backdrop blur scrim when Sections Menu Box is open */}
      <AnimatePresence>
        {isBigDockOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeBigDock}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Persistent Bottom Dock container — stays fixed steadily on Homepage */}
      <div
        style={{ bottom: `${12 - keyboardOffsetPx}px` }}
        className={`fixed inset-x-0 flex flex-col items-center gap-3 px-3 pointer-events-none ${
          isBigDockOpen ? 'z-50' : 'z-30'
        }`}
      >
        {/* Sections Menu Box emerging smoothly upward from the bottom dock */}
        <AnimatePresence>
          {isBigDockOpen && (
            <motion.section
              key="dock-sections-menu"
              aria-label="Store Sections Quick Dock"
              style={{ transformOrigin: '50% 100%' }}
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.92 }}
              transition={{ type: 'spring', damping: 32, stiffness: 460, mass: 0.65 }}
              className="pointer-events-auto w-full max-w-md rounded-[28px] bg-slate-900/65 backdrop-blur-xl border border-white/35 ring-1 ring-inset ring-white/20 shadow-[0_24px_64px_rgba(15,23,42,0.42)] p-4 text-white will-change-transform"
            >
              {/* Menu Box Header */}
              <div className="flex items-center justify-between gap-3 px-1 pb-3 border-b border-white/20">
                <div>
                  <p className="font-display text-base font-bold tracking-tight text-white drop-shadow-xs">
                    Store Sections
                  </p>
                  <p className="text-[11px] text-white/80">
                    Tap a section to jump straight in
                  </p>
                </div>
                <motion.button
                  type="button"
                  data-motion-tap
                  whileTap={{ scale: 0.88 }}
                  onClick={closeBigDock}
                  aria-label="Close big sections dock"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 inline-flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Smooth Oval Section Boxes */}
              <div className="pt-3.5 pb-1 flex flex-wrap items-center justify-center gap-2">
                <AnimatedLink
                  to="/category/all"
                  onBeforeNavigate={closeBigDock}
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 border border-white/30 bg-white/20 hover:bg-white/30 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>All Sections</span>
                </AnimatedLink>

                {SECTIONS.map((section) => (
                  <AnimatedLink
                    key={section.slug}
                    to={`/category/${section.slug}`}
                    onBeforeNavigate={closeBigDock}
                    className="inline-flex items-center gap-2 rounded-full pl-1.5 pr-3.5 py-1.5 border border-white/30 bg-white/15 hover:bg-white/25 text-xs font-semibold text-white shadow-sm transition-colors whitespace-nowrap shrink-0"
                  >
                    <ResilientImage
                      src={section.image}
                      alt={section.name}
                      loading="eager"
                      className="w-6 h-6 rounded-full object-cover border border-white/35 shrink-0"
                    />
                    <span className="drop-shadow-xs">{section.name}</span>
                  </AnimatedLink>
                ))}

                <AnimatedLink
                  to="/quick-list"
                  onBeforeNavigate={closeBigDock}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 border border-amber-300/50 bg-amber-400/20 hover:bg-amber-400/30 text-xs font-semibold text-amber-200 transition-colors whitespace-nowrap shrink-0"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                  <span>Snap List</span>
                </AnimatedLink>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Bottom Dock — Always visible steadily on Homepage */}
        <motion.nav
          aria-label="Mobile quick navigation"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 360, mass: 0.7 }}
          className="pointer-events-auto will-change-transform"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/40 backdrop-blur-lg text-white shadow-[0_12px_40px_rgba(15,23,42,0.28)] border border-white/35 ring-1 ring-inset ring-white/20">
            <AnimatedLink
              to="/"
              onBeforeNavigate={closeBigDock}
              aria-label="Home"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 drop-shadow-[0_1px_2px_rgba(15,23,42,0.55)] ${
                !isBigDockOpen
                  ? 'bg-white/25 text-amber-300 border border-white/25'
                  : 'text-white/95 hover:bg-white/15'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </AnimatedLink>

            <motion.button
              type="button"
              data-motion-tap
              whileTap={{ scale: 0.9 }}
              onClick={() => setBigDockOpen((prev) => !prev)}
              aria-label="Store Sections"
              aria-expanded={isBigDockOpen}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer drop-shadow-[0_1px_2px_rgba(15,23,42,0.55)] ${
                isBigDockOpen
                  ? 'bg-white/25 text-amber-300 border border-white/30'
                  : 'text-white/95 hover:bg-white/15'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Sections</span>
            </motion.button>

            <AnimatedLink
              to="/search"
              onBeforeNavigate={closeBigDock}
              aria-label="Search"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 drop-shadow-[0_1px_2px_rgba(15,23,42,0.55)] text-white/95 hover:bg-white/15"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </AnimatedLink>
          </div>
        </motion.nav>
      </div>
    </div>
  );
}

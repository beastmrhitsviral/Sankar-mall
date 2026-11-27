import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Home, PackageCheck, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AnimatedLink } from './AnimatedLink';

export function Header() {
  const { pathname } = useLocation();
  const { bagSummary, setBagDrawerOpen } = useStore();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/92 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-[1280px] mx-auto h-full px-3.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-6">
        {/* Top-Left: Shankar Mall only on Homepage; animated Home oval bubble on every other page */}
        <div className="flex items-center shrink-0 min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {isHome ? (
              <motion.div
                key="brand-shankar"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
              >
                <AnimatedLink
                  to="/"
                  className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-1"
                >
                  <span className="text-[#1E3A8A]">Shankar</span>
                  <span>Mall</span>
                </AnimatedLink>
              </motion.div>
            ) : (
              <motion.div
                key="home-oval-bubble"
                initial={{ opacity: 0, scale: 0.88, x: -6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.88, x: -6 }}
                transition={{ type: 'spring', stiffness: 460, damping: 28, mass: 0.65 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.88 }}
                data-motion-tap
              >
                <AnimatedLink
                  to="/"
                  aria-label="Back to Home"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100/95 hover:bg-blue-50 border border-slate-200/90 hover:border-[#1E3A8A]/30 text-slate-900 hover:text-[#1E3A8A] text-xs sm:text-sm font-semibold shadow-xs transition-colors whitespace-nowrap shrink-0"
                >
                  <Home className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                  <span>Home</span>
                </AnimatedLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Top-Right: Track + Bag Drawer Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <AnimatedLink
            to="/track-order"
            aria-label="Track Booking Status"
            title="Track Booking Status"
            className="h-9 sm:h-10 px-2.5 sm:px-3 inline-flex items-center gap-1.5 rounded-lg text-slate-700 hover:text-[#1E3A8A] hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="text-xs font-semibold">Track</span>
          </AnimatedLink>

          <button
            type="button"
            onClick={() => setBagDrawerOpen(true)}
            aria-label={`Open Pickup Bag (${bagSummary.itemCount} items)`}
            className="h-9 sm:h-10 px-2.5 sm:px-3 inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-[#1E3A8A] hover:bg-[#172E6E] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Bag</span>
            <span
              data-testid="bag-count"
              className="font-mono tabular-nums bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[11px] font-bold leading-none"
            >
              {bagSummary.itemCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

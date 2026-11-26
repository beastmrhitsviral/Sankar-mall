import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, PackageCheck, Search, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AnimatedLink } from './AnimatedLink';

export function Header() {
  const { bagSummary, setSectionsDrawerOpen, setBagDrawerOpen } = useStore();
  const { pathname } = useLocation();
  const isSearchPage = pathname === '/search';

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-[1280px] mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-6">
        {/* Left: Menu Drawer Trigger + Shankar Mall Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setSectionsDrawerOpen(true)}
            aria-label="Open store sections directory"
            className="w-9 h-9 sm:w-10 sm:h-10 inline-flex items-center justify-center rounded-lg text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <AnimatedLink
            to="/"
            className="font-display text-base sm:text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-1"
          >
            <span className="text-[#1E3A8A]">Shankar</span>
            <span>Mall</span>
          </AnimatedLink>
        </div>

        {/* Center: Half-Size Search Trigger Button (Shrinks & shifts down then disappears on /search) */}
        <div className="flex-1 flex justify-center min-w-0">
          <AnimatePresence>
            {!isSearchPage && (
              <motion.div
                key="header-search-trigger"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.72, y: 18 }}
                whileTap={{ scale: 0.84 }}
                transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
              >
                <AnimatedLink
                  to="/search"
                  data-motion-tap
                  delayMs={45}
                  aria-label="Search"
                  className="w-32 sm:w-52 h-9 sm:h-10 px-3.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/70 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
                >
                  <Search className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Search</span>
                </AnimatedLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Track Icon + Bag Drawer Trigger */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <AnimatedLink
            to="/track-order"
            aria-label="Track Booking Status"
            title="Track Booking Status"
            className="h-9 sm:h-10 px-2 sm:px-3 inline-flex items-center gap-1.5 rounded-lg text-slate-700 hover:text-[#1E3A8A] hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="hidden lg:inline text-xs font-medium">Track</span>
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

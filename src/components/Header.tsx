import { Menu, PackageCheck, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AnimatedLink } from './AnimatedLink';

export function Header() {
  const { bagSummary, setSectionsDrawerOpen, setBagDrawerOpen } = useStore();

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

        {/* Right: Track (always labeled "Track") + Bag Drawer Trigger */}
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

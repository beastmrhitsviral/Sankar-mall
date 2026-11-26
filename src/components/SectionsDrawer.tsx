import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ChevronRight, Lock, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SECTIONS } from '../lib/catalog';
import { AnimatedLink } from './AnimatedLink';
import { ResilientImage } from './ResilientImage';

export function SectionsDrawer() {
  const { isSectionsDrawerOpen, setSectionsDrawerOpen } = useStore();
  const [policyOpen, setPolicyOpen] = useState(false);

  const close = () => setSectionsDrawerOpen(false);

  return (
    <AnimatePresence>
      {isSectionsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={close}
            className="fixed inset-0 bg-slate-950/35 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 420, mass: 0.8 }}
            aria-label="Shankar Mall Sections Directory"
            className="relative w-full max-w-sm bg-white/88 backdrop-blur-xl h-full shadow-2xl border-r border-white/60 flex flex-col z-10 will-change-transform"
          >
            <div className="h-16 px-5 border-b border-slate-200/70 flex items-center justify-between shrink-0">
              <div>
                <p className="font-display text-lg font-bold text-slate-900">
                  Store Sections
                </p>
                <p className="text-xs text-slate-600">Hirapur &amp; Rangatand, Dhanbad</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close sections directory"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full text-slate-700 hover:bg-white/80 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {SECTIONS.map((section) => (
                <AnimatedLink
                  key={section.slug}
                  to={`/category/${section.slug}`}
                  onBeforeNavigate={close}
                  className="flex items-center gap-3 p-2 pr-4 border border-slate-200/75 rounded-full bg-white/90 shadow-xs hover:bg-white hover:border-[#1E3A8A]/40 transition-colors"
                >
                  <ResilientImage
                    src={section.image}
                    alt={section.name}
                    className="w-11 h-11 rounded-full object-cover shrink-0 bg-slate-100 border border-slate-200/70"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {section.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </AnimatedLink>
              ))}

              <div className="pt-3 space-y-2">
                <AnimatedLink
                  to="/quick-list"
                  onBeforeNavigate={close}
                  className="block w-full px-5 py-3 rounded-full bg-amber-100/90 border border-amber-300/70 text-slate-900 text-sm font-semibold hover:bg-amber-200/80 transition-colors text-center"
                >
                  Snap &amp; Send Handwritten List
                </AnimatedLink>
                <AnimatedLink
                  to="/track-order"
                  onBeforeNavigate={close}
                  className="block w-full px-5 py-3 rounded-full bg-white/90 border border-slate-200/80 text-slate-900 text-sm font-medium hover:bg-white transition-colors text-center"
                >
                  Track Express Booking Pass
                </AnimatedLink>
              </div>
            </div>

            {/* Discreet bottom accordion for corporate/policy & staff counter */}
            <div className="border-t border-slate-200/70 bg-white/75 p-4 shrink-0">
              <button
                type="button"
                aria-expanded={policyOpen}
                onClick={() => setPolicyOpen((v) => !v)}
                className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 py-1 cursor-pointer"
              >
                <span>Store Information &amp; Policies</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    policyOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {policyOpen && (
                <nav
                  aria-label="Store information links"
                  className="pt-3 grid grid-cols-2 gap-2 text-xs text-slate-600"
                >
                  <AnimatedLink to="/about" onBeforeNavigate={close} className="hover:text-[#1E3A8A] py-1">
                    About Shankar Mall
                  </AnimatedLink>
                  <AnimatedLink to="/contact" onBeforeNavigate={close} className="hover:text-[#1E3A8A] py-1">
                    Dhanbad Branches
                  </AnimatedLink>
                  <AnimatedLink to="/faq" onBeforeNavigate={close} className="hover:text-[#1E3A8A] py-1">
                    Pickup FAQ
                  </AnimatedLink>
                  <AnimatedLink to="/terms" onBeforeNavigate={close} className="hover:text-[#1E3A8A] py-1">
                    Terms of Pickup
                  </AnimatedLink>
                  <AnimatedLink to="/privacy" onBeforeNavigate={close} className="hover:text-[#1E3A8A] py-1">
                    Privacy Policy
                  </AnimatedLink>
                  <AnimatedLink
                    to="/admin"
                    onBeforeNavigate={close}
                    className="inline-flex items-center gap-1 text-[#1E3A8A] font-semibold py-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Staff Counter</span>
                  </AnimatedLink>
                </nav>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

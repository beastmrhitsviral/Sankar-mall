import { MapPin, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AnimatedLink } from './AnimatedLink';

export function Footer() {
  const { siteSettings, setPinModalOpen } = useStore();

  return (
    <footer className="border-t border-slate-200 bg-slate-50/70 pb-20 md:pb-0">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-200">
          <div>
            <p className="font-display text-lg font-bold text-slate-900">
              <span className="text-[#1E3A8A]">Shankar</span> Mall
            </p>
            <p className="text-sm text-slate-600 mt-2 max-w-xs leading-relaxed">
              Dhanbad&apos;s trusted departmental store &amp; supermarket. Reserve online, skip queues, and pay at the Express Counter.
            </p>
          </div>

          <div className="space-y-2.5 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Dhanbad Branches ({siteSettings.openingHours})</p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
              <span>Hirapur · Hari Mandir Road, Dhanbad 826001</span>
            </p>
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
              <span>Rangatand · Near Railway Station, Dhanbad 826001</span>
            </p>
            <p className="flex items-center gap-2 font-mono text-xs text-slate-700 pt-1">
              <Phone className="w-3.5 h-3.5 text-[#1E3A8A]" />
              <span>Express Desk: +91 81028 00129</span>
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold text-slate-900">Click &amp; Collect</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600">
              <AnimatedLink to="/quick-list" className="hover:text-[#1E3A8A]">
                Snap &amp; Send List
              </AnimatedLink>
              <AnimatedLink to="/track-order" className="hover:text-[#1E3A8A]">
                Track Booking
              </AnimatedLink>
              <AnimatedLink to="/about" className="hover:text-[#1E3A8A]">
                About Store
              </AnimatedLink>
              <AnimatedLink to="/contact" className="hover:text-[#1E3A8A]">
                Contact &amp; Map
              </AnimatedLink>
              <AnimatedLink to="/faq" className="hover:text-[#1E3A8A]">
                Pickup FAQ
              </AnimatedLink>
              <AnimatedLink to="/admin" className="hover:text-[#1E3A8A] font-medium text-slate-800">
                Staff Counter
              </AnimatedLink>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()}{' '}
            <button
              type="button"
              onClick={() => setPinModalOpen(true)}
              className="hover:text-slate-800 transition-colors cursor-pointer"
            >
              @Shankar Mall
            </button>
          </p>
          <div className="flex items-center gap-4">
            <AnimatedLink to="/terms" className="hover:text-slate-900">
              Terms
            </AnimatedLink>
            <AnimatedLink to="/privacy" className="hover:text-slate-900">
              Privacy
            </AnimatedLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

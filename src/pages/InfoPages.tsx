import { useState } from 'react';
import { ChevronDown, Clock, MapPin, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AnimatedLink } from '../components/AnimatedLink';

export function AboutPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      <p className="text-xs font-semibold text-[#1E3A8A]">Dhanbad&apos;s Curated Departmental Store</p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
        About Shankar Mall
      </h1>
      <p className="text-base text-slate-600 leading-relaxed">
        Serving families across Hirapur, Bank More, Rangatand, and Saraidhela, Shankar Mall brings together eight thoughtfully organized sections—Chocolate, Women Dress, Men Dress, Decorations Things, Toys, Skin Care, Snacks &amp; Biscuits, and Grains.
      </p>
      <p className="text-base text-slate-600 leading-relaxed">
        With Click &amp; Collect, you never have to wait in weekend billing queues. Reserve items online or upload your monthly handwritten list, get a QR Booking Pass, and collect your packed bags from our dedicated Express Counter.
      </p>
      <div className="pt-4">
        <AnimatedLink
          to="/category/all"
          className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-sm font-semibold"
        >
          Browse All Sections
        </AnimatedLink>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { siteSettings } = useStore();

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <div>
        <p className="text-xs font-semibold text-[#1E3A8A]">Visit Our Dhanbad Counters</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
          Branches &amp; Contact
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-2xl p-6 space-y-3 bg-white">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Hirapur — Hari Mandir Road
          </h2>
          <p className="text-sm text-slate-600 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
            <span>Hari Mandir Road, Hirapur, Dhanbad, Jharkhand 826001</span>
          </p>
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Open Daily: {siteSettings.openingHours}</span>
          </p>
          <p className="text-sm font-mono text-slate-800 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            <span>+91 81028 00129</span>
          </p>
        </div>

        <div className="border border-slate-200 rounded-2xl p-6 space-y-3 bg-white">
          <h2 className="font-display text-xl font-bold text-slate-900">
            Rangatand — Near Railway Station
          </h2>
          <p className="text-sm text-slate-600 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
            <span>Rangatand Chowk, Near Dhanbad Junction, Jharkhand 826001</span>
          </p>
          <p className="text-sm text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Open Daily: {siteSettings.openingHours}</span>
          </p>
          <p className="text-sm font-mono text-slate-800 flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#1E3A8A] shrink-0" />
            <span>+91 81028 00129</span>
          </p>
        </div>
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: 'Do I need to create an account or pay online to reserve items?',
    a: 'No. Shankar Mall Click & Collect requires zero login and zero advance payment. Just enter your name, 10-digit WhatsApp number, branch, and pickup slot, and pay by Cash, UPI, or Card at the Express Counter.',
  },
  {
    q: 'How does Snap & Send Shopping List work?',
    a: 'Take a photo of your handwritten paper grocery list (or type items in our notepad) on the Snap List page. Our store staff packs your order and notifies you on WhatsApp with the final counter bill.',
  },
  {
    q: 'How quickly will my order be ready?',
    a: 'Bookings placed in the "Within 2 Hours" slot are prioritized immediately and typically ready within 60–90 minutes during store hours (9 AM – 9:30 PM).',
  },
  {
    q: 'Can I exchange apparel sizes at pickup?',
    a: 'Yes. For Men Dress and Women Dress reservations, you can try or swap sizes right at the counter before completing payment.',
  },
];

export function FaqPage() {
  const { siteSettings } = useStore();
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const faqItems = FAQ_ITEMS.map((item, idx) =>
    idx === 2
      ? {
          ...item,
          a: `Bookings placed in the "Within 2 Hours" slot are prioritized immediately and typically ready within 60–90 minutes during store hours (${siteSettings.openingHours}).`,
        }
      : item
  );

  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#1E3A8A]">Help Center</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
          Frequently Asked Questions
        </h1>
      </div>

      <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white overflow-hidden">
        {faqItems.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={item.q}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 hover:bg-slate-50 cursor-pointer"
              >
                <span className="text-sm sm:text-base">{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 text-slate-500 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-5">
      <h1 className="font-display text-3xl font-bold text-slate-900">Terms of Store Pickup</h1>
      <p className="text-sm text-slate-600 leading-relaxed">
        1. Reserved items and packed photo-list orders are held at your chosen Dhanbad Express Counter until the end of your selected pickup day.
      </p>
      <p className="text-sm text-slate-600 leading-relaxed">
        2. Prices shown online reflect current in-store Shankar Mall offers; exact billing is finalized upon barcode scan at the Express Counter via Cash, UPI, or Card.
      </p>
      <p className="text-sm text-slate-600 leading-relaxed">
        3. Uncollected bookings automatically release stock back to store shelves after store closing at 9:30 PM without any penalty.
      </p>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-5">
      <h1 className="font-display text-3xl font-bold text-slate-900">Privacy Policy</h1>
      <p className="text-sm text-slate-600 leading-relaxed">
        Shankar Mall collects only your full name, 10-digit WhatsApp mobile number, preferred Dhanbad branch, and pickup items or uploaded list photo strictly to pack and hand over your Click &amp; Collect order.
      </p>
      <p className="text-sm text-slate-600 leading-relaxed">
        We do not require passwords, store credit card details, or send unsolicited promotional messages.
      </p>
    </div>
  );
}

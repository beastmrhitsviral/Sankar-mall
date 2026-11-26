import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Package, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  buildPhotoListWhatsAppUrl,
  buildStoreWhatsAppUrl,
  findBookingsByQuery,
  formatINR,
} from '../lib/bookingStore';
import { BookingRecord, OrderStatus } from '../lib/types';

const STEPS: { key: OrderStatus; label: string; description: string }[] = [
  {
    key: 'Pending',
    label: 'Booking Received',
    description: 'Confirmed at Shankar Mall packing desk',
  },
  {
    key: 'Packing',
    label: 'Staff Packing',
    description: 'Team is gathering and verifying your items',
  },
  {
    key: 'Ready',
    label: 'Ready at Counter',
    description: 'Sealed at Express Counter for instant pickup',
  },
];

function getStepIndex(status: OrderStatus): number {
  if (status === 'Packing') return 1;
  if (status === 'Ready' || status === 'Completed') return 2;
  return 0;
}

export function TrackOrderPage() {
  const { bookings } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('id') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<BookingRecord[]>(() =>
    initialQuery ? findBookingsByQuery(initialQuery) : []
  );
  const [searched, setSearched] = useState(Boolean(initialQuery));

  useEffect(() => {
    if (query.trim()) {
      setResults(findBookingsByQuery(query));
    }
  }, [bookings, query]);

  const runSearch = (value: string) => {
    setQuery(value);
    setSearched(true);
    setResults(findBookingsByQuery(value));
    if (value.trim()) {
      setSearchParams({ id: value.trim() });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(query);
  };

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#1E3A8A]">Live Express Counter Lookup</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
          Track Your Booking Pass
        </h1>
        <p className="text-sm text-slate-600">
          Enter your Booking ID (e.g. #SM-8412) or 10-digit WhatsApp mobile number.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter #SM-XXXX or 10-digit phone number"
            aria-label="Booking ID or Phone Number"
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-300 focus:border-[#1E3A8A] text-sm font-mono outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-12 px-6 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white font-semibold text-sm transition-colors cursor-pointer shrink-0"
        >
          Track Order
        </button>
      </form>

      {/* Quick Demo Pass Selectors */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-medium">Try seeded Dhanbad passes:</span>
        {bookings.slice(0, 3).map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => runSearch(b.id)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:border-[#1E3A8A] font-mono text-slate-800 cursor-pointer transition-colors"
          >
            {b.id} · {b.status}
          </button>
        ))}
      </div>

      {searched && results.length === 0 && (
        <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-2">
          <p className="font-display text-lg font-semibold text-slate-900">
            No booking found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-slate-600">
            Check your Booking Pass number (#SM-XXXX) or the 10-digit phone number used at checkout.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {results.map((booking) => {
          const activeStep = getStepIndex(booking.status);
          const waHref =
            booking.kind === 'standard'
              ? buildStoreWhatsAppUrl(booking)
              : buildPhotoListWhatsAppUrl(booking);

          return (
            <div
              key={booking.id}
              className="border border-slate-200 rounded-2xl bg-white overflow-hidden"
            >
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xl font-bold text-[#1E3A8A] tabular-nums">
                      {booking.id}
                    </span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {booking.customerName}
                    </span>
                    {booking.status === 'Completed' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                        Completed · Picked Up
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {booking.branch} · Slot: {booking.pickupSlot}
                  </p>
                </div>

                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold transition-colors"
                >
                  WhatsApp Store Desk
                </a>
              </div>

              {/* Animated 3-Step Tracker */}
              <div className="p-5 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                  {STEPS.map((step, idx) => {
                    const completed = idx <= activeStep;
                    const isCurrent = idx === activeStep;
                    const Icon =
                      idx === 0 ? Clock : idx === 1 ? Package : CheckCircle2;

                    return (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.08 }}
                        className={`p-4 rounded-xl border transition-colors ${
                          isCurrent
                            ? 'border-[#1E3A8A] bg-blue-50/60'
                            : completed
                            ? 'border-emerald-200 bg-emerald-50/40'
                            : 'border-slate-200 bg-white opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isCurrent
                                ? 'text-[#1E3A8A]'
                                : completed
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }`}
                          />
                          <span className="text-sm font-bold text-slate-900">
                            {step.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{step.description}</p>
                      </motion.div>
                    );
                  })}
                </div>

                {booking.kind === 'standard' ? (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Reserved Items ({booking.items.length})</span>
                      <span className="font-mono text-slate-900 tabular-nums">
                        Payable at Counter: {formatINR(booking.subtotal)}
                      </span>
                    </div>
                    <ul className="divide-y divide-slate-100">
                      {booking.items.map((item) => (
                        <li
                          key={`${item.productId}-${item.variant}`}
                          className="py-2 flex items-center justify-between text-sm"
                        >
                          <span className="text-slate-800">
                            {item.name} ({item.variant}) × {item.quantity}
                          </span>
                          <span className="font-mono font-medium text-slate-900 tabular-nums">
                            {formatINR(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                    {booking.listText && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1.5">
                          Shopping List Notes
                        </p>
                        <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap font-sans">
                          {booking.listText}
                        </pre>
                      </div>
                    )}
                    {booking.photoDataUrl && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-1.5">
                          Attached List Photo
                        </p>
                        <img
                          src={booking.photoDataUrl}
                          alt="Uploaded shopping list"
                          className="max-h-48 rounded-lg border border-slate-200 bg-white object-contain"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

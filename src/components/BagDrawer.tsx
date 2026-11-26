import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useMotionNav } from '../context/MotionNavContext';
import {
  formatINR,
  PAYMENT_MODE_LABEL,
  validateBookingCustomerInput,
} from '../lib/bookingStore';
import { BranchName, PickupSlot } from '../lib/types';
import { QrPassCard } from './QrPassCard';
import { ResilientImage } from './ResilientImage';

const BRANCHES: BranchName[] = [
  'Hirapur - Hari Mandir Road',
  'Rangatand - Near Railway Station',
];

const PICKUP_SLOTS: PickupSlot[] = [
  'Within 2 Hours',
  'Today Evening 5-8 PM',
  'Tomorrow Morning',
];

export function BagDrawer() {
  const {
    bag,
    bagSummary,
    isBagDrawerOpen,
    setBagDrawerOpen,
    updateBagQuantity,
    removeFromBag,
    submitStandardBooking,
    lastCreatedPass,
    setLastCreatedPass,
  } = useStore();

  const { animatedNavigate } = useMotionNav();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState<BranchName>('Hirapur - Hari Mandir Road');
  const [pickupSlot, setPickupSlot] = useState<PickupSlot>('Within 2 Hours');
  const [error, setError] = useState<string | null>(null);

  const closeDrawer = () => {
    setBagDrawerOpen(false);
    setError(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateBookingCustomerInput({ customerName, phone });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    try {
      submitStandardBooking({
        customerName,
        phone,
        branch,
        pickupSlot,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create booking.');
    }
  };

  return (
    <AnimatePresence>
      {isBagDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            aria-label="Pickup Bag and Quick-Book Drawer"
            className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10"
          >
            <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {lastCreatedPass ? 'Booking Pass Ready' : 'Your Pickup Bag'}
                </h2>
                <p className="text-xs text-slate-500">
                  {lastCreatedPass
                    ? 'Show this QR code at the Express Counter'
                    : `${bagSummary.itemCount} items · Zero-login 2-tap booking`}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close pickup bag"
                className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {lastCreatedPass ? (
                <div className="space-y-4">
                  <QrPassCard
                    booking={lastCreatedPass}
                    onTrackClick={() => {
                      const passId = lastCreatedPass.id;
                      animatedNavigate(`/track-order?id=${encodeURIComponent(passId)}`, {
                        onBeforeNavigate: () => {
                          setLastCreatedPass(null);
                          closeDrawer();
                        },
                      });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setLastCreatedPass(null)}
                    className="w-full py-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Start Another Order
                  </button>
                </div>
              ) : bag.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="font-display text-lg font-semibold text-slate-900">
                    Your pickup bag is empty
                  </p>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs">
                    Reserve chocolates, dresses, toys, skin care, snacks, or grains online and pay at our Express Counter.
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5 w-full max-w-xs">
                    <button
                      type="button"
                      onClick={() => {
                        animatedNavigate('/sections', { onBeforeNavigate: closeDrawer });
                      }}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#1E3A8A] text-white text-sm font-semibold hover:bg-[#172E6E] cursor-pointer"
                    >
                      Browse Store Sections
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        animatedNavigate('/quick-list', { onBeforeNavigate: closeDrawer });
                      }}
                      className="w-full py-2.5 px-4 rounded-lg border border-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-50 cursor-pointer"
                    >
                      Upload Handwritten List Instead
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Bag Items */}
                  <ul className="divide-y divide-slate-100">
                    {bag.map((item) => (
                      <li
                        key={`${item.productId}-${item.variant}`}
                        className="py-3.5 flex items-start gap-3"
                      >
                        <ResilientImage
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-14 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.brand} · {item.variant}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="inline-flex items-center border border-slate-200 rounded-lg">
                              <button
                                type="button"
                                onClick={() =>
                                  updateBagQuantity(item.productId, item.variant, -1)
                                }
                                aria-label={`Decrease quantity of ${item.name}`}
                                className="w-8 h-8 inline-flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center font-mono text-xs font-semibold tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateBagQuantity(item.productId, item.variant, 1)
                                }
                                aria-label={`Increase quantity of ${item.name}`}
                                className="w-8 h-8 inline-flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                                {formatINR(item.price * item.quantity)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFromBag(item.productId, item.variant)}
                                aria-label={`Remove ${item.name}`}
                                className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Summary */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Total MRP</span>
                      <span className="font-mono tabular-nums">{formatINR(bagSummary.totalMrp)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Shankar Mall Savings</span>
                      <span className="font-mono tabular-nums">-{formatINR(bagSummary.savings)}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-200">
                      <span>Payable at Counter</span>
                      <span className="font-mono tabular-nums">{formatINR(bagSummary.subtotal)}</span>
                    </div>
                  </div>

                  {/* Zero-Login 2-Tap Quick-Book Form */}
                  <form onSubmit={handleConfirmBooking} className="space-y-4">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Express Pickup Details
                      </h3>
                      <p className="text-xs text-slate-500">
                        No account or password needed. Pay only when you collect.
                      </p>
                    </div>

                    {error && (
                      <div
                        role="alert"
                        className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium"
                      >
                        {error}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label htmlFor="bag-name" className="block text-xs font-semibold text-slate-700">
                        Full Name
                      </label>
                      <input
                        id="bag-name"
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g., Rajesh Kumar"
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:border-[#1E3A8A] text-sm outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="bag-phone" className="block text-xs font-semibold text-slate-700">
                        10-Digit WhatsApp Number
                      </label>
                      <input
                        id="bag-phone"
                        type="tel"
                        inputMode="numeric"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g., 9835123456"
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:border-[#1E3A8A] text-sm font-mono tabular-nums outline-none"
                      />
                    </div>

                    <fieldset className="space-y-2">
                      <legend className="text-xs font-semibold text-slate-700">
                        Select Dhanbad Branch
                      </legend>
                      <div className="grid grid-cols-1 gap-2">
                        {BRANCHES.map((b) => (
                          <label
                            key={b}
                            className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                              branch === b
                                ? 'border-[#1E3A8A] bg-blue-50/60 text-slate-900 font-semibold'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="bag-branch"
                              value={b}
                              checked={branch === b}
                              onChange={() => setBranch(b)}
                              className="accent-[#1E3A8A]"
                            />
                            <span>{b}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div className="space-y-1.5">
                      <label htmlFor="bag-slot" className="block text-xs font-semibold text-slate-700">
                        Pickup Time Slot
                      </label>
                      <select
                        id="bag-slot"
                        value={pickupSlot}
                        onChange={(e) => setPickupSlot(e.target.value as PickupSlot)}
                        className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:border-[#1E3A8A] text-sm bg-white outline-none"
                      >
                        {PICKUP_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-slate-800">
                      <span className="font-semibold">Payment Mode:</span> {PAYMENT_MODE_LABEL}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 px-5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Generate Booking Pass</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

import { useMemo, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ExternalLink,
  Eye,
  Lock,
  LogOut,
  Plus,
  ShoppingBag,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  ADMIN_PIN,
  buildCustomerNotifyWhatsAppUrl,
  formatINR,
} from '../lib/bookingStore';
import { SECTIONS } from '../lib/catalog';
import { BookingRecord, OrderStatus, SectionSlug } from '../lib/types';

type AdminTab = 'all' | 'standard' | 'photo-list' | 'add-product';

export function AdminPage() {
  const { bookings, updateStatus, addProduct } = useStore();

  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem('shankar_admin_unlocked') === '1';
    }
    return false;
  });
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('all');
  const [previewBooking, setPreviewBooking] = useState<BookingRecord | null>(null);

  // Add New Product Form state
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodSection, setProdSection] = useState<SectionSlug>('chocolate');
  const [prodPrice, setProdPrice] = useState('');
  const [prodMrp, setProdMrp] = useState('');
  const [prodUnit, setProdUnit] = useState('');
  const [prodAisle, setProdAisle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodSuccess, setProdSuccess] = useState<string | null>(null);

  const photoRequestsCount = useMemo(
    () => bookings.filter((b) => b.kind === 'photo-list').length,
    [bookings]
  );
  const standardCount = useMemo(
    () => bookings.filter((b) => b.kind === 'standard').length,
    [bookings]
  );
  const readyCount = useMemo(
    () => bookings.filter((b) => b.status === 'Ready').length,
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    if (activeTab === 'standard') return bookings.filter((b) => b.kind === 'standard');
    if (activeTab === 'photo-list') return bookings.filter((b) => b.kind === 'photo-list');
    return bookings;
  }, [bookings, activeTab]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === ADMIN_PIN) {
      setUnlocked(true);
      setPinError(null);
      window.sessionStorage.setItem('shankar_admin_unlocked', '1');
    } else {
      setPinError('Incorrect Staff PIN. Demo PIN is 1234.');
    }
  };

  const handleLock = () => {
    setUnlocked(false);
    setPin('');
    window.sessionStorage.removeItem('shankar_admin_unlocked');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const sectionMeta = SECTIONS.find((s) => s.slug === prodSection) || SECTIONS[0];
    const priceNum = Number(prodPrice);
    const mrpNum = Number(prodMrp) || priceNum;

    if (!prodName.trim() || !prodBrand.trim() || !priceNum || priceNum <= 0) {
      return;
    }

    const created = addProduct({
      name: prodName.trim(),
      brand: prodBrand.trim(),
      sectionSlug: prodSection,
      price: priceNum,
      mrp: Math.max(priceNum, mrpNum),
      unit: prodUnit.trim() || '1 Unit',
      variants: [prodUnit.trim() || 'Standard Pack'],
      inStock: true,
      trending: true,
      image: sectionMeta.image,
      description:
        prodDesc.trim() ||
        `${prodName.trim()} available for Click & Collect at Shankar Mall Dhanbad.`,
      aisleLocation: prodAisle.trim() || `${sectionMeta.name} Section · Express Shelf`,
      highlights: ['Ready for 2-hour store pickup', 'Pay at Express Counter'],
    });

    setProdSuccess(`Added "${created.name}" to ${sectionMeta.name}.`);
    setProdName('');
    setProdBrand('');
    setProdPrice('');
    setProdMrp('');
    setProdUnit('');
    setProdAisle('');
    setProdDesc('');
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Staff Express Counter
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Enter 4-digit store counter PIN to manage bookings and photo lists.
            </p>
          </div>

          {pinError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium"
            >
              {pinError}
            </div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-pin" className="block text-xs font-semibold text-slate-700">
                Counter PIN (Demo PIN: 1234)
              </label>
              <input
                id="admin-pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN (1234)"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] font-mono text-base tracking-widest outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Unlock Counter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold text-[#1E3A8A]">
            Shankar Mall · Hirapur &amp; Rangatand
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Express Counter Dispatch Board
          </h1>
        </div>

        <button
          type="button"
          onClick={handleLock}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Lock Counter</span>
        </button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <p className="text-xs text-slate-500">Total Bookings</p>
          <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
            {bookings.length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <p className="text-xs text-slate-500">Item Bag Bookings</p>
          <p className="font-mono text-2xl font-bold text-[#1E3A8A] tabular-nums mt-1">
            {standardCount}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
          <p className="text-xs text-amber-800 font-medium">Photo List Requests</p>
          <p className="font-mono text-2xl font-bold text-amber-900 tabular-nums mt-1">
            {photoRequestsCount}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
          <p className="text-xs text-emerald-800 font-medium">Ready at Counter</p>
          <p className="font-mono text-2xl font-bold text-emerald-900 tabular-nums mt-1">
            {readyCount}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl w-fit">
        {(
          [
            { id: 'all', label: `All Requests (${bookings.length})` },
            { id: 'standard', label: `Item Bookings (${standardCount})` },
            { id: 'photo-list', label: `Photo List Requests (${photoRequestsCount})` },
            { id: 'add-product', label: '+ Add New Product' },
          ] as { id: AdminTab; label: string }[]
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'add-product' ? (
        <div className="max-w-2xl border border-slate-200 rounded-2xl p-6 bg-white space-y-5">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Add New Store Product
            </h2>
            <p className="text-xs text-slate-500">
              Published immediately to the live catalog and category pages.
            </p>
          </div>

          {prodSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{prodSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="p-name" className="block text-xs font-semibold text-slate-700">
                Product Name
              </label>
              <input
                id="p-name"
                type="text"
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="e.g., Desi Cow Pure Ghee 1L"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-brand" className="block text-xs font-semibold text-slate-700">
                Brand Name
              </label>
              <input
                id="p-brand"
                type="text"
                required
                value={prodBrand}
                onChange={(e) => setProdBrand(e.target.value)}
                placeholder="e.g., Amul / Gowardhan"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-section" className="block text-xs font-semibold text-slate-700">
                Store Section
              </label>
              <select
                id="p-section"
                value={prodSection}
                onChange={(e) => setProdSection(e.target.value as SectionSlug)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white outline-none focus:border-[#1E3A8A]"
              >
                {SECTIONS.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-price" className="block text-xs font-semibold text-slate-700">
                Offer Price (₹)
              </label>
              <input
                id="p-price"
                type="number"
                min={1}
                required
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                placeholder="650"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-mono outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-mrp" className="block text-xs font-semibold text-slate-700">
                MRP (₹)
              </label>
              <input
                id="p-mrp"
                type="number"
                min={1}
                value={prodMrp}
                onChange={(e) => setProdMrp(e.target.value)}
                placeholder="720"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-mono outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-unit" className="block text-xs font-semibold text-slate-700">
                Unit / Pack Size
              </label>
              <input
                id="p-unit"
                type="text"
                value={prodUnit}
                onChange={(e) => setProdUnit(e.target.value)}
                placeholder="1 Litre Jar"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="p-aisle" className="block text-xs font-semibold text-slate-700">
                Aisle Location
              </label>
              <input
                id="p-aisle"
                type="text"
                value={prodAisle}
                onChange={(e) => setProdAisle(e.target.value)}
                placeholder="Chocolate Section · Bay C1"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="p-desc" className="block text-xs font-semibold text-slate-700">
                Short Description
              </label>
              <textarea
                id="p-desc"
                rows={3}
                value={prodDesc}
                onChange={(e) => setProdDesc(e.target.value)}
                placeholder="Describe quality, pack details, or counter notes..."
                className="w-full p-3 rounded-lg border border-slate-300 text-sm outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white text-sm font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Product to Store</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const notifyHref = buildCustomerNotifyWhatsAppUrl(booking);

            return (
              <article
                key={booking.id}
                className="border border-slate-200 rounded-2xl bg-white p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-lg font-bold text-[#1E3A8A] tabular-nums">
                        {booking.id}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-base font-bold text-slate-900">
                        {booking.customerName}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                        {booking.kind === 'photo-list' ? (
                          <>
                            <Camera className="w-3.5 h-3.5 text-amber-600" />
                            <span>Photo List Request</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-[#1E3A8A]" />
                            <span>Standard Booking</span>
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <span className="font-mono">+91 {booking.phone}</span> · {booking.branch} · Slot:{' '}
                      <span className="font-medium text-slate-900">{booking.pickupSlot}</span>
                    </p>
                  </div>

                  {/* 1-Click Status Progression + WhatsApp Notify */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200">
                      {(['Pending', 'Packing', 'Ready'] as OrderStatus[]).map((statusOption) => (
                        <button
                          key={statusOption}
                          type="button"
                          onClick={() => updateStatus(booking.id, statusOption)}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                            booking.status === statusOption
                              ? statusOption === 'Ready'
                                ? 'bg-emerald-700 text-white'
                                : statusOption === 'Packing'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {statusOption}
                        </button>
                      ))}
                    </div>

                    <a
                      href={notifyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold transition-colors"
                    >
                      <span>Notify Customer on WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Payload Details */}
                {booking.kind === 'standard' ? (
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <ul className="text-xs text-slate-700 space-y-1">
                      {booking.items.map((item) => (
                        <li key={`${item.productId}-${item.variant}`}>
                          • {item.name} ({item.variant}) × {item.quantity} —{' '}
                          <span className="font-mono font-semibold tabular-nums">
                            {formatINR(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Counter Total</p>
                      <p className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                        {formatINR(booking.subtotal)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs font-semibold text-slate-500">
                        Customer Notes / Items
                      </p>
                      {booking.listText ? (
                        <pre className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap font-sans">
                          {booking.listText}
                        </pre>
                      ) : (
                        <p className="text-xs text-slate-500 italic">
                          Handwritten photo uploaded (no typed text).
                        </p>
                      )}
                    </div>

                    {booking.photoDataUrl && (
                      <div className="flex items-center gap-3 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                        <img
                          src={booking.photoDataUrl}
                          alt={`Photo list for ${booking.id}`}
                          className="w-16 h-20 object-cover rounded-lg border border-slate-200 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setPreviewBooking(booking)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#172E6E] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview Photo</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Photo List Preview Modal */}
      {previewBooking && previewBooking.kind === 'photo-list' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo list preview for ${previewBooking.id}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          onClick={() => setPreviewBooking(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
          >
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-bold text-[#1E3A8A]">
                  {previewBooking.id} · {previewBooking.customerName}
                </p>
                <p className="text-xs text-slate-500">
                  {previewBooking.branch} · {previewBooking.pickupSlot}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewBooking(null)}
                aria-label="Close photo preview"
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-50 max-h-[75vh] overflow-y-auto flex justify-center">
              <img
                src={previewBooking.photoDataUrl}
                alt={`Full photo list for ${previewBooking.id}`}
                className="max-w-full max-h-[65vh] object-contain rounded-lg border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

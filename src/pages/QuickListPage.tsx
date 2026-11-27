import { useRef, useState } from 'react';
import { Camera, FileText, Trash2, Upload } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useMotionNav } from '../context/MotionNavContext';
import {
  PAYMENT_MODE_LABEL,
  validateBookingCustomerInput,
} from '../lib/bookingStore';
import { BranchName, PhotoListRequest, PickupSlot } from '../lib/types';
import { compressImageFileToDataUrl } from '../lib/imageUpload';
import { QrPassCard } from '../components/QrPassCard';

const BRANCHES: BranchName[] = [
  'Hirapur - Hari Mandir Road',
  'Rangatand - Near Railway Station',
];

const PICKUP_SLOTS: PickupSlot[] = [
  'Within 2 Hours',
  'Today Evening 5-8 PM',
  'Tomorrow Morning',
];

const QUICK_CHIPS = [
  'India Gate Basmati Rice - 5 kg',
  'Aashirvaad Chakki Atta - 10 kg',
  'Tata Sampann Toor Dal - 2 kg',
  'Fortune Mustard Oil - 2 L',
  'Darjeeling Leaf Tea - 250 g',
  'Surf Excel / Detergent - 2 kg',
];

const SAMPLE_LIST_SVG_DATA_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="640" viewBox="0 0 520 640">
      <rect width="520" height="640" fill="#FFFDF7"/>
      <rect x="20" y="20" width="480" height="600" fill="none" stroke="#CBD5E1" stroke-width="2"/>
      <line x1="70" y1="20" x2="70" y2="620" stroke="#FCA5A5" stroke-width="2"/>
      <text x="90" y="80" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#1E3A8A">Shankar Mall Family Ration List</text>
      <text x="90" y="135" font-family="Georgia, serif" font-size="19" fill="#0F172A">1. Basmati Rice - 5 kg</text>
      <text x="90" y="185" font-family="Georgia, serif" font-size="19" fill="#0F172A">2. Toor Dal (Arhar) - 2 kg</text>
      <text x="90" y="235" font-family="Georgia, serif" font-size="19" fill="#0F172A">3. Mustard Oil (Fortune) - 2 Litre</text>
      <text x="90" y="285" font-family="Georgia, serif" font-size="19" fill="#0F172A">4. Chakki Atta - 10 kg</text>
      <text x="90" y="335" font-family="Georgia, serif" font-size="19" fill="#0F172A">5. Sugar - 3 kg</text>
      <text x="90" y="385" font-family="Georgia, serif" font-size="19" fill="#0F172A">6. Darjeeling Tea Tin - 250 g</text>
    </svg>`
  );

export function QuickListPage() {
  const { submitPhotoList } = useStore();
  const { animatedNavigate } = useMotionNav();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [listText, setListText] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [branch, setBranch] = useState<BranchName>('Hirapur - Hari Mandir Road');
  const [pickupSlot, setPickupSlot] = useState<PickupSlot>('Within 2 Hours');
  const [error, setError] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<PhotoListRequest | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WebP).');
      return;
    }

    try {
      const optimized = await compressImageFileToDataUrl(file, 1024, 0.82);
      setPhotoDataUrl(optimized);
      setPhotoFileName(file.name);
      setError(null);
    } catch {
      setError('Could not read the selected image file.');
    }
  };

  const handleAppendChip = (item: string) => {
    setListText((prev) => (prev.trim() ? `${prev.trim()}\n• ${item}` : `• ${item}`));
  };

  const handleUseSamplePhoto = () => {
    setPhotoDataUrl(SAMPLE_LIST_SVG_DATA_URI);
    setPhotoFileName('sample-paper-list.svg');
    if (!listText.trim()) {
      setListText(
        '• Basmati Rice - 5 kg\n• Toor Dal - 2 kg\n• Fortune Mustard Oil - 2 L\n• Chakki Atta - 10 kg'
      );
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerErr = validateBookingCustomerInput({ customerName, phone });
    if (customerErr) {
      setError(customerErr);
      return;
    }
    if (!photoDataUrl && !listText.trim()) {
      setError('Please upload a handwritten list photo or type your items in the notepad.');
      return;
    }

    setError(null);
    try {
      const record = submitPhotoList({
        customerName,
        phone,
        branch,
        pickupSlot,
        listText,
        photoDataUrl: photoDataUrl || undefined,
        photoFileName: photoFileName || undefined,
      });
      setCreatedRequest(record);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send list.');
    }
  };

  return (
    <div className="max-w-[1060px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="space-y-2 max-w-2xl">
        <p className="text-xs font-semibold text-[#1E3A8A]">
          1-Tap Snap &amp; Send Shopping List
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 [text-wrap:balance]">
          Send your paper grocery list directly to our packing desk.
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Snap a clear photo of your handwritten family ration list or type your bullets below. Pay only at the Hirapur or Rangatand Express Counter when you pick it up.
        </p>
      </div>

      {createdRequest ? (
        <div className="max-w-xl space-y-5">
          <QrPassCard
            booking={createdRequest}
            onTrackClick={() =>
              animatedNavigate(`/track-order?id=${encodeURIComponent(createdRequest.id)}`)
            }
          />
          <button
            type="button"
            onClick={() => {
              setCreatedRequest(null);
              setPhotoDataUrl('');
              setPhotoFileName('');
              setListText('');
            }}
            className="text-sm font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
          >
            Submit Another Shopping List
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Photo Upload + Smart Notepad */}
          <div className="lg:col-span-7 space-y-6">
            {/* Photo Upload Box */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-[#1E3A8A]" />
                    <span>1. Snap or Upload Paper List</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visible immediately to our packing counter staff
                  </p>
                </div>

                {!photoDataUrl && (
                  <button
                    type="button"
                    onClick={handleUseSamplePhoto}
                    className="text-xs font-semibold text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Load Sample List Photo
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="sr-only"
                id="quick-list-photo-input"
              />

              {photoDataUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={photoDataUrl}
                    alt="Uploaded handwritten shopping list preview"
                    className="w-full max-h-72 object-contain mx-auto bg-white"
                  />
                  <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-700 truncate">
                      {photoFileName || 'Attached list image'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoDataUrl('');
                        setPhotoFileName('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="inline-flex items-center gap-1 text-red-600 font-semibold hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="quick-list-photo-input"
                  className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#1E3A8A] bg-slate-50/70 hover:bg-blue-50/30 transition-colors cursor-pointer text-center"
                >
                  <Upload className="w-7 h-7 text-[#1E3A8A] mb-2" />
                  <span className="text-sm font-semibold text-slate-900">
                    Tap to snap photo or upload list image
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Supports handwritten notebook pages, WhatsApp screenshots, or bills
                  </span>
                </label>
              )}
            </div>

            {/* Smart Notepad Box */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1E3A8A]" />
                  <span>2. Or Type / Paste Quick Bullet List</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tap common monthly items below to add them instantly
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAppendChip(chip)}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-xs font-medium text-slate-700 hover:text-[#1E3A8A] transition-colors cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <label htmlFor="quick-list-notepad" className="sr-only">
                Shopping list items
              </label>
              <textarea
                id="quick-list-notepad"
                rows={6}
                value={listText}
                onChange={(e) => setListText(e.target.value)}
                placeholder={'• India Gate Classic Basmati - 5 kg\n• Tata Sampann Toor Dal - 2 kg\n• Mustard Oil - 2 Litre\n• Any brand preference notes...'}
                className="w-full p-3.5 rounded-xl border border-slate-300 focus:border-[#1E3A8A] text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Right Column: Pickup Details */}
          <div className="lg:col-span-5 border border-slate-200 rounded-2xl p-6 bg-slate-50/70 space-y-4 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Pickup &amp; Contact Details
            </h2>

            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium"
              >
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="ql-name" className="block text-xs font-semibold text-slate-700">
                Full Name
              </label>
              <input
                id="ql-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., Sunita Devi"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:border-[#1E3A8A] text-sm outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ql-phone" className="block text-xs font-semibold text-slate-700">
                10-Digit WhatsApp Number
              </label>
              <input
                id="ql-phone"
                type="tel"
                inputMode="numeric"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 9431188990"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:border-[#1E3A8A] text-sm font-mono tabular-nums outline-none"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold text-slate-700">
                Choose Dhanbad Branch
              </legend>
              <div className="space-y-2">
                {BRANCHES.map((b) => (
                  <label
                    key={b}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm cursor-pointer bg-white transition-colors ${
                      branch === b
                        ? 'border-[#1E3A8A] ring-1 ring-[#1E3A8A] font-semibold text-slate-900'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ql-branch"
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
              <label htmlFor="ql-slot" className="block text-xs font-semibold text-slate-700">
                Preferred Pickup Time
              </label>
              <select
                id="ql-slot"
                value={pickupSlot}
                onChange={(e) => setPickupSlot(e.target.value as PickupSlot)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white focus:border-[#1E3A8A] text-sm outline-none"
              >
                {PICKUP_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-slate-800">
              <span className="font-semibold">Payment:</span> {PAYMENT_MODE_LABEL}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Send List to Store
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

import { SEEDED_PRODUCTS } from './catalog';
import {
  BagItem,
  BookingRecord,
  BranchName,
  OrderStatus,
  PhotoListRequest,
  PickupSlot,
  Product,
  ProductOverride,
  SiteSettings,
  StandardBooking,
} from './types';

export const STORE_WHATSAPP_NUMBER = '918102800129';
export const PAYMENT_MODE_LABEL = 'Pay at Express Counter (Cash / UPI / Card)' as const;
export const ADMIN_PIN = '1234';
export const MANAGER_PIN = '2014';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroHeadline: 'Reserve online. Walk in & pick up in minutes.',
  announcementBanner: 'Hirapur & Rangatand · Dhanbad Express Pickup',
  openingHours: '9:00 AM – 9:30 PM',
};

const BOOKINGS_KEY = 'shankar_mall_bookings_v1';
const BAG_KEY = 'shankar_mall_bag_v1';
const CUSTOM_PRODUCTS_KEY = 'shankar_mall_custom_products_v1';
const PRODUCT_OVERRIDES_KEY = 'shankar_mall_product_overrides_v1';
const SITE_SETTINGS_KEY = 'shankar_mall_site_settings_v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const memoryMap = new Map<string, string>();
const memoryStorage: StorageLike = {
  getItem: (key) => memoryMap.get(key) ?? null,
  setItem: (key, value) => {
    memoryMap.set(key, value);
  },
  removeItem: (key) => {
    memoryMap.delete(key);
  },
};

export function getStorage(customStorage?: StorageLike): StorageLike {
  if (customStorage) return customStorage;
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return window.localStorage;
  }
  return memoryStorage;
}

export function resetMemoryStorageForTests(): void {
  memoryMap.clear();
}

// Inline sample handwritten list image (SVG data URI) so demo Photo List preview works immediately
const SAMPLE_HANDWRITTEN_LIST_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760">
      <rect width="600" height="760" fill="#FCFBF7"/>
      <rect x="24" y="24" width="552" height="712" fill="none" stroke="#E2E8F0" stroke-width="2"/>
      <line x1="80" y1="24" x2="80" y2="736" stroke="#FCA5A5" stroke-width="2"/>
      <g stroke="#DBEAFE" stroke-width="1">
        <line x1="24" y1="110" x2="576" y2="110"/><line x1="24" y1="160" x2="576" y2="160"/>
        <line x1="24" y1="210" x2="576" y2="210"/><line x1="24" y1="260" x2="576" y2="260"/>
        <line x1="24" y1="310" x2="576" y2="310"/><line x1="24" y1="360" x2="576" y2="360"/>
        <line x1="24" y1="410" x2="576" y2="410"/><line x1="24" y1="460" x2="576" y2="460"/>
        <line x1="24" y1="510" x2="576" y2="510"/><line x1="24" y1="560" x2="576" y2="560"/>
        <line x1="24" y1="610" x2="576" y2="610"/><line x1="24" y1="660" x2="576" y2="660"/>
      </g>
      <text x="100" y="92" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#1E3A8A">Monthly Ration - Dhanbad</text>
      <text x="100" y="150" font-family="Georgia, serif" font-size="22" fill="#0F172A">1. India Gate Classic Basmati - 5 kg</text>
      <text x="100" y="200" font-family="Georgia, serif" font-size="22" fill="#0F172A">2. Tata Sampann Toor Dal - 2 kg</text>
      <text x="100" y="250" font-family="Georgia, serif" font-size="22" fill="#0F172A">3. Fortune Kachi Ghani Mustard Oil - 2 L</text>
      <text x="100" y="300" font-family="Georgia, serif" font-size="22" fill="#0F172A">4. Aashirvaad Chakki Atta - 10 kg</text>
      <text x="100" y="350" font-family="Georgia, serif" font-size="22" fill="#0F172A">5. Darjeeling Leaf Tea Tin - 250 g</text>
      <text x="100" y="400" font-family="Georgia, serif" font-size="22" fill="#0F172A">6. Kesar Chandan Bath Soap - 4 pcs</text>
      <text x="100" y="450" font-family="Georgia, serif" font-size="22" fill="#0F172A">7. Roasted Masala Cashews - 250 g</text>
      <text x="100" y="545" font-family="Georgia, serif" font-size="18" font-style="italic" fill="#475569">Please pack double-bagged for evening pickup.</text>
      <text x="100" y="600" font-family="Georgia, serif" font-size="18" fill="#1E3A8A">- Sunita Devi, Bank More</text>
    </svg>`
  );

export const SEEDED_BOOKINGS: BookingRecord[] = [
  {
    id: '#SM-8412',
    kind: 'standard',
    customerName: 'Rajesh Kumar Verma',
    phone: '9835123456',
    branch: 'Hirapur - Hari Mandir Road',
    pickupSlot: 'Within 2 Hours',
    paymentMode: PAYMENT_MODE_LABEL,
    items: [
      {
        productId: 'prod-29',
        slug: 'india-gate-classic-basmati-5kg',
        name: 'Royal Aged Basmati Rice',
        brand: 'India Gate Classic',
        variant: '5 kg Bag',
        price: 785,
        mrp: 940,
        image: '/src/assets/images/cat_staples_groceries_1795533366629.jpg',
        quantity: 2,
      },
      {
        productId: 'prod-13',
        slug: 'hammered-brass-puja-diya-set',
        name: 'Hammered Solid Brass Diya Set (4 Pcs)',
        brand: 'Shankar Decor',
        variant: '4 Diyas + Pedestal',
        price: 680,
        mrp: 890,
        image: '/src/assets/images/cat_decorations_things_1795655841180.jpg',
        quantity: 1,
      },
    ],
    subtotal: 2250,
    totalMrp: 2770,
    savings: 520,
    status: 'Ready',
    createdAt: '2026-11-24T09:15:00.000Z',
  },
  {
    id: '#SM-8409',
    kind: 'photo-list',
    customerName: 'Sunita Devi',
    phone: '9431188990',
    branch: 'Rangatand - Near Railway Station',
    pickupSlot: 'Today Evening 5-8 PM',
    paymentMode: PAYMENT_MODE_LABEL,
    listText:
      '• India Gate Classic Basmati 5kg\n• Tata Sampann Toor Dal 2kg\n• Fortune Mustard Oil 2L\n• Aashirvaad Chakki Atta 10kg\n• Digestive Biscuits Tin 400g',
    photoDataUrl: SAMPLE_HANDWRITTEN_LIST_DATA_URL,
    photoFileName: 'monthly-ration-dhanbad.svg',
    estimatedItemsCount: 7,
    status: 'Packing',
    createdAt: '2026-11-24T10:30:00.000Z',
  },
  {
    id: '#SM-8395',
    kind: 'standard',
    customerName: 'Ankit Agarwal',
    phone: '9123456780',
    branch: 'Hirapur - Hari Mandir Road',
    pickupSlot: 'Tomorrow Morning',
    paymentMode: PAYMENT_MODE_LABEL,
    items: [
      {
        productId: 'prod-9',
        slug: 'royal-blue-pure-linen-kurta-shirt',
        name: 'Royal Blue Mandarin Linen Shirt',
        brand: 'Elements Menswear',
        variant: 'L (42)',
        price: 1699,
        mrp: 2299,
        image: '/src/assets/images/cat_mens_fashion_1795533367001.jpg',
        quantity: 1,
      },
      {
        productId: 'prod-2',
        slug: 'gold-wrapped-hazelnut-praline-truffles',
        name: 'Gold Hazelnut Praline Truffle Bowl Pack',
        brand: 'Shankar Chocolatier',
        variant: '24 Pieces Gift Pack',
        price: 540,
        mrp: 650,
        image: '/src/assets/images/cat_chocolate_1795655840303.jpg',
        quantity: 1,
      },
    ],
    subtotal: 2239,
    totalMrp: 2949,
    savings: 710,
    status: 'Pending',
    createdAt: '2026-11-24T11:45:00.000Z',
  },
];

export function isSupabaseConfigured(): boolean {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return Boolean(env?.VITE_SUPABASE_URL && env?.VITE_SUPABASE_ANON_KEY);
  } catch {
    return false;
  }
}

export async function syncBookingToSupabase(booking: BookingRecord): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    const url = env?.VITE_SUPABASE_URL;
    const key = env?.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return;
    await fetch(`${url}/rest/v1/shankar_bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        id: booking.id,
        kind: booking.kind,
        customer_name: booking.customerName,
        phone: booking.phone,
        branch: booking.branch,
        pickup_slot: booking.pickupSlot,
        status: booking.status,
        payload: booking,
        created_at: booking.createdAt,
      }),
    });
  } catch {
    // Graceful localStorage fallback when Supabase is unreachable or table not provisioned
  }
}

export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function validateIndianPhone(raw: string): boolean {
  const clean = normalizeIndianPhone(raw);
  return /^[6-9]\d{9}$/.test(clean) || /^\d{10}$/.test(clean);
}

export function validateBookingCustomerInput(input: {
  customerName: string;
  phone: string;
}): string | null {
  if (!input.customerName.trim() || input.customerName.trim().length < 2) {
    return 'Please enter your full name (at least 2 characters).';
  }
  if (!validateIndianPhone(input.phone)) {
    return 'Please enter a valid 10-digit WhatsApp mobile number.';
  }
  return null;
}

export function generateBookingId(existingIds: string[] = []): string {
  const used = new Set(existingIds.map((id) => id.toUpperCase()));
  for (let i = 0; i < 20; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const candidate = `#SM-${num}`;
    if (!used.has(candidate)) return candidate;
  }
  return `#SM-${String(Date.now()).slice(-4)}`;
}

export function calculateBagSummary(items: BagItem[]): {
  itemCount: number;
  subtotal: number;
  totalMrp: number;
  savings: number;
} {
  let itemCount = 0;
  let subtotal = 0;
  let totalMrp = 0;

  for (const item of items) {
    const qty = Math.max(0, item.quantity);
    itemCount += qty;
    subtotal += item.price * qty;
    totalMrp += item.mrp * qty;
  }

  return {
    itemCount,
    subtotal,
    totalMrp,
    savings: Math.max(0, totalMrp - subtotal),
  };
}

export function loadBookings(customStorage?: StorageLike): BookingRecord[] {
  const storage = getStorage(customStorage);
  const raw = storage.getItem(BOOKINGS_KEY);
  if (!raw) {
    storage.setItem(BOOKINGS_KEY, JSON.stringify(SEEDED_BOOKINGS));
    return [...SEEDED_BOOKINGS];
  }
  try {
    const parsed = JSON.parse(raw) as BookingRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      storage.setItem(BOOKINGS_KEY, JSON.stringify(SEEDED_BOOKINGS));
      return [...SEEDED_BOOKINGS];
    }
    return parsed;
  } catch {
    storage.setItem(BOOKINGS_KEY, JSON.stringify(SEEDED_BOOKINGS));
    return [...SEEDED_BOOKINGS];
  }
}

export function saveBookings(bookings: BookingRecord[], customStorage?: StorageLike): void {
  const storage = getStorage(customStorage);
  storage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function loadBag(customStorage?: StorageLike): BagItem[] {
  const storage = getStorage(customStorage);
  const raw = storage.getItem(BAG_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as BagItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBag(items: BagItem[], customStorage?: StorageLike): void {
  const storage = getStorage(customStorage);
  storage.setItem(BAG_KEY, JSON.stringify(items));
}

export function loadProductOverrides(
  customStorage?: StorageLike
): Record<string, ProductOverride> {
  const storage = getStorage(customStorage);
  const raw = storage.getItem(PRODUCT_OVERRIDES_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, ProductOverride>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveProductOverrides(
  overrides: Record<string, ProductOverride>,
  customStorage?: StorageLike
): void {
  const storage = getStorage(customStorage);
  storage.setItem(PRODUCT_OVERRIDES_KEY, JSON.stringify(overrides));
}

export function loadCustomProducts(customStorage?: StorageLike): Product[] {
  const storage = getStorage(customStorage);
  const raw = storage.getItem(CUSTOM_PRODUCTS_KEY);
  if (!raw) return [];
  try {
    const custom = JSON.parse(raw) as Product[];
    return Array.isArray(custom) ? custom : [];
  } catch {
    return [];
  }
}

export function saveCustomProducts(
  products: Product[],
  customStorage?: StorageLike
): void {
  const storage = getStorage(customStorage);
  storage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(products));
}

export function loadProducts(customStorage?: StorageLike): Product[] {
  const custom = loadCustomProducts(customStorage);
  const overrides = loadProductOverrides(customStorage);
  const seen = new Set<string>();
  const base: Product[] = [];
  for (const p of [...custom, ...SEEDED_PRODUCTS]) {
    if (!p || !p.id || seen.has(p.id)) continue;
    seen.add(p.id);
    base.push(p);
  }
  return base.map((p) => {
    const ov = overrides[p.id];
    if (!ov) return p;
    return {
      ...p,
      inStock: typeof ov.inStock === 'boolean' ? ov.inStock : p.inStock,
      price: typeof ov.price === 'number' && ov.price > 0 ? ov.price : p.price,
      mrp: typeof ov.mrp === 'number' && ov.mrp > 0 ? ov.mrp : p.mrp,
    };
  });
}

export function toggleProductStock(
  productId: string,
  inStock: boolean,
  customStorage?: StorageLike
): Product[] {
  const overrides = loadProductOverrides(customStorage);
  overrides[productId] = { ...(overrides[productId] || {}), inStock };
  saveProductOverrides(overrides, customStorage);
  return loadProducts(customStorage);
}

export function updateProductPrice(
  productId: string,
  price: number,
  mrp?: number,
  customStorage?: StorageLike
): Product[] {
  const overrides = loadProductOverrides(customStorage);
  const cleanPrice = Math.max(1, Math.round(price));
  const cleanMrp = mrp !== undefined ? Math.max(cleanPrice, Math.round(mrp)) : undefined;
  overrides[productId] = {
    ...(overrides[productId] || {}),
    price: cleanPrice,
    ...(cleanMrp !== undefined ? { mrp: cleanMrp } : {}),
  };
  saveProductOverrides(overrides, customStorage);
  return loadProducts(customStorage);
}

export function loadSiteSettings(customStorage?: StorageLike): SiteSettings {
  const storage = getStorage(customStorage);
  const raw = storage.getItem(SITE_SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SITE_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return {
      heroHeadline:
        typeof parsed.heroHeadline === 'string' && parsed.heroHeadline.trim()
          ? parsed.heroHeadline
          : DEFAULT_SITE_SETTINGS.heroHeadline,
      announcementBanner:
        typeof parsed.announcementBanner === 'string' && parsed.announcementBanner.trim()
          ? parsed.announcementBanner
          : DEFAULT_SITE_SETTINGS.announcementBanner,
      openingHours:
        typeof parsed.openingHours === 'string' && parsed.openingHours.trim()
          ? parsed.openingHours
          : DEFAULT_SITE_SETTINGS.openingHours,
    };
  } catch {
    return { ...DEFAULT_SITE_SETTINGS };
  }
}

export function saveSiteSettings(
  settings: SiteSettings,
  customStorage?: StorageLike
): SiteSettings {
  const storage = getStorage(customStorage);
  const normalized: SiteSettings = {
    heroHeadline: settings.heroHeadline.trim() || DEFAULT_SITE_SETTINGS.heroHeadline,
    announcementBanner:
      settings.announcementBanner.trim() || DEFAULT_SITE_SETTINGS.announcementBanner,
    openingHours: settings.openingHours.trim() || DEFAULT_SITE_SETTINGS.openingHours,
  };
  storage.setItem(SITE_SETTINGS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function resetSiteSettings(customStorage?: StorageLike): SiteSettings {
  const storage = getStorage(customStorage);
  storage.removeItem(SITE_SETTINGS_KEY);
  return { ...DEFAULT_SITE_SETTINGS };
}

export function addCustomProduct(
  productInput: Omit<Product, 'id' | 'slug'>,
  customStorage?: StorageLike
): Product {
  const custom = loadCustomProducts(customStorage);

  const baseSlug = productInput.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const id = `custom-${Date.now()}`;
  const newProduct: Product = {
    ...productInput,
    id,
    slug: `${baseSlug || 'item'}-${String(Date.now()).slice(-4)}`,
  };

  custom.unshift(newProduct);
  saveCustomProducts(custom, customStorage);
  return newProduct;
}

export function deleteCustomProduct(
  productId: string,
  customStorage?: StorageLike
): Product[] {
  const nextCustom = loadCustomProducts(customStorage).filter((p) => p.id !== productId);
  saveCustomProducts(nextCustom, customStorage);
  const overrides = loadProductOverrides(customStorage);
  if (overrides[productId]) {
    delete overrides[productId];
    saveProductOverrides(overrides, customStorage);
  }
  return loadProducts(customStorage);
}

export function createStandardBooking(
  params: {
    customerName: string;
    phone: string;
    branch: BranchName;
    pickupSlot: PickupSlot;
    items: BagItem[];
  },
  customStorage?: StorageLike
): StandardBooking {
  const err = validateBookingCustomerInput(params);
  if (err) throw new Error(err);
  if (!params.items.length) {
    throw new Error('Your Pickup Bag is empty.');
  }

  const existing = loadBookings(customStorage);
  const id = generateBookingId(existing.map((b) => b.id));
  const summary = calculateBagSummary(params.items);

  const record: StandardBooking = {
    id,
    kind: 'standard',
    customerName: params.customerName.trim(),
    phone: normalizeIndianPhone(params.phone),
    branch: params.branch,
    pickupSlot: params.pickupSlot,
    paymentMode: PAYMENT_MODE_LABEL,
    items: params.items.map((i) => ({ ...i })),
    subtotal: summary.subtotal,
    totalMrp: summary.totalMrp,
    savings: summary.savings,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  saveBookings([record, ...existing], customStorage);
  void syncBookingToSupabase(record);
  return record;
}

export function createPhotoListRequest(
  params: {
    customerName: string;
    phone: string;
    branch: BranchName;
    pickupSlot: PickupSlot;
    listText: string;
    photoDataUrl?: string;
    photoFileName?: string;
  },
  customStorage?: StorageLike
): PhotoListRequest {
  const err = validateBookingCustomerInput(params);
  if (err) throw new Error(err);
  if (!params.listText.trim() && !params.photoDataUrl) {
    throw new Error('Please upload a list photo or type at least one item.');
  }

  const existing = loadBookings(customStorage);
  const id = generateBookingId(existing.map((b) => b.id));

  const lines = params.listText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const record: PhotoListRequest = {
    id,
    kind: 'photo-list',
    customerName: params.customerName.trim(),
    phone: normalizeIndianPhone(params.phone),
    branch: params.branch,
    pickupSlot: params.pickupSlot,
    paymentMode: PAYMENT_MODE_LABEL,
    listText: params.listText.trim(),
    photoDataUrl: params.photoDataUrl,
    photoFileName: params.photoFileName,
    estimatedItemsCount: Math.max(lines.length, params.photoDataUrl ? 5 : 1),
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  saveBookings([record, ...existing], customStorage);
  void syncBookingToSupabase(record);
  return record;
}

export function findBookingsByQuery(
  query: string,
  customStorage?: StorageLike
): BookingRecord[] {
  const bookings = loadBookings(customStorage);
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const qClean = q.replace(/^#/, '');
  const qDigits = normalizeIndianPhone(q);

  const isPassIdQuery = qClean.startsWith('sm-');

  return bookings.filter((b) => {
    const idMatch =
      b.id.toLowerCase() === q || b.id.toLowerCase().replace(/^#/, '') === qClean;
    const phoneMatch = !isPassIdQuery && qDigits.length >= 4 && b.phone.includes(qDigits);
    return idMatch || phoneMatch;
  });
}

export function updateBookingStatus(
  bookingId: string,
  nextStatus: OrderStatus,
  customStorage?: StorageLike
): BookingRecord[] {
  const bookings = loadBookings(customStorage);
  const updated = bookings.map((b) =>
    b.id === bookingId ? { ...b, status: nextStatus } : b
  );
  saveBookings(updated, customStorage);
  return updated;
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function buildStoreWhatsAppUrl(booking: StandardBooking): string {
  const itemLines = booking.items
    .map((i) => `• ${i.name} (${i.variant}) x${i.quantity} = ₹${i.price * i.quantity}`)
    .join('\n');

  const message = [
    `*SHANKAR MALL — EXPRESS PICKUP PASS ${booking.id}*`,
    `Name: ${booking.customerName}`,
    `WhatsApp: +91 ${booking.phone}`,
    `Branch: ${booking.branch}`,
    `Pickup Slot: ${booking.pickupSlot}`,
    `Payment: ${booking.paymentMode}`,
    ``,
    `*Reserved Items:*`,
    itemLines,
    ``,
    `*Estimated Total: ₹${booking.subtotal}* (Saved ₹${booking.savings})`,
    `Please keep my bag ready at the Express Counter.`,
  ].join('\n');

  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildPhotoListWhatsAppUrl(booking: PhotoListRequest): string {
  const message = [
    `*SHANKAR MALL — QUICK LIST REQUEST ${booking.id}*`,
    `Name: ${booking.customerName}`,
    `WhatsApp: +91 ${booking.phone}`,
    `Branch: ${booking.branch}`,
    `Pickup Slot: ${booking.pickupSlot}`,
    booking.photoFileName ? `Attached List Photo: ${booking.photoFileName}` : '',
    booking.listText ? `\n*Items Requested:*\n${booking.listText}` : '',
    `\nPayment: ${booking.paymentMode}`,
    `Please pack and confirm total before pickup.`,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildCustomerNotifyWhatsAppUrl(booking: BookingRecord): string {
  const statusText =
    booking.status === 'Ready'
      ? `is *READY FOR PICKUP* at our Express Counter (${booking.branch}).`
      : booking.status === 'Packing'
      ? `is currently *BEING PACKED* by our staff at ${booking.branch}.`
      : `has been *RECEIVED* at ${booking.branch}.`;

  const amountLine =
    booking.kind === 'standard'
      ? `Payable at Express Counter: ₹${booking.subtotal} (Cash / UPI / Card).`
      : `Your billing total will be ready at the Express Counter.`;

  const message = [
    `Namaste ${booking.customerName} ji!`,
    `Your Shankar Mall Click & Collect order *${booking.id}* ${statusText}`,
    `Pickup Slot: ${booking.pickupSlot}`,
    amountLine,
    `Thank you for shopping at Shankar Mall, Dhanbad.`,
  ].join('\n');

  return `https://wa.me/91${booking.phone}?text=${encodeURIComponent(message)}`;
}

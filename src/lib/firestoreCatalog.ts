import {
  Unsubscribe,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  PendingPublishState,
  sanitizeCustomProductPayload,
  sanitizeDocumentId,
  sanitizeProductOverridePayload,
  sanitizeSiteSettingsPayload,
} from './catalogSync';
import { OperationType, db, handleFirestoreError } from './firebase';
import { BookingRecord, OrderStatus, Product, ProductOverride, SiteSettings } from './types';

const CUSTOM_PRODUCTS_COL = 'custom_products';
const PRODUCT_OVERRIDES_COL = 'product_overrides';
const SITE_SETTINGS_COL = 'site_settings';
const SITE_SETTINGS_DOC_ID = 'storefront';
const BOOKINGS_COL = 'bookings';

export interface PublicCatalogSnapshot {
  customProducts: Product[];
  overrides: Record<string, ProductOverride>;
  siteSettings: SiteSettings | null;
}

export function subscribePublicCatalog(callbacks: {
  onCustomProducts: (items: Product[]) => void;
  onOverrides: (overrides: Record<string, ProductOverride>) => void;
  onSiteSettings: (settings: SiteSettings) => void;
  onConnected?: () => void;
  onError?: (err: Error) => void;
}): Unsubscribe {
  const unsubCustom = onSnapshot(
    collection(db, CUSTOM_PRODUCTS_COL),
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (d && typeof d.name === 'string' && typeof d.price === 'number') {
          items.push({
            id: String(d.id || docSnap.id),
            slug: String(d.slug || docSnap.id),
            name: d.name,
            brand: String(d.brand || 'Shankar Mall'),
            sectionSlug: d.sectionSlug,
            price: d.price,
            mrp: typeof d.mrp === 'number' ? d.mrp : d.price,
            unit: String(d.unit || '1 Unit'),
            variants: Array.isArray(d.variants) ? d.variants.map(String) : ['Standard Pack'],
            inStock: Boolean(d.inStock),
            trending: Boolean(d.trending),
            image: String(d.image || ''),
            description: String(d.description || ''),
            aisleLocation: String(d.aisleLocation || ''),
            highlights: Array.isArray(d.highlights) ? d.highlights.map(String) : [],
          });
        }
      });
      // Sort newest custom products first by numeric suffix if present
      items.sort((a, b) => b.id.localeCompare(a.id));
      callbacks.onCustomProducts(items);
      callbacks.onConnected?.();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, CUSTOM_PRODUCTS_COL);
      } catch (wrapped) {
        callbacks.onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );

  const unsubOverrides = onSnapshot(
    collection(db, PRODUCT_OVERRIDES_COL),
    (snapshot) => {
      const next: Record<string, ProductOverride> = {};
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (d && typeof d.inStock === 'boolean') {
          next[docSnap.id] = {
            inStock: d.inStock,
            ...(typeof d.price === 'number' ? { price: d.price } : {}),
            ...(typeof d.mrp === 'number' ? { mrp: d.mrp } : {}),
          };
        }
      });
      callbacks.onOverrides(next);
      callbacks.onConnected?.();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, PRODUCT_OVERRIDES_COL);
      } catch (wrapped) {
        callbacks.onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );

  const settingsPath = `${SITE_SETTINGS_COL}/${SITE_SETTINGS_DOC_ID}`;
  const unsubSettings = onSnapshot(
    doc(db, SITE_SETTINGS_COL, SITE_SETTINGS_DOC_ID),
    (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data();
        if (
          typeof d.heroHeadline === 'string' &&
          typeof d.announcementBanner === 'string' &&
          typeof d.openingHours === 'string'
        ) {
          callbacks.onSiteSettings({
            heroHeadline: d.heroHeadline,
            announcementBanner: d.announcementBanner,
            openingHours: d.openingHours,
          });
        }
      }
      callbacks.onConnected?.();
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, settingsPath);
      } catch (wrapped) {
        callbacks.onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );

  return () => {
    unsubCustom();
    unsubOverrides();
    unsubSettings();
  };
}

export async function publishCustomProductToFirestore(
  product: Product,
  authorUid: string
): Promise<void> {
  const payload = sanitizeCustomProductPayload(product, authorUid);
  const path = `${CUSTOM_PRODUCTS_COL}/${payload.id}`;
  const ref = doc(db, CUSTOM_PRODUCTS_COL, payload.id);

  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        name: payload.name,
        brand: payload.brand,
        sectionSlug: payload.sectionSlug,
        price: payload.price,
        mrp: payload.mrp,
        unit: payload.unit,
        variants: payload.variants,
        inStock: payload.inStock,
        trending: payload.trending,
        image: payload.image,
        description: payload.description,
        aisleLocation: payload.aisleLocation,
        highlights: payload.highlights,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomProductFromFirestore(productId: string): Promise<void> {
  const cleanId = sanitizeDocumentId(productId);
  const path = `${CUSTOM_PRODUCTS_COL}/${cleanId}`;
  try {
    await deleteDoc(doc(db, CUSTOM_PRODUCTS_COL, cleanId));
    try {
      await deleteDoc(doc(db, PRODUCT_OVERRIDES_COL, cleanId));
    } catch {
      // Override doc might not exist
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function publishProductOverrideToFirestore(
  productId: string,
  override: ProductOverride,
  fallbackInStock: boolean,
  authorUid: string
): Promise<void> {
  const payload = sanitizeProductOverridePayload(
    productId,
    override,
    fallbackInStock,
    authorUid
  );
  const path = `${PRODUCT_OVERRIDES_COL}/${payload.productId}`;
  const ref = doc(db, PRODUCT_OVERRIDES_COL, payload.productId);

  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      const updatePatch: Record<string, unknown> = {
        inStock: payload.inStock,
        updatedAt: serverTimestamp(),
      };
      if (typeof payload.price === 'number') updatePatch.price = payload.price;
      if (typeof payload.mrp === 'number') updatePatch.mrp = payload.mrp;
      await updateDoc(ref, updatePatch);
    } else {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function publishSiteSettingsToFirestore(
  settings: SiteSettings,
  authorUid: string
): Promise<void> {
  const payload = sanitizeSiteSettingsPayload(settings, authorUid);
  const path = `${SITE_SETTINGS_COL}/${SITE_SETTINGS_DOC_ID}`;
  const ref = doc(db, SITE_SETTINGS_COL, SITE_SETTINGS_DOC_ID);

  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        heroHeadline: payload.heroHeadline,
        announcementBanner: payload.announcementBanner,
        openingHours: payload.openingHours,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function publishAllPendingToFirestore(params: {
  pending: PendingPublishState;
  customProducts: Product[];
  overrides: Record<string, ProductOverride>;
  allProducts: Product[];
  siteSettings: SiteSettings;
  authorUid: string;
}): Promise<void> {
  const { pending, customProducts, overrides, allProducts, siteSettings, authorUid } = params;

  for (const id of pending.customProductIds) {
    const product = customProducts.find((p) => p.id === id);
    if (product) {
      await publishCustomProductToFirestore(product, authorUid);
    }
  }

  for (const id of pending.deletedCustomProductIds) {
    await deleteCustomProductFromFirestore(id);
  }

  for (const id of pending.overrideProductIds) {
    const ov = overrides[id];
    const currentProduct = allProducts.find((p) => p.id === id);
    if (ov) {
      await publishProductOverrideToFirestore(
        id,
        ov,
        currentProduct?.inStock ?? true,
        authorUid
      );
    }
  }

  if (pending.siteSettingsDirty) {
    await publishSiteSettingsToFirestore(siteSettings, authorUid);
  }
}

export function subscribeAdminBookings(
  isAdmin: boolean,
  uid: string | null,
  onBookings: (items: BookingRecord[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!uid || !isAdmin) {
    return () => {};
  }

  const q = query(collection(db, BOOKINGS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: BookingRecord[] = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (!d || typeof d.id !== 'string') return;
        const createdAtIso =
          d.createdAt && typeof d.createdAt.toDate === 'function'
            ? d.createdAt.toDate().toISOString()
            : new Date().toISOString();

        if (d.kind === 'photo-list') {
          list.push({
            id: d.id,
            kind: 'photo-list',
            customerName: String(d.customerName || ''),
            phone: String(d.phone || ''),
            branch: d.branch,
            pickupSlot: d.pickupSlot,
            paymentMode: d.paymentMode,
            listText: String(d.listText || ''),
            photoDataUrl: typeof d.photoDataUrl === 'string' ? d.photoDataUrl : undefined,
            photoFileName: typeof d.photoFileName === 'string' ? d.photoFileName : undefined,
            estimatedItemsCount:
              typeof d.estimatedItemsCount === 'number' ? d.estimatedItemsCount : undefined,
            status: d.status as OrderStatus,
            createdAt: createdAtIso,
          });
        } else {
          list.push({
            id: d.id,
            kind: 'standard',
            customerName: String(d.customerName || ''),
            phone: String(d.phone || ''),
            branch: d.branch,
            pickupSlot: d.pickupSlot,
            paymentMode: d.paymentMode,
            items: Array.isArray(d.items) ? d.items : [],
            subtotal: Number(d.subtotal || 0),
            totalMrp: Number(d.totalMrp || 0),
            savings: Number(d.savings || 0),
            status: d.status as OrderStatus,
            createdAt: createdAtIso,
          });
        }
      });
      onBookings(list);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, BOOKINGS_COL);
      } catch (wrapped) {
        onError?.(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function publishBookingToFirestore(
  booking: BookingRecord,
  ownerUid: string
): Promise<void> {
  const docId = sanitizeDocumentId(booking.id.replace(/^#/, ''));
  const path = `${BOOKINGS_COL}/${docId}`;
  try {
    await setDoc(doc(db, BOOKINGS_COL, docId), {
      ...booking,
      ownerUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function publishBookingStatusToFirestore(
  bookingId: string,
  status: OrderStatus
): Promise<void> {
  const docId = sanitizeDocumentId(bookingId.replace(/^#/, ''));
  const path = `${BOOKINGS_COL}/${docId}`;
  try {
    const ref = doc(db, BOOKINGS_COL, docId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    await updateDoc(ref, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

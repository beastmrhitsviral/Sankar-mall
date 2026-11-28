import {
  Unsubscribe,
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  PendingPublishState,
  sanitizeCustomProductPayload,
  sanitizeDocumentId,
  sanitizeManagerPin,
  sanitizeProductOverridePayload,
  sanitizeSiteSettingsPayload,
} from './catalogSync';
import { OperationType, db, handleFirestoreError } from './firebase';
import { Product, ProductOverride, SiteSettings } from './types';

const CUSTOM_PRODUCTS_COL = 'custom_products';
const PRODUCT_OVERRIDES_COL = 'product_overrides';
const SITE_SETTINGS_COL = 'site_settings';
const SITE_SETTINGS_DOC_ID = 'storefront';

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
        if (d && d.deleted === true) return;
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
  managerPin: string
): Promise<void> {
  const payload = sanitizeCustomProductPayload(product, managerPin);
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
        deleted: false,
        image: payload.image,
        description: payload.description,
        aisleLocation: payload.aisleLocation,
        highlights: payload.highlights,
        managerPin: payload.managerPin,
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

export async function deleteCustomProductFromFirestore(
  productId: string,
  managerPin: string
): Promise<void> {
  const cleanId = sanitizeDocumentId(productId);
  const cleanPin = sanitizeManagerPin(managerPin);
  const path = `${CUSTOM_PRODUCTS_COL}/${cleanId}`;
  const ref = doc(db, CUSTOM_PRODUCTS_COL, cleanId);
  try {
    const existing = await getDoc(ref);
    if (!existing.exists()) return;
    await updateDoc(ref, {
      deleted: true,
      managerPin: cleanPin,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function publishProductOverrideToFirestore(
  productId: string,
  override: ProductOverride,
  fallbackInStock: boolean,
  managerPin: string
): Promise<void> {
  const payload = sanitizeProductOverridePayload(
    productId,
    override,
    fallbackInStock,
    managerPin
  );
  const path = `${PRODUCT_OVERRIDES_COL}/${payload.productId}`;
  const ref = doc(db, PRODUCT_OVERRIDES_COL, payload.productId);

  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      const updatePatch: Record<string, unknown> = {
        inStock: payload.inStock,
        managerPin: payload.managerPin,
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
  managerPin: string
): Promise<void> {
  const payload = sanitizeSiteSettingsPayload(settings, managerPin);
  const path = `${SITE_SETTINGS_COL}/${SITE_SETTINGS_DOC_ID}`;
  const ref = doc(db, SITE_SETTINGS_COL, SITE_SETTINGS_DOC_ID);

  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        heroHeadline: payload.heroHeadline,
        announcementBanner: payload.announcementBanner,
        openingHours: payload.openingHours,
        managerPin: payload.managerPin,
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
  managerPin: string;
}): Promise<void> {
  const { pending, customProducts, overrides, allProducts, siteSettings, managerPin } = params;

  for (const id of pending.customProductIds) {
    const product = customProducts.find((p) => p.id === id);
    if (product) {
      await publishCustomProductToFirestore(product, managerPin);
    }
  }

  for (const id of pending.deletedCustomProductIds) {
    await deleteCustomProductFromFirestore(id, managerPin);
  }

  for (const id of pending.overrideProductIds) {
    const ov = overrides[id];
    const currentProduct = allProducts.find((p) => p.id === id);
    if (ov) {
      await publishProductOverrideToFirestore(
        id,
        ov,
        currentProduct?.inStock ?? true,
        managerPin
      );
    }
  }

  if (pending.siteSettingsDirty) {
    await publishSiteSettingsToFirestore(siteSettings, managerPin);
  }
}

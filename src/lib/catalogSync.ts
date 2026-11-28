import { DEFAULT_SITE_SETTINGS } from './bookingStore';
import { Product, ProductOverride, SectionSlug, SiteSettings } from './types';

export const VALID_SECTION_SLUGS: readonly SectionSlug[] = [
  'chocolate',
  'women-dress',
  'men-dress',
  'decorations-things',
  'toys',
  'skin-care',
  'snacks-and-biscuits',
  'grains',
] as const;

// Volumetric limits synchronized verbatim with firebase-blueprint.json & firestore.rules
export const BLUEPRINT_LIMITS = {
  idMaxLength: 128,
  idPattern: /^[a-zA-Z0-9_\-]+$/,
  slugMaxLength: 160,
  nameMaxLength: 140,
  brandMaxLength: 100,
  unitMaxLength: 60,
  imageMaxLength: 250000,
  descriptionMaxLength: 600,
  aisleMaxLength: 120,
  variantsMaxItems: 8,
  highlightsMaxItems: 8,
  heroHeadlineMaxLength: 180,
  announcementMaxLength: 180,
  openingHoursMaxLength: 80,
  managerPinMinLength: 4,
  managerPinMaxLength: 16,
  managerPinPattern: /^[0-9]+$/,
} as const;

export interface PendingPublishState {
  customProductIds: string[];
  deletedCustomProductIds: string[];
  overrideProductIds: string[];
  siteSettingsDirty: boolean;
}

export const EMPTY_PENDING_PUBLISH: PendingPublishState = {
  customProductIds: [],
  deletedCustomProductIds: [],
  overrideProductIds: [],
  siteSettingsDirty: false,
};

export function countPendingChanges(pending: PendingPublishState): number {
  return (
    pending.customProductIds.length +
    pending.deletedCustomProductIds.length +
    pending.overrideProductIds.length +
    (pending.siteSettingsDirty ? 1 : 0)
  );
}

export function mergeCatalogProducts(
  seeded: Product[],
  customProducts: Product[],
  overrides: Record<string, ProductOverride>
): Product[] {
  const seen = new Set<string>();
  const combined: Product[] = [];

  for (const p of customProducts) {
    if (!p || !p.id || seen.has(p.id)) continue;
    seen.add(p.id);
    combined.push(p);
  }
  for (const p of seeded) {
    if (!p || !p.id || seen.has(p.id)) continue;
    seen.add(p.id);
    combined.push(p);
  }

  return combined.map((p) => {
    const ov = overrides[p.id];
    if (!ov) return p;
    const nextPrice =
      typeof ov.price === 'number' && Number.isFinite(ov.price) && ov.price > 0
        ? Math.round(ov.price)
        : p.price;
    const rawMrp =
      typeof ov.mrp === 'number' && Number.isFinite(ov.mrp) && ov.mrp > 0
        ? Math.round(ov.mrp)
        : p.mrp;
    return {
      ...p,
      inStock: typeof ov.inStock === 'boolean' ? ov.inStock : p.inStock,
      price: nextPrice,
      mrp: Math.max(nextPrice, rawMrp),
    };
  });
}

function clampString(val: string | undefined, fallback: string, maxLen: number): string {
  const trimmed = (val ?? '').trim();
  if (!trimmed) return fallback.slice(0, maxLen);
  return trimmed.slice(0, maxLen);
}

export function sanitizeManagerPin(rawPin: string): string {
  const digitsOnly = rawPin.replace(/[^0-9]/g, '').slice(0, BLUEPRINT_LIMITS.managerPinMaxLength);
  return digitsOnly.length >= BLUEPRINT_LIMITS.managerPinMinLength ? digitsOnly : '0000';
}

export function sanitizeDocumentId(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, BLUEPRINT_LIMITS.idMaxLength);
  return cleaned || `item-${Date.now()}`;
}

export function sanitizeCustomProductPayload(
  product: Product,
  managerPin: string
): {
  id: string;
  slug: string;
  name: string;
  brand: string;
  sectionSlug: SectionSlug;
  price: number;
  mrp: number;
  unit: string;
  variants: string[];
  inStock: boolean;
  trending: boolean;
  deleted: boolean;
  image: string;
  description: string;
  aisleLocation: string;
  highlights: string[];
  managerPin: string;
} {
  const id = sanitizeDocumentId(product.id);
  const sectionSlug = VALID_SECTION_SLUGS.includes(product.sectionSlug)
    ? product.sectionSlug
    : 'chocolate';
  const price = Math.max(1, Math.min(1000000, Math.round(Number(product.price) || 1)));
  const mrp = Math.max(price, Math.min(1000000, Math.round(Number(product.mrp) || price)));
  const unit = clampString(product.unit, '1 Unit', BLUEPRINT_LIMITS.unitMaxLength);

  const rawVariants = Array.isArray(product.variants) ? product.variants : [];
  const variants = rawVariants
    .map((v) => clampString(String(v), '', BLUEPRINT_LIMITS.unitMaxLength))
    .filter(Boolean)
    .slice(0, BLUEPRINT_LIMITS.variantsMaxItems);
  if (variants.length === 0) variants.push(unit);

  const rawHighlights = Array.isArray(product.highlights) ? product.highlights : [];
  const highlights = rawHighlights
    .map((h) => clampString(String(h), '', BLUEPRINT_LIMITS.aisleMaxLength))
    .filter(Boolean)
    .slice(0, BLUEPRINT_LIMITS.highlightsMaxItems);
  if (highlights.length === 0) highlights.push('Ready for 2-hour pickup');

  const safeImage =
    product.image && product.image.length <= BLUEPRINT_LIMITS.imageMaxLength
      ? product.image
      : `/src/assets/images/cat_${sectionSlug === 'women-dress' ? 'womens_fashion_1795533368004' : sectionSlug === 'men-dress' ? 'mens_fashion_1795533367001' : sectionSlug === 'skin-care' ? 'personal_care_1795533367785' : sectionSlug === 'grains' ? 'staples_groceries_1795533366629' : 'chocolate_1795655840303'}.jpg`;

  return {
    id,
    slug: clampString(product.slug, id, BLUEPRINT_LIMITS.slugMaxLength),
    name: clampString(product.name, 'Store Item', BLUEPRINT_LIMITS.nameMaxLength),
    brand: clampString(product.brand, 'Shankar Mall', BLUEPRINT_LIMITS.brandMaxLength),
    sectionSlug,
    price,
    mrp,
    unit,
    variants,
    inStock: Boolean(product.inStock),
    trending: Boolean(product.trending ?? true),
    deleted: false,
    image: safeImage,
    description: clampString(
      product.description,
      'Available for Click & Collect at Shankar Mall Dhanbad.',
      BLUEPRINT_LIMITS.descriptionMaxLength
    ),
    aisleLocation: clampString(
      product.aisleLocation,
      'Express Shelf',
      BLUEPRINT_LIMITS.aisleMaxLength
    ),
    highlights,
    managerPin: sanitizeManagerPin(managerPin),
  };
}

export function sanitizeProductOverridePayload(
  productId: string,
  override: ProductOverride,
  fallbackInStock: boolean,
  managerPin: string
): {
  productId: string;
  inStock: boolean;
  price?: number;
  mrp?: number;
  managerPin: string;
} {
  const cleanId = sanitizeDocumentId(productId);
  const inStock = typeof override.inStock === 'boolean' ? override.inStock : fallbackInStock;
  const payload: {
    productId: string;
    inStock: boolean;
    price?: number;
    mrp?: number;
    managerPin: string;
  } = {
    productId: cleanId,
    inStock,
    managerPin: sanitizeManagerPin(managerPin),
  };

  if (typeof override.price === 'number' && Number.isFinite(override.price) && override.price > 0) {
    payload.price = Math.max(1, Math.min(1000000, Math.round(override.price)));
  }
  if (typeof override.mrp === 'number' && Number.isFinite(override.mrp) && override.mrp > 0) {
    const minMrp = payload.price ?? 1;
    payload.mrp = Math.max(minMrp, Math.min(1000000, Math.round(override.mrp)));
  }
  return payload;
}

export function sanitizeSiteSettingsPayload(
  settings: SiteSettings,
  managerPin: string
): SiteSettings & { managerPin: string } {
  return {
    heroHeadline: clampString(
      settings.heroHeadline,
      DEFAULT_SITE_SETTINGS.heroHeadline,
      BLUEPRINT_LIMITS.heroHeadlineMaxLength
    ),
    announcementBanner: clampString(
      settings.announcementBanner,
      DEFAULT_SITE_SETTINGS.announcementBanner,
      BLUEPRINT_LIMITS.announcementMaxLength
    ),
    openingHours: clampString(
      settings.openingHours,
      DEFAULT_SITE_SETTINGS.openingHours,
      BLUEPRINT_LIMITS.openingHoursMaxLength
    ),
    managerPin: sanitizeManagerPin(managerPin),
  };
}

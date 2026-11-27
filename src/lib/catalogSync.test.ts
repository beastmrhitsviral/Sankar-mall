import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BLUEPRINT_LIMITS,
  EMPTY_PENDING_PUBLISH,
  countPendingChanges,
  mergeCatalogProducts,
  sanitizeCustomProductPayload,
  sanitizeProductOverridePayload,
  sanitizeSiteSettingsPayload,
} from './catalogSync';
import { SEEDED_PRODUCTS } from './catalog';

test('mergeCatalogProducts merges custom items first, deduplicates IDs, and applies live overrides', () => {
  const custom = {
    ...SEEDED_PRODUCTS[0],
    id: 'custom-999',
    slug: 'custom-truffle-999',
    name: 'Belgian Hazelnut Truffle Box',
    inStock: true,
    price: 550,
    mrp: 650,
  };

  const merged = mergeCatalogProducts(SEEDED_PRODUCTS, [custom], {
    'prod-1': { inStock: false, price: 320, mrp: 400 },
    'custom-999': { inStock: false },
  });

  assert.equal(merged.length, SEEDED_PRODUCTS.length + 1);
  assert.equal(merged[0].id, 'custom-999');
  assert.equal(merged[0].inStock, false);

  const prod1 = merged.find((p) => p.id === 'prod-1');
  assert.equal(prod1?.inStock, false);
  assert.equal(prod1?.price, 320);
  assert.equal(prod1?.mrp, 400);
});

test('sanitizeCustomProductPayload enforces blueprint volumetric bounds and valid price/MRP', () => {
  const sanitized = sanitizeCustomProductPayload(
    {
      id: 'custom/invalid id!@#',
      slug: 'my-slug',
      name: '  ' + 'X'.repeat(200),
      brand: 'Brand',
      sectionSlug: 'chocolate',
      price: 500,
      mrp: 200, // Lower than price — must clamp >= price
      unit: '200 g',
      variants: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      inStock: true,
      trending: true,
      image: '/src/assets/images/cat_chocolate_1795655840303.jpg',
      description: 'D'.repeat(800),
      aisleLocation: 'Bay C1',
      highlights: [],
    },
    'uid-123'
  );

  assert.match(sanitized.id, BLUEPRINT_LIMITS.idPattern);
  assert.equal(sanitized.name.length, BLUEPRINT_LIMITS.nameMaxLength);
  assert.equal(sanitized.mrp, 500);
  assert.equal(sanitized.variants.length, BLUEPRINT_LIMITS.variantsMaxItems);
  assert.equal(sanitized.description.length, BLUEPRINT_LIMITS.descriptionMaxLength);
  assert.equal(sanitized.highlights.length, 1);
});

test('sanitizeProductOverridePayload and sanitizeSiteSettingsPayload enforce defaults and bounds', () => {
  const ov = sanitizeProductOverridePayload('prod-1', { price: 199, mrp: 150 }, false, 'uid-admin');
  assert.equal(ov.productId, 'prod-1');
  assert.equal(ov.inStock, false);
  assert.equal(ov.price, 199);
  assert.equal(ov.mrp, 199);

  const settings = sanitizeSiteSettingsPayload(
    {
      heroHeadline: '   ',
      announcementBanner: 'Live Banner',
      openingHours: '9 AM - 9 PM',
    },
    'uid-admin'
  );
  assert.ok(settings.heroHeadline.length > 0);
  assert.equal(settings.announcementBanner, 'Live Banner');

  assert.equal(countPendingChanges(EMPTY_PENDING_PUBLISH), 0);
  assert.equal(
    countPendingChanges({
      customProductIds: ['c1'],
      deletedCustomProductIds: [],
      overrideProductIds: ['p1', 'p2'],
      siteSettingsDirty: true,
    }),
    4
  );
});

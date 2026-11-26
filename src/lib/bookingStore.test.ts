import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SITE_SETTINGS,
  addCustomProduct,
  buildCustomerNotifyWhatsAppUrl,
  buildStoreWhatsAppUrl,
  calculateBagSummary,
  createPhotoListRequest,
  createStandardBooking,
  findBookingsByQuery,
  loadBookings,
  loadProducts,
  loadSiteSettings,
  resetMemoryStorageForTests,
  resetSiteSettings,
  saveSiteSettings,
  toggleProductStock,
  updateBookingStatus,
  updateProductPrice,
  validateIndianPhone,
} from './bookingStore';
import { searchProducts } from './catalog';
import { generateQrMatrix } from './qr';

test('pre-seeds 3 Dhanbad demo orders on fresh load', () => {
  resetMemoryStorageForTests();
  const bookings = loadBookings();
  assert.equal(bookings.length, 3);
  assert.equal(bookings[0].id, '#SM-8412');
  assert.equal(bookings[1].kind, 'photo-list');
  assert.ok(bookings[1].photoDataUrl?.startsWith('data:image/'));
});

test('phone validation enforces 10-digit numbers', () => {
  assert.equal(validateIndianPhone('9835123456'), true);
  assert.equal(validateIndianPhone('+91 9835123456'), true);
  assert.equal(validateIndianPhone('12345'), false);
  assert.equal(validateIndianPhone(''), false);
});

test('standard quick-book creates #SM-XXXX pass, persists, and looks up by ID & phone', () => {
  resetMemoryStorageForTests();
  const booking = createStandardBooking({
    customerName: 'Priya Sinha',
    phone: '9934011223',
    branch: 'Hirapur - Hari Mandir Road',
    pickupSlot: 'Within 2 Hours',
    items: [
      {
        productId: 'prod-1',
        slug: 'india-gate-classic-basmati-5kg',
        name: 'Royal Aged Basmati Rice',
        brand: 'India Gate Classic',
        variant: '5 kg Bag',
        price: 785,
        mrp: 940,
        image: '/src/assets/images/cat_staples_groceries_1795533366629.jpg',
        quantity: 2,
      },
    ],
  });

  assert.match(booking.id, /^#SM-\d{4}$/);
  assert.equal(booking.subtotal, 1570);
  assert.equal(booking.savings, 310);

  const byId = findBookingsByQuery(booking.id);
  assert.equal(byId.length, 1);
  assert.equal(byId[0].customerName, 'Priya Sinha');

  const byPhone = findBookingsByQuery('9934011223');
  assert.equal(byPhone.length, 1);

  const waUrl = buildStoreWhatsAppUrl(booking);
  assert.ok(waUrl.startsWith('https://wa.me/918102800129?text='));
  assert.ok(decodeURIComponent(waUrl).includes(booking.id));
});

test('photo list request persists Base64 photo & text and supports admin status transitions', () => {
  resetMemoryStorageForTests();
  const listReq = createPhotoListRequest({
    customerName: 'Manoj Tiwari',
    phone: '9835500112',
    branch: 'Rangatand - Near Railway Station',
    pickupSlot: 'Today Evening 5-8 PM',
    listText: 'Atta 10kg\nMustard Oil 2L',
    photoDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
    photoFileName: 'handwritten.png',
  });

  assert.equal(listReq.kind, 'photo-list');
  assert.equal(listReq.status, 'Pending');

  const afterPacking = updateBookingStatus(listReq.id, 'Packing');
  const updated = afterPacking.find((b) => b.id === listReq.id);
  assert.equal(updated?.status, 'Packing');

  const afterReady = updateBookingStatus(listReq.id, 'Ready');
  const readyRecord = afterReady.find((b) => b.id === listReq.id);
  assert.equal(readyRecord?.status, 'Ready');

  if (readyRecord) {
    const notifyUrl = buildCustomerNotifyWhatsAppUrl(readyRecord);
    assert.ok(notifyUrl.startsWith('https://wa.me/919835500112?text='));
    assert.ok(decodeURIComponent(notifyUrl).includes('READY FOR PICKUP'));
  }

  const afterCompleted = updateBookingStatus(listReq.id, 'Completed');
  const completedRecord = afterCompleted.find((b) => b.id === listReq.id);
  assert.equal(completedRecord?.status, 'Completed');
});

test('calculateBagSummary and addCustomProduct work cleanly', () => {
  resetMemoryStorageForTests();
  const summary = calculateBagSummary([
    {
      productId: 'p1',
      slug: 'p1',
      name: 'Tea',
      brand: 'Brand',
      variant: '250g',
      price: 400,
      mrp: 500,
      image: '',
      quantity: 3,
    },
  ]);
  assert.equal(summary.itemCount, 3);
  assert.equal(summary.subtotal, 1200);
  assert.equal(summary.savings, 300);

  const initialCount = loadProducts().length;
  assert.equal(initialCount, 32);

  const created = addCustomProduct({
    name: 'Belgian Hazelnut Chocolate Box',
    brand: 'Shankar Chocolatier',
    sectionSlug: 'chocolate',
    price: 580,
    mrp: 680,
    unit: '250 g Box',
    variants: ['250 g Box'],
    inStock: true,
    image: '/src/assets/images/cat_chocolate_1795655840303.jpg',
    description: 'Assorted roasted hazelnut pralines.',
    aisleLocation: 'Chocolate Section · Bay C1',
    highlights: ['Pure cocoa butter'],
  });

  const nextProducts = loadProducts();
  assert.equal(nextProducts.length, 33);
  assert.equal(nextProducts[0].id, created.id);
});

test('manager stock toggle, price override, and site settings persist cleanly', () => {
  resetMemoryStorageForTests();

  const outStockList = toggleProductStock('prod-1', false);
  const p1Out = outStockList.find((p) => p.id === 'prod-1');
  assert.equal(p1Out?.inStock, false);

  const priceUpdatedList = updateProductPrice('prod-1', 310, 399);
  const p1Price = priceUpdatedList.find((p) => p.id === 'prod-1');
  assert.equal(p1Price?.price, 310);
  assert.equal(p1Price?.mrp, 399);
  assert.equal(p1Price?.inStock, false);

  const reEnabled = toggleProductStock('prod-1', true);
  assert.equal(reEnabled.find((p) => p.id === 'prod-1')?.inStock, true);

  assert.deepEqual(loadSiteSettings(), DEFAULT_SITE_SETTINGS);
  const saved = saveSiteSettings({
    heroHeadline: 'Festive Weekend Pickup Open!',
    announcementBanner: 'Free Jaggery Bar on ₹1,000+ Orders',
    openingHours: '8:30 AM – 10:00 PM',
  });
  assert.equal(saved.heroHeadline, 'Festive Weekend Pickup Open!');
  assert.equal(loadSiteSettings().openingHours, '8:30 AM – 10:00 PM');

  const reset = resetSiteSettings();
  assert.deepEqual(reset, DEFAULT_SITE_SETTINGS);
});

test('QR matrix generator produces valid 21x21 grid with finder squares', () => {
  const matrix = generateQrMatrix('#SM-8412');
  assert.equal(matrix.length, 21);
  assert.equal(matrix[0].length, 21);
  // Top-left finder corner
  assert.equal(matrix[0][0], true);
  assert.equal(matrix[3][3], true);
  assert.equal(matrix[1][1], false);
});

test('searchProducts matches relatable multi-word & section queries and retains out-of-stock products', () => {
  resetMemoryStorageForTests();
  toggleProductStock('prod-1', false);
  const products = loadProducts();

  const chocoResults = searchProducts(products, 'dark chocolate');
  const outItem = chocoResults.find((p) => p.id === 'prod-1');
  assert.ok(outItem, 'Out of stock product should still be included in search results');
  assert.equal(outItem?.inStock, false);

  const sectionResults = searchProducts(products, 'women dress');
  assert.ok(sectionResults.length >= 4);
});

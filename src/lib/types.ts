export type SectionSlug =
  | 'chocolate'
  | 'women-dress'
  | 'men-dress'
  | 'decorations-things'
  | 'toys'
  | 'skin-care'
  | 'snacks-and-biscuits'
  | 'grains';

export interface Section {
  slug: SectionSlug;
  name: string;
  description: string;
  image: string;
}

export interface Product {
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
  trending?: boolean;
  image: string;
  description: string;
  aisleLocation: string;
  highlights: string[];
}

export interface BagItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  variant: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
}

export type BranchName =
  | 'Hirapur - Hari Mandir Road'
  | 'Rangatand - Near Railway Station';

export type PickupSlot =
  | 'Within 2 Hours'
  | 'Today Evening 5-8 PM'
  | 'Tomorrow Morning';

export type OrderStatus = 'Pending' | 'Packing' | 'Ready' | 'Completed';

export interface SiteSettings {
  heroHeadline: string;
  announcementBanner: string;
  openingHours: string;
}

export interface ProductOverride {
  inStock?: boolean;
  price?: number;
  mrp?: number;
}

export interface StandardBooking {
  id: string;
  kind: 'standard';
  customerName: string;
  phone: string;
  branch: BranchName;
  pickupSlot: PickupSlot;
  paymentMode: 'Pay at Express Counter (Cash / UPI / Card)';
  items: BagItem[];
  subtotal: number;
  totalMrp: number;
  savings: number;
  status: OrderStatus;
  createdAt: string;
}

export interface PhotoListRequest {
  id: string;
  kind: 'photo-list';
  customerName: string;
  phone: string;
  branch: BranchName;
  pickupSlot: PickupSlot;
  paymentMode: 'Pay at Express Counter (Cash / UPI / Card)';
  listText: string;
  photoDataUrl?: string;
  photoFileName?: string;
  estimatedItemsCount?: number;
  status: OrderStatus;
  createdAt: string;
}

export type BookingRecord = StandardBooking | PhotoListRequest;

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  MANAGER_PIN,
  addCustomProduct as storeAddCustomProduct,
  calculateBagSummary,
  createPhotoListRequest as storeCreatePhotoListRequest,
  createStandardBooking as storeCreateStandardBooking,
  loadBag,
  loadBookings,
  loadProducts,
  loadSiteSettings,
  resetSiteSettings as storeResetSiteSettings,
  saveBag,
  saveSiteSettings as storeSaveSiteSettings,
  toggleProductStock as storeToggleProductStock,
  updateBookingStatus as storeUpdateBookingStatus,
  updateProductPrice as storeUpdateProductPrice,
} from '../lib/bookingStore';
import {
  BagItem,
  BookingRecord,
  BranchName,
  OrderStatus,
  PhotoListRequest,
  PickupSlot,
  Product,
  SiteSettings,
  StandardBooking,
} from '../lib/types';

const MANAGER_SESSION_KEY = 'shankar_manager_unlocked_2014';

interface StoreContextValue {
  products: Product[];
  bag: BagItem[];
  bagSummary: ReturnType<typeof calculateBagSummary>;
  bookings: BookingRecord[];
  siteSettings: SiteSettings;
  isSectionsDrawerOpen: boolean;
  setSectionsDrawerOpen: (open: boolean) => void;
  isBagDrawerOpen: boolean;
  setBagDrawerOpen: (open: boolean) => void;
  isPinModalOpen: boolean;
  setPinModalOpen: (open: boolean) => void;
  isManagerUnlocked: boolean;
  unlockManagerWithPin: (pin: string) => boolean;
  lockManager: () => void;
  lastCreatedPass: StandardBooking | null;
  setLastCreatedPass: (pass: StandardBooking | null) => void;
  addToBag: (product: Product, variant?: string, quantity?: number) => void;
  updateBagQuantity: (productId: string, variant: string, delta: number) => void;
  removeFromBag: (productId: string, variant: string) => void;
  clearBag: () => void;
  submitStandardBooking: (params: {
    customerName: string;
    phone: string;
    branch: BranchName;
    pickupSlot: PickupSlot;
  }) => StandardBooking;
  submitPhotoList: (params: {
    customerName: string;
    phone: string;
    branch: BranchName;
    pickupSlot: PickupSlot;
    listText: string;
    photoDataUrl?: string;
    photoFileName?: string;
  }) => PhotoListRequest;
  updateStatus: (bookingId: string, status: OrderStatus) => void;
  addProduct: (input: Omit<Product, 'id' | 'slug'>) => Product;
  toggleStock: (productId: string, inStock: boolean) => void;
  editProductPrice: (productId: string, price: number, mrp?: number) => void;
  updateSiteSettings: (settings: SiteSettings) => SiteSettings;
  resetSiteDefaults: () => SiteSettings;
  refreshFromStorage: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [bag, setBag] = useState<BagItem[]>(() => loadBag());
  const [bookings, setBookings] = useState<BookingRecord[]>(() => loadBookings());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => loadSiteSettings());
  const [isSectionsDrawerOpen, setSectionsDrawerOpen] = useState(false);
  const [isBagDrawerOpen, setBagDrawerOpen] = useState(false);
  const [isPinModalOpen, setPinModalOpen] = useState(false);
  const [isManagerUnlocked, setManagerUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem(MANAGER_SESSION_KEY) === '1';
    }
    return false;
  });
  const [lastCreatedPass, setLastCreatedPass] = useState<StandardBooking | null>(null);

  const refreshFromStorage = useCallback(() => {
    setProducts(loadProducts());
    setBag(loadBag());
    setBookings(loadBookings());
    setSiteSettings(loadSiteSettings());
  }, []);

  useEffect(() => {
    const onStorage = () => refreshFromStorage();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshFromStorage]);

  const unlockManagerWithPin = useCallback((pin: string): boolean => {
    if (pin.trim() === MANAGER_PIN) {
      setManagerUnlocked(true);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(MANAGER_SESSION_KEY, '1');
      }
      return true;
    }
    return false;
  }, []);

  const lockManager = useCallback(() => {
    setManagerUnlocked(false);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(MANAGER_SESSION_KEY);
    }
  }, []);

  const addToBag = useCallback(
    (product: Product, variant?: string, quantity = 1) => {
      if (!product.inStock) return;
      const chosenVariant = variant || product.variants[0] || product.unit;
      setLastCreatedPass(null);
      setBag((prev) => {
        const idx = prev.findIndex(
          (i) => i.productId === product.id && i.variant === chosenVariant
        );
        let next: BagItem[];
        if (idx >= 0) {
          next = prev.map((item, i) =>
            i === idx ? { ...item, quantity: item.quantity + quantity } : item
          );
        } else {
          next = [
            ...prev,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              brand: product.brand,
              variant: chosenVariant,
              price: product.price,
              mrp: product.mrp,
              image: product.image,
              quantity,
            },
          ];
        }
        saveBag(next);
        return next;
      });
    },
    []
  );

  const updateBagQuantity = useCallback((productId: string, variant: string, delta: number) => {
    setBag((prev) => {
      const next = prev
        .map((item) =>
          item.productId === productId && item.variant === variant
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0);
      saveBag(next);
      return next;
    });
  }, []);

  const removeFromBag = useCallback((productId: string, variant: string) => {
    setBag((prev) => {
      const next = prev.filter(
        (item) => !(item.productId === productId && item.variant === variant)
      );
      saveBag(next);
      return next;
    });
  }, []);

  const clearBag = useCallback(() => {
    saveBag([]);
    setBag([]);
  }, []);

  const submitStandardBooking = useCallback(
    (params: {
      customerName: string;
      phone: string;
      branch: BranchName;
      pickupSlot: PickupSlot;
    }) => {
      const record = storeCreateStandardBooking({
        ...params,
        items: bag,
      });
      setBookings(loadBookings());
      clearBag();
      setLastCreatedPass(record);
      return record;
    },
    [bag, clearBag]
  );

  const submitPhotoList = useCallback(
    (params: {
      customerName: string;
      phone: string;
      branch: BranchName;
      pickupSlot: PickupSlot;
      listText: string;
      photoDataUrl?: string;
      photoFileName?: string;
    }) => {
      const record = storeCreatePhotoListRequest(params);
      setBookings(loadBookings());
      return record;
    },
    []
  );

  const updateStatus = useCallback((bookingId: string, status: OrderStatus) => {
    const updated = storeUpdateBookingStatus(bookingId, status);
    setBookings(updated);
  }, []);

  const addProduct = useCallback((input: Omit<Product, 'id' | 'slug'>) => {
    const created = storeAddCustomProduct(input);
    setProducts(loadProducts());
    return created;
  }, []);

  const toggleStock = useCallback((productId: string, inStock: boolean) => {
    const next = storeToggleProductStock(productId, inStock);
    setProducts(next);
  }, []);

  const editProductPrice = useCallback((productId: string, price: number, mrp?: number) => {
    const next = storeUpdateProductPrice(productId, price, mrp);
    setProducts(next);
  }, []);

  const updateSiteSettings = useCallback((settings: SiteSettings) => {
    const saved = storeSaveSiteSettings(settings);
    setSiteSettings(saved);
    return saved;
  }, []);

  const resetSiteDefaults = useCallback(() => {
    const defaults = storeResetSiteSettings();
    setSiteSettings(defaults);
    return defaults;
  }, []);

  const bagSummary = useMemo(() => calculateBagSummary(bag), [bag]);

  const contextValue = useMemo<StoreContextValue>(
    () => ({
      products,
      bag,
      bagSummary,
      bookings,
      siteSettings,
      isSectionsDrawerOpen,
      setSectionsDrawerOpen,
      isBagDrawerOpen,
      setBagDrawerOpen,
      isPinModalOpen,
      setPinModalOpen,
      isManagerUnlocked,
      unlockManagerWithPin,
      lockManager,
      lastCreatedPass,
      setLastCreatedPass,
      addToBag,
      updateBagQuantity,
      removeFromBag,
      clearBag,
      submitStandardBooking,
      submitPhotoList,
      updateStatus,
      addProduct,
      toggleStock,
      editProductPrice,
      updateSiteSettings,
      resetSiteDefaults,
      refreshFromStorage,
    }),
    [
      products,
      bag,
      bagSummary,
      bookings,
      siteSettings,
      isSectionsDrawerOpen,
      isBagDrawerOpen,
      isPinModalOpen,
      isManagerUnlocked,
      unlockManagerWithPin,
      lockManager,
      lastCreatedPass,
      addToBag,
      updateBagQuantity,
      removeFromBag,
      clearBag,
      submitStandardBooking,
      submitPhotoList,
      updateStatus,
      addProduct,
      toggleStock,
      editProductPrice,
      updateSiteSettings,
      resetSiteDefaults,
      refreshFromStorage,
    ]
  );

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return ctx;
}

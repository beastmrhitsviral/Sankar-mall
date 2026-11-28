import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  DEFAULT_SITE_SETTINGS,
  MANAGER_PIN,
  addCustomProduct as storeAddCustomProduct,
  calculateBagSummary,
  createPhotoListRequest as storeCreatePhotoListRequest,
  createStandardBooking as storeCreateStandardBooking,
  deleteCustomProduct as storeDeleteCustomProduct,
  loadBag,
  loadBookings,
  loadCustomProducts,
  loadProductOverrides,
  loadSiteSettings,
  resetSiteSettings as storeResetSiteSettings,
  saveBag,
  saveSiteSettings as storeSaveSiteSettings,
  toggleProductStock as storeToggleProductStock,
  updateBookingStatus as storeUpdateBookingStatus,
  updateProductPrice as storeUpdateProductPrice,
} from '../lib/bookingStore';
import { SEEDED_PRODUCTS } from '../lib/catalog';
import {
  EMPTY_PENDING_PUBLISH,
  PendingPublishState,
  countPendingChanges,
  mergeCatalogProducts,
} from '../lib/catalogSync';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  auth,
  checkIsStoreAdmin,
  completeGoogleRedirectSignIn,
  signInAdminWithGoogle,
  signOutAdmin,
  testConnection,
} from '../lib/firebase';
import {
  deleteCustomProductFromFirestore,
  publishAllPendingToFirestore,
  publishBookingStatusToFirestore,
  publishBookingToFirestore,
  publishCustomProductToFirestore,
  publishProductOverrideToFirestore,
  publishSiteSettingsToFirestore,
  subscribeAdminBookings,
  subscribePublicCatalog,
} from '../lib/firestoreCatalog';
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
} from '../lib/types';

const MANAGER_SESSION_KEY = 'shankar_manager_unlocked_2014';
const PENDING_PUBLISH_KEY = 'shankar_mall_pending_publish_v1';

export type CloudSyncStatus = 'connecting' | 'live' | 'error';
export type PublishStatus = 'idle' | 'publishing' | 'published' | 'pending-auth' | 'error';

function loadPendingPublish(): PendingPublishState {
  if (typeof window === 'undefined') return EMPTY_PENDING_PUBLISH;
  try {
    const raw = window.localStorage.getItem(PENDING_PUBLISH_KEY);
    if (!raw) return EMPTY_PENDING_PUBLISH;
    const parsed = JSON.parse(raw) as Partial<PendingPublishState>;
    return {
      customProductIds: Array.isArray(parsed.customProductIds) ? parsed.customProductIds : [],
      deletedCustomProductIds: Array.isArray(parsed.deletedCustomProductIds)
        ? parsed.deletedCustomProductIds
        : [],
      overrideProductIds: Array.isArray(parsed.overrideProductIds)
        ? parsed.overrideProductIds
        : [],
      siteSettingsDirty: Boolean(parsed.siteSettingsDirty),
    };
  } catch {
    return EMPTY_PENDING_PUBLISH;
  }
}

function savePendingPublish(pending: PendingPublishState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PENDING_PUBLISH_KEY, JSON.stringify(pending));
  } catch {
    // Ignore storage quota issues
  }
}

function parseReadableError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err || '');
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as { error?: string };
    if (parsed?.error) return parsed.error;
  } catch {
    // Not JSON
  }
  return raw;
}

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
  deleteProduct: (productId: string) => void;
  toggleStock: (productId: string, inStock: boolean) => void;
  editProductPrice: (productId: string, price: number, mrp?: number) => void;
  updateSiteSettings: (settings: SiteSettings) => SiteSettings;
  resetSiteDefaults: () => SiteSettings;
  refreshFromStorage: () => void;
  // Cloud Publishing & Auth
  authReady: boolean;
  authUser: User | null;
  isCloudAdmin: boolean;
  authError: string | null;
  cloudSyncStatus: CloudSyncStatus;
  publishStatus: PublishStatus;
  publishError: string | null;
  pendingCount: number;
  lastPublishedAt: number | null;
  signInAsCloudAdmin: () => Promise<void>;
  signOutCloudAdmin: () => Promise<void>;
  publishPendingNow: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [localCustomProducts, setLocalCustomProducts] = useState<Product[]>(() =>
    loadCustomProducts()
  );
  const [cloudCustomProducts, setCloudCustomProducts] = useState<Product[] | null>(null);

  const [localOverrides, setLocalOverrides] = useState<Record<string, ProductOverride>>(() =>
    loadProductOverrides()
  );
  const [cloudOverrides, setCloudOverrides] = useState<Record<string, ProductOverride> | null>(
    null
  );

  const [localSiteSettings, setLocalSiteSettings] = useState<SiteSettings>(() =>
    loadSiteSettings()
  );
  const [cloudSiteSettings, setCloudSiteSettings] = useState<SiteSettings | null>(null);

  const [pendingPublish, setPendingPublish] = useState<PendingPublishState>(() =>
    loadPendingPublish()
  );

  // Optimistic in-flight trackers so UI never snaps back while Firestore write completes
  const [inFlightCustomIds, setInFlightCustomIds] = useState<string[]>([]);
  const [inFlightDeletedIds, setInFlightDeletedIds] = useState<string[]>([]);
  const [inFlightOverrideIds, setInFlightOverrideIds] = useState<string[]>([]);
  const [inFlightSettings, setInFlightSettings] = useState(false);

  const [bag, setBag] = useState<BagItem[]>(() => loadBag());
  const [localBookings, setLocalBookings] = useState<BookingRecord[]>(() => loadBookings());
  const [cloudBookings, setCloudBookings] = useState<BookingRecord[] | null>(null);

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

  // Firebase Auth & Sync states
  const [authReady, setAuthReady] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isCloudAdmin, setIsCloudAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('connecting');
  const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [lastPublishedAt, setLastPublishedAt] = useState<number | null>(null);

  const pendingCount = useMemo(() => countPendingChanges(pendingPublish), [pendingPublish]);

  const updatePending = useCallback(
    (updater: (prev: PendingPublishState) => PendingPublishState) => {
      setPendingPublish((prev) => {
        const next = updater(prev);
        savePendingPublish(next);
        return next;
      });
    },
    []
  );

  // Effective public catalog merges cloud state + optimistic in-flight + pending edits
  const products = useMemo(() => {
    const baseCustom = cloudCustomProducts ?? localCustomProducts;
    const deletedSet = new Set([
      ...pendingPublish.deletedCustomProductIds,
      ...inFlightDeletedIds,
    ]);
    const activeLocalCustomSet = new Set([
      ...pendingPublish.customProductIds,
      ...inFlightCustomIds,
    ]);

    const customMerged: Product[] = [];
    const seenCustom = new Set<string>();

    for (const p of localCustomProducts) {
      if (activeLocalCustomSet.has(p.id) && !deletedSet.has(p.id)) {
        customMerged.push(p);
        seenCustom.add(p.id);
      }
    }
    for (const p of baseCustom) {
      if (!seenCustom.has(p.id) && !deletedSet.has(p.id)) {
        customMerged.push(p);
        seenCustom.add(p.id);
      }
    }

    const baseOverrides: Record<string, ProductOverride> = {
      ...(cloudOverrides ?? localOverrides),
    };
    const activeLocalOverrides = new Set([
      ...pendingPublish.overrideProductIds,
      ...inFlightOverrideIds,
    ]);
    for (const id of activeLocalOverrides) {
      if (localOverrides[id]) {
        baseOverrides[id] = localOverrides[id];
      }
    }

    return mergeCatalogProducts(SEEDED_PRODUCTS, customMerged, baseOverrides);
  }, [
    cloudCustomProducts,
    cloudOverrides,
    inFlightCustomIds,
    inFlightDeletedIds,
    inFlightOverrideIds,
    localCustomProducts,
    localOverrides,
    pendingPublish,
  ]);

  const siteSettings = useMemo(() => {
    if (pendingPublish.siteSettingsDirty || inFlightSettings) return localSiteSettings;
    return cloudSiteSettings ?? localSiteSettings ?? DEFAULT_SITE_SETTINGS;
  }, [cloudSiteSettings, inFlightSettings, localSiteSettings, pendingPublish.siteSettingsDirty]);

  const bookings = useMemo(() => {
    if (cloudBookings && cloudBookings.length > 0) {
      const seen = new Set(cloudBookings.map((b) => b.id));
      const merged = [...cloudBookings];
      for (const lb of localBookings) {
        if (!seen.has(lb.id)) merged.push(lb);
      }
      return merged;
    }
    return localBookings;
  }, [cloudBookings, localBookings]);

  const latestRef = useRef({
    pendingPublish,
    localCustomProducts,
    localOverrides,
    products,
    localSiteSettings,
    authUser,
    isCloudAdmin,
  });
  latestRef.current = {
    pendingPublish,
    localCustomProducts,
    localOverrides,
    products,
    localSiteSettings,
    authUser,
    isCloudAdmin,
  };

  const publishPendingNow = useCallback(async () => {
    const snap = latestRef.current;
    if (!snap.authUser || !snap.isCloudAdmin) {
      setPublishStatus('pending-auth');
      return;
    }
    if (countPendingChanges(snap.pendingPublish) === 0) {
      setPublishStatus('published');
      return;
    }
    setPublishStatus('publishing');
    setPublishError(null);
    try {
      await publishAllPendingToFirestore({
        pending: snap.pendingPublish,
        customProducts: snap.localCustomProducts,
        overrides: snap.localOverrides,
        allProducts: snap.products,
        siteSettings: snap.localSiteSettings,
        authorUid: snap.authUser.uid,
      });
      updatePending(() => EMPTY_PENDING_PUBLISH);
      setPublishStatus('published');
      setLastPublishedAt(Date.now());
    } catch (err) {
      setPublishStatus('error');
      setPublishError(parseReadableError(err, 'Failed to publish changes to live store.'));
    }
  }, [updatePending]);

  // 1. Validate Firestore connectivity & subscribe to real-time public storefront catalog
  useEffect(() => {
    void testConnection();
    const unsubscribe = subscribePublicCatalog({
      onCustomProducts: (items) => setCloudCustomProducts(items),
      onOverrides: (overrides) => setCloudOverrides(overrides),
      onSiteSettings: (settings) => setCloudSiteSettings(settings),
      onConnected: () => setCloudSyncStatus('live'),
      onError: () => setCloudSyncStatus('error'),
    });
    return () => unsubscribe();
  }, []);

  // 2. Complete any pending OAuth redirect sign-in and track Firebase Auth state
  useEffect(() => {
    void completeGoogleRedirectSignIn().catch((err) => {
      setAuthError(parseReadableError(err, 'Google Sign-In redirect failed.'));
    });

    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthError(null);
      if (user) {
        const adminOk = await checkIsStoreAdmin(user);
        setIsCloudAdmin(adminOk);
        if (!adminOk) {
          setAuthError(
            `Signed in as ${user.email || 'unknown'}. Please sign in with ${BOOTSTRAPPED_ADMIN_EMAIL} to publish changes to all phones.`
          );
        } else {
          setPublishStatus((prev) =>
            countPendingChanges(latestRef.current.pendingPublish) > 0 ? prev : 'published'
          );
        }
      } else {
        setIsCloudAdmin(false);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // 3. Automatically publish queued local edits as soon as admin signs in
  useEffect(() => {
    if (authReady && isCloudAdmin && authUser && pendingCount > 0) {
      void publishPendingNow();
    }
  }, [authReady, authUser, isCloudAdmin, pendingCount, publishPendingNow]);

  // 4. Subscribe to Firestore bookings ONLY when verified admin is authenticated
  useEffect(() => {
    if (!authReady || !isCloudAdmin || !authUser) {
      setCloudBookings(null);
      return;
    }
    const unsub = subscribeAdminBookings(true, authUser.uid, (items) => {
      setCloudBookings(items);
    });
    return () => unsub();
  }, [authReady, authUser, isCloudAdmin]);

  const signInAsCloudAdmin = useCallback(async () => {
    setAuthError(null);
    try {
      const user = await signInAdminWithGoogle();
      if (!user) return; // Redirecting
      const adminOk = await checkIsStoreAdmin(user);
      setIsCloudAdmin(adminOk);
      if (!adminOk) {
        setAuthError(
          `Signed in as ${user.email || 'unknown'}. Please sign in with ${BOOTSTRAPPED_ADMIN_EMAIL} to publish changes to all phones.`
        );
      }
    } catch (err) {
      setAuthError(
        parseReadableError(err, 'Google Sign-In was cancelled or blocked.')
      );
    }
  }, []);

  const signOutCloudAdmin = useCallback(async () => {
    await signOutAdmin();
    setIsCloudAdmin(false);
    setAuthError(null);
  }, []);

  const refreshFromStorage = useCallback(() => {
    setLocalCustomProducts(loadCustomProducts());
    setLocalOverrides(loadProductOverrides());
    setBag(loadBag());
    setLocalBookings(loadBookings());
    setLocalSiteSettings(loadSiteSettings());
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
      setLocalBookings(loadBookings());
      clearBag();
      setLastCreatedPass(record);
      if (authUser && authUser.emailVerified) {
        void publishBookingToFirestore(record, authUser.uid).catch(() => {});
      }
      return record;
    },
    [authUser, bag, clearBag]
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
      setLocalBookings(loadBookings());
      if (authUser && authUser.emailVerified) {
        void publishBookingToFirestore(record, authUser.uid).catch(() => {});
      }
      return record;
    },
    [authUser]
  );

  const updateStatus = useCallback(
    (bookingId: string, status: OrderStatus) => {
      const updated = storeUpdateBookingStatus(bookingId, status);
      setLocalBookings(updated);
      if (isCloudAdmin && authUser) {
        void publishBookingStatusToFirestore(bookingId, status).catch(() => {});
      }
    },
    [authUser, isCloudAdmin]
  );

  const addProduct = useCallback(
    (input: Omit<Product, 'id' | 'slug'>) => {
      const created = storeAddCustomProduct(input);
      setLocalCustomProducts(loadCustomProducts());

      if (isCloudAdmin && authUser) {
        setInFlightCustomIds((prev) => Array.from(new Set([...prev, created.id])));
        setPublishStatus('publishing');
        setPublishError(null);
        void publishCustomProductToFirestore(created, authUser.uid)
          .then(() => {
            setPublishStatus('published');
            setLastPublishedAt(Date.now());
          })
          .catch((err) => {
            updatePending((prev) => ({
              ...prev,
              customProductIds: Array.from(new Set([...prev.customProductIds, created.id])),
            }));
            setPublishStatus('error');
            setPublishError(parseReadableError(err, 'Could not publish new product.'));
          })
          .finally(() => {
            setInFlightCustomIds((prev) => prev.filter((id) => id !== created.id));
          });
      } else {
        updatePending((prev) => ({
          ...prev,
          customProductIds: Array.from(new Set([...prev.customProductIds, created.id])),
        }));
        setPublishStatus('pending-auth');
      }

      return created;
    },
    [authUser, isCloudAdmin, updatePending]
  );

  const deleteProduct = useCallback(
    (productId: string) => {
      storeDeleteCustomProduct(productId);
      setLocalCustomProducts(loadCustomProducts());
      setLocalOverrides(loadProductOverrides());

      if (isCloudAdmin && authUser) {
        setInFlightDeletedIds((prev) => Array.from(new Set([...prev, productId])));
        setPublishStatus('publishing');
        setPublishError(null);
        void deleteCustomProductFromFirestore(productId)
          .then(() => {
            setPublishStatus('published');
            setLastPublishedAt(Date.now());
          })
          .catch((err) => {
            setPublishStatus('error');
            setPublishError(parseReadableError(err, 'Could not delete product from live store.'));
          })
          .finally(() => {
            setInFlightDeletedIds((prev) => prev.filter((id) => id !== productId));
          });
      } else {
        updatePending((prev) => ({
          ...prev,
          customProductIds: prev.customProductIds.filter((id) => id !== productId),
          deletedCustomProductIds: Array.from(
            new Set([...prev.deletedCustomProductIds, productId])
          ),
        }));
        setPublishStatus('pending-auth');
      }
    },
    [authUser, isCloudAdmin, updatePending]
  );

  const toggleStock = useCallback(
    (productId: string, inStock: boolean) => {
      storeToggleProductStock(productId, inStock);
      const nextOverrides = loadProductOverrides();
      setLocalOverrides(nextOverrides);
      const currentProduct = products.find((p) => p.id === productId);
      const override = nextOverrides[productId] || { inStock };

      if (isCloudAdmin && authUser) {
        setInFlightOverrideIds((prev) => Array.from(new Set([...prev, productId])));
        setPublishStatus('publishing');
        setPublishError(null);
        void publishProductOverrideToFirestore(
          productId,
          override,
          currentProduct?.inStock ?? inStock,
          authUser.uid
        )
          .then(() => {
            setPublishStatus('published');
            setLastPublishedAt(Date.now());
          })
          .catch((err) => {
            updatePending((prev) => ({
              ...prev,
              overrideProductIds: Array.from(new Set([...prev.overrideProductIds, productId])),
            }));
            setPublishStatus('error');
            setPublishError(parseReadableError(err, 'Could not publish stock status.'));
          })
          .finally(() => {
            setInFlightOverrideIds((prev) => prev.filter((id) => id !== productId));
          });
      } else {
        updatePending((prev) => ({
          ...prev,
          overrideProductIds: Array.from(new Set([...prev.overrideProductIds, productId])),
        }));
        setPublishStatus('pending-auth');
      }
    },
    [authUser, isCloudAdmin, products, updatePending]
  );

  const editProductPrice = useCallback(
    (productId: string, price: number, mrp?: number) => {
      storeUpdateProductPrice(productId, price, mrp);
      const nextOverrides = loadProductOverrides();
      setLocalOverrides(nextOverrides);
      const currentProduct = products.find((p) => p.id === productId);
      const override = nextOverrides[productId] || {
        inStock: currentProduct?.inStock ?? true,
        price,
        mrp,
      };

      if (isCloudAdmin && authUser) {
        setInFlightOverrideIds((prev) => Array.from(new Set([...prev, productId])));
        setPublishStatus('publishing');
        setPublishError(null);
        void publishProductOverrideToFirestore(
          productId,
          override,
          currentProduct?.inStock ?? true,
          authUser.uid
        )
          .then(() => {
            setPublishStatus('published');
            setLastPublishedAt(Date.now());
          })
          .catch((err) => {
            updatePending((prev) => ({
              ...prev,
              overrideProductIds: Array.from(new Set([...prev.overrideProductIds, productId])),
            }));
            setPublishStatus('error');
            setPublishError(parseReadableError(err, 'Could not publish price update.'));
          })
          .finally(() => {
            setInFlightOverrideIds((prev) => prev.filter((id) => id !== productId));
          });
      } else {
        updatePending((prev) => ({
          ...prev,
          overrideProductIds: Array.from(new Set([...prev.overrideProductIds, productId])),
        }));
        setPublishStatus('pending-auth');
      }
    },
    [authUser, isCloudAdmin, products, updatePending]
  );

  const updateSiteSettings = useCallback(
    (settings: SiteSettings) => {
      const saved = storeSaveSiteSettings(settings);
      setLocalSiteSettings(saved);

      if (isCloudAdmin && authUser) {
        setInFlightSettings(true);
        setPublishStatus('publishing');
        setPublishError(null);
        void publishSiteSettingsToFirestore(saved, authUser.uid)
          .then(() => {
            setPublishStatus('published');
            setLastPublishedAt(Date.now());
          })
          .catch((err) => {
            updatePending((prev) => ({ ...prev, siteSettingsDirty: true }));
            setPublishStatus('error');
            setPublishError(parseReadableError(err, 'Could not publish storefront text.'));
          })
          .finally(() => {
            setInFlightSettings(false);
          });
      } else {
        updatePending((prev) => ({ ...prev, siteSettingsDirty: true }));
        setPublishStatus('pending-auth');
      }

      return saved;
    },
    [authUser, isCloudAdmin, updatePending]
  );

  const resetSiteDefaults = useCallback(() => {
    const defaults = storeResetSiteSettings();
    setLocalSiteSettings(defaults);

    if (isCloudAdmin && authUser) {
      setInFlightSettings(true);
      setPublishStatus('publishing');
      void publishSiteSettingsToFirestore(defaults, authUser.uid)
        .then(() => {
          setPublishStatus('published');
          setLastPublishedAt(Date.now());
        })
        .catch(() => {})
        .finally(() => {
          setInFlightSettings(false);
        });
    } else {
      updatePending((prev) => ({ ...prev, siteSettingsDirty: true }));
      setPublishStatus('pending-auth');
    }

    return defaults;
  }, [authUser, isCloudAdmin, updatePending]);

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
      deleteProduct,
      toggleStock,
      editProductPrice,
      updateSiteSettings,
      resetSiteDefaults,
      refreshFromStorage,
      authReady,
      authUser,
      isCloudAdmin,
      authError,
      cloudSyncStatus,
      publishStatus,
      publishError,
      pendingCount,
      lastPublishedAt,
      signInAsCloudAdmin,
      signOutCloudAdmin,
      publishPendingNow,
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
      deleteProduct,
      toggleStock,
      editProductPrice,
      updateSiteSettings,
      resetSiteDefaults,
      refreshFromStorage,
      authReady,
      authUser,
      isCloudAdmin,
      authError,
      cloudSyncStatus,
      publishStatus,
      publishError,
      pendingCount,
      lastPublishedAt,
      signInAsCloudAdmin,
      signOutCloudAdmin,
      publishPendingNow,
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

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Lock,
  Package,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Type,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useMotionNav } from '../context/MotionNavContext';
import { formatINR } from '../lib/bookingStore';
import { SECTIONS } from '../lib/catalog';
import { BookingRecord, Product, SectionSlug } from '../lib/types';
import { CloudPublishBanner } from '../components/CloudPublishBanner';
import { ProductImageUploadBox } from '../components/ProductImageUploadBox';
import { ResilientImage } from '../components/ResilientImage';

type PortalTab = 'inventory' | 'customizer' | 'reservations';

export function ManagerPortalPage() {
  const {
    products,
    bookings,
    siteSettings,
    isManagerUnlocked,
    setPinModalOpen,
    lockManager,
    toggleStock,
    editProductPrice,
    addProduct,
    deleteProduct,
    isCloudAdmin,
    authReady,
    authError,
    pendingCount,
    signInAsCloudAdmin,
    updateSiteSettings,
    resetSiteDefaults,
    updateStatus,
  } = useStore();
  const { animatedNavigate } = useMotionNav();

  const [allowOfflinePreview, setAllowOfflinePreview] = useState(false);
  const [activeTab, setActiveTab] = useState<PortalTab>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectionFilter, setSectionFilter] = useState<'all' | SectionSlug>('all');

  // Price editing state per product
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [draftPrice, setDraftPrice] = useState('');
  const [draftMrp, setDraftMrp] = useState('');
  const [savedPriceId, setSavedPriceId] = useState<string | null>(null);

  // Add new item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newSection, setNewSection] = useState<SectionSlug>('chocolate');
  const [newPrice, setNewPrice] = useState('');
  const [newMrp, setNewMrp] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newImageDataUrl, setNewImageDataUrl] = useState('');
  const [newImageFileName, setNewImageFileName] = useState('');
  const [newAddedMsg, setNewAddedMsg] = useState<string | null>(null);

  // Website Text & Banner Customizer state
  const [heroHeadline, setHeroHeadline] = useState(siteSettings.heroHeadline);
  const [announcementBanner, setAnnouncementBanner] = useState(siteSettings.announcementBanner);
  const [openingHours, setOpeningHours] = useState(siteSettings.openingHours);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Sync draft customizer fields if storage settings change
  useEffect(() => {
    setHeroHeadline(siteSettings.heroHeadline);
    setAnnouncementBanner(siteSettings.announcementBanner);
    setOpeningHours(siteSettings.openingHours);
  }, [siteSettings]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSection = sectionFilter === 'all' || p.sectionSlug === sectionFilter;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q);
      return matchesSection && matchesQuery;
    });
  }, [products, searchQuery, sectionFilter]);

  const inStockCount = useMemo(
    () => products.filter((p) => p.inStock).length,
    [products]
  );
  const outOfStockCount = products.length - inStockCount;
  const activeReservationsCount = useMemo(
    () => bookings.filter((b) => b.status !== 'Completed').length,
    [bookings]
  );

  // Gate unauthorized access if someone navigates to /manager without PIN 2014
  if (!isManagerUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-white/15 border border-white/25 mx-auto flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-300" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-xl font-bold">
              Shankar Mall Manager Portal
            </h1>
            <p className="text-xs text-white/75">
              Authorized manager verification required to continue.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <motion.button
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => setPinModalOpen(true)}
              className="w-full py-3 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 text-sm font-semibold cursor-pointer transition-colors"
            >
              Enter Manager PIN
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => animatedNavigate('/')}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium cursor-pointer transition-colors"
            >
              Exit to Website
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Ensure manager connects store Google account so changes publish across all phones
  if (authReady && !isCloudAdmin && !allowOfflinePreview) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full rounded-3xl bg-white border border-slate-200 shadow-lg p-7 sm:p-8 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
              Step 2 · Live Store Sync
            </span>
            <button
              type="button"
              onClick={() => animatedNavigate('/')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Exit
            </button>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-bold text-slate-900 leading-tight">
              Sign in with Google to Publish Changes
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in with your store Google account (<span className="font-semibold text-slate-900">mr.beast990345@gmail.com</span>) so added products, stock toggles, and price updates appear immediately on every other phone.
            </p>
          </div>

          {pendingCount > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900">
              You have {pendingCount} unsaved local {pendingCount === 1 ? 'change' : 'changes'} ready to publish as soon as you sign in.
            </div>
          )}

          {authError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800"
            >
              {authError}
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => void signInAsCloudAdmin()}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white text-sm font-semibold shadow-sm cursor-pointer transition-colors"
            >
              Connect Google Account &amp; Manage Store
            </motion.button>

            <button
              type="button"
              onClick={() => setAllowOfflinePreview(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 cursor-pointer transition-colors"
            >
              Continue in This-Device Draft Mode Only
            </button>
          </div>
        </div>
      </div>
    );
  }

  const startPriceEdit = (p: Product) => {
    setEditingPriceId(p.id);
    setDraftPrice(String(p.price));
    setDraftMrp(String(p.mrp));
  };

  const commitPriceEdit = (productId: string) => {
    const pNum = Number(draftPrice);
    const mNum = Number(draftMrp);
    if (!Number.isFinite(pNum) || pNum <= 0) return;
    editProductPrice(productId, pNum, Number.isFinite(mNum) && mNum > 0 ? mNum : undefined);
    setEditingPriceId(null);
    setSavedPriceId(productId);
    window.setTimeout(() => setSavedPriceId(null), 1600);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const sectionMeta = SECTIONS.find((s) => s.slug === newSection) || SECTIONS[0];
    const pNum = Number(newPrice);
    const mNum = Number(newMrp) || pNum;
    if (!newName.trim() || !newBrand.trim() || !pNum || pNum <= 0) return;

    const created = addProduct({
      name: newName.trim(),
      brand: newBrand.trim(),
      sectionSlug: newSection,
      price: pNum,
      mrp: Math.max(pNum, mNum),
      unit: newUnit.trim() || '1 Unit',
      variants: [newUnit.trim() || 'Standard Pack'],
      inStock: true,
      trending: true,
      image: newImageDataUrl || sectionMeta.image,
      description: `${newName.trim()} available for Click & Collect at Shankar Mall Dhanbad.`,
      aisleLocation: `${sectionMeta.name} Section · Express Shelf`,
      highlights: ['Ready for 2-hour pickup', 'Pay at Express Counter'],
    });

    setNewAddedMsg(
      isCloudAdmin
        ? `Published "${created.name}" to ${sectionMeta.name} for all visitors.`
        : `Saved "${created.name}" locally. Sign in with Google above to publish to all visitors.`
    );
    setNewName('');
    setNewBrand('');
    setNewPrice('');
    setNewMrp('');
    setNewUnit('');
    setNewImageDataUrl('');
    setNewImageFileName('');
    setShowAddForm(false);
    window.setTimeout(() => setNewAddedMsg(null), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteSettings({
      heroHeadline,
      announcementBanner,
      openingHours,
    });
    setSettingsSaved(true);
    window.setTimeout(() => setSettingsSaved(false), 2200);
  };

  const handleResetSettings = () => {
    const defaults = resetSiteDefaults();
    setHeroHeadline(defaults.heroHeadline);
    setAnnouncementBanner(defaults.announcementBanner);
    setOpeningHours(defaults.openingHours);
    setSettingsSaved(true);
    window.setTimeout(() => setSettingsSaved(false), 2200);
  };

  const handleExitToWebsite = () => {
    animatedNavigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Portal Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#1E3A8A] uppercase tracking-wider">
              Manager &amp; Customizing Portal
            </p>
            <h1 className="font-display text-lg sm:text-xl font-bold text-slate-900 truncate">
              Shankar Mall Control Desk
            </h1>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <motion.button
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => {
                lockManager();
                animatedNavigate('/');
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Portal</span>
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={handleExitToWebsite}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit to Website</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-8">
        <CloudPublishBanner />

        {/* Live KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <p className="text-xs text-slate-500">Catalog Items</p>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums mt-1">
              {products.length}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <p className="text-xs text-emerald-800 font-medium">In Stock</p>
            <p className="font-mono text-2xl font-bold text-emerald-900 tabular-nums mt-1">
              {inStockCount}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
            <p className="text-xs text-rose-800 font-medium">Out of Stock</p>
            <p className="font-mono text-2xl font-bold text-rose-900 tabular-nums mt-1">
              {outOfStockCount}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <p className="text-xs text-amber-800 font-medium">Open Reservations</p>
            <p className="font-mono text-2xl font-bold text-amber-900 tabular-nums mt-1">
              {activeReservationsCount}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-200/70 rounded-2xl w-fit">
          {(
            [
              { id: 'inventory', label: 'In Stock / Price Manager', icon: Package },
              { id: 'customizer', label: 'Website Text & Banner', icon: Type },
              {
                id: 'reservations',
                label: `Customer Reservations (${bookings.length})`,
                icon: ClipboardList,
              },
            ] as { id: PortalTab; label: string; icon: typeof Package }[]
          ).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1E3A8A] text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* TAB 1: IN STOCK / OUT OF STOCK & PRICE MANAGER */}
        {activeTab === 'inventory' && (
          <section className="space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    enterKeyHint="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter products or food items..."
                    aria-label="Filter catalog items"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <select
                  aria-label="Filter by store section"
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value as 'all' | SectionSlug)}
                  className="h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E3A8A]"
                >
                  <option value="all">All 8 Sections ({products.length})</option>
                  {SECTIONS.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                onClick={() => setShowAddForm((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddForm ? 'Hide Add Form' : '+ Add New Item'}</span>
              </motion.button>
            </div>

            {newAddedMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{newAddedMsg}</span>
              </div>
            )}

            {/* + Add New Item Form */}
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleAddItem}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div className="sm:col-span-2 lg:col-span-3">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Add New Product / Food Item
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isCloudAdmin
                      ? 'Publishes live to Firestore so every phone and visitor sees it immediately.'
                      : 'Draft mode: connect Google account above to publish to other phones.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="m-name" className="block text-xs font-semibold text-slate-700">
                    Item Name
                  </label>
                  <input
                    id="m-name"
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g., Almond Crunch Bar 150g"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="m-brand" className="block text-xs font-semibold text-slate-700">
                    Brand
                  </label>
                  <input
                    id="m-brand"
                    type="text"
                    required
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="e.g., Shankar Chocolatier"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="m-section" className="block text-xs font-semibold text-slate-700">
                    Section
                  </label>
                  <select
                    id="m-section"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value as SectionSlug)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:border-[#1E3A8A]"
                  >
                    {SECTIONS.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="m-price" className="block text-xs font-semibold text-slate-700">
                    Price (₹)
                  </label>
                  <input
                    id="m-price"
                    type="number"
                    min={1}
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="250"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-mono outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="m-mrp" className="block text-xs font-semibold text-slate-700">
                    MRP (₹)
                  </label>
                  <input
                    id="m-mrp"
                    type="number"
                    min={1}
                    value={newMrp}
                    onChange={(e) => setNewMrp(e.target.value)}
                    placeholder="300"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm font-mono outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="m-unit" className="block text-xs font-semibold text-slate-700">
                    Pack / Size
                  </label>
                  <input
                    id="m-unit"
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="150 g Pack"
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:border-[#1E3A8A]"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <ProductImageUploadBox
                    value={newImageDataUrl}
                    fileName={newImageFileName}
                    onChange={(dataUrl, fileName) => {
                      setNewImageDataUrl(dataUrl);
                      setNewImageFileName(fileName);
                    }}
                    fallbackPreviewSrc={
                      (SECTIONS.find((s) => s.slug === newSection) || SECTIONS[0]).image
                    }
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3 pt-1">
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.94 }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white text-sm font-semibold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish Item to Store</span>
                  </motion.button>
                </div>
              </motion.form>
            )}

            {/* Products Inventory Table/List */}
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
              {filteredProducts.map((product) => {
                const isEditing = editingPriceId === product.id;
                const justSavedPrice = savedPriceId === product.id;

                return (
                  <div
                    key={product.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <ResilientImage
                        src={product.image}
                        alt={product.name}
                        className="w-14 h-12 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {product.brand} · {product.unit} · {product.sectionSlug}
                        </p>
                      </div>
                    </div>

                    {/* Price Edit & 1-Tap Stock Toggle */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={1}
                            aria-label={`New price for ${product.name}`}
                            value={draftPrice}
                            onChange={(e) => setDraftPrice(e.target.value)}
                            className="w-20 h-9 px-2 rounded-lg border border-[#1E3A8A] font-mono text-xs outline-none"
                          />
                          <input
                            type="number"
                            min={1}
                            aria-label={`New MRP for ${product.name}`}
                            value={draftMrp}
                            onChange={(e) => setDraftMrp(e.target.value)}
                            className="w-20 h-9 px-2 rounded-lg border border-slate-300 font-mono text-xs outline-none"
                          />
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => commitPriceEdit(product.id)}
                            className="h-9 px-3 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold cursor-pointer"
                          >
                            Save
                          </motion.button>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setEditingPriceId(null)}
                            className="h-9 px-2.5 rounded-lg border border-slate-300 text-xs text-slate-600 cursor-pointer"
                          >
                            Cancel
                          </motion.button>
                        </div>
                      ) : (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.93 }}
                          onClick={() => startPriceEdit(product)}
                          aria-label={`Edit price for ${product.name}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-[#1E3A8A] text-xs font-mono font-semibold text-slate-800 cursor-pointer transition-colors"
                        >
                          <span>{formatINR(product.price)}</span>
                          {justSavedPrice ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Edit3 className="w-3 h-3 text-slate-400" />
                          )}
                        </motion.button>
                      )}

                      {/* 1-Tap Stock Toggle Switch */}
                      <motion.button
                        type="button"
                        role="switch"
                        aria-checked={product.inStock}
                        aria-label={`Toggle stock status for ${product.name}`}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => toggleStock(product.id, !product.inStock)}
                        className={`inline-flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer min-w-[134px] justify-between ${
                          product.inStock
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                        }`}
                      >
                        <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        <span
                          className={`w-9 h-5 rounded-full p-0.5 flex items-center transition-colors ${
                            product.inStock ? 'bg-emerald-600' : 'bg-rose-500'
                          }`}
                        >
                          <motion.span
                            animate={{ x: product.inStock ? 16 : 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                            className="w-4 h-4 rounded-full bg-white shadow-xs will-change-transform"
                          />
                        </span>
                      </motion.button>

                      {product.id.startsWith('custom-') && (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteProduct(product.id)}
                          aria-label={`Delete custom product ${product.name}`}
                          className="p-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 2: WEBSITE TEXT & BANNER CUSTOMIZER */}
        {activeTab === 'customizer' && (
          <section className="max-w-2xl bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1E3A8A]" />
                <span>Website Text &amp; Banner Customizer</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Updates the live Shankar Mall storefront for all visitors.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="c-banner" className="block text-xs font-semibold text-slate-700">
                  Announcement Banner
                </label>
                <input
                  id="c-banner"
                  type="text"
                  required
                  value={announcementBanner}
                  onChange={(e) => setAnnouncementBanner(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="c-headline" className="block text-xs font-semibold text-slate-700">
                  Main Hero Headline
                </label>
                <textarea
                  id="c-headline"
                  rows={2}
                  required
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1E3A8A] resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="c-hours" className="block text-xs font-semibold text-slate-700">
                  Mall Opening Hours
                </label>
                <input
                  id="c-hours"
                  type="text"
                  required
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm outline-none focus:border-[#1E3A8A]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.94 }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white text-sm font-semibold cursor-pointer"
                >
                  {settingsSaved ? (
                    <>
                      <Check className="w-4 h-4 text-amber-300" />
                      <span>Saved to Website!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Website Changes</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={handleResetSettings}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Defaults</span>
                </motion.button>
              </div>
            </form>
          </section>
        )}

        {/* TAB 3: CUSTOMER RESERVATIONS VIEWER */}
        {activeTab === 'reservations' && (
          <section className="space-y-4">
            {bookings.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-sm text-slate-500">
                No customer reservations recorded yet.
              </div>
            ) : (
              bookings.map((booking: BookingRecord) => {
                const isCompleted = booking.status === 'Completed';
                return (
                  <article
                    key={booking.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-base font-bold text-[#1E3A8A] tabular-nums">
                            {booking.id}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-base font-bold text-slate-900">
                            {booking.customerName}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : booking.status === 'Ready'
                                ? 'bg-blue-100 text-[#1E3A8A]'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600">
                          Phone: <span className="font-mono font-semibold text-slate-900">+91 {booking.phone}</span> ·
                          Arrival Time: <span className="font-semibold text-slate-900">{booking.pickupSlot}</span> ·
                          Branch: {booking.branch}
                        </p>
                      </div>

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.93 }}
                        disabled={isCompleted}
                        onClick={() => updateStatus(booking.id, 'Completed')}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                            : 'bg-[#1E3A8A] hover:bg-[#172E6E] text-white cursor-pointer'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isCompleted ? 'Completed' : 'Mark Completed'}</span>
                      </motion.button>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      {booking.kind === 'standard' ? (
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <ul className="text-xs text-slate-700 space-y-1">
                            {booking.items.map((item) => (
                              <li key={`${item.productId}-${item.variant}`}>
                                • {item.name} ({item.variant}) × {item.quantity} —{' '}
                                <span className="font-mono font-semibold tabular-nums">
                                  {formatINR(item.price * item.quantity)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="text-right">
                            <p className="text-[11px] text-slate-500">Total at Counter</p>
                            <p className="font-mono text-base font-bold text-slate-900 tabular-nums">
                              {formatINR(booking.subtotal)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <p className="text-[11px] font-semibold text-slate-500">
                              Handwritten / Quick List Items
                            </p>
                            <pre className="text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 whitespace-pre-wrap font-sans">
                              {booking.listText || 'Handwritten list image attached.'}
                            </pre>
                          </div>
                          {booking.photoDataUrl && (
                            <img
                              src={booking.photoDataUrl}
                              alt={`List for ${booking.id}`}
                              className="w-20 h-24 object-cover rounded-xl border border-slate-200 bg-white shrink-0"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </section>
        )}
      </div>
    </div>
  );
}

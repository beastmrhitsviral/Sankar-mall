import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Minus, Plus, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../lib/bookingStore';
import { getSectionBySlug } from '../lib/catalog';
import { AnimatedLink } from '../components/AnimatedLink';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { products, addToBag, setBagDrawerOpen } = useStore();

  const product = products.find((p) => p.slug === slug);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0] || product.unit);
      setQuantity(1);
      setAdded(false);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900">Product not found</h1>
        <p className="text-sm text-slate-600">
          This item may have moved or been updated at the counter.
        </p>
        <AnimatedLink
          to="/category/all"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E3A8A] text-white text-sm font-semibold"
        >
          Browse All Products
        </AnimatedLink>
      </div>
    );
  }

  const section = getSectionBySlug(product.sectionSlug);
  const related = products
    .filter((p) => p.sectionSlug === product.sectionSlug && p.id !== product.id)
    .slice(0, 3);

  const savings = Math.max(0, product.mrp - product.price);

  const handleReserve = () => {
    if (!product.inStock) return;
    addToBag(product, selectedVariant, quantity);
    setAdded(true);
    setBagDrawerOpen(true);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-16">
      <div>
        <AnimatedLink
          to={section ? `/category/${section.slug}` : '/category/all'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1E3A8A] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {section?.name || 'Catalog'}</span>
        </AnimatedLink>

        {/* Contiguous Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200">
              <ResilientImage
                src={product.image}
                alt={product.name}
                fallbackTitle={product.name}
                className={`w-full h-full object-cover ${
                  !product.inStock ? 'opacity-65 grayscale-[25%]' : ''
                }`}
              />
              {!product.inStock && (
                <span className="absolute top-3.5 left-3.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold shadow-sm">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[#1E3A8A]">{product.brand}</span>
                <span aria-hidden="true">·</span>
                <span>{product.aisleLocation}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 [text-wrap:balance]">
                {product.name}
              </h1>

              <p className="text-sm text-slate-600 leading-relaxed pt-1">
                {product.description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {formatINR(product.price)}
                </span>
                {product.mrp > product.price && (
                  <span className="font-mono text-sm text-slate-400 line-through tabular-nums">
                    {formatINR(product.mrp)}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                  Save {formatINR(savings)}
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {product.variants.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-700">
                  Select Pack / Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        selectedVariant === variant
                          ? 'border-[#1E3A8A] bg-[#1E3A8A] text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Primary Reserve CTA */}
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center border border-slate-300 rounded-xl h-12 bg-white">
                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-11 h-full inline-flex items-center justify-center text-slate-700 hover:bg-slate-50 rounded-l-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-mono text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-11 h-full inline-flex items-center justify-center text-slate-700 hover:bg-slate-50 rounded-r-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleReserve}
                className={`flex-1 h-12 px-5 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors ${
                  !product.inStock
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-[#1E3A8A] hover:bg-[#172E6E] text-white cursor-pointer'
                }`}
              >
                {!product.inStock ? (
                  <span>Out of Stock</span>
                ) : added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Reserved in Pickup Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Reserve for Store Pickup</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                <span>Available at Hirapur (Hari Mandir Rd) &amp; Rangatand</span>
              </p>
              <p className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Pay at Express Counter via Cash, UPI, or Card</span>
              </p>
            </div>

            {product.highlights.length > 0 && (
              <div className="pt-2 space-y-2">
                <p className="text-xs font-semibold text-slate-800">Product Highlights</p>
                <ul className="space-y-1.5 text-sm text-slate-600 list-disc pl-5">
                  {product.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-6">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            More from {section?.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((item, idx) => (
              <ProductCard key={item.id} product={item} index={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Search, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useMotionNav } from '../context/MotionNavContext';
import { SECTIONS, searchProducts } from '../lib/catalog';
import { formatINR } from '../lib/bookingStore';
import { AnimatedLink } from '../components/AnimatedLink';
import { ResilientImage } from '../components/ResilientImage';

export function SearchPage() {
  const { products } = useStore();
  const { animatedNavigate } = useMotionNav();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => window.clearTimeout(id);
  }, []);

  const relatableMatches = useMemo(
    () => (query.trim().length > 0 ? searchProducts(products, query) : []),
    [products, query]
  );

  const showcaseProducts = useMemo(() => {
    if (deferredQuery.trim().length > 0) {
      return searchProducts(products, deferredQuery).slice(0, 12);
    }
    const buckets = SECTIONS.map((s) => products.filter((p) => p.sectionSlug === s.slug));
    const mixed: typeof products = [];
    let i = 0;
    while (mixed.length < 12 && buckets.some((b) => i < b.length)) {
      for (const b of buckets) {
        if (i < b.length && mixed.length < 12) mixed.push(b[i]);
      }
      i++;
    }
    return mixed;
  }, [products, deferredQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    const target = trimmed
      ? `/search-results?q=${encodeURIComponent(trimmed)}`
      : '/search-results';
    animatedNavigate(target);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 pt-3 sm:pt-4 pb-24 space-y-6">
      {/* Search Bar & Relatable Products Box immediately below the Shankar Mall top bar */}
      <section className="space-y-3.5 relative">
        <h1 className="sr-only">Search Shankar Mall Products</h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.75 }}
          className="w-full will-change-transform space-y-2"
        >
          <form
            onSubmit={handleSubmit}
            role="search"
            aria-label="Full store product search"
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-white border-2 border-slate-200 focus-within:border-[#1E3A8A] shadow-sm transition-colors">
              <div className="relative flex-1 flex items-center min-w-0">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search chocolate, dresses, toys, skin care, snacks, grains..."
                  aria-label="Search store products"
                  className="w-full h-12 sm:h-13 pl-11 pr-10 bg-transparent text-base sm:text-lg text-slate-900 placeholder:text-slate-400 outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search text"
                    className="absolute right-2.5 w-8 h-8 rounded-full inline-flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="h-12 sm:h-13 px-8 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white font-semibold text-base inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Relatable Products Box shown directly underneath Search while typing */}
          <AnimatePresence>
            {query.trim().length > 0 && (
              <motion.div
                role="region"
                aria-label="Relatable products"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl bg-white border border-slate-200 shadow-lg overflow-hidden"
              >
                <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    Relatable Products ({relatableMatches.length})
                  </span>
                  {relatableMatches.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        animatedNavigate(`/search-results?q=${encodeURIComponent(query.trim())}`)
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
                    >
                      <span>See all products</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {relatableMatches.length === 0 ? (
                  <div className="p-4 text-xs sm:text-sm text-slate-500">
                    No direct matches for &ldquo;{query.trim()}&rdquo;. Try tapping a section tag below.
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {relatableMatches.slice(0, 6).map((item) => (
                      <li key={item.id}>
                        <AnimatedLink
                          to={`/product/${item.slug}`}
                          className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors"
                        >
                          <ResilientImage
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className={`w-11 h-11 rounded-lg object-cover shrink-0 bg-slate-100 border border-slate-200/70 ${
                              !item.inStock ? 'opacity-65 grayscale-[25%]' : ''
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {item.brand} · {item.unit}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {!item.inStock && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-semibold">
                                Out of Stock
                              </span>
                            )}
                            <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                              {formatINR(item.price)}
                            </span>
                          </div>
                        </AnimatedLink>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick Section Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center gap-2"
        >
          {SECTIONS.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() =>
                animatedNavigate(`/search-results?q=${encodeURIComponent(s.name)}`)
              }
              className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              {s.name}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Bottom Showcase: Product Images & Names */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-4 pt-3 border-t border-slate-200/80"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
            {query.trim()
              ? `Matching Products (${showcaseProducts.length})`
              : 'Popular Store Products'}
          </h2>
          {query.trim() && showcaseProducts.length > 0 && (
            <button
              type="button"
              onClick={() =>
                animatedNavigate(`/search-results?q=${encodeURIComponent(query.trim())}`)
              }
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1E3A8A] hover:underline cursor-pointer"
            >
              <span>View All Results</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {showcaseProducts.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <p className="font-display text-base font-semibold text-slate-900">
              No products matched &ldquo;{query}&rdquo;
            </p>
            <p className="text-xs sm:text-sm text-slate-500">
              Try searching a section name or press Search to browse the catalog.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {showcaseProducts.map((product) => (
              <AnimatedLink
                key={product.id}
                to={`/product/${product.slug}`}
                className="cv-auto group bg-white border border-slate-200/90 rounded-xl overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-[transform,box-shadow] duration-200 flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                  <ResilientImage
                    src={product.image}
                    alt={product.name}
                    fallbackTitle={product.name}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
                      !product.inStock ? 'opacity-65 grayscale-[25%]' : ''
                    }`}
                  />
                  {!product.inStock && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-semibold">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
                  <p className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-[#1E3A8A] transition-colors leading-snug">
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="truncate">{product.unit}</span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums shrink-0">
                      {formatINR(product.price)}
                    </span>
                  </div>
                </div>
              </AnimatedLink>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}

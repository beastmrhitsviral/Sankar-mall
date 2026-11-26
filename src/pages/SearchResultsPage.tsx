import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useMotionNav } from '../context/MotionNavContext';
import { searchProducts } from '../lib/catalog';
import { AnimatedLink } from '../components/AnimatedLink';
import { ProductCard } from '../components/ProductCard';

type SortOption = 'featured' | 'price-asc' | 'price-desc';

export function SearchResultsPage() {
  const { products } = useStore();
  const { animatedNavigate } = useMotionNav();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [draftQuery, setDraftQuery] = useState(queryParam);
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const results = useMemo(() => {
    const base = queryParam.trim() ? searchProducts(products, queryParam) : products;
    if (sortBy === 'price-asc') {
      return [...base].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...base].sort((a, b) => b.price - a.price);
    }
    return base;
  }, [products, queryParam, sortBy]);

  const handleRefineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftQuery.trim();
    animatedNavigate(
      trimmed ? `/search-results?q=${encodeURIComponent(trimmed)}` : '/search-results'
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="space-y-4 pb-6 border-b border-slate-200">
        <AnimatedLink
          to="/search"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#1E3A8A]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </AnimatedLink>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-[#1E3A8A]">
              Shankar Mall Search Results
            </p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-slate-900">
              {queryParam.trim()
                ? `Results for "${queryParam.trim()}"`
                : 'All Store Products'}
            </h1>
            <p className="text-sm text-slate-600">
              {results.length} {results.length === 1 ? 'item' : 'items'} ready for Express Counter pickup
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <label htmlFor="search-sort" className="text-xs font-medium text-slate-600">
              Sort by
            </label>
            <select
              id="search-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-[#1E3A8A]"
            >
              <option value="featured">Best Match</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Inline refine search bar */}
        <form onSubmit={handleRefineSearch} className="flex items-center gap-2 max-w-xl">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              enterKeyHint="search"
              value={draftQuery}
              onChange={(e) => setDraftQuery(e.target.value)}
              placeholder="Refine search..."
              aria-label="Refine search query"
              className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 focus:border-[#1E3A8A] bg-white text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-5 rounded-xl bg-[#1E3A8A] hover:bg-[#172E6E] text-white text-sm font-semibold transition-colors cursor-pointer shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {results.length === 0 ? (
        <div className="py-16 px-4 text-center border border-slate-200 rounded-2xl bg-slate-50 space-y-4">
          <p className="font-display text-xl font-bold text-slate-900">
            No products found for &ldquo;{queryParam}&rdquo;
          </p>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Try a different keyword, browse all store sections, or upload your handwritten shopping list.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <AnimatedLink
              to="/search"
              className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] text-white text-sm font-semibold"
            >
              New Search
            </AnimatedLink>
            <AnimatedLink
              to="/quick-list"
              className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-semibold"
            >
              Snap &amp; Send List
            </AnimatedLink>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {results.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} compact />
          ))}
        </div>
      )}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { SECTIONS, getProductsBySection, getSectionBySlug } from '../lib/catalog';
import { AnimatedLink } from '../components/AnimatedLink';
import { ProductCard } from '../components/ProductCard';

type SortOption = 'featured' | 'price-asc' | 'price-desc';

export function CategoryPage() {
  const { slug = 'all' } = useParams<{ slug: string }>();
  const { products } = useStore();
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const section = slug === 'all' ? undefined : getSectionBySlug(slug);

  const filteredProducts = useMemo(() => {
    const base = getProductsBySection(products, slug);
    if (sortBy === 'price-asc') {
      return [...base].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...base].sort((a, b) => b.price - a.price);
    }
    return base;
  }, [products, slug, sortBy]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#1E3A8A]">
            {section ? 'Store Section' : 'All Store Sections'} · Shankar Mall Dhanbad
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900">
            {section ? section.name : 'Complete Store Catalog'}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl">
            {section
              ? section.description
              : 'Browse every item available for instant Click & Collect reservation across Hirapur and Rangatand.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label htmlFor="cat-sort" className="text-xs font-medium text-slate-600">
            Sort by
          </label>
          <select
            id="cat-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none focus:border-[#1E3A8A]"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Sections Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <AnimatedLink
          to="/category/all"
          className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            slug === 'all'
              ? 'bg-[#1E3A8A] text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All ({products.length})
        </AnimatedLink>
        {SECTIONS.map((s) => (
          <AnimatedLink
            key={s.slug}
            to={`/category/${s.slug}`}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
              slug === s.slug
                ? 'bg-[#1E3A8A] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {s.name}
          </AnimatedLink>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center border border-slate-200 rounded-2xl bg-slate-50">
          <p className="font-display text-lg font-semibold text-slate-900">
            No items found in this section
          </p>
          <p className="text-sm text-slate-500 mt-1">
            You can request any specific brand using Snap &amp; Send List.
          </p>
          <AnimatedLink
            to="/quick-list"
            className="inline-block mt-4 px-5 py-2.5 rounded-lg bg-[#1E3A8A] text-white text-sm font-semibold"
          >
            Go to Snap &amp; Send List
          </AnimatedLink>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} compact />
          ))}
        </div>
      )}
    </div>
  );
}

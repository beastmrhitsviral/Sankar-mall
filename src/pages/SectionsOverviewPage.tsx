import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SECTIONS, getProductsBySection } from '../lib/catalog';
import { AnimatedLink } from '../components/AnimatedLink';
import { ProductCard } from '../components/ProductCard';

export function SectionsOverviewPage() {
  const { products } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-6 sm:py-10 pb-16 space-y-8">
      {/* Page Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs font-semibold text-[#1E3A8A]">
            Shankar Mall Directory
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            All Store Sections &amp; Products
          </h1>
        </div>

        <AnimatedLink
          to="/category/all"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#172E6E] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <span>Browse All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </AnimatedLink>
      </div>

      {/* Each of the 8 Sections: Section Name + Browse All + 4 Compact Products (2 per horizontal row) */}
      <div className="space-y-8">
        {SECTIONS.map((section, sectionIdx) => {
          const sectionItems = getProductsBySection(products, section.slug).slice(0, 4);
          return (
            <section
              key={section.slug}
              aria-labelledby={`sec-title-${section.slug}`}
              className="space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <h2
                  id={`sec-title-${section.slug}`}
                  className="font-display text-base sm:text-lg font-bold text-slate-900"
                >
                  {section.name}
                </h2>

                <AnimatedLink
                  to={`/category/${section.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E3A8A] hover:underline whitespace-nowrap shrink-0"
                >
                  <span>Browse All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </AnimatedLink>
              </div>

              {/* Always 2 products per horizontal line, 4 products = 2x2 compact rows */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {sectionItems.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    compact
                    priority={sectionIdx === 0}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom All-Products Action */}
      <div className="pt-4 border-t border-slate-200 flex justify-center">
        <AnimatedLink
          to="/category/all"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <span>Browse All Products</span>
          <ArrowRight className="w-4 h-4" />
        </AnimatedLink>
      </div>
    </div>
  );
}

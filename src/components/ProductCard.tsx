import { memo, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatINR } from '../lib/bookingStore';
import { Product } from '../lib/types';
import { AnimatedLink } from './AnimatedLink';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  index?: number;
  compact?: boolean;
  priority?: boolean;
}

export const ProductCard = memo(function ProductCard({
  product,
  compact = false,
  priority = false,
}: ProductCardProps) {
  const { addToBag } = useStore();
  const [justAdded, setJustAdded] = useState(false);

  const handleReserve = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToBag(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  const discountPct =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <article className="cv-auto group bg-white border border-slate-200/90 rounded-xl overflow-hidden transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col">
      <AnimatedLink
        to={`/product/${product.slug}`}
        className={`block relative bg-slate-100 overflow-hidden ${
          compact ? 'h-28 sm:h-36' : 'aspect-[4/3]'
        }`}
      >
        <ResilientImage
          src={product.image}
          alt={product.name}
          fallbackTitle={product.name}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
            !product.inStock ? 'opacity-65 grayscale-[25%]' : ''
          }`}
        />
        {!product.inStock && (
          <span
            className={`absolute rounded-md bg-rose-600 text-white font-semibold shadow-xs ${
              compact
                ? 'top-1.5 left-1.5 px-1.5 py-0.5 text-[10px]'
                : 'top-2.5 left-2.5 px-2.5 py-1 text-[11px]'
            }`}
          >
            Out of Stock
          </span>
        )}
      </AnimatedLink>

      <div
        className={`flex-1 flex flex-col justify-between ${
          compact ? 'p-2.5 sm:p-3 gap-2' : 'p-4 gap-3'
        }`}
      >
        <div>
          <div
            className={`flex items-center gap-1 text-slate-500 truncate ${
              compact ? 'text-[10px] sm:text-[11px] mb-0.5' : 'text-xs mb-1'
            }`}
          >
            <span className="truncate">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{product.unit}</span>
          </div>

          <AnimatedLink
            to={`/product/${product.slug}`}
            className={`block font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#1E3A8A] transition-colors ${
              compact ? 'text-xs sm:text-sm' : 'text-base'
            }`}
          >
            {product.name}
          </AnimatedLink>
        </div>

        <div
          className={`flex items-center justify-between gap-1.5 border-t border-slate-100 ${
            compact ? 'pt-1.5' : 'pt-2 gap-2'
          }`}
        >
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span
              className={`font-mono font-semibold text-slate-900 tabular-nums ${
                compact ? 'text-xs sm:text-sm' : 'text-base'
              }`}
            >
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <span
                className={`font-mono text-slate-400 line-through tabular-nums ${
                  compact ? 'hidden sm:inline text-[11px]' : 'text-xs'
                }`}
              >
                {formatINR(product.mrp)}
              </span>
            )}
            {discountPct > 0 && !compact && (
              <span className="text-xs font-medium text-amber-700 tabular-nums">
                -{discountPct}%
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleReserve}
            disabled={!product.inStock}
            aria-label={`Reserve ${product.name}`}
            className={`inline-flex items-center justify-center rounded-lg font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              compact ? 'gap-1 px-2.5 py-1.5 text-[11px]' : 'gap-1.5 px-3.5 py-2 text-xs'
            } ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : product.inStock
                ? 'bg-[#1E3A8A] text-white hover:bg-[#172E6E]'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {justAdded ? (
              <>
                <Check className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
                <span>Added</span>
              </>
            ) : (
              <>
                {product.inStock && <Plus className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
                <span>{product.inStock ? 'Reserve' : compact ? 'No Stock' : 'Out of Stock'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});

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
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
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
    <article
      className="cv-auto group bg-white border border-slate-200/90 rounded-xl overflow-hidden transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col"
    >
      <AnimatedLink to={`/product/${product.slug}`} className="block relative aspect-[4/3] bg-slate-50 overflow-hidden">
        <ResilientImage
          src={product.image}
          alt={product.name}
          fallbackTitle={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${
            !product.inStock ? 'opacity-65 grayscale-[25%]' : ''
          }`}
        />
        {!product.inStock && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-rose-600 text-white text-[11px] font-semibold shadow-xs">
            Out of Stock
          </span>
        )}
      </AnimatedLink>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1 truncate">
            <span className="truncate">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{product.unit}</span>
          </div>

          <AnimatedLink
            to={`/product/${product.slug}`}
            className="block text-base font-semibold text-slate-900 leading-snug line-clamp-1 group-hover:text-[#1E3A8A] transition-colors"
          >
            {product.name}
          </AnimatedLink>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-semibold text-slate-900 tabular-nums">
              {formatINR(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="font-mono text-xs text-slate-400 line-through tabular-nums">
                {formatINR(product.mrp)}
              </span>
            )}
            {discountPct > 0 && (
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
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : product.inStock
                ? 'bg-[#1E3A8A] text-white hover:bg-[#172E6E]'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>{product.inStock ? 'Reserve' : 'Out of Stock'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
});

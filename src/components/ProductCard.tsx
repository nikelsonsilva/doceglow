'use client';

import { Product } from '@/store/useCartStore';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const isOutOfStock = product.stock !== null && product.stock !== undefined && product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock !== null && product.stock !== undefined && product.stock <= 5;

  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      className="bg-white rounded-2xl overflow-hidden flex flex-col border border-slate-100/80 transition-all duration-300 active:scale-[0.97] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-left w-full group touch-manipulation"
      aria-label={`Ver detalhes de ${product.name}`}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
          loading="lazy"
          draggable={false}
        />
        
        {/* Gradient overlay bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="bg-slate-900/80 text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
              Esgotado
            </span>
          </div>
        )}

        {/* Low stock badge */}
        {isLowStock && (
          <div className="absolute top-2.5 left-2.5">
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm shadow-amber-200/50">
              Últimas {product.stock} un.
            </span>
          </div>
        )}

        {/* Category badge on image */}
        <div className="absolute top-2.5 right-2.5">
          <span className="bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 flex flex-col flex-grow gap-1.5">
        <h3 className="text-[13px] font-semibold text-slate-800 line-clamp-2 leading-snug min-h-[2.5em]">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex flex-col">
            {product.has_options && (
              <span className="text-[10px] text-slate-400 font-medium">a partir de</span>
            )}
            <span className="font-bold text-primary text-[15px] tabular-nums">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          {isOutOfStock ? (
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              Indisponível
            </span>
          ) : (
            <div
              className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25 transition-all duration-200 group-hover:scale-110 group-active:scale-95"
              aria-hidden="true"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

'use client';

import { Product, useCartStore } from '@/store/useCartStore';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock !== null && product.stock !== undefined && product.stock <= 0;
  const isLowStock = !isOutOfStock && product.stock !== null && product.stock !== undefined && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error('Produto esgotado!');
      return;
    }
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho!`, {
      style: {
        background: '#FAFAFA',
        color: '#334155',
        border: '1px solid #F472B6',
      },
      icon: '🛍️'
    });
  };

  return (
    <div 
      onClick={() => onClick(product)}
      className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-slate-50 transition-shadow hover:shadow-md cursor-pointer"
    >
      <div className="relative w-full aspect-[4/5] bg-slate-100 overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.name}
          className={`absolute inset-0 w-full h-full object-cover ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          loading="lazy"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-slate-900/80 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">Esgotado</span>
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 left-2">
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Últimas {product.stock} un.</span>
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-grow justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{product.category}</span>
          <h3 className="text-sm font-medium text-slate-700 line-clamp-2 mt-1 leading-snug">
            {product.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-primary">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>
          {isOutOfStock ? (
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">Indisponível</span>
          ) : (
            <button
              onClick={handleAddToCart}
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              aria-label="Adicionar ao carrinho"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

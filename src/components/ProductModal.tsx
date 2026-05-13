'use client';

import { useEffect, useState } from 'react';
import { Product, useCartStore } from '@/store/useCartStore';
import { X, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // Prevent background scrolling when modal or fullscreen image is open
  useEffect(() => {
    if (isOpen || fullscreenImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, fullscreenImage]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} adicionado ao carrinho!`, {
      style: {
        background: '#FAFAFA',
        color: '#334155',
        border: '1px solid #F472B6',
      },
      icon: '🛍️'
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal / Bottom Sheet */}
        <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-[51] flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Product Image Carousel */}
            <div className="w-full h-64 sm:h-80 bg-slate-100 relative shrink-0">
              {product.images && product.images.length > 0 ? (
                <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                  {product.images.map((img, idx) => (
                    <img loading="lazy" 
                      key={idx}
                      src={img} 
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover shrink-0 snap-center cursor-zoom-in"
                      onClick={() => setFullscreenImage(img)}
                    />
                  ))}
                </div>
              ) : (
                <img loading="lazy" 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setFullscreenImage(product.image_url)}
                />
              )}
              
              {/* Pagination Dots (Optional visually if multiple images) */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                  {product.images.map((_, idx) => (
                    <div key={idx} className="w-2 h-2 rounded-full bg-white/70 shadow-sm" />
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-3">
                  {product.category}
                </span>
                <h2 className="text-2xl font-serif font-bold text-slate-800 leading-tight">
                  {product.name}
                </h2>
                <p className="text-3xl font-bold text-slate-800 mt-2">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </p>
              </div>
              
              <div className="text-sm text-slate-500 leading-relaxed mt-2 border-t border-slate-100 pt-4">
                <p>
                  Produto original e de altíssima qualidade. 
                  Ideal para quem busca aquele efeito incrível na maquiagem do dia a dia ou eventos especiais. 
                  Garante longa duração e acabamento perfeito.
                </p>
              </div>
            </div>
          </div>

          {/* Fixed Action Bottom */}
          <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] pb-8 sm:pb-4 shrink-0">
            <button 
              onClick={handleAddToCart}
              className="w-full bg-primary text-white py-4 rounded-full font-semibold shadow-md shadow-pink-200 hover:bg-primary-hover active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Adicionar R$ {product.price.toFixed(2).replace('.', ',')}
            </button>
          </div>
          
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={() => setFullscreenImage(null)} 
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img loading="lazy" 
            src={fullscreenImage} 
            alt="Fullscreen view"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </>
  );
}

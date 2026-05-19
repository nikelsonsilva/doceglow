'use client';

import { useCartStore } from '@/store/useCartStore';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CartDrawerProps {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { isCartOpen, toggleCart, items, total, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isCartOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
          onClick={toggleCart}
        />
      )}

      {/* Drawer - fullscreen on mobile */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 shrink-0">
          <h2 className="font-serif text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Seu Carrinho
            {items.length > 0 && (
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </h2>
          <button 
            onClick={toggleCart}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors touch-manipulation active:scale-90"
            aria-label="Fechar carrinho"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 opacity-20" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-500">Carrinho vazio</p>
                <p className="text-sm text-slate-400 mt-1">Adicione produtos para continuar</p>
              </div>
              <button 
                onClick={toggleCart}
                className="mt-2 px-6 py-2.5 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary/5 transition-colors touch-manipulation active:scale-95 text-sm"
              >
                Continuar comprando
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100/80">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                    <img loading="lazy" src={item.image_url} alt={item.name} className="w-full h-full object-cover" draggable={false} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 line-clamp-1">{item.name}</h4>
                      {item.selectedOptions?.length ? (
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                          {item.selectedOptions.map(s => s.options.join(', ')).join(' · ')}
                        </p>
                      ) : null}
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">R$ {item.unitPrice.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-1.5 py-1">
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors touch-manipulation active:scale-90"
                          aria-label={item.quantity === 1 ? 'Remover item' : 'Diminuir quantidade'}
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                        </button>
                        <span className="text-xs font-bold w-5 text-center tabular-nums">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors touch-manipulation active:scale-90"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-slate-800 tabular-nums">
                        R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white border-t border-slate-100 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.08)] shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-sm">Total</span>
              <span className="font-serif text-2xl font-bold text-primary tabular-nums">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button 
              onClick={() => {
                toggleCart();
                onCheckout();
              }}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all touch-manipulation text-[15px]"
            >
              Avançar para Entrega
            </button>
          </div>
        )}
      </div>
    </>
  );
}

'use client';

import { useCartStore } from '@/store/useCartStore';
import { ShoppingBag } from 'lucide-react';

interface FloatingCartBarProps {
  onOpenCart: () => void;
}

export default function FloatingCartBar({ onOpenCart }: FloatingCartBarProps) {
  const items = useCartStore(s => s.items);
  const total = useCartStore(s => s.total);

  if (items.length === 0) return null;

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <button
          onClick={onOpenCart}
          className="w-full bg-primary hover:bg-primary-hover text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl shadow-pink-200/50 transition active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                {count}
              </span>
            </div>
            <span className="font-semibold text-sm">Ver Carrinho</span>
          </div>
          <span className="font-bold text-lg">
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </button>
      </div>
    </div>
  );
}

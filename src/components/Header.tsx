'use client';

import { useCartStore } from '@/store/useCartStore';
import { ShoppingBag, History } from 'lucide-react';

interface HeaderProps {
  storeName?: string;
  onOpenOrders?: () => void;
  hasOrders?: boolean;
}

export default function Header({ storeName, onOpenOrders, hasOrders }: HeaderProps) {
  const { items, toggleCart } = useCartStore();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="w-10"></div>
        
        <h1 className="font-serif text-2xl font-bold text-primary tracking-tight truncate max-w-[200px]">
          {storeName || 'Doce Glow'}
        </h1>
        
        <div className="flex items-center gap-1">
          {hasOrders && onOpenOrders && (
            <button onClick={onOpenOrders} className="p-2 text-slate-500 hover:text-primary transition-colors" title="Meus Pedidos">
              <History className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={toggleCart}
            className="relative p-2 text-slate-700 hover:text-primary transition-colors"
          >
            <ShoppingBag className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

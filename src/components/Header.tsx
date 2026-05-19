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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-100/80 supports-[backdrop-filter]:bg-white/80">
      <div className="w-full max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left spacer or orders button */}
        <div className="w-10 flex items-center justify-start">
          {hasOrders && onOpenOrders && (
            <button 
              onClick={onOpenOrders} 
              className="p-2 -ml-2 text-slate-400 hover:text-primary transition-colors rounded-full active:bg-slate-100 touch-manipulation" 
              title="Meus Pedidos"
              aria-label="Ver meus pedidos"
            >
              <History className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Store name */}
        <h1 className="font-serif text-xl font-bold text-primary tracking-tight truncate max-w-[280px] sm:max-w-md text-center">
          {storeName || 'Vitrinia'}
        </h1>
        
        {/* Cart button */}
        <div className="w-10 flex items-center justify-end">
          <button 
            onClick={toggleCart}
            className="relative p-2 -mr-2 text-slate-600 hover:text-primary transition-colors rounded-full active:bg-slate-100 touch-manipulation"
            aria-label={`Carrinho com ${itemCount} itens`}
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute top-0.5 right-0 w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white tabular-nums animate-in zoom-in duration-200">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

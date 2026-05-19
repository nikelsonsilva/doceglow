'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import FloatingCartBar from '@/components/FloatingCartBar';
import OrdersDrawer from '@/components/OrdersDrawer';
import { Product, useCartStore } from '@/store/useCartStore';
import { getSessionPhone, refreshSession } from '@/lib/session';

interface StoreData {
  id: string;
  slug: string;
  name: string;
  category: string;
  logo_url: string | null;
  primary_color: string;
  whatsapp_number: string;
  pix_key: string;
}

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const [store, setStore] = useState<StoreData | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [loading, setLoading] = useState(true);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);
  const toggleCart = useCartStore(s => s.toggleCart);

  // Load store info
  useEffect(() => {
    if (!slug) return;
    async function loadStore() {
      try {
        const res = await fetch(`/api/stores/${slug}`);
        if (!res.ok) { setStoreError(true); return; }
        const data = await res.json();
        setStore(data);

        // Apply store primary color as CSS variable
        if (data.primary_color) {
          document.documentElement.style.setProperty('--color-primary', data.primary_color);
        }
      } catch {
        setStoreError(true);
      } finally {
        setStoreLoading(false);
      }
    }
    loadStore();
  }, [slug]);

  // Load products
  useEffect(() => {
    if (!slug) return;
    async function loadProducts() {
      try {
        const res = await fetch(`/api/stores/${slug}/products`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setProducts(data || []);
        if (data?.length) {
          const uniqueCats = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean))) as string[];
          setCategories(['Todos', ...uniqueCats]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [slug]);

  // Session
  useEffect(() => {
    const saved = getSessionPhone();
    if (saved) { setCustomerPhone(saved); refreshSession(); }
  }, []);

  useEffect(() => {
    const handler = () => {
      const saved = getSessionPhone();
      if (saved) setCustomerPhone(saved);
    };
    window.addEventListener('storage', handler);
    window.addEventListener('vitrinia:phone-verified', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('vitrinia:phone-verified', handler);
    };
  }, []);

  const filteredProducts = activeCategory === 'Todos'
    ? products
    : products.filter(p => p.category === activeCategory);

  if (storeLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Carregando loja...</p>
        </div>
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🏪</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Loja não encontrada</h1>
          <p className="text-slate-500 text-sm mb-6">Essa loja não existe ou foi desativada.</p>
          <a href="/" className="text-primary font-semibold text-sm hover:underline">← Voltar ao início</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50/80 pb-24">
      <Header 
        storeName={store.name} 
        onOpenOrders={() => setIsOrdersOpen(true)} 
        hasOrders={!!customerPhone} 
      />
      
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col">
        <CategoryNav 
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
        
        {loading ? (
          <div className="p-4 grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100/80 animate-pulse">
                <div className="aspect-square bg-slate-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-slate-200 rounded-full w-3/4" />
                  <div className="h-3 bg-slate-200 rounded-full w-1/2" />
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-4 bg-slate-200 rounded-full w-20" />
                    <div className="w-9 h-9 bg-slate-200 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2 px-6 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-3xl">📦</span>
            </div>
            <p className="text-base font-medium text-slate-500">Nenhum produto cadastrado ainda.</p>
            <p className="text-sm text-slate-400">Os produtos aparecerão aqui assim que forem cadastrados.</p>
          </div>
        ) : (
          <div className="p-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={(p) => setSelectedProduct(p)}
              />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                Nenhum produto encontrado nesta categoria.
              </div>
            )}
          </div>
        )}
      </main>

      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />

      <CartDrawer onCheckout={() => setIsCheckoutOpen(true)} />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        storeSlug={slug}
        storeName={store.name}
        storeSettings={{ whatsapp_number: store.whatsapp_number, pix_key: store.pix_key }}
      />

      <OrdersDrawer
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        customerPhone={customerPhone}
        storeSlug={slug}
      />

      <FloatingCartBar onOpenCart={toggleCart} />
    </div>
  );
}

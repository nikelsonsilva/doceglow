'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import CheckoutModal from '@/components/CheckoutModal';
import FloatingCartBar from '@/components/FloatingCartBar';
import { Product, useCartStore } from '@/store/useCartStore';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [loading, setLoading] = useState(true);
  const toggleCart = useCartStore(s => s.toggleCart);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        setProducts(data || []);

        if (data && data.length > 0) {
          const uniqueCats = Array.from(new Set(data.map((p: any) => p.category).filter(Boolean))) as string[];
          setCategories(['Todos', ...uniqueCats]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    
    loadProducts();
  }, []);

  const filteredProducts = activeCategory === 'Todos'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-full flex flex-col bg-slate-50 pb-20">
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col">
        <CategoryNav 
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
        
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            Carregando produtos...
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <p className="text-lg">Nenhum produto cadastrado ainda.</p>
            <p className="text-sm">Os produtos aparecerão aqui assim que forem cadastrados no painel admin.</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={(p) => setSelectedProduct(p)}
              />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
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
      />

      <FloatingCartBar onOpenCart={toggleCart} />
    </div>
  );
}

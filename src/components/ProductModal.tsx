'use client';

import { useEffect, useState } from 'react';
import { Product, SelectedOption, useCartStore } from '@/store/useCartStore';
import { X, ShoppingBag, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});

  // Reset selections when product changes
  useEffect(() => {
    if (product?.has_options && product.option_groups?.length) {
      const initial: Record<string, Set<string>> = {};
      product.option_groups.forEach(g => { initial[g.id] = new Set(); });
      setSelections(initial);
    }
  }, [product]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen || fullscreenImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, fullscreenImage]);

  if (!isOpen || !product) return null;

  const hasOptions = product.has_options && product.option_groups?.length;

  // Calculate total price with options
  const calcPrice = () => {
    if (!hasOptions) return product.price;
    let base = product.price;
    let addTotal = 0;

    for (const group of product.option_groups!) {
      const selected = selections[group.id];
      if (!selected?.size) continue;

      for (const opt of group.product_options) {
        if (selected.has(opt.id)) {
          if (group.price_mode === 'replace') {
            base = Number(opt.extra_price);
          } else {
            addTotal += Number(opt.extra_price);
          }
        }
      }
    }
    return base + addTotal;
  };

  // Toggle option selection
  const toggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    setSelections(prev => {
      const current = new Set(prev[groupId] || []);
      if (current.has(optionId)) {
        current.delete(optionId);
      } else {
        if (maxSelect === 1) {
          current.clear();
        } else if (current.size >= maxSelect) {
          toast.error(`Máximo de ${maxSelect} opções neste passo`);
          return prev;
        }
        current.add(optionId);
      }
      return { ...prev, [groupId]: current };
    });
  };

  // Validate all required groups are filled
  const isValid = () => {
    if (!hasOptions) return true;
    for (const group of product.option_groups!) {
      const selected = selections[group.id];
      if (group.min_select > 0 && (!selected || selected.size < group.min_select)) {
        return false;
      }
    }
    return true;
  };

  const handleAddToCart = () => {
    if (hasOptions && !isValid()) {
      toast.error('Preencha todos os passos obrigatórios');
      return;
    }

    let selectedOptions: SelectedOption[] | undefined;

    if (hasOptions) {
      selectedOptions = product.option_groups!
        .filter(g => selections[g.id]?.size > 0)
        .map(g => {
          const selectedOpts = g.product_options.filter(o => selections[g.id].has(o.id));
          let extra = 0;
          if (g.price_mode === 'replace') {
            extra = selectedOpts.length > 0 ? Number(selectedOpts[0].extra_price) : 0;
          } else {
            extra = selectedOpts.reduce((sum, o) => sum + Number(o.extra_price), 0);
          }
          return {
            groupName: g.name,
            priceMode: g.price_mode,
            options: selectedOpts.map(o => o.name),
            extra,
          };
        });
    }

    addItem(product, selectedOptions);
    toast.success(`${product.name} adicionado ao carrinho!`, {
      style: { background: '#FAFAFA', color: '#334155', border: '1px solid #F472B6' },
      icon: '🛍️'
    });
    onClose();
  };

  const totalPrice = calcPrice();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
        
        <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-[51] flex flex-col h-[85vh] sm:h-auto sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">
          
          <button onClick={onClose} 
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-sm">
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {/* Product Image */}
            <div className="w-full h-56 sm:h-72 bg-slate-100 relative shrink-0">
              {product.images && product.images.length > 0 ? (
                <div className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
                  {product.images.map((img, idx) => (
                    <img loading="lazy" key={idx} src={img} alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover shrink-0 snap-center cursor-zoom-in"
                      onClick={() => setFullscreenImage(img)} />
                  ))}
                </div>
              ) : (
                <img loading="lazy" src={product.image_url} alt={product.name}
                  className="w-full h-full object-cover cursor-zoom-in"
                  onClick={() => setFullscreenImage(product.image_url)} />
              )}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                  {product.images.map((_, idx) => (
                    <div key={idx} className="w-2 h-2 rounded-full bg-white/70 shadow-sm" />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-5">
              <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-2">
                {product.category}
              </span>
              <h2 className="text-2xl font-serif font-bold text-slate-800 leading-tight">{product.name}</h2>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {hasOptions ? 'A partir de ' : ''}R$ {product.price.toFixed(2).replace('.', ',')}
              </p>

              {/* Option Groups (Montagem) */}
              {hasOptions && (
                <div className="mt-5 space-y-5">
                  {product.option_groups!.map((group, gIdx) => {
                    const selected = selections[group.id] || new Set();
                    const isRequired = group.min_select > 0;
                    const isFilled = selected.size >= group.min_select;
                    const isRadio = group.max_select === 1;
                    
                    return (
                      <div key={group.id} className="border border-slate-200 rounded-2xl overflow-hidden">
                        {/* Group Header */}
                        <div className={`px-4 py-3 flex items-center justify-between ${isFilled ? 'bg-emerald-50' : isRequired ? 'bg-amber-50' : 'bg-slate-50'}`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isFilled ? 'bg-emerald-200 text-emerald-700' : isRequired ? 'bg-amber-200 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                              Passo {gIdx + 1}
                            </span>
                            <span className="text-sm font-semibold text-slate-700">{group.name}</span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {isRequired ? `${group.min_select}` : '0'}-{group.max_select} {isRadio ? 'opção' : 'opções'}
                          </span>
                        </div>

                        {/* Options */}
                        <div className="p-3 space-y-1.5">
                          {group.product_options.map((opt) => {
                            const isSelected = selected.has(opt.id);
                            const extraPrice = Number(opt.extra_price);
                            
                            return (
                              <button key={opt.id} type="button"
                                onClick={() => toggleOption(group.id, opt.id, group.max_select)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition border-2 ${
                                  isSelected
                                    ? 'border-primary bg-primary/5 text-slate-800'
                                    : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}>
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-${isRadio ? 'full' : 'md'} border-2 flex items-center justify-center transition ${
                                    isSelected ? 'border-primary bg-primary' : 'border-slate-300'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className="font-medium">{opt.name}</span>
                                </div>
                                {extraPrice > 0 && (
                                  <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                                    {group.price_mode === 'replace' ? 'R$' : '+R$'} {extraPrice.toFixed(2).replace('.', ',')}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Description (if not options product) */}
              {!hasOptions && (
                <div className="text-sm text-slate-500 leading-relaxed mt-4 border-t border-slate-100 pt-4">
                  <p>Produto original e de altíssima qualidade.</p>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Action Bottom */}
          <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] pb-8 sm:pb-4 shrink-0">
            <button 
              onClick={handleAddToCart}
              disabled={!!hasOptions && !isValid()}
              className="w-full bg-primary text-white py-4 rounded-full font-semibold shadow-md shadow-pink-200 hover:bg-primary-hover active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingBag className="w-5 h-5" />
              Adicionar R$ {totalPrice.toFixed(2).replace('.', ',')}
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
          <button onClick={() => setFullscreenImage(null)} 
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <img loading="lazy" src={fullscreenImage} alt="Fullscreen view" className="w-full h-full object-contain" />
        </div>
      )}
    </>
  );
}

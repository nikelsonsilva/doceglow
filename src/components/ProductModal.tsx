'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Product, SelectedOption, useCartStore } from '@/store/useCartStore';
import { X, ShoppingBag, Check, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState(0); // 0 = product info, 1+ = option groups
  const [carouselIdx, setCarouselIdx] = useState(0);

  // Touch carousel state
  const touchRef = useRef<{ startX: number; startY: number; isDragging: boolean; currentX: number }>({
    startX: 0, startY: 0, isDragging: false, currentX: 0
  });
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const hasOptions = product?.has_options && product.option_groups?.length;
  const totalSteps = hasOptions ? product.option_groups!.length : 0;

  // Reset selections and step when product changes
  useEffect(() => {
    if (product?.has_options && product.option_groups?.length) {
      const initial: Record<string, Set<string>> = {};
      product.option_groups.forEach(g => { initial[g.id] = new Set(); });
      setSelections(initial);
    }
    setCurrentStep(0);
    setCarouselIdx(0);
    setDragOffset(0);
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

  // Touch handlers for carousel
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!product?.images || product.images.length <= 1) return;
    const touch = e.touches[0];
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      isDragging: false,
      currentX: touch.clientX,
    };
  }, [product]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!product?.images || product.images.length <= 1) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchRef.current.startX;
    const diffY = touch.clientY - touchRef.current.startY;

    // Only start horizontal drag if move is mostly horizontal
    if (!touchRef.current.isDragging && Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
      touchRef.current.isDragging = true;
      setIsDragging(true);
    }

    if (touchRef.current.isDragging) {
      e.preventDefault();
      touchRef.current.currentX = touch.clientX;
      setDragOffset(diffX);
    }
  }, [product]);

  const handleTouchEnd = useCallback(() => {
    if (!product?.images || product.images.length <= 1) return;
    if (!touchRef.current.isDragging) return;

    const threshold = 50;
    const diff = touchRef.current.currentX - touchRef.current.startX;

    if (diff < -threshold && carouselIdx < product.images.length - 1) {
      setCarouselIdx(prev => prev + 1);
    } else if (diff > threshold && carouselIdx > 0) {
      setCarouselIdx(prev => prev - 1);
    }

    setDragOffset(0);
    setIsDragging(false);
    touchRef.current.isDragging = false;
  }, [product, carouselIdx]);

  if (!isOpen || !product) return null;

  // Calculate total price with options
  // Logic: first 'replace' group with extra_price > 0 sets the base price.
  // Subsequent groups (replace or add) with extra_price > 0 ADD to the total.
  // Replace groups with extra_price = 0 are informational (no price impact).
  const calcPrice = () => {
    if (!hasOptions) return product.price;
    let base = product.price;
    let baseReplaced = false;
    let addTotal = 0;

    for (const group of product.option_groups!) {
      const selected = selections[group.id];
      if (!selected?.size) continue;

      for (const opt of group.product_options) {
        if (selected.has(opt.id)) {
          const price = Number(opt.extra_price);
          if (price === 0) continue; // no price impact

          if (group.price_mode === 'replace' && !baseReplaced) {
            base = price;
            baseReplaced = true;
          } else {
            addTotal += price;
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

  // Check if a specific step is filled
  const isStepFilled = (groupIdx: number) => {
    if (!hasOptions) return true;
    const group = product.option_groups![groupIdx];
    const selected = selections[group.id];
    return selected && selected.size >= group.min_select;
  };

  // Check if current step is valid to proceed
  const canProceed = () => {
    if (currentStep === 0) return true; // product info step always ok
    const groupIdx = currentStep - 1;
    const group = product.option_groups![groupIdx];
    if (!group) return true;
    if (group.min_select === 0) return true; // optional step
    const selected = selections[group.id];
    return selected && selected.size >= group.min_select;
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

  const goNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const totalPrice = calcPrice();
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 0;

  // Current group for option steps
  const currentGroup = hasOptions && currentStep > 0 ? product.option_groups![currentStep - 1] : null;
  const currentSelected = currentGroup ? (selections[currentGroup.id] || new Set()) : new Set();

  // Carousel images
  const images = product.images && product.images.length > 0 ? product.images : [product.image_url];
  const hasMultipleImages = images.length > 1;

  // Carousel transform with drag
  const getCarouselTransform = () => {
    const containerWidth = carouselContainerRef.current?.offsetWidth || 0;
    const baseOffset = -(carouselIdx * containerWidth);
    return `translateX(${baseOffset + dragOffset}px)`;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
          onClick={onClose} 
        />
        
        <div className="bg-white w-full max-w-lg rounded-t-[28px] shadow-2xl relative z-[51] flex flex-col h-[92dvh] overflow-hidden animate-in slide-in-from-bottom-full duration-300">
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shadow-md active:scale-90 touch-manipulation"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar">
            
            {/* ===== STEP 0: Product Info ===== */}
            {currentStep === 0 && (
              <div className="animate-in fade-in duration-200">
                {/* Product Image Carousel with Touch Support */}
                <div 
                  ref={carouselContainerRef}
                  className="w-full aspect-[4/3] bg-slate-100 relative shrink-0 overflow-hidden select-none"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <div 
                    className={`w-full h-full flex ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
                    style={{ transform: getCarouselTransform() }}
                  >
                    {images.map((img, idx) => (
                      <div key={idx} className="w-full h-full shrink-0 relative">
                        <img 
                          loading={idx === 0 ? 'eager' : 'lazy'} 
                          src={img} 
                          alt={`${product.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                          draggable={false}
                          onClick={() => !isDragging && setFullscreenImage(img)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Navigation arrows - visible on larger screens, hidden on mobile */}
                  {hasMultipleImages && (
                    <>
                      {carouselIdx > 0 && (
                        <button 
                          type="button" 
                          onClick={() => setCarouselIdx(i => i - 1)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-700 shadow-lg transition-all hover:bg-white active:scale-90 touch-manipulation opacity-100"
                          aria-label="Imagem anterior"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                      {carouselIdx < images.length - 1 && (
                        <button 
                          type="button" 
                          onClick={() => setCarouselIdx(i => i + 1)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-700 shadow-lg transition-all hover:bg-white active:scale-90 touch-manipulation opacity-100"
                          aria-label="Próxima imagem"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  )}

                  {/* Dot Indicators */}
                  {hasMultipleImages && (
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                      {images.map((_, idx) => (
                        <button 
                          key={idx} 
                          type="button" 
                          onClick={() => setCarouselIdx(idx)}
                          className={`h-2 rounded-full transition-all duration-300 shadow-sm touch-manipulation ${
                            idx === carouselIdx 
                              ? 'bg-white w-6' 
                              : 'bg-white/50 w-2 hover:bg-white/70'
                          }`}
                          aria-label={`Imagem ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="px-5 pt-5 pb-4">
                  <span className="inline-block text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full mb-3">
                    {product.category}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight">{product.name}</h2>
                  <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">
                    {hasOptions ? 'A partir de ' : ''}R$ {product.price.toFixed(2).replace('.', ',')}
                  </p>

                  {(product as any).description && (
                    <p className="text-sm text-slate-500 leading-relaxed mt-3">{(product as any).description}</p>
                  )}

                  {/* Steps preview for customizable products */}
                  {hasOptions && (
                    <div className="mt-6 space-y-2.5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary text-[10px]">✦</span>
                        </span>
                        Monte do seu jeito
                      </p>
                      {product.option_groups!.map((group, gIdx) => {
                        const filled = isStepFilled(gIdx);
                        const selected = selections[group.id];
                        const selectedNames = selected?.size
                          ? group.product_options.filter(o => selected.has(o.id)).map(o => o.name)
                          : [];

                        return (
                          <button
                            key={group.id}
                            type="button"
                            onClick={() => setCurrentStep(gIdx + 1)}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition-all duration-200 border-2 active:scale-[0.98] touch-manipulation ${
                              filled
                                ? 'border-emerald-200 bg-emerald-50/50'
                                : group.min_select > 0
                                  ? 'border-amber-200/80 bg-amber-50/30'
                                  : 'border-slate-100 bg-slate-50/50'
                            }`}
                          >
                            {/* Step number */}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              filled
                                ? 'bg-emerald-500 text-white'
                                : group.min_select > 0
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-slate-200 text-slate-500'
                            }`}>
                              {filled ? <Check className="w-4 h-4" /> : gIdx + 1}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800">{group.name}</p>
                              {selectedNames.length > 0 ? (
                                <p className="text-xs text-emerald-600 truncate mt-0.5">
                                  {selectedNames.join(', ')}
                                </p>
                              ) : (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {group.min_select > 0 ? `Obrigatório · ${group.min_select}-${group.max_select}` : `Opcional · até ${group.max_select}`}
                                </p>
                              )}
                            </div>

                            <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Description (if not options product) */}
                  {!hasOptions && !(product as any).description && (
                    <div className="text-sm text-slate-500 leading-relaxed mt-4 border-t border-slate-100 pt-4">
                      <p>Produto original e de altíssima qualidade.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== STEP 1+: Option Group Steps ===== */}
            {currentGroup && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-200" key={`step-${currentStep}`}>
                {/* Step header */}
                <div className="px-5 pt-6 pb-4">
                  {/* Progress bar */}
                  <div className="flex items-center gap-1.5 mb-6">
                    {product.option_groups!.map((_, idx) => (
                      <div key={idx} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            idx < currentStep 
                              ? 'w-full bg-emerald-400' 
                              : idx === currentStep - 1 
                                ? 'bg-primary w-full' 
                                : 'w-0'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Step info */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary/70 uppercase tracking-wider">
                      Passo {currentStep} de {totalSteps}
                    </span>
                    {currentGroup.min_select > 0 && (
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        Obrigatório
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{currentGroup.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {currentGroup.min_select > 0 
                      ? `Escolha ${currentGroup.min_select === currentGroup.max_select 
                          ? currentGroup.min_select 
                          : `${currentGroup.min_select} a ${currentGroup.max_select}`} ${currentGroup.max_select === 1 ? 'opção' : 'opções'}`
                      : `Opcional · até ${currentGroup.max_select} ${currentGroup.max_select === 1 ? 'opção' : 'opções'}`
                    }
                  </p>
                </div>

                {/* Options list */}
                <div className="px-5 pb-6 space-y-2.5">
                  {currentGroup.product_options.map((opt) => {
                    const isSelected = currentSelected.has(opt.id);
                    const extraPrice = Number(opt.extra_price);
                    const isRadio = currentGroup.max_select === 1;

                    return (
                      <button key={opt.id} type="button"
                        onClick={() => toggleOption(currentGroup.id, opt.id, currentGroup.max_select)}
                        className={`w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl text-sm transition-all duration-200 border-2 active:scale-[0.98] touch-manipulation ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        }`}>
                        
                        {/* Checkbox / Radio indicator */}
                        <div className={`w-6 h-6 rounded-${isRadio ? 'full' : 'lg'} border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
                          isSelected 
                            ? 'border-primary bg-primary scale-110' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>

                        {/* Option name */}
                        <span className={`font-medium flex-1 text-left ${isSelected ? 'text-slate-800' : 'text-slate-600'}`}>
                          {opt.name}
                        </span>

                        {/* Price */}
                        {extraPrice > 0 && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors tabular-nums ${
                            isSelected 
                              ? 'text-primary bg-primary/10' 
                              : 'text-slate-400 bg-slate-100'
                          }`}>
                            {currentGroup.price_mode === 'replace' ? 'R$' : '+R$'} {extraPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ===== Fixed Bottom Action Bar ===== */}
          <div className="px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white border-t border-slate-100 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.08)] shrink-0">
            {/* Non-customizable product: simple add button */}
            {!hasOptions && (
              <button 
                onClick={handleAddToCart}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-manipulation text-[15px]">
                <ShoppingBag className="w-5 h-5" />
                Adicionar · R$ {totalPrice.toFixed(2).replace('.', ',')}
              </button>
            )}

            {/* Customizable product: step navigation */}
            {hasOptions && (
              <div className="flex items-center gap-3">
                {/* Back button */}
                {!isFirstStep && (
                  <button
                    onClick={goBack}
                    className="w-12 h-12 rounded-2xl border-2 border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all shrink-0 touch-manipulation">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Step 0 (product info): "Montar pedido" button */}
                {isFirstStep && (
                  <button
                    onClick={goNext}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-manipulation text-[15px]">
                    Montar Pedido
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}

                {/* Option steps: Next / Add to cart */}
                {!isFirstStep && !isLastStep && (
                  <button
                    onClick={goNext}
                    disabled={!canProceed()}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none touch-manipulation text-[15px]">
                    Próximo
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Last step: Add to cart */}
                {!isFirstStep && isLastStep && (
                  <button
                    onClick={handleAddToCart}
                    disabled={!isValid()}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none touch-manipulation text-[15px]">
                    <ShoppingBag className="w-5 h-5" />
                    Adicionar · R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
          <button onClick={() => setFullscreenImage(null)} 
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors touch-manipulation active:scale-90"
            aria-label="Fechar imagem">
            <X className="w-6 h-6" />
          </button>
          <img loading="lazy" src={fullscreenImage} alt="Fullscreen view" className="w-full h-full object-contain" />
        </div>
      )}
    </>
  );
}

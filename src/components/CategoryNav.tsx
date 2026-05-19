'use client';

import { useRef, useState, useEffect } from 'react';

interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryNav({ categories, activeCategory, onSelectCategory }: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // Deduplicate: categories already includes 'Todos' from page.tsx
  const uniqueCategories = Array.from(new Set(categories));

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 4);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  // Auto-scroll to active category
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeBtn = el.querySelector(`[data-category="${activeCategory}"]`) as HTMLElement;
    if (activeBtn) {
      const scrollLeft = activeBtn.offsetLeft - el.offsetWidth / 2 + activeBtn.offsetWidth / 2;
      el.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeCategory]);

  return (
    <div className="w-full relative py-2.5 px-3 border-b border-slate-100/60 bg-white/95 backdrop-blur-md sticky top-14 z-30">
      {/* Left fade */}
      {showLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Scrollable tabs */}
      <div 
        ref={scrollRef} 
        onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 -webkit-overflow-scrolling-touch"
      >
        {uniqueCategories.map((category) => (
          <button
            key={category}
            data-category={category}
            onClick={() => onSelectCategory(category)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 shrink-0 touch-manipulation active:scale-95 ${
              activeCategory === category
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/80 active:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Right fade */}
      {showRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}
    </div>
  );
}

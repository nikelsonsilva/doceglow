'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  return (
    <div className="w-full relative py-3 px-4 border-b border-slate-100 bg-white/95 backdrop-blur-md sticky top-16 z-30">
      {/* Left arrow */}
      {showLeft && (
        <button onClick={() => scroll('left')}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Scrollable tabs */}
      <div ref={scrollRef} onScroll={checkScroll}
        className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1">
        {uniqueCategories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
              activeCategory === category
                ? 'bg-primary text-white shadow-md shadow-pink-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Right arrow */}
      {showRight && (
        <button onClick={() => scroll('right')}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

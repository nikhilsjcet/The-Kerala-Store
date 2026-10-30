import React, { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface ShopByCategoryProps {
  onSelectCategory: (categorySlug: string) => void;
}

export const CIRCULAR_CATEGORIES = [
  {
    name: 'Electronics',
    slug: 'electronics',
    image: '/mockup/cat-electronics.png',
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    image: '/mockup/cat-home-kitchen.png',
  },
  {
    name: 'Fashion',
    slug: 'fashion',
    image: '/mockup/cat-fashion.png',
  },
  {
    name: 'Beauty & Care',
    slug: 'beauty-care',
    image: '/mockup/cat-beauty-care.png',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: '/mockup/cat-accessories.png',
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    image: '/mockup/cat-sports-fitness.png',
  },
  {
    name: 'Toys & Games',
    slug: 'toys-games',
    image: '/mockup/cat-toys-games.png',
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    image: '/mockup/cat-automotive.png',
  },
  {
    name: 'Home Essentials',
    slug: 'home-essentials',
    image: '/mockup/cat-home-essentials.png',
  },
];

export const ShopByCategory: React.FC<ShopByCategoryProps> = ({ onSelectCategory }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-4 sm:py-7 border-b border-gray-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header row: Shop by Category | Desktop Arrows | View All -> */}
        <div className="flex items-center justify-between mb-3.5 sm:mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              Shop by Category
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop scroll arrows */}
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-black flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="w-7 h-7 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-black flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View All Button */}
            <button
              onClick={() => onSelectCategory('all')}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-700 hover:text-[#0A5C36] transition-colors cursor-pointer group"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Premium Tall Rounded Category Cards matching mockup screenshot */}
        <div 
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-4 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
        >
          {CIRCULAR_CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className="group flex-shrink-0 w-[108px] sm:w-[128px] h-[146px] sm:h-[168px] bg-[#FAF8F5] hover:bg-[#F3EFE8] border border-[#EBE5DE] hover:border-[#0A5C36]/60 rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 flex flex-col items-center justify-between text-center cursor-pointer select-none transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-1 active:scale-95"
            >
              {/* High-res category image with warm stone & green leaves */}
              <div className="w-full h-[94px] sm:h-[110px] rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-0.5 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl sm:rounded-2xl group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Bold Category label */}
              <span className="text-[11px] sm:text-[12.5px] font-bold text-gray-900 group-hover:text-[#0A5C36] transition-colors leading-tight line-clamp-2 w-full px-0.5 mt-1">
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* Carousel indicator dots underneath matching screenshot */}
        <div className="flex justify-center items-center gap-1.5 mt-3.5 sm:mt-5">
          <span className="w-6 sm:w-7 h-1.5 bg-[#0A5C36] rounded-full" />
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        </div>

      </div>
    </section>
  );
};

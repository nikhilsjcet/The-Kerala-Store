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
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-white py-5 sm:py-8 border-b border-gray-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header row: Shop by Category | View All -> */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-[#0A5C36] rounded-full hidden sm:block" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Shop by Category
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Tablet scroll arrows */}
            <div className="hidden sm:flex lg:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors shadow-2xs cursor-pointer active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* View All Button */}
            <button
              onClick={() => onSelectCategory('all')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-700 hover:text-[#0A5C36] transition-colors cursor-pointer group"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#0A5C36]" />
            </button>
          </div>
        </div>

        {/* 
          Category Listing:
          - Mobile / Tablet: Silky-smooth horizontal swipe with snap points & peek-ahead
          - Desktop (lg:): Complete 9-column grid where all departments are listed simultaneously side-by-side
        */}
        <div 
          ref={scrollRef}
          className="flex lg:grid lg:grid-cols-9 gap-2.5 sm:gap-3.5 overflow-x-auto lg:overflow-visible scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-smooth"
        >
          {CIRCULAR_CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className="group relative flex-shrink-0 snap-start w-[102px] xs:w-[110px] sm:w-[124px] lg:w-full h-[146px] xs:h-[154px] sm:h-[172px] lg:h-[180px] bg-[#FAF7F2] hover:bg-[#F2ECE3] border border-[#ECE4D8] hover:border-[#0A5C36]/50 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 flex flex-col items-center justify-between text-center cursor-pointer select-none transition-all duration-300 shadow-2xs hover:shadow-lg hover:-translate-y-1.5 active:scale-95"
            >
              {/* High-res category photo with soft natural blending */}
              <div className="w-full h-[96px] xs:h-[102px] sm:h-[116px] lg:h-[122px] rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-0.5 relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl sm:rounded-2xl group-hover:scale-108 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
              </div>

              {/* Bold Category Label */}
              <div className="w-full py-1 sm:py-1.5 flex flex-col items-center justify-center">
                <span className="text-[11px] xs:text-[11.5px] sm:text-xs lg:text-[13px] font-bold text-gray-900 group-hover:text-[#0A5C36] transition-colors leading-[1.2] line-clamp-2 w-full px-0.5">
                  {cat.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel indicator dots underneath on mobile */}
        <div className="flex lg:hidden justify-center items-center gap-1.5 mt-3.5 sm:mt-5">
          <span className="w-7 h-1.5 bg-[#0A5C36] rounded-full" />
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
          <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
        </div>

      </div>
    </section>
  );
};

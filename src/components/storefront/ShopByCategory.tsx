import React from 'react';
import { ArrowRight } from 'lucide-react';

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
  return (
    <section className="bg-white py-4 sm:py-7 border-b border-gray-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header row matching mobile screenshot: Shop by Category | View All -> */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">
            Shop by Category
          </h2>
          <button
            onClick={() => onSelectCategory('all')}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#0A5C36] transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tall Rounded Category Cards matching mockup screenshot */}
        <div className="flex gap-2.5 sm:gap-4 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CIRCULAR_CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className="group flex-shrink-0 w-[100px] sm:w-[115px] h-[130px] sm:h-[148px] bg-[#F8F6F2] hover:bg-[#F2EFE8] border border-[#ECE6DF]/80 hover:border-[#0A5C36] rounded-2xl p-2.5 flex flex-col items-center justify-between text-center cursor-pointer select-none transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95"
            >
              {/* Product image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-0.5">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>

              {/* Category label */}
              <span className="text-[11px] sm:text-xs font-semibold text-gray-900 group-hover:text-[#0A5C36] transition-colors leading-tight line-clamp-2 w-full">
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* Carousel indicator dots underneath matching screenshot */}
        <div className="flex justify-center items-center gap-1.5 mt-3 sm:mt-4">
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

import React from 'react';

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
    <section className="bg-white py-6 sm:py-8 border-b border-gray-100 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 9 Circular Category Items Row matching mockup */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4 md:gap-6 justify-center items-start">
          {CIRCULAR_CATEGORIES.map((cat) => (
            <div
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className="group flex flex-col items-center text-center cursor-pointer select-none transition-transform"
            >
              {/* Circular product image */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#ECE6DF] flex items-center justify-center mb-2 shadow-2xs group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-200 border border-black/5">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>

              {/* Category label */}
              <span className="text-[11px] sm:text-xs font-medium text-gray-900 group-hover:text-[#0B4628] transition-colors leading-tight line-clamp-1 max-w-[90px]">
                {cat.name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

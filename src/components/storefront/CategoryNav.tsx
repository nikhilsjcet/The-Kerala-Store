import React, { useState } from 'react';
import { 
  LayoutGrid, 
  Headphones, 
  Home, 
  Shirt, 
  Sparkles, 
  ShoppingBag, 
  Dumbbell, 
  Gamepad2, 
  Car, 
  ChevronDown,
  Tag,
  Flame,
  Award
} from 'lucide-react';

interface CategoryNavProps {
  onSelectCategory: (categorySlug: string) => void;
  activeCategorySlug?: string;
}

export const NAV_CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', icon: Headphones },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: Home },
  { name: 'Fashion', slug: 'fashion', icon: Shirt },
  { name: 'Beauty & Care', slug: 'beauty-care', icon: Sparkles },
  { name: 'Accessories', slug: 'accessories', icon: ShoppingBag },
  { name: 'Sports & Fitness', slug: 'sports-fitness', icon: Dumbbell },
  { name: 'Toys & Games', slug: 'toys-games', icon: Gamepad2 },
  { name: 'Automotive', slug: 'automotive', icon: Car },
  { name: 'Home Essentials', slug: 'home-essentials', icon: Home },
];

export const MORE_CATEGORIES = [
  { name: 'Limited Flash Sale', slug: 'sale', icon: Tag },
  { name: 'Trending Hot Picks', slug: 'trending', icon: Flame },
  { name: 'Verified Best Quality', slug: 'best-quality', icon: Award },
];

export const CategoryNav: React.FC<CategoryNavProps> = ({ 
  onSelectCategory, 
  activeCategorySlug 
}) => {
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 overflow-x-auto scrollbar-none transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 sm:space-x-3 py-2.5 whitespace-nowrap min-w-max text-xs sm:text-sm">
          
          {/* All Categories Pill Button matching mockup */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-1.5 shadow-2xs ${
              !activeCategorySlug || activeCategorySlug === 'all'
                ? 'bg-[#0B4628] text-white font-semibold'
                : 'bg-[#0B4628]/90 hover:bg-[#0B4628] text-white font-semibold'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>All Categories</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {/* Fixed Nav Categories matching mockup */}
          {NAV_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategorySlug === cat.slug;

            return (
              <button
                key={cat.slug}
                onClick={() => onSelectCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#0B4628] font-bold bg-emerald-50'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B4628]' : 'text-gray-500'}`} strokeWidth={1.75} />
                <span>{cat.name}</span>
              </button>
            );
          })}

          {/* More Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              className="px-3 py-1.5 rounded-full font-medium text-gray-700 hover:text-black hover:bg-gray-100/70 transition-all flex items-center gap-1"
            >
              <span>More</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {showMoreDropdown && (
              <div 
                className="absolute left-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-1"
                onMouseLeave={() => setShowMoreDropdown(false)}
              >
                {MORE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => {
                        setShowMoreDropdown(false);
                        onSelectCategory(cat.slug);
                      }}
                      className="w-full px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

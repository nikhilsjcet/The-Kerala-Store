import React, { useEffect, useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { StoreService } from '../services/storeService';
import { INITIAL_CATEGORIES } from '../services/seedData';
import { ProductCard } from '../components/storefront/ProductCard';
import { formatINR } from '../lib/utils';
import { 
  Filter, 
  X, 
  SlidersHorizontal, 
  Search, 
  ChevronDown, 
  Tag, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface ShopPageProps {
  initialCategorySlug?: string;
  initialSearchQuery?: string;
  initialFilter?: string;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (slug: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  initialCategorySlug,
  initialSearchQuery,
  initialFilter,
  onSelectProduct,
  onSelectCategory,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || '');
  const [priceRange, setPriceRange] = useState<number>(100000);
  const [onlyOnSale, setOnlyOnSale] = useState<boolean>(initialFilter === 'sale');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync props changes
  useEffect(() => {
    if (initialCategorySlug) setSelectedCategory(initialCategorySlug);
  }, [initialCategorySlug]);

  useEffect(() => {
    if (initialSearchQuery) setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialFilter === 'sale') setOnlyOnSale(true);
  }, [initialFilter]);

  // Load Data
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          StoreService.getCategories(),
          StoreService.getProducts(),
        ]);
        if (isMounted) {
          setCategories(cats);
          setProducts(prods);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load shop catalog:', err);
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      const targetSlug = selectedCategory.toLowerCase().trim().replace(/^cat-/, '');
      const matchedCat = categories.find(
        (c) =>
          c.slug?.toLowerCase() === targetSlug ||
          c.id === selectedCategory ||
          c.id.toLowerCase().replace(/^cat-/, '') === targetSlug ||
          c.name.toLowerCase().replace(/\s+/g, '-') === targetSlug
      );
      const matchedCatId = matchedCat?.id;

      result = result.filter((p) => {
        const catSlug = p.category
          ? Array.isArray(p.category)
            ? p.category[0]?.slug?.toLowerCase()
            : (p.category as any).slug?.toLowerCase()
          : null;

        const resolvedCategory = categories.find(
          (c) =>
            c.id === p.category_id ||
            c.slug === p.category_id ||
            c.slug === (p.category_id || '').toLowerCase().replace(/^cat-/, '')
        );
        const resolvedSlug = resolvedCategory?.slug?.toLowerCase();
        const pCatClean = (p.category_id || '').toLowerCase().replace(/^cat-/, '');

        return (
          catSlug === targetSlug ||
          resolvedSlug === targetSlug ||
          pCatClean === targetSlug ||
          p.category_id === selectedCategory ||
          (matchedCatId && p.category_id === matchedCatId) ||
          (p.tags && p.tags.some((t) => t.toLowerCase() === targetSlug || t.toLowerCase() === targetSlug.replace(/-/g, ' ')))
        );
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.short_description.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Price range
    result = result.filter((p) => p.price <= priceRange);

    // On sale
    if (onlyOnSale) {
      result = result.filter((p) => p.is_on_sale || (p.discount_percentage && p.discount_percentage > 0));
    }

    // In stock
    if (onlyInStock) {
      result = result.filter((p) => p.stock_quantity > 0);
    }

    // Rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, categories, selectedCategory, searchQuery, priceRange, onlyOnSale, onlyInStock, minRating, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setPriceRange(100000);
    setOnlyOnSale(false);
    setOnlyInStock(false);
    setMinRating(0);
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {selectedCategory === 'all'
                ? 'All Products'
                : categories.find((c) => c.slug === selectedCategory)?.name || 'Catalog'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Showing {filteredProducts.length} verified products available for instant dispatch
            </p>
          </div>

          {/* Sort & Mobile Filter Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 flex items-center gap-1.5 shadow-2xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-gray-200 text-xs font-semibold text-gray-800 py-2.5 pl-4 pr-9 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A5C36]/20 shadow-2xs cursor-pointer"
              >
                <option value="featured">Featured Picks</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content Layout: Filters Sidebar + Products Grid */}
        <div className="mt-8 flex gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs space-y-6 shrink-0 sticky top-28">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#0A5C36]" /> Filter Products
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-gray-400 hover:text-[#0A5C36] font-medium flex items-center gap-1"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Categories Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                Department
              </h4>
              <div className="space-y-1 max-h-56 overflow-y-auto scrollbar-thin">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-50 text-[#0A5C36] font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-emerald-50 text-[#0A5C36] font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1.5">
                <span>Max Price</span>
                <span className="text-[#0A5C36]">{formatINR(priceRange)}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#0A5C36] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>₹1,000</span>
                <span>₹1,00,000</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyOnSale}
                  onChange={(e) => setOnlyOnSale(e.target.checked)}
                  className="rounded text-[#0A5C36] focus:ring-[#0A5C36] accent-[#0A5C36]"
                />
                <span>Special Sale &amp; Discounts</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded text-[#0A5C36] focus:ring-[#0A5C36] accent-[#0A5C36]"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 max-w-lg mx-auto shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">No matching products</h3>
                <p className="text-xs text-gray-500 mt-1 mb-6">
                  We couldn't find any products matching your current filter criteria.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-full bg-[#0A5C36] text-white font-bold text-xs shadow-sm hover:bg-[#064024] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>

        </div>

      </div>

      {/* Mobile Filters Slide-over modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white shadow-2xl p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">Filters</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-gray-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Categories
                  </h4>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedCategory('all'); setMobileFilterOpen(false); }}
                      className="block w-full text-left py-1 text-xs text-gray-700"
                    >
                      All
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCategory(c.slug); setMobileFilterOpen(false); }}
                        className="block w-full text-left py-1 text-xs text-gray-700"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Max Price</span>
                    <span>{formatINR(priceRange)}</span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={100000}
                    step={1000}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-[#0A5C36]"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 bg-[#0A5C36] text-white font-bold rounded-2xl text-xs"
                >
                  Apply Filters ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState } from 'react';
import { HeroBanner } from '../components/storefront/HeroBanner';
import { ShopByCategory } from '../components/storefront/ShopByCategory';
import { TrustBadgesBar } from '../components/storefront/TrustBadgesBar';
import { PromoCards } from '../components/storefront/PromoCards';
import { ProductCard } from '../components/storefront/ProductCard';
import { StoreService } from '../services/storeService';
import { Product } from '../types';
import { 
  ArrowRight, 
  Flame, 
  Sparkles, 
  CheckCircle, 
  Clock 
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, param?: string) => void;
  onSelectProduct: (product: Product) => void;
  onOpenSupabaseModal?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  onNavigate, 
  onSelectProduct,
  onOpenSupabaseModal 
}) => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadHomeData = async () => {
      try {
        const [trending, best, newest] = await Promise.all([
          StoreService.getProducts({ is_trending: true, limit: 4 }),
          StoreService.getProducts({ sort: 'rating', limit: 4 }),
          StoreService.getProducts({ is_new_arrival: true, limit: 4 }),
        ]);

        if (isMounted) {
          setTrendingProducts(trending);
          setBestSellers(best);
          setNewArrivals(newest);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load homepage products:', err);
        if (isMounted) setIsLoading(false);
      }
    };

    loadHomeData();
    return () => { isMounted = false; };
  }, []);

  const handleSubscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSuccess(true);
      setTimeout(() => setNewsletterSuccess(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. Hero Banner matching visual reference */}
      <HeroBanner 
        onShopNow={() => onNavigate('shop')} 
        onQuickEdit={() => onNavigate('admin')}
      />

      {/* 2. Shop By Category (9 Circular department items from mockup) */}
      <ShopByCategory 
        onSelectCategory={(slug) => onNavigate('shop', `category=${slug}`)} 
      />

      {/* 3. Trust Badges Row (Free Shipping, Secure Payments, Easy Returns, 24/7 Support, Quality Products) */}
      <TrustBadgesBar />

      {/* 4. Triple Bottom Promo Cards (Home Essentials, Electronics & Gadgets, Fashion Collection) */}
      <PromoCards 
        onSelectPromo={(filter) => onNavigate('shop', `category=${filter}`)} 
      />

      {/* 5. Trending Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B4628] uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              Customer Favorites
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Trending Dropship Hot Picks
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Top curated items with rapid supplier dispatch and highest verified ratings
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop', 'filter=trending')}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#0B4628] hover:underline"
          >
            <span>View all trending</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* 6. Best Sellers & Limited-Time Flash Deals */}
      <section className="bg-stone-50/70 py-12 sm:py-16 border-y border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                Verified Quality
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Best Sellers in India
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Loved by thousands of shoppers across Kottayam, Kerala &amp; all over India
              </p>
            </div>
            <button
              onClick={() => onNavigate('shop', 'sort=rating')}
              className="inline-flex items-center gap-1 text-sm font-bold text-[#0B4628] hover:underline"
            >
              <span>Explore top rated</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B4628] uppercase tracking-wider mb-1">
              <Clock className="w-4 h-4" />
              Just Landed
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Fresh Catalog Additions
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Directly imported innovative gadgets, home essentials &amp; wearables
            </p>
          </div>
          <button
            onClick={() => onNavigate('shop', 'sort=newest')}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#0B4628] hover:underline"
          >
            <span>See what's new</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} onSelect={onSelectProduct} />
          ))}
        </div>
      </section>

      {/* 8. Newsletter VIP Signup */}
      <section className="bg-gradient-to-r from-[#0B4628] via-[#0E5C35] to-[#07301B] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">
            VIP Community
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 mb-2">
            Join The Kerala Store VIP Club
          </h2>
          <p className="text-sm text-emerald-100/90 max-w-lg mx-auto mb-6">
            Get early access to trending curated catalog drops, new arrivals, and express delivery updates direct to your inbox.
          </p>

          <form onSubmit={handleSubscribeNewsletter} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email address..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 rounded-full text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#191C1E] hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              Subscribe
            </button>
          </form>

          {newsletterSuccess && (
            <p className="mt-3 text-xs font-bold text-emerald-200 flex items-center justify-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              Thank you for subscribing! We'll keep you updated on new trending arrivals.
            </p>
          )}
        </div>
      </section>

    </div>
  );
};

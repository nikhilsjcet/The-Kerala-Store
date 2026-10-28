import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface BigPromoBannerProps {
  onShopPromo: () => void;
}

export const BigPromoBanner: React.FC<BigPromoBannerProps> = ({ onShopPromo }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-200/80 shadow-card flex flex-col md:flex-row items-center">
        
        {/* Left Side: Product Imagery with Overlapping "Best Price" Pink Circle Badge */}
        <div className="relative w-full md:w-1/2 min-h-[300px] sm:min-h-[380px] bg-stone-100 overflow-hidden flex items-center justify-center p-6">
          <img
            src="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=80"
            alt="Tablet and Speaker Best Price Deals"
            className="w-full h-full object-cover object-center absolute inset-0 transform hover:scale-103 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden" />

          {/* Overlapping "Best Price" Pink Circle Badge (Exact match from screenshot 2) */}
          <div className="absolute top-1/2 -translate-y-1/2 md:translate-y-0 md:top-8 right-6 md:right-8 z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#FF70BA] text-white font-extrabold flex flex-col items-center justify-center shadow-lg transform rotate-[-6deg] hover:rotate-0 transition-transform">
            <span className="text-sm sm:text-base leading-tight font-black uppercase tracking-wider">
              Best
            </span>
            <span className="text-sm sm:text-base leading-tight font-black uppercase tracking-wider">
              Price
            </span>
          </div>
        </div>

        {/* Right Side: Typography & Promo Offer */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col items-start justify-center bg-white">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A5C36] uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Limited-Time Tech Festival
          </div>

          <span className="text-base sm:text-lg font-bold text-gray-800">
            Save up to
          </span>

          <div className="text-5xl sm:text-7xl font-black text-[#191C1E] tracking-tight my-2">
            ₹12,000
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 leading-snug">
            on selected laptop &amp; tablets brands
          </h3>

          <p className="text-xs text-gray-400 mt-2 mb-6">
            Terms and conditions apply. Valid until supplies last. Free door delivery across India.
          </p>

          <button
            onClick={onShopPromo}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white bg-[#0A5C36] hover:bg-[#064024] active:scale-95 shadow-md hover:shadow-lg transition-all"
          >
            <span>Claim Discount</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};


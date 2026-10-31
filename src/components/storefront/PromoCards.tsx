import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PromoCardsProps {
  onSelectPromo: (filter: string) => void;
}

export const PromoCards: React.FC<PromoCardsProps> = ({ onSelectPromo }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 select-none">
      <div className="space-y-4 sm:space-y-6">
        
        {/* Banner 1: Electronics & Gadgets (Luminous Studio Desk Setup matching Reference) */}
        <div 
          onClick={() => onSelectPromo('electronics')}
          className="group relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#EFF6FF] via-[#E2EEFE] to-[#D5E6FA] text-gray-900 p-6 sm:p-9 lg:p-12 flex items-center min-h-[220px] sm:min-h-[260px] lg:min-h-[290px] cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-blue-100/90"
        >
          {/* Left Text */}
          <div className="relative z-10 max-w-[58%] sm:max-w-md lg:max-w-lg flex flex-col justify-between h-full space-y-3 sm:space-y-4">
            <div>
              <span className="inline-block text-[11px] sm:text-xs uppercase tracking-wider font-extrabold text-blue-600 mb-1.5">
                Latest Collection
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12] mb-1.5">
                Electronics <br />&amp; Gadgets
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium">
                Smart gadgets for a smarter you
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); onSelectPromo('electronics'); }}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-sm group-hover:shadow transition-all cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image: Seamless Studio Photograph with Soft Fade */}
          <div 
            className="absolute right-0 bottom-0 top-0 w-[55%] sm:w-[60%] lg:w-[55%] overflow-hidden flex items-center justify-end pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#EFF6FF] via-[#EFF6FF]/60 via-30% to-transparent z-10 pointer-events-none" />
            <img
              src="/mockup/banner-electronics-studio.jpg"
              alt="Electronics and Gadgets"
              className="w-full h-full object-cover object-right group-hover:scale-103 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Banner 2: Fashion Collection (Warm Peach Studio Apparel Rack matching Reference) */}
        <div 
          onClick={() => onSelectPromo('fashion')}
          className="group relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#FFF4EB] via-[#FDEBD7] to-[#FCD9BC] text-gray-900 p-6 sm:p-9 lg:p-12 flex items-center min-h-[220px] sm:min-h-[260px] lg:min-h-[290px] cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-orange-100/90"
        >
          {/* Left Text */}
          <div className="relative z-10 max-w-[58%] sm:max-w-md lg:max-w-lg flex flex-col justify-between h-full space-y-3 sm:space-y-4">
            <div>
              <span className="inline-block text-[11px] sm:text-xs uppercase tracking-wider font-extrabold text-[#C2410C] mb-1.5">
                Trending Now
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#7C2D12] sm:text-gray-900 tracking-tight leading-[1.12] mb-1.5">
                Fashion <br />Collection
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-amber-950/75 font-medium">
                Trendy styles for every occasion
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); onSelectPromo('fashion'); }}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#9A3412] hover:bg-[#7C2D12] shadow-sm group-hover:shadow transition-all cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image: Seamless Studio Photograph with Soft Fade */}
          <div 
            className="absolute right-0 bottom-0 top-0 w-[55%] sm:w-[60%] lg:w-[55%] overflow-hidden flex items-center justify-end pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FFF4EB] via-[#FFF4EB]/60 via-30% to-transparent z-10 pointer-events-none" />
            <img
              src="/mockup/banner-fashion-studio.jpg"
              alt="Fashion Collection"
              className="w-full h-full object-cover object-right group-hover:scale-103 transition-transform duration-700"
            />
          </div>
        </div>

        {/* Banner 3: Home Essentials (Fresh Sage/Mint Studio Scene) */}
        <div 
          onClick={() => onSelectPromo('home-essentials')}
          className="group relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#F0FDF4] via-[#DCFCE7]/70 to-[#BBF7D0]/50 text-gray-900 p-6 sm:p-9 lg:p-12 flex items-center min-h-[220px] sm:min-h-[260px] lg:min-h-[290px] cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-emerald-100/90"
        >
          {/* Left Text */}
          <div className="relative z-10 max-w-[58%] sm:max-w-md lg:max-w-lg flex flex-col justify-between h-full space-y-3 sm:space-y-4">
            <div>
              <span className="inline-block text-[11px] sm:text-xs uppercase tracking-wider font-extrabold text-[#0A5C36] mb-1.5">
                Up to 40% Off
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B4628] tracking-tight leading-[1.12] mb-1.5">
                Home <br />Essentials
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-emerald-950/75 font-medium">
                Curated comfort for every corner
              </p>
            </div>

            <div className="pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); onSelectPromo('home-essentials'); }}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#0A5C36] hover:bg-[#064024] shadow-sm group-hover:shadow transition-all cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image: Seamless Studio Photograph with Soft Fade */}
          <div 
            className="absolute right-0 bottom-0 top-0 w-[55%] sm:w-[60%] lg:w-[55%] overflow-hidden flex items-center justify-end pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#F0FDF4] via-[#F0FDF4]/60 via-30% to-transparent z-10 pointer-events-none" />
            <img
              src="/mockup/banner-home-studio.jpg"
              alt="Home Essentials"
              className="w-full h-full object-cover object-right group-hover:scale-103 transition-transform duration-700"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

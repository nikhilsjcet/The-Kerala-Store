import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PromoCardsProps {
  onSelectPromo: (filter: string) => void;
}

export const PromoCards: React.FC<PromoCardsProps> = ({ onSelectPromo }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 select-none">
      <div className="space-y-5 sm:space-y-7">
        
        {/* Banner 1: Electronics & Gadgets (Matches Reference 1:1) */}
        <div 
          onClick={() => onSelectPromo('electronics')}
          className="group relative rounded-3xl overflow-hidden bg-[#EDF4FB] text-gray-900 p-6 sm:p-10 lg:p-14 flex items-center min-h-[220px] sm:min-h-[270px] lg:min-h-[300px] cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-blue-100"
        >
          {/* Left Text Content */}
          <div className="relative z-20 max-w-[55%] sm:max-w-md lg:max-w-lg flex flex-col justify-between h-full space-y-3 sm:space-y-4">
            <div>
              <span className="inline-block text-[11px] sm:text-xs uppercase tracking-widest font-black text-blue-600 mb-1.5">
                Latest Collection
              </span>
              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] tracking-tight leading-[1.12] mb-2 font-serif">
                Electronics <br />&amp; Gadgets
              </h3>
              <p className="text-xs sm:text-base text-slate-600 font-medium">
                Smart gadgets for a smarter you
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelectPromo('electronics'); }}
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] shadow-sm group-hover:shadow-md transition-all cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image: Seamless Blend Matching Reference with Zero Seams */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-[58%] sm:w-[58%] lg:w-[54%] overflow-hidden flex items-center justify-end pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)'
            }}
          >
            <img
              src="/mockup/banner-electronics-studio.jpg"
              alt="Electronics & Gadgets"
              className="w-full h-full object-cover object-right group-hover:scale-102 transition-transform duration-700"
            />
            {/* Seamless Left Edge Dissolve */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#EDF4FB] via-[#EDF4FB]/85 via-25% to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#EDF4FB]/30 via-transparent to-[#EDF4FB]/30 pointer-events-none" />
          </div>
        </div>

        {/* Banner 2: Fashion Collection (Matches Reference 1:1) */}
        <div 
          onClick={() => onSelectPromo('fashion')}
          className="group relative rounded-3xl overflow-hidden bg-[#FDF0E6] text-gray-900 p-6 sm:p-10 lg:p-14 flex items-center min-h-[220px] sm:min-h-[270px] lg:min-h-[300px] cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-orange-100"
        >
          {/* Left Text Content */}
          <div className="relative z-20 max-w-[55%] sm:max-w-md lg:max-w-lg flex flex-col justify-between h-full space-y-3 sm:space-y-4">
            <div>
              <span className="inline-block text-[11px] sm:text-xs uppercase tracking-widest font-black text-[#C2410C] mb-1.5">
                Trending Now
              </span>
              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#7C2D12] tracking-tight leading-[1.12] mb-2 font-serif">
                Fashion <br />Collection
              </h3>
              <p className="text-xs sm:text-base text-amber-950/75 font-medium">
                Trendy styles for every occasion
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelectPromo('fashion'); }}
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#9A3412] hover:bg-[#7C2D12] shadow-sm group-hover:shadow-md transition-all cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image: Seamless Blend Matching Reference with Zero Seams */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-[58%] sm:w-[58%] lg:w-[54%] overflow-hidden flex items-center justify-end pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)'
            }}
          >
            <img
              src="/mockup/banner-fashion-studio.jpg"
              alt="Fashion Collection"
              className="w-full h-full object-cover object-right group-hover:scale-102 transition-transform duration-700"
            />
            {/* Seamless Left Edge Dissolve */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FDF0E6] via-[#FDF0E6]/85 via-25% to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FDF0E6]/30 via-transparent to-[#FDF0E6]/30 pointer-events-none" />
          </div>
        </div>

        {/* Banner 3: Home Essentials (Fresh Sage Studio Setup) */}
        <div 
          onClick={() => onSelectPromo('home-essentials')}
          className="group relative rounded-3xl overflow-hidden bg-[#F0F8F3] text-gray-900 p-6 sm:p-10 lg:p-14 flex items-center min-h-[220px] sm:min-h-[270px] lg:min-h-[300px] cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-emerald-100"
        >
          {/* Left Text Content */}
          <div className="relative z-20 max-w-[55%] sm:max-w-md lg:max-w-lg flex flex-col justify-between h-full space-y-3 sm:space-y-4">
            <div>
              <span className="inline-block text-[11px] sm:text-xs uppercase tracking-widest font-black text-[#0A5C36] mb-1.5">
                Up to 40% Off
              </span>
              <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B4628] tracking-tight leading-[1.12] mb-2 font-serif">
                Home <br />Essentials
              </h3>
              <p className="text-xs sm:text-base text-emerald-950/75 font-medium">
                Curated comfort for every corner
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelectPromo('home-essentials'); }}
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#0A5C36] hover:bg-[#064024] shadow-sm group-hover:shadow-md transition-all cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image: Seamless Blend with Zero Seams */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-[58%] sm:w-[58%] lg:w-[54%] overflow-hidden flex items-center justify-end pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)'
            }}
          >
            <img
              src="/mockup/banner-home-studio.jpg"
              alt="Home Essentials"
              className="w-full h-full object-cover object-right group-hover:scale-102 transition-transform duration-700"
            />
            {/* Seamless Left Edge Dissolve */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F0F8F3] via-[#F0F8F3]/85 via-25% to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F0F8F3]/30 via-transparent to-[#F0F8F3]/30 pointer-events-none" />
          </div>
        </div>

      </div>
    </section>
  );
};

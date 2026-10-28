import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PromoCardsProps {
  onSelectPromo: (filter: string) => void;
}

export const PromoCards: React.FC<PromoCardsProps> = ({ onSelectPromo }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Card 1: Home Essentials (Deep Forest Green #134E35) */}
        <div 
          onClick={() => onSelectPromo('home-essentials')}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#134E35] text-white p-5 sm:p-6 flex items-center justify-between min-h-[170px] sm:min-h-[190px] cursor-pointer shadow-xs hover:shadow-md transition-all"
        >
          {/* Left Text */}
          <div className="relative z-10 max-w-[55%] flex flex-col justify-between h-full">
            <div>
              <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-emerald-200 mb-1">
                Up to 40% Off
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-4 text-white">
                Home <br />Essentials
              </h3>
            </div>

            <div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelectPromo('home-essentials'); }}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-[#134E35] bg-white hover:bg-gray-100 shadow-2xs group-hover:shadow transition-all"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="absolute right-0 bottom-0 top-0 w-[55%] overflow-hidden flex items-center justify-end pointer-events-none">
            <img
              src="/mockup/promo-img-home.png"
              alt="Home Essentials"
              className="w-full h-full object-cover object-left group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Card 2: Electronics & Gadgets (Off-white/Cream #F5EFE9) */}
        <div 
          onClick={() => onSelectPromo('electronics')}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F5EFE9] text-gray-900 p-5 sm:p-6 flex items-center justify-between min-h-[170px] sm:min-h-[190px] cursor-pointer shadow-xs hover:shadow-md transition-all border border-[#EBE4DD]"
        >
          {/* Left Text */}
          <div className="relative z-10 max-w-[55%] flex flex-col justify-between h-full">
            <div>
              <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                Latest Collection
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-4 text-gray-900">
                Electronics <br />&amp; Gadgets
              </h3>
            </div>

            <div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelectPromo('electronics'); }}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 bg-white hover:bg-gray-50 shadow-2xs group-hover:shadow transition-all border border-gray-200/50"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="absolute right-0 bottom-0 top-0 w-[55%] overflow-hidden flex items-center justify-end pointer-events-none">
            <img
              src="/mockup/promo-img-electronics.png"
              alt="Electronics and Gadgets"
              className="w-full h-full object-cover object-left group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        {/* Card 3: Fashion Collection (Soft Peach #F8A888) */}
        <div 
          onClick={() => onSelectPromo('fashion')}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F8A888] text-gray-900 p-5 sm:p-6 flex items-center justify-between min-h-[170px] sm:min-h-[190px] cursor-pointer shadow-xs hover:shadow-md transition-all"
        >
          {/* Left Text */}
          <div className="relative z-10 max-w-[55%] flex flex-col justify-between h-full">
            <div>
              <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-amber-950/70 mb-1">
                Trending Now
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-4 text-gray-900">
                Fashion <br />Collection
              </h3>
            </div>

            <div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelectPromo('fashion'); }}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 bg-white hover:bg-gray-50 shadow-2xs group-hover:shadow transition-all border border-black/5"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="absolute right-0 bottom-0 top-0 w-[55%] overflow-hidden flex items-center justify-end pointer-events-none">
            <img
              src="/mockup/promo-img-fashion.png"
              alt="Fashion Collection"
              className="w-full h-full object-cover object-left group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

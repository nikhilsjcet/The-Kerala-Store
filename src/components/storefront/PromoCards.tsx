import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PromoCardsProps {
  onSelectPromo: (filter: string) => void;
}

export const PromoCards: React.FC<PromoCardsProps> = ({ onSelectPromo }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Card 1: Home Essentials (Deep Forest Green #0B4628) */}
        <div 
          onClick={() => onSelectPromo('home-essentials')}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#0B4628] text-white p-5 sm:p-6 flex items-center justify-between min-h-[180px] sm:min-h-[200px] cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-[#083820]"
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
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#0B4628] bg-white hover:bg-gray-100 shadow-2xs group-hover:shadow transition-all"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image with Smooth Gradient Overlay */}
          <div className="absolute right-0 bottom-0 top-0 w-[55%] overflow-hidden flex items-center justify-end pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B4628] via-[#0B4628]/40 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=600&q=80"
              alt="Home Essentials"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Card 2: Electronics & Gadgets (Off-white/Cream #F5EFE9) */}
        <div 
          onClick={() => onSelectPromo('electronics')}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F5EFE9] text-gray-900 p-5 sm:p-6 flex items-center justify-between min-h-[180px] sm:min-h-[200px] cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-[#EBE4DD]"
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
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold text-gray-900 bg-white hover:bg-gray-50 shadow-2xs group-hover:shadow transition-all border border-gray-200/50"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image with Smooth Gradient Overlay */}
          <div className="absolute right-0 bottom-0 top-0 w-[55%] overflow-hidden flex items-center justify-end pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5EFE9] via-[#F5EFE9]/40 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
              alt="Electronics and Gadgets"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Card 3: Fashion Collection (Soft Peach #F8A888) */}
        <div 
          onClick={() => onSelectPromo('fashion')}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F8A888] text-gray-900 p-5 sm:p-6 flex items-center justify-between min-h-[180px] sm:min-h-[200px] cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-[#F29B78]"
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
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold text-gray-900 bg-white hover:bg-gray-50 shadow-2xs group-hover:shadow transition-all border border-black/5"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image with Smooth Gradient Overlay */}
          <div className="absolute right-0 bottom-0 top-0 w-[55%] overflow-hidden flex items-center justify-end pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F8A888] via-[#F8A888]/40 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
              alt="Fashion Collection"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

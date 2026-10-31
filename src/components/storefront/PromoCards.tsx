import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PromoCardsProps {
  onSelectPromo: (filter: string) => void;
}

export const PromoCards: React.FC<PromoCardsProps> = ({ onSelectPromo }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 select-none">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Card 1: Home Essentials (Deep Forest Green #12472F) */}
        <div 
          onClick={() => onSelectPromo('home-essentials')}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#12472F] text-white p-5 sm:p-6 flex items-center justify-between min-h-[185px] sm:min-h-[205px] cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-[#0E3A26]"
        >
          {/* Left Text */}
          <div className="relative z-10 max-w-[58%] flex flex-col justify-between h-full">
            <div>
              <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-emerald-300 mb-1">
                Up to 40% Off
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-4 text-white drop-shadow-xs">
                Home <br />Essentials
              </h3>
            </div>

            <div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelectPromo('home-essentials'); }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-extrabold text-[#12472F] bg-white hover:bg-gray-100 shadow-sm group-hover:shadow transition-all"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image: Seamless Soft Gradient Mask & Natural Edge Blend */}
          <div 
            className="absolute right-0 bottom-0 top-0 w-[55%] sm:w-[60%] overflow-hidden flex items-center justify-end pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)'
            }}
          >
            {/* Multi-stage color gradient overlay to guarantee 100% seamless photo blending with zero hard cuts */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#12472F] via-[#12472F]/70 via-35% to-transparent z-10 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80"
              alt="Home Essentials"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Card 2: Electronics & Gadgets (Off-white/Cream #F5EFE8) */}
        <div 
          onClick={() => onSelectPromo('electronics')}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F5EFE8] text-gray-900 p-5 sm:p-6 flex items-center justify-between min-h-[185px] sm:min-h-[205px] cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-[#EBE3D8]"
        >
          {/* Left Text */}
          <div className="relative z-10 max-w-[58%] flex flex-col justify-between h-full">
            <div>
              <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-gray-500 mb-1">
                Latest Collection
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-4 text-gray-900">
                Electronics <br />&amp; Gadgets
              </h3>
            </div>

            <div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelectPromo('electronics'); }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-extrabold text-gray-900 bg-white hover:bg-gray-50 shadow-sm group-hover:shadow transition-all border border-gray-200/60"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image: Seamless Soft Gradient Mask & Natural Edge Blend */}
          <div 
            className="absolute right-0 bottom-0 top-0 w-[55%] sm:w-[60%] overflow-hidden flex items-center justify-end pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)'
            }}
          >
            {/* Multi-stage cream gradient overlay to blend laptop/gadget image naturally into #F5EFE8 */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5EFE8] via-[#F5EFE8]/75 via-35% to-transparent z-10 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=80"
              alt="Electronics and Gadgets"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Card 3: Fashion Collection (Soft Peach #F7A380) */}
        <div 
          onClick={() => onSelectPromo('fashion')}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F7A380] text-gray-900 p-5 sm:p-6 flex items-center justify-between min-h-[185px] sm:min-h-[205px] cursor-pointer shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 border border-[#F2946E]"
        >
          {/* Left Text */}
          <div className="relative z-10 max-w-[58%] flex flex-col justify-between h-full">
            <div>
              <span className="inline-block text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-amber-950/75 mb-1">
                Trending Now
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-4 text-gray-900">
                Fashion <br />Collection
              </h3>
            </div>

            <div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelectPromo('fashion'); }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-extrabold text-gray-900 bg-white hover:bg-gray-50 shadow-sm group-hover:shadow transition-all border border-black/5"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image: Seamless Soft Gradient Mask & Natural Edge Blend */}
          <div 
            className="absolute right-0 bottom-0 top-0 w-[55%] sm:w-[60%] overflow-hidden flex items-center justify-end pointer-events-none"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,1) 55%)'
            }}
          >
            {/* Multi-stage peach gradient overlay to blend fashion image naturally into #F7A380 */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F7A380] via-[#F7A380]/75 via-35% to-transparent z-10 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=700&q=80"
              alt="Fashion Collection"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

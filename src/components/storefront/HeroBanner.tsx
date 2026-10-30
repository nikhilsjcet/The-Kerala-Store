import React from 'react';
import { Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeroBannerProps {
  onShopNow: () => void;
  onQuickEdit?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow, onQuickEdit }) => {
  const { isAdmin } = useAuth();

  return (
    <section className="max-w-3xl lg:max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-3.5 select-none">
      {/* 
        Hero Banner Card matching the design given in the user screenshot:
        TheKeralaStore™ - Your One-Stop Store for Everything (Explore, Shop, Live Better)
      */}
      <div 
        onClick={onShopNow}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-[#E0D5CB] cursor-pointer group hover:shadow-md transition-all active:scale-[0.99] bg-[#ECE2D9] mx-auto w-full"
      >
        {/* Admin Quick Edit Button */}
        {isAdmin && (
          <button
            onClick={(e) => { e.stopPropagation(); onQuickEdit?.(); }}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 bg-black/50 text-white backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold shadow-md border border-white/20 flex items-center gap-1.5 hover:bg-black/70 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3 text-emerald-400" />
            <span>Admin Quick Edit</span>
          </button>
        )}

        {/* High Clarity HD Banner graphic uploaded by user */}
        <div className="relative w-full aspect-[1024/377] bg-[#ECE2D9] overflow-hidden">
          <img
            src="/mockup/hero-banner-hd.png"
            srcSet="/mockup/hero-banner-hd.png 1024w, /mockup/hero-banner-card@2x.png 1024w"
            sizes="(max-width: 640px) 100vw, 1024px"
            alt="TheKeralaStore - Your One-Stop Store for Everything. Explore, Shop, Live Better."
            className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-300"
            loading="eager"
          />

          {/* Accessible focusable hotspot over the 'Shop Now' button area */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onShopNow(); }}
            aria-label="Shop Now"
            className="absolute left-[6%] bottom-[12%] w-[25%] h-[22%] rounded-full cursor-pointer opacity-0 focus:opacity-100 focus:ring-2 focus:ring-[#0A5C36] focus:bg-white/20 transition-opacity"
          />
        </div>
      </div>
    </section>
  );
};

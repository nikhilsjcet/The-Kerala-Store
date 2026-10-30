import React, { useState, useEffect } from 'react';
import { ArrowRight, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeroBannerProps {
  onShopNow: () => void;
  onQuickEdit?: () => void;
}

interface SlideItem {
  subtitle: string;
  line1: string;
  line2Prefix: string;
  highlightWord: string;
  ctaText: string;
}

const SLIDES: SlideItem[] = [
  {
    subtitle: 'EXPLORE • SHOP • LIVE BETTER',
    line1: 'Your One-Stop Store',
    line2Prefix: 'for ',
    highlightWord: 'Everything',
    ctaText: 'Shop Now',
  },
  {
    subtitle: 'AUTHENTIC & TRADITIONAL',
    line1: 'Pure Kerala Treasures',
    line2Prefix: 'at ',
    highlightWord: 'Best Prices',
    ctaText: 'Explore Kerala',
  },
  {
    subtitle: 'PREMIUM SOUND & WEARABLES',
    line1: 'Smart Living & Audio',
    line2Prefix: 'crafted for ',
    highlightWord: 'Everyday Life',
    ctaText: 'Shop Gadgets',
  },
  {
    subtitle: 'FRESH TRENDS & LIFESTYLE',
    line1: 'Quality Fashion Drops',
    line2Prefix: 'to your ',
    highlightWord: 'Doorstep',
    ctaText: 'Discover Style',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow, onQuickEdit }) => {
  const { isAdmin } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Automatically advance headline text across 4 slides every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 select-none">
      {/* 
        Hero banner card:
        - Mobile: Natural aspect-[1024/377] with perfectly scaled text, zero zoom distortion
        - PC: Sleek, compact panoramic height (md:h-[270px] lg:h-[285px]) that never dominates the viewport
      */}
      <div 
        onClick={onShopNow}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs border border-[#E0D5CB] cursor-pointer group hover:shadow-md transition-all active:scale-[0.99] bg-[#ECE2D9] aspect-[1024/377] md:aspect-auto md:h-[270px] lg:h-[285px] w-full flex items-center"
      >
        {/* Admin Quick Edit Button */}
        {isAdmin && (
          <button
            onClick={(e) => { e.stopPropagation(); onQuickEdit?.(); }}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-30 bg-black/50 text-white backdrop-blur-md px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-semibold shadow-md border border-white/20 flex items-center gap-1 hover:bg-black/70 transition-colors cursor-pointer"
          >
            <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
            <span className="hidden xs:inline">Admin Quick Edit</span>
            <span className="xs:hidden">Edit</span>
          </button>
        )}

        {/* High Clarity Base Artwork Background */}
        <img
          src="/mockup/hero-banner-base-bg.png"
          alt="TheKeralaStore Lifestyle"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          loading="eager"
        />

        {/* Left Column: Live Animated Text Content (4 Slides) */}
        <div className="relative z-10 w-[49%] sm:w-[51%] md:w-[50%] h-full pl-3.5 xs:pl-5 sm:pl-8 md:pl-12 pr-1.5 sm:pr-3 py-2.5 xs:py-3 sm:py-4 md:py-5 flex flex-col justify-between">
          
          {/* Top: Official TheKeralaStore™ Logo (Bigger, bolder brand mark) & Subtitle */}
          <div>
            <div className="h-7 xs:h-8.5 sm:h-11 md:h-13 lg:h-15 flex items-center">
              <img
                src="/mockup/thekeralastore-logo-hero-clean-transparent.png"
                alt="TheKeralaStore"
                className="h-full w-auto object-contain drop-shadow-xs"
              />
            </div>
            <p 
              key={`sub-${currentSlide}`}
              className="text-[8px] xs:text-[9.5px] sm:text-xs md:text-sm font-bold tracking-wider sm:tracking-[0.22em] text-gray-700 uppercase mt-1 sm:mt-1.5 transition-all duration-300 truncate"
            >
              {slide.subtitle}
            </p>
          </div>

          {/* Center: Dynamic Animated Headline (Bigger, bolder typography) */}
          <div className="my-auto py-0.5 sm:py-1">
            <h1 
              key={`title-${currentSlide}`}
              className="text-[12px] xs:text-[14.5px] sm:text-xl md:text-[27px] lg:text-[32px] xl:text-[35px] font-black text-gray-950 tracking-tight leading-[1.14] transition-opacity duration-300"
            >
              {slide.line1} <br />
              {slide.line2Prefix}
              <span className="text-[#0A5C36]">{slide.highlightWord}</span>
            </h1>
          </div>

          {/* Bottom: Shop Now Button & 4 Interactive Pagination Dots */}
          <div className="space-y-1 xs:space-y-1.5 sm:space-y-2.5">
            <div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onShopNow(); }}
                className="bg-[#0A5C36] hover:bg-[#074628] text-white px-3 xs:px-3.5 sm:px-5 md:px-6 py-1 xs:py-1.5 sm:py-2 rounded-full font-bold text-[9.5px] xs:text-[11px] sm:text-xs md:text-sm shadow-xs hover:shadow active:scale-95 transition-all inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* 4 Pagination Dots matching 4 slides */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1 xs:h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide
                      ? 'w-4 xs:w-5 sm:w-7 bg-[#0A5C36]'
                      : 'w-1.5 xs:w-2 sm:w-2.5 bg-gray-400/60 hover:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

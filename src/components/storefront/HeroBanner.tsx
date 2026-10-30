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

        {/* Left Column: Live Animated Text Content (4 Slides) strictly in left 46% */}
        <div className="relative z-10 w-[46%] sm:w-[48%] md:w-[48%] h-full pl-3 xs:pl-4 sm:pl-8 md:pl-12 pr-1 sm:pr-2 py-2 xs:py-2.5 sm:py-4 md:py-5 flex flex-col justify-between">
          
          {/* Top: Official TheKeralaStore™ Logo & Subtitle */}
          <div>
            <div className="h-4 xs:h-5 sm:h-7 md:h-9 flex items-center">
              <img
                src="/mockup/thekeralastore-logo-hero-clean-transparent.png"
                alt="TheKeralaStore"
                className="h-full w-auto object-contain drop-shadow-2xs"
              />
            </div>
            <p 
              key={`sub-${currentSlide}`}
              className="text-[6.5px] xs:text-[7.5px] sm:text-[10px] md:text-xs font-bold tracking-wider sm:tracking-[0.2em] text-gray-700 uppercase mt-0.5 sm:mt-1.5 transition-all duration-300 truncate"
            >
              {slide.subtitle}
            </p>
          </div>

          {/* Center: Dynamic Animated Headline (Changes automatically like 4 slides) */}
          <div className="my-auto py-0.5 sm:py-1">
            <h1 
              key={`title-${currentSlide}`}
              className="text-[10px] xs:text-[12px] sm:text-lg md:text-2xl lg:text-[27px] font-black text-gray-950 tracking-tight leading-[1.12] transition-opacity duration-300"
            >
              {slide.line1} <br />
              {slide.line2Prefix}
              <span className="text-[#0A5C36]">{slide.highlightWord}</span>
            </h1>
          </div>

          {/* Bottom: Shop Now Button & 4 Interactive Pagination Dots */}
          <div className="space-y-1 sm:space-y-2">
            <div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onShopNow(); }}
                className="bg-[#0A5C36] hover:bg-[#074628] text-white px-2.5 xs:px-3 sm:px-5 md:px-6 py-0.5 xs:py-1 sm:py-1.5 md:py-2 rounded-full font-bold text-[8.5px] xs:text-[9.5px] sm:text-xs md:text-sm shadow-xs hover:shadow active:scale-95 transition-all inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
                  className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide
                      ? 'w-3.5 sm:w-6 bg-[#0A5C36]'
                      : 'w-1 sm:w-2 bg-gray-400/60 hover:bg-gray-600'
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

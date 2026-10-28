import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { KeralaStoreLogo } from '../common/KeralaStoreLogo';

interface HeroBannerProps {
  onShopNow: () => void;
  onQuickEdit?: () => void;
}

const SLIDES = [
  {
    subtitle: 'EXPLORE • SHOP • LIVE BETTER',
    tagline: 'Your One-Stop Store for Everything',
    ctaText: 'Shop Now',
    filterCategory: 'all',
    image: '/mockup/hero-collage.png',
    alt: 'Curated lifestyle products on stone pedestals',
  },
  {
    subtitle: 'PREMIUM SOUND & WEARABLES',
    tagline: 'Experience Studio Sound & Smart Living',
    ctaText: 'Explore Tech',
    filterCategory: 'electronics',
    image: '/mockup/hero-collage.png',
    alt: 'Headphones and smart watch',
  },
  {
    subtitle: 'HOME & KITCHEN ESSENTIALS',
    tagline: 'Aesthetic Living for Contemporary Homes',
    ctaText: 'Shop Home',
    filterCategory: 'home-kitchen',
    image: '/mockup/hero-collage.png',
    alt: 'Home & Kitchen Essentials',
  },
  {
    subtitle: 'TRENDING FASHION & SNEAKERS',
    tagline: 'Fresh Minimalist Drops Verified for Quality',
    ctaText: 'Discover Style',
    filterCategory: 'fashion',
    image: '/mockup/hero-collage.png',
    alt: 'Fashion and sneakers',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow, onQuickEdit }) => {
  const { isAdmin } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slide every 7s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const slide = SLIDES[currentSlide];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
      {/* 
        Rounded Hero Card matching mockup 
        Background: #ECE2D9 warm alabaster stone tint
      */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#ECE2D9] border border-[#E0D5CB] shadow-xs select-none">
        
        {/* Admin Quick Edit Button */}
        {isAdmin && (
          <button
            onClick={onQuickEdit}
            className="absolute top-4 right-4 z-30 bg-black/40 text-white backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold shadow-md border border-white/20 flex items-center gap-1.5 hover:bg-black/60 transition-colors"
          >
            <Edit3 className="w-3 h-3 text-emerald-400" />
            Admin Quick Edit
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[300px] sm:min-h-[340px] lg:h-[350px]">
          
          {/* Left Column: Brand, Tagline, Button, Carousel Controls */}
          <div className="lg:col-span-5 p-6 sm:p-10 lg:pl-12 lg:pr-4 flex flex-col justify-center z-10">
            
            {/* Top Subtitle: EXPLORE • SHOP • LIVE BETTER */}
            <p className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-gray-700 uppercase mb-3">
              {slide.subtitle}
            </p>

            {/* Brand Headline: Kerala Map silhouette + TheKeralaStore */}
            <div className="mb-2">
              <KeralaStoreLogo size="lg" />
            </div>

            {/* Tagline: Your One-Stop Store for Everything */}
            <p className="text-base sm:text-lg text-gray-700 font-normal mb-6 tracking-tight">
              {slide.tagline}
            </p>

            {/* Action Button: Dark Green Pill 'Shop Now →' */}
            <div className="mb-6">
              <button
                onClick={onShopNow}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-full font-semibold text-xs sm:text-sm text-white bg-[#0B4628] hover:bg-[#07301B] active:scale-98 shadow-sm hover:shadow transition-all group"
              >
                <span>{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Slider Controls: < > • • • • */}
            <div className="flex items-center space-x-3">
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                aria-label="Previous slide"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300/80 bg-white/70 hover:bg-white text-gray-700 flex items-center justify-center transition-colors shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300/80 bg-white/70 hover:bg-white text-gray-700 flex items-center justify-center transition-colors shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Dots */}
              <div className="flex items-center space-x-1.5 ml-2">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide 
                        ? 'w-5 bg-[#0B4628]' 
                        : 'w-2 bg-gray-400/50 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Lifestyle Product Collage */}
          <div className="lg:col-span-7 h-full w-full relative flex items-center justify-center lg:justify-end overflow-hidden p-4 lg:p-0">
            <img
              src="/mockup/hero-collage.png"
              alt={slide.alt}
              className="w-full h-auto max-h-[280px] sm:max-h-[320px] lg:max-h-[350px] object-contain object-bottom lg:object-right-bottom transition-opacity duration-500 pointer-events-none"
            />
          </div>

        </div>

      </div>
    </section>
  );
};

import React from 'react';
import { Instagram, ExternalLink, Heart, MessageCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export const InstagramProductsSection: React.FC = () => {
  const instagramUrl = 'https://instagram.com/thekeralastore_';

  const instagramPosts = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      title: 'Handcrafted Kerala Spices & Organics',
      category: 'Pure Kerala',
      likes: '1.4k',
      comments: '86',
      tag: '@thekeralastore_',
      description: 'Single-origin Wayanad black pepper, green cardamom & cold-pressed oils straight from farm estates. DM to order or tap bio link!',
    },
    {
      id: 2,
      image: '/mockup/banner-electronics-studio.jpg',
      title: 'Next-Gen Smart Gadgets & Audio',
      category: 'Electronics',
      likes: '2.8k',
      comments: '142',
      tag: '@thekeralastore_',
      description: 'Noise-cancelling wireless headphones, ultra-slim smartwatches & lifestyle tech drops with 48h Kerala dispatch.',
    },
    {
      id: 3,
      image: '/mockup/banner-fashion-studio.jpg',
      title: 'Festive Handlooms & Daily Wear',
      category: 'Fashion',
      likes: '3.1k',
      comments: '194',
      tag: '@thekeralastore_',
      description: 'Kasavu borders, breathable organic cottons & modern ethnic wear. Check our highlight stories for live drape videos!',
    },
    {
      id: 4,
      image: '/mockup/banner-home-studio.jpg',
      title: 'Artisan Kitchen & Home Decor',
      category: 'Home Living',
      likes: '1.9k',
      comments: '98',
      tag: '@thekeralastore_',
      description: 'Traditional heavy-bottom cast iron cookware, hand-woven throws & brass home essentials for modern aesthetics.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-pink-50/20 to-white select-none border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block with Instagram Styling */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200/80 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shadow-2xs">
                <Instagram className="w-3 h-3" />
              </div>
              <span className="text-xs font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent uppercase tracking-wider">
                Live Store Drops on Instagram
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-gray-950 tracking-tight leading-tight">
              Show All Products on <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text text-transparent">
                Instagram Feed
              </span>
            </h2>

            <p className="text-xs sm:text-base text-gray-600 font-medium leading-relaxed">
              Explore our complete curated catalog in action. Watch live unboxing videos, customer reviews, reel drops, and place express orders directly via DM on <strong className="text-gray-900">@thekeralastore_</strong>.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-white font-black text-xs sm:text-sm bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-95 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span>Show All Products on Instagram</span>
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/90" />
            </a>
          </div>
        </div>

        {/* Instagram Post Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-3xl border border-gray-200/90 shadow-2xs hover:shadow-xl hover:border-pink-300/80 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Image Container with Instagram Overlay */}
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Top Overlay Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-white/20">
                    {post.category}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-pink-600 shadow-sm">
                    <Instagram className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom Engagement Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="flex items-center justify-between w-full text-white text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-pink-500 text-pink-500" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 fill-white text-white" /> {post.comments}
                    </span>
                    <span className="underline text-[11px] font-extrabold flex items-center gap-1">
                      View Reel ↗
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Information Block */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-pink-600">
                    <span>@thekeralastore_</span>
                    <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500 text-white" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-snug group-hover:text-pink-600 transition-colors line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {post.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 group-hover:text-pink-600 transition-colors">
                  <span>Open on Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Bottom Fast Follow Pill Card */}
        <div className="mt-8 sm:mt-10 p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-white shrink-0 shadow-sm">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-sm sm:text-base">
                Follow @thekeralastore_ for Daily Catalog Updates
              </h4>
              <p className="text-xs text-gray-600 font-medium">
                Tag us in your unboxing reels or DM your product wishlists for instant doorstep delivery.
              </p>
            </div>
          </div>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full bg-[#0A5C36] hover:bg-[#064024] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Follow on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};


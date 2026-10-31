import React from 'react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CreditCard,
  Sparkles
} from 'lucide-react';

interface FooterProps {
  onNavigateCategory: (slug: string) => void;
  onOpenPolicy: (policyName: string) => void;
  onNavigatePage?: (page: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateCategory, onOpenPolicy, onNavigatePage }) => {
  return (
    <footer className="bg-white border-t border-gray-200 text-[#191C1E] pt-14 pb-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid matching Screenshot 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12">
          
          {/* Column 1: Store Location & Support */}
          <div>
            <h4 className="text-base font-bold text-gray-900 tracking-tight mb-4">
              Store Location &amp; Help
            </h4>
            <div className="space-y-3.5 text-sm text-gray-600">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0A5C36] shrink-0 mt-0.5" />
                <span>
                  TheKeralaStore<br />
                  Kottayam, Kerala, India
                </span>
              </p>
              <div className="pt-1 space-y-2">
                <p className="text-xs font-semibold text-gray-500 mb-1">For Support &amp; Help:</p>
                <div className="flex flex-col gap-1.5">
                  <a
                    href="mailto:support@thekeralastore.shop"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-gray-800 hover:text-[#0A5C36] font-semibold text-xs transition-all shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#0A5C36]" />
                    <span>support@thekeralastore.shop</span>
                  </a>
                  <a
                    href="https://instagram.com/thekeralastore_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-200 text-gray-800 hover:text-pink-600 font-semibold text-xs transition-all shadow-2xs group"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-600 group-hover:scale-110 transition-transform" />
                    <span>@thekeralastore_</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 mt-6">
              <a 
                href="https://instagram.com/thekeralastore_" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-600 hover:text-white flex items-center justify-center text-pink-600 transition-colors shadow-2xs"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop Department Links (Exact match from screenshot) */}
          <div>
            <h4 className="text-base font-bold text-gray-900 tracking-tight mb-4">
              Shop
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <button onClick={() => onNavigateCategory('all')} className="hover:text-[#0A5C36] transition-colors">
                  Shop All
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('electronics')} className="hover:text-[#0A5C36] transition-colors">
                  Electronics
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('home-kitchen')} className="hover:text-[#0A5C36] transition-colors">
                  Home &amp; Kitchen
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('fashion')} className="hover:text-[#0A5C36] transition-colors">
                  Fashion
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('beauty-care')} className="hover:text-[#0A5C36] transition-colors">
                  Beauty &amp; Care
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('accessories')} className="hover:text-[#0A5C36] transition-colors">
                  Accessories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('sports-fitness')} className="hover:text-[#0A5C36] transition-colors">
                  Sports &amp; Fitness
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('toys-games')} className="hover:text-[#0A5C36] transition-colors">
                  Toys &amp; Games
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('automotive')} className="hover:text-[#0A5C36] transition-colors">
                  Automotive
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateCategory('home-essentials')} className="hover:text-[#0A5C36] transition-colors">
                  Home Essentials
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div>
            <h4 className="text-base font-bold text-gray-900 tracking-tight mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <button onClick={() => onOpenPolicy('contact')} className="hover:text-[#0A5C36] transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('help')} className="hover:text-[#0A5C36] transition-colors">
                  Help Center
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('about')} className="hover:text-[#0A5C36] transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('careers')} className="hover:text-[#0A5C36] transition-colors">
                  Careers
                </button>
              </li>
              <li>
                <button onClick={() => onOpenPolicy('track')} className="hover:text-[#0A5C36] transition-colors">
                  Track Your Shipment
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Policy */}
          <div>
            <h4 className="text-base font-bold text-gray-900 tracking-tight mb-4">
              Policy &amp; Legal
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a
                  href="/policies"
                  onClick={(e) => {
                    if (onNavigatePage) {
                      e.preventDefault();
                      onNavigatePage('policies', 'shipping');
                    }
                  }}
                  className="hover:text-[#0A5C36] transition-colors"
                >
                  Shipping &amp; Delivery Policy
                </a>
              </li>
              <li>
                <a
                  href="/policies"
                  onClick={(e) => {
                    if (onNavigatePage) {
                      e.preventDefault();
                      onNavigatePage('policies', 'returns');
                    }
                  }}
                  className="hover:text-[#0A5C36] transition-colors"
                >
                  Returns &amp; Refunds Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  onClick={(e) => {
                    if (onNavigatePage) {
                      e.preventDefault();
                      onNavigatePage('terms');
                    }
                  }}
                  className="hover:text-[#0A5C36] transition-colors"
                >
                  Terms of Service (/term)
                </a>
              </li>
              <li>
                <a
                  href="/policies"
                  onClick={(e) => {
                    if (onNavigatePage) {
                      e.preventDefault();
                      onNavigatePage('policies', 'privacy');
                    }
                  }}
                  className="hover:text-[#0A5C36] transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/policies"
                  onClick={(e) => {
                    if (onNavigatePage) {
                      e.preventDefault();
                      onNavigatePage('policies');
                    }
                  }}
                  className="hover:text-[#0A5C36] transition-colors font-medium text-[#0A5C36]"
                >
                  All Store Policies (/policies) &rarr;
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Horizontal Divider Line matching screenshot */}
        <div className="border-t border-gray-200/90 pt-8 mt-2">
          
          {/* Centered Caption */}
          <p className="text-center text-xs font-medium text-gray-500 mb-6">
            We accept the following paying methods
          </p>

          {/* Payment Badges Row (Visa, Mastercard, Amex, UnionPay, JCB, Diners, Discover, PayPal, UPI) */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl mx-auto">
            
            {/* Visa */}
            <div className="h-8 px-3 rounded bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
              <span className="font-black italic text-blue-800 text-sm tracking-wider">VISA</span>
            </div>

            {/* Mastercard */}
            <div className="h-8 px-3 rounded bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
              <div className="flex -space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500 opacity-90" />
                <div className="w-4 h-4 rounded-full bg-amber-400 opacity-90" />
              </div>
              <span className="text-[11px] font-bold text-gray-800 ml-1.5 hidden sm:inline">Mastercard</span>
            </div>

            {/* Amex */}
            <div className="h-8 px-3 rounded bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs">
              AMEX
            </div>

            {/* UPI */}
            <div className="h-8 px-3 rounded bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
              <span className="font-extrabold text-[#0A5C36] text-xs">UPI / GPay</span>
            </div>

            {/* RuPay */}
            <div className="h-8 px-3 rounded bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
              <span className="font-extrabold text-orange-600 text-xs">RuPay</span>
            </div>

            {/* JCB */}
            <div className="h-8 px-3 rounded bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
              <span className="font-bold text-blue-700 text-xs tracking-wider">JCB</span>
            </div>

            {/* Diners Club */}
            <div className="h-8 px-3 rounded bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
              <span className="font-bold text-sky-800 text-[11px]">Diners Club</span>
            </div>

            {/* Discover */}
            <div className="h-8 px-3 rounded bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
              <span className="font-bold text-orange-500 text-xs">DISCOVER</span>
            </div>

            {/* PayPal / Razorpay */}
            <div className="h-8 px-3 rounded bg-white border border-gray-200 flex items-center justify-center shadow-2xs">
              <span className="font-bold text-blue-600 text-xs">PayPal</span>
            </div>

            <div className="h-8 px-3 rounded bg-blue-900 text-white text-[11px] font-bold flex items-center justify-center shadow-2xs">
              Razorpay Secured
            </div>

            {/* Cash on Delivery Badge */}
            <div className="h-8 px-3 rounded bg-emerald-50 text-[#0A5C36] border border-emerald-300 text-[11px] font-bold flex items-center justify-center shadow-2xs">
              COD Available
            </div>

          </div>

          {/* Legal Dropshipping Platform Disclosure Notice */}
          <div className="mt-10 p-5 bg-stone-50/90 rounded-2xl border border-stone-200/80 text-left max-w-4xl mx-auto space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0A5C36] shrink-0" />
              <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
                Dropshipping Platform Transparency &amp; Fulfillment Notice
              </h5>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              <strong>About The Kerala Store:</strong> This website is an independent e-commerce dropshipping initiative operated from <strong>Kottayam, Kerala, India</strong>. Please note that this is an individual-run retail storefront utilizing the <strong>Meesho Dropshipping Platform</strong> and domestic wholesale networks.
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              <strong>Meesho Dropshipping Model:</strong> We curate high-demand products directly from verified manufacturers and wholesale sellers on the <strong>Meesho Marketplace</strong>. When you place an order, the item is sourced and fulfilled directly by the Meesho supplier network with modest markup to maintain operations.
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              <strong>Direct Supplier Shipping:</strong> Parcels are dispatched directly from supplier fulfillment centers across India using standard logistics networks (Delhivery, Shadowfax, Xpressbees, India Post). Real-time AWB tracking numbers are provided on our tracking page.
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              <strong>Return &amp; Refund Policy Governed by Meesho:</strong> Returns, replacements, and refunds are strictly subject to and governed by the specific return policy of each product as listed on Meesho (7-day window for return-eligible items; non-returnable categories cannot be returned). For any questions or returns, DM our Kerala team on Instagram: <a href="https://instagram.com/thekeralastore_" target="_blank" rel="noopener noreferrer" className="font-bold text-pink-700 hover:underline">@thekeralastore_</a>.
            </p>
          </div>

          {/* Copyright and legal footer */}
          <div className="mt-8 text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} TheKeralaStore. An independent dropshipping project based in Kottayam, Kerala. Official Support: @thekeralastore_
          </div>

        </div>

      </div>
    </footer>
  );
};


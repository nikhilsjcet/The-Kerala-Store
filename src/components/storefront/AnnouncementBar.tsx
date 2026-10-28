import React from 'react';
import { Truck } from 'lucide-react';

interface AnnouncementBarProps {
  onOpenInfoModal?: (type: 'about' | 'contact' | 'help' | 'track') => void;
  onNavigateOrders?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onOpenInfoModal, onNavigateOrders }) => {
  return (
    <div className="bg-[#0B4628] text-white text-xs sm:text-sm font-medium py-2 px-4 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Free Shipping on orders over ₹499 */}
        <div className="flex items-center space-x-2 text-white">
          <Truck className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="tracking-normal font-normal text-xs sm:text-sm">
            Free Shipping on orders over <strong className="font-semibold text-white">₹499</strong>
          </span>
        </div>

        {/* Right: About | Contact | Help Center | Track Order */}
        <div className="flex items-center space-x-5 sm:space-x-8 text-white/90 text-xs sm:text-sm">
          <button 
            onClick={() => onOpenInfoModal?.('about')} 
            className="hover:text-emerald-200 transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => onOpenInfoModal?.('contact')} 
            className="hover:text-emerald-200 transition-colors"
          >
            Contact
          </button>
          <button 
            onClick={() => onOpenInfoModal?.('help')} 
            className="hover:text-emerald-200 transition-colors"
          >
            Help Center
          </button>
          <button 
            onClick={() => onNavigateOrders ? onNavigateOrders() : onOpenInfoModal?.('track')} 
            className="hover:text-emerald-200 transition-colors font-medium text-emerald-300"
          >
            Track Order
          </button>
        </div>

      </div>
    </div>
  );
};

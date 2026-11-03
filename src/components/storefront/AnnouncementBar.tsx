import React from 'react';
import { Truck } from 'lucide-react';

interface AnnouncementBarProps {
  onOpenInfoModal?: (type: 'about' | 'contact' | 'help' | 'track') => void;
  onNavigateOrders?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onOpenInfoModal, onNavigateOrders }) => {
  return (
    <div className="hidden md:block bg-[#0B4628] text-white text-xs sm:text-sm font-medium py-2 px-4 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Storefront Express Delivery Badge */}
        <div className="flex items-center gap-2 text-emerald-100 text-xs font-semibold">
          <Truck className="w-3.5 h-3.5 text-emerald-300" />
          <span>Express Doorstep Delivery Across India • Real-Time Order Tracking</span>
        </div>

        {/* Right: About | Contact | Help Center | Track Order */}
        <div className="flex items-center space-x-5 sm:space-x-8 text-white/90 text-xs sm:text-sm">
          <button 
            onClick={() => onOpenInfoModal?.('about')} 
            className="hover:text-emerald-200 transition-colors cursor-pointer"
          >
            About
          </button>
          <button 
            onClick={() => onOpenInfoModal?.('contact')} 
            className="hover:text-emerald-200 transition-colors cursor-pointer"
          >
            Contact
          </button>
          <button 
            onClick={() => onOpenInfoModal?.('help')} 
            className="hover:text-emerald-200 transition-colors cursor-pointer"
          >
            Help Center
          </button>
          <button 
            onClick={() => onNavigateOrders ? onNavigateOrders() : onOpenInfoModal?.('track')} 
            className="hover:text-emerald-200 transition-colors font-bold text-emerald-300 cursor-pointer flex items-center gap-1.5"
          >
            <span>Track Order</span>
          </button>
        </div>

      </div>
    </div>
  );
};

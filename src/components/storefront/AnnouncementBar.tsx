import React from 'react';

interface AnnouncementBarProps {
  onOpenInfoModal?: (type: 'about' | 'contact' | 'help' | 'track') => void;
  onNavigateOrders?: () => void;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ onOpenInfoModal, onNavigateOrders }) => {
  return (
    <div className="hidden md:block bg-[#0B4628] text-white text-xs sm:text-sm font-medium py-2 px-4 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-end gap-4">
        
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
            className="hover:text-emerald-200 transition-colors font-medium text-emerald-300 cursor-pointer"
          >
            Track Order
          </button>
        </div>

      </div>
    </div>
  );
};

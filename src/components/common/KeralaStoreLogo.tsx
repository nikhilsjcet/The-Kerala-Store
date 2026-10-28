import React from 'react';

interface KeralaStoreLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  useImage?: boolean;
}

export const KeralaCartIcon: React.FC<{ className?: string; color?: string }> = ({ 
  className = 'w-10 h-10',
  color = '#0D482B'
}) => (
  // Stylized shopping cart mark holding Kerala map and green leaf sprout
  <svg 
    viewBox="0 0 120 100" 
    fill="none" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shopping Cart Frame */}
    <path 
      d="M10 20 L24 20 L42 66 L88 66 L102 30 L32 30" 
      stroke={color} 
      strokeWidth="7" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Cart Wheels */}
    <circle cx="48" cy="82" r="7" fill={color} />
    <circle cx="82" cy="82" r="7" fill={color} />

    {/* Kerala Map Silhouette inside the cart */}
    <g transform="translate(44, 16) scale(0.24)">
      <path 
        d="M45,8 C40,15 36,26 33,38 C30,50 32,60 36,72 C40,84 48,96 52,108 C56,120 54,132 50,144 C45,158 40,172 38,188 C36,200 40,214 44,226 C46,232 44,236 40,238 C37,235 34,228 32,220 C28,206 24,192 22,176 C20,160 21,146 24,132 C28,118 32,104 29,90 C26,76 18,64 16,50 C14,38 18,26 24,16 C28,10 36,4 42,2 C46,2 47,4 45,8 Z" 
        fill={color} 
      />
    </g>

    {/* Green leaf sprout inside cart */}
    <g transform="translate(64, 10)">
      <path 
        d="M6 16 C6 16 7 10 12 8 C8 6 7 1 7 1 C7 1 6 6 1 8 C6 10 6 16 6 16 Z" 
        fill="#22C55E" 
      />
      <circle cx="10" cy="5" r="2.5" fill="#16A34A" />
    </g>
  </svg>
);

export const KeralaStoreLogo: React.FC<KeralaStoreLogoProps> = ({ 
  size = 'md', 
  className = '',
  useImage = true
}) => {
  // If useImage is true (default), use the transparent brand logo image from the official design mockup
  if (useImage) {
    const isHero = size === 'lg' || size === 'xl';
    const imgSrc = isHero 
      ? '/mockup/thekeralastore-logo-hero-clean-transparent.png' 
      : '/mockup/thekeralastore-logo-transparent.png';

    const sizeClasses = {
      sm: 'h-8 sm:h-9',
      md: 'h-10 sm:h-11',
      lg: 'h-12 sm:h-14 lg:h-16',
      xl: 'h-16 sm:h-20',
    };

    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        <img
          src={imgSrc}
          alt="TheKeralaStore"
          className={`${sizeClasses[size]} w-auto object-contain drop-shadow-2xs`}
          loading="eager"
        />
      </div>
    );
  }

  // Fallback vector SVG version
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-4xl sm:text-5xl',
  };

  return (
    <div className={`flex items-center space-x-2 select-none ${className}`}>
      <KeralaCartIcon className={iconSizes[size]} color="#0D482B" />
      
      <div className="flex items-baseline leading-none">
        <span className={`font-black tracking-tight ${textSizes[size]} text-black`}>
          The<span className="text-[#0D482B]">Kera</span><span className="relative inline-block text-[#0D482B]">
            l
            {/* Green leaf sprout on letter 'l' */}
            <span className="absolute -top-2 -right-1.5 pointer-events-none flex items-center">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 21C12 21 13 14 19 12C13 10 12 3 12 3C12 3 11 10 5 12C11 14 12 21 12 21Z" 
                  fill="#16A34A" 
                />
                <circle cx="17" cy="8" r="3" fill="#22C55E" />
              </svg>
            </span>
            a
          </span>Store
        </span>
        <span className="text-[10px] sm:text-xs font-bold text-gray-700 ml-0.5 relative -top-2">
          ™
        </span>
      </div>
    </div>
  );
};

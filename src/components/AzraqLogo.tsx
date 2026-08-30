import React from 'react';

interface AzraqLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'emblem' | 'icon-only' | 'badge';
  showText?: boolean;
}

export const AzraqLogo: React.FC<AzraqLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'emblem',
  showText = false,
}) => {
  // Compute pixel dimensions
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs': return 28;
      case 'sm': return 36;
      case 'md': return 44;
      case 'lg': return 56;
      case 'xl': return 72;
      default: return 44;
    }
  };

  const dim = getDimension();

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Official Emblem */}
      <svg
        viewBox="0 0 500 500"
        width={dim}
        height={dim}
        className="shrink-0 drop-shadow-xs transition-transform duration-200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Azraq Tours & Travels Logo"
      >
        {/* Background Circle */}
        <circle cx="250" cy="250" r="240" fill="#FFFFFF" />
        
        {/* Outer Blue Ring */}
        <circle cx="250" cy="250" r="236" fill="none" stroke="#0047BA" strokeWidth="15" />

        {/* Logo Graphic Group in Royal Blue */}
        <g fill="#0047BA">
          {/* Main Stylized 'A' with Contrail Path */}
          <path
            d="M 250,68 
               L 266,74 
               L 362,268 
               L 300,268 
               L 272,212 
               C 285,188 318,162 355,152 
               C 275,178 220,212 178,268 
               L 116,268 
               L 234,68 
               Z"
          />

          {/* Ascending Jet Airplane */}
          <g transform="translate(370, 142) rotate(32) scale(0.95)">
            <path d="M 0,-24 C 2,-24 4,-18 4,-4 L 4,14 C 4,18 2,22 0,22 C -2,22 -4,18 -4,14 L -4,-4 C -4,-18 -2,-24 0,-24 Z" />
            <path d="M 0,-4 L 28,10 L 28,14 L 0,6 L -28,14 L -28,10 Z" />
            <path d="M 0,16 L 12,22 L 12,25 L 0,21 L -12,25 L -12,22 Z" />
          </g>

          {/* AZRAQ Typography */}
          <g
            transform="translate(250, 358)"
            textAnchor="middle"
            fontFamily="'Cinzel', 'Trajan Pro', 'Baskerville', 'Times New Roman', 'Playfair Display', serif"
            fontWeight="900"
            fontSize="76"
            letterSpacing="12"
          >
            <text x="6" y="0">AZRAQ</text>
          </g>

          {/* TOURS & TRAVELS Subtitle */}
          <g
            transform="translate(250, 400)"
            textAnchor="middle"
            fontFamily="'Montserrat', 'Inter', 'Helvetica Neue', 'Arial', sans-serif"
            fontWeight="800"
            fontSize="25"
            letterSpacing="6"
          >
            <text x="3" y="0">TOURS &amp; TRAVELS</text>
          </g>

          {/* Bottom Airplane and Flanking Lines Ornament */}
          <line x1="140" y1="432" x2="225" y2="432" stroke="#0047BA" strokeWidth="2.5" strokeLinecap="round" />
          <g transform="translate(250, 432) scale(0.65)">
            <path d="M 0,-14 C 1.5,-14 2.5,-10 2.5,-2 L 2.5,8 C 2.5,11 1.5,13 0,13 C -1.5,13 -2.5,11 -2.5,8 L -2.5,-2 C -2.5,-10 -1.5,-14 0,-14 Z" />
            <path d="M 0,-2 L 18,6 L 18,9 L 0,4 L -18,9 L -18,6 Z" />
            <path d="M 0,9 L 8,13 L 8,15 L 0,12 L -8,15 L -8,13 Z" />
          </g>
          <line x1="275" y1="432" x2="360" y2="432" stroke="#0047BA" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>

      {/* Optional Side Text */}
      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#073B4C] font-sans">
            AZRAQ TRIPS
          </span>
          <span className="text-[10px] sm:text-[11px] text-[#0047BA] font-bold tracking-wider uppercase">
            Tours &amp; Travels
          </span>
        </div>
      )}
    </div>
  );
};

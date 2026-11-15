import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Star,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Destination } from '../types';
import { POPULAR_BANGLADESHI_DESTINATIONS } from '../data/popularBangladeshiDestinations';
import { VisaQuoteModal } from './VisaQuoteModal';
import { useAuth } from '../context/AuthContext';
import { getVisaFeeForDestination } from '../data/visaRequirementsData';
import { getOptimizedUnsplashUrl, getUnsplashSrcSet } from '../utils/imageOptimization';

interface PopularBDDestinationsSectionProps {
  onSelectDestination: (destination: Destination) => void;
  onPlanTripPrompt?: (promptText: string) => void;
}

export const PopularBDDestinationsSection: React.FC<PopularBDDestinationsSectionProps> = ({
  onSelectDestination,
}) => {
  const { requireAuth } = useAuth();
  
  // State for sub-modals (Visa quote directly from card)
  const [visaModalCountry, setVisaModalCountry] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filterCategories = [
    { id: 'All', label: 'All Popular' },
    { id: 'Beach', label: '🏖️ Beach & Islands' },
    { id: 'Family', label: '👨‍👩‍👧‍👦 Family Escapes' },
    { id: 'City', label: '🏙️ City & Shopping' },
    { id: 'Visa-friendly', label: '⚡ Visa-Friendly' },
  ];

  // Specific rationale and pricing metadata for Bangladeshi travelers
  const destinationReasons: Record<string, { reason: string; tripType: string; startingPriceBDT: string }> = {
    'Maldives': {
      reason: 'Ideal for honeymooners & romantic beach getaways with crystal turquoise lagoons.',
      tripType: 'Beach & Honeymoon',
      startingPriceBDT: 'BDT 85,000*',
    },
    'Dubai': {
      reason: 'Perfect for family vacations, desert safaris, and luxury retail experiences.',
      tripType: 'Family & City Wonder',
      startingPriceBDT: 'BDT 68,000*',
    },
    'Kuala Lumpur': {
      reason: 'Best for budget-friendly city breaks, vibrant street food, and retail shopping.',
      tripType: 'Shopping & Culture',
      startingPriceBDT: 'BDT 55,000*',
    },
    'Bangkok': {
      reason: 'Famous for bustling night markets, cultural temples, and flavorful street cuisine.',
      tripType: 'Food & Sightseeing',
      startingPriceBDT: 'BDT 48,000*',
    },
  };

  // Featured 4 core destinations matching the primary editorial list: Maldives, Dubai, Kuala Lumpur, Bangkok
  const featuredFourDestinations = useMemo(() => {
    const keyNames = ['Maldives', 'Dubai', 'Kuala Lumpur', 'Bangkok'];
    const matched = keyNames.map((name) =>
      POPULAR_BANGLADESHI_DESTINATIONS.find((d) =>
        d.name.toLowerCase().includes(name.toLowerCase()) || d.country.toLowerCase().includes(name.toLowerCase())
      )
    ).filter(Boolean) as Destination[];

    let list = matched.length >= 4 ? matched.slice(0, 4) : POPULAR_BANGLADESHI_DESTINATIONS.slice(0, 4);

    if (selectedFilter === 'Beach') {
      return list.filter((d) => d.name === 'Maldives');
    }
    if (selectedFilter === 'Family') {
      return list.filter((d) => d.name === 'Dubai' || d.name === 'Kuala Lumpur');
    }
    if (selectedFilter === 'City') {
      return list.filter((d) => d.name === 'Bangkok' || d.name === 'Kuala Lumpur' || d.name === 'Dubai');
    }
    if (selectedFilter === 'Visa-friendly') {
      return list.filter((d) => d.name === 'Maldives' || d.name === 'Kuala Lumpur');
    }

    return list;
  }, [selectedFilter]);

  const handleOpenVisaQuote = (countryName: string) => {
    requireAuth(
      { type: 'submit_quote', label: `Visa quote for ${countryName}` },
      () => setVisaModalCountry(countryName)
    );
  };

  return (
    <section className="w-full flex flex-col gap-6 my-6" id="popular-destinations">
      {/* Section Header with exact heading and Right-aligned "View all destinations" */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-sky-400/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D6EFD]/15 border border-[#0D6EFD]/30 text-[#00d2ff] text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-[#22C7C9]" />
            <span>Top Escapes for Bangladeshi Travelers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif-display font-extrabold text-white tracking-tight">
            Popular destinations for Bangladeshi travelers
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Handpicked places, unforgettable experiences.
          </p>
        </div>

        <button
          onClick={() => {
            const hub = document.getElementById('destination-hub');
            hub?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#22C7C9] hover:text-white transition-colors cursor-pointer shrink-0 self-start sm:self-end"
        >
          <span>View all destinations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        {filterCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              selectedFilter === cat.id
                ? 'bg-[#0D6EFD] text-white shadow-md shadow-blue-500/25 border border-blue-400'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of 4 Equal-width Destination Cards in One Row (Desktop 4 cols, Tablet 2 cols, Mobile 1 col) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto w-full">
        {featuredFourDestinations.map((dest) => {
          const reasonMeta = destinationReasons[dest.name] || {
            reason: dest.description,
            tripType: dest.category || 'Holiday',
            startingPriceBDT: dest.priceRange || 'Starting from BDT 50,000*',
          };

          return (
              <div
                key={`featured-${dest.id}`}
                role="button"
                tabIndex={0}
                aria-label={`Explore destination: ${dest.name}, ${dest.country}`}
                onClick={() => onSelectDestination(dest)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDestination(dest);
                  }
                }}
                className="group relative rounded-none overflow-hidden h-[420px] sm:h-[440px] cursor-pointer shadow-lg hover:shadow-2xl border border-slate-200/40 transition-all duration-500 flex flex-col justify-between p-5 bg-[#071A33] hover:-translate-y-1"
              >
                {/* Full-bleed background image */}
                <img
                  src={getOptimizedUnsplashUrl(dest.imageUrl, 600, 80)}
                  srcSet={getUnsplashSrcSet(dest.imageUrl, [300, 600, 800], 80)}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                  alt={`Travel destination ${dest.name}, ${dest.country}`}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Dark gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071A33] via-[#071A33]/60 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#071A33]/50 via-transparent to-transparent pointer-events-none" />
                
                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between gap-2 w-full">
                  <div className="px-2.5 py-1 rounded-full bg-[#071A33]/80 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-1.5 shadow-md">
                    <MapPin className="w-3 h-3 text-[#22C7C9]" />
                    <span>{dest.cityRegion || dest.country}</span>
                  </div>

                  {dest.rating && dest.rating > 0 && (
                    <div className="px-2 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1 border border-white/15 shadow-sm">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{dest.rating}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Overlay Info */}
                <div className="relative z-10 space-y-2.5 text-white">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#22C7C9] mb-0.5">
                      <span className="font-semibold uppercase tracking-wider text-[10px]">{dest.country}</span>
                      <span className="text-[10px] text-white/70">{reasonMeta.tripType}</span>
                    </div>
                    <h3
                      className="text-xl font-extrabold text-white group-hover:text-teal-200 transition-colors line-clamp-1"
                    >
                      {dest.name}
                    </h3>
                    <p className="text-xs text-slate-200/90 line-clamp-2 mt-0.5 leading-relaxed font-light">
                      {reasonMeta.reason}
                    </p>
                  </div>

                  {/* Pricing & Visa Row */}
                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                    <div>
                      {reasonMeta.startingPriceBDT && (
                        <span className="font-bold text-white font-mono text-xs">{reasonMeta.startingPriceBDT}</span>
                      )}
                    </div>
                    {dest.visaFee && (
                      <span className="text-[11px] font-semibold text-[#22C7C9]">
                        Visa: {dest.visaFee}
                      </span>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#22C7C9] group-hover:text-white flex items-center gap-1 transition-colors">
                      <span>Explore Destination</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVisaModalCountry(dest.country);
                      }}
                      className="text-[11px] font-medium text-white/80 hover:text-white underline underline-offset-2 cursor-pointer"
                    >
                      Visa Assistance
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      {/* Footnote on Pricing & Availability */}
      <p className="text-[11px] text-slate-400 text-center max-w-2xl mx-auto pt-1">
        *Starting package prices are per person on twin-sharing basis. Seasonal availability, hotel class, government taxes, and embassy visa fees may affect the final quotation.
      </p>

      {/* Sub-Modals for direct card actions */}
      {visaModalCountry && (
        <VisaQuoteModal
          isOpen={!!visaModalCountry}
          onClose={() => setVisaModalCountry(null)}
          initialCountry={visaModalCountry}
        />
      )}
    </section>
  );
};


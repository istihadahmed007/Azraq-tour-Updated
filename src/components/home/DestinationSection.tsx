import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MapPin, Star, Plane, ChevronRight } from 'lucide-react';
import { Destination } from '../../types';
import { POPULAR_AIRPORTS, BANGLADESH_AIRPORTS } from '../../data/flightsData';
import { FlightSearchParams } from '../AzraqTripFinder';

interface DestinationSectionProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onQuickGenerateItinerary: (destName: string) => void;
  onSearchFlights?: (params: FlightSearchParams) => void;
  onNavigateToDestinations?: () => void;
}

export const DestinationSection: React.FC<DestinationSectionProps> = ({
  destinations,
  onSelectDestination,
  onQuickGenerateItinerary,
  onSearchFlights,
  onNavigateToDestinations,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const curatedList = [
    {
      id: 'dest-bangkok',
      name: 'Bangkok',
      country: 'Thailand',
      code: 'BKK',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
      routeTag: 'Direct Flight · 2h 30m',
      visaType: 'Sticker / eVisa Available',
    },
    {
      id: 'dest-dubai',
      name: 'Dubai',
      country: 'UAE',
      code: 'DXB',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
      routeTag: 'Direct Hub · 5h 15m',
      visaType: '30/60-Day Tourist Visa',
    },
    {
      id: 'dest-kuala-lumpur',
      name: 'Kuala Lumpur',
      country: 'Malaysia',
      code: 'KUL',
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
      routeTag: 'Direct Route · 3h 45m',
      visaType: 'eVisa Support',
    },
    {
      id: 'dest-maldives',
      name: 'Maldives',
      country: 'Maldives',
      code: 'MLE',
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
      routeTag: 'Direct / 1-Stop',
      visaType: 'Free 30-Day On Arrival',
    },
  ];

  const handleCardClick = (destName: string) => {
    const found = destinations.find(
      (d) =>
        d.name.toLowerCase().includes(destName.toLowerCase()) ||
        d.country.toLowerCase().includes(destName.toLowerCase())
    );
    if (found) {
      onSelectDestination(found);
    } else {
      onQuickGenerateItinerary(destName);
    }
  };

  const handleFlightClick = (destCode: string) => {
    if (!onSearchFlights) return;
    const destAirport = POPULAR_AIRPORTS.find((a) => a.code === destCode) || POPULAR_AIRPORTS[4];
    const depDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const retDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    onSearchFlights({
      tripType: 'round',
      origin: BANGLADESH_AIRPORTS[0], // DAC
      destination: destAirport,
      departureDate: depDate,
      returnDate: retDate,
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'Economy',
      currency: 'BDT',
    });
  };

  const featuredDest = curatedList[0]; // Bangkok
  const supportingDests = curatedList.slice(1); // Dubai, Kuala Lumpur, Maldives

  return (
    <section id="popular-destinations" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/50 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#17BEBB]">
            <MapPin className="w-3.5 h-3.5" />
            <span>Curated Asian Routes</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#071A33] tracking-[-0.025em]">
            Featured Destinations
          </h2>
          <p className="text-sm text-slate-600 font-sans">
            Handpicked escapes with direct flights from Dhaka, seamless visas, and verified stays.
          </p>
        </div>

        {onNavigateToDestinations && (
          <button
            onClick={onNavigateToDestinations}
            type="button"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#071A33] hover:text-[#17BEBB] transition-colors cursor-pointer self-start sm:self-auto min-h-[44px] px-4 py-2 rounded-xl bg-white/40 hover:bg-white/70 backdrop-blur-md border border-white/50"
          >
            <span>View All Destinations</span>
            <ChevronRight className="w-4 h-4 text-[#17BEBB]" />
          </button>
        )}
      </div>

      {/* Asymmetric Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Large Featured Story Destination (Span 7) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="lg:col-span-7 group relative rounded-3xl overflow-hidden min-h-[420px] sm:min-h-[500px] flex flex-col justify-end p-6 sm:p-10 cursor-pointer shadow-lg border border-white/60 backdrop-blur-md"
          onClick={() => handleCardClick(featuredDest.name)}
        >
          <img
            src={featuredDest.imageUrl}
            alt={featuredDest.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#071A33]/90 via-[#071A33]/40 to-transparent" />

          {/* Content Overlay */}
          <div className="relative z-10 space-y-3.5 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
                Featured Story
              </span>
              <span className="px-3 py-1 rounded-full bg-[#17BEBB]/90 text-xs font-bold text-[#071A33]">
                {featuredDest.routeTag}
              </span>
            </div>

            <div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-white">
                {featuredDest.name}, {featuredDest.country}
              </h3>
              <p className="text-sm text-slate-200/90 font-light mt-1 max-w-md">
                Bustling night markets, tranquil floating temples, world-class shopping, and fast-track Thai visa processing.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlightClick(featuredDest.code);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#071A33] hover:bg-[#FAF8F5] text-xs font-semibold shadow-sm transition-all min-h-[44px]"
              >
                <Plane className="w-3.5 h-3.5 text-[#17BEBB]" />
                <span>Search Flights from DAC</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(featuredDest.name);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all min-h-[44px]"
              >
                <span>Explore Itinerary</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#17BEBB]" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Supporting Destinations Stack (Span 5) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
          {supportingDests.map((dest, idx) => (
            <motion.div
              key={dest.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: shouldReduceMotion ? 0 : (idx + 1) * 0.08,
                ease: 'easeOut',
              }}
              whileHover={shouldReduceMotion ? undefined : { y: -2 }}
              onClick={() => handleCardClick(dest.name)}
              className="group relative rounded-2xl overflow-hidden min-h-[160px] sm:min-h-[150px] lg:min-h-[155px] flex items-end p-5 cursor-pointer shadow-md hover:shadow-xl border border-white/60 backdrop-blur-md transition-all"
            >
              <img
                src={dest.imageUrl}
                alt={dest.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071A33]/90 via-[#071A33]/35 to-transparent" />

              <div className="relative z-10 w-full flex items-center justify-between gap-3 text-white">
                <div>
                  <span className="text-[11px] font-mono text-[#17BEBB] font-semibold block">
                    {dest.routeTag}
                  </span>
                  <h4 className="text-xl font-bold tracking-tight text-white group-hover:text-teal-200 transition-colors">
                    {dest.name}, {dest.country}
                  </h4>
                  <p className="text-xs text-slate-300 font-light mt-0.5">
                    Visa: {dest.visaType}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFlightClick(dest.code);
                  }}
                  className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-[#17BEBB] group-hover:text-[#071A33] transition-colors shrink-0 shadow-sm"
                  title="Search Flights"
                >
                  <Plane className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

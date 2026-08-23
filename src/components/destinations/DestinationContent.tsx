import React from 'react';
import {
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
  Plane,
  FileText,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Share2,
  Package,
} from 'lucide-react';
import { Destination } from '../../types';
import { SEO } from '../shared/SEO';
import { getTouristDestinationSchema, getBreadcrumbSchema, getFAQSchema, SITE_URL } from '../../lib/seo';

interface DestinationContentProps {
  destination: Destination;
  onNavigateToFlights?: (destinationName: string) => void;
  onNavigateToVisa?: (countryName: string) => void;
  onNavigateToPackages?: (destinationName: string) => void;
  onPlanTripPrompt?: (prompt: string) => void;
  className?: string;
}

export function DestinationContent({
  destination,
  onNavigateToFlights,
  onNavigateToVisa,
  onNavigateToPackages,
  onPlanTripPrompt,
  className = '',
}: DestinationContentProps) {
  const destinationUrl = `/destinations/${destination.id}`;
  const canonicalUrl = `${SITE_URL}${destinationUrl}`;

  const structuredData = [
    getTouristDestinationSchema({
      name: destination.name,
      country: destination.country,
      description: destination.description,
      imageUrl: destination.imageUrl,
      bestTimeToVisit: destination.bestTimeToVisit,
      currency: destination.currency,
      url: destinationUrl,
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Destinations', url: '/destinations' },
      { name: destination.name, url: destinationUrl },
    ]),
  ];

  return (
    <div className={`space-y-12 ${className}`}>
      <SEO
        title={`${destination.name}, ${destination.country} Travel Guide 2026`}
        description={`Complete travel guide to ${destination.name}, ${destination.country}. Visa requirements for Bangladeshi citizens, direct flights from Dhaka, top attractions, and budget estimates.`}
        canonical={canonicalUrl}
        ogImage={destination.imageUrl}
        structuredData={structuredData}
      />

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[360px] sm:min-h-[420px] flex items-end p-6 sm:p-10 lg:p-12">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#febb02] text-[#002244] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {destination.category || 'Popular Destination'}
            </span>
            <span className="text-white/80 text-xs flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#febb02]" /> {destination.country}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            {destination.name}
          </h1>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed line-clamp-3">
            {destination.description}
          </p>

          {/* Quick Stat Strip */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs sm:text-sm text-slate-200 border-t border-white/20 pt-4">
            {destination.bestTimeToVisit && (
              <div>
                <span className="text-white/60 block text-[11px]">Best Time</span>
                <span className="font-semibold">{destination.bestTimeToVisit}</span>
              </div>
            )}
            {destination.flightDuration && (
              <div>
                <span className="text-white/60 block text-[11px]">Flight from Dhaka</span>
                <span className="font-semibold">{destination.flightDuration}</span>
              </div>
            )}
            {destination.priceRange && (
              <div>
                <span className="text-white/60 block text-[11px]">Trip Budget (per person)</span>
                <span className="font-semibold text-[#febb02]">{destination.priceRange}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: In-depth Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Overview & Why Visit */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Why Visit {destination.name}
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base mb-6">
              {destination.description}
            </p>

            {destination.highlights && destination.highlights.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[#006ce4]">
                  Key Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {destination.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-800 font-medium">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Top Attractions */}
          {((destination.attractions && destination.attractions.length > 0) ||
            (destination.popularAttractions && destination.popularAttractions.length > 0)) && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Top Attractions & Landmarks
              </h2>
              <div className="space-y-3">
                {(destination.attractions || destination.popularAttractions || []).map((att, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-blue-50 text-[#006ce4] text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-slate-900 text-sm">{att}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">Must Visit</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Visa Info Strip */}
          {destination.visaInfo && (
            <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#006ce4] text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Visa Information for Bangladeshi Citizens
                  </h3>
                  <p className="text-xs text-slate-600">Verified official consular requirements</p>
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mt-2">{destination.visaInfo}</p>
              <button
                onClick={() => onNavigateToVisa && onNavigateToVisa(destination.country)}
                className="mt-4 inline-flex items-center gap-2 bg-[#006ce4] hover:bg-[#0057b8] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                <span>View Full {destination.country} Visa Checklist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </section>
          )}
        </div>

        {/* Right Column: Interactive CTAs & Quick Booking */}
        <div className="space-y-6">
          {/* AI Trip Planner Card */}
          <div className="bg-[#002244] text-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#febb02]">
              <Sparkles className="w-4 h-4" />
              <span>AI Trip Concierge</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-2">
              Plan Your {destination.name} Trip in 30 Seconds
            </h3>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed">
              Get an instant day-by-day custom itinerary with verified flight routes from Dhaka and realistic BDT budget estimates.
            </p>
            <button
              onClick={() =>
                onPlanTripPrompt &&
                onPlanTripPrompt(`Plan a 5-day trip to ${destination.name}, ${destination.country} from Dhaka with top sights and budget.`)
              }
              className="mt-5 w-full bg-[#febb02] hover:bg-[#e5a802] text-[#002244] font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Itinerary for {destination.name}</span>
            </button>
          </div>

          {/* Direct Flights CTA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-[#006ce4] text-xs font-bold uppercase">
              <Plane className="w-4 h-4" />
              <span>Flight Booking</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Flights to {destination.name}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Compare live airfares from Dhaka (DAC) on Emirates, Singapore Airlines, Thai Airways, and Biman Bangladesh.
            </p>
            <button
              onClick={() => onNavigateToFlights && onNavigateToFlights(destination.name)}
              className="mt-4 w-full bg-[#006ce4] hover:bg-[#0057b8] text-white text-xs font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plane className="w-4 h-4" />
              <span>Search Flights to {destination.name}</span>
            </button>
          </div>

          {/* Holiday Packages CTA */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-emerald-600 text-xs font-bold uppercase">
              <Package className="w-4 h-4" />
              <span>Holiday Packages</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              All-Inclusive {destination.name} Packages
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Browse curated holiday deals with verified hotels, airport transfers, sightseeing tours, and visa support.
            </p>
            <button
              onClick={() => onNavigateToPackages && onNavigateToPackages(destination.name)}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Tour Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DestinationContent;

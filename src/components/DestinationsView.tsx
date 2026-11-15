import React, { useState, useMemo } from 'react';
import { Destination } from '../types';
import { Search, MapPin, ArrowRight, Star, Sparkles, Filter, Globe, RotateCcw } from 'lucide-react';
import { getOptimizedUnsplashUrl, getUnsplashSrcSet } from '../utils/imageOptimization';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';
import { getBreadcrumbSchema, SITE_URL } from '../lib/seo';

interface DestinationsViewProps {
  destinations: Destination[];
  onSelectDestination: (destination: Destination) => void;
  onPlanTripPrompt: (promptText: string) => void;
}

export const DestinationsView: React.FC<DestinationsViewProps> = ({
  destinations,
  onSelectDestination,
  onPlanTripPrompt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');

  const categories = ['All', 'Beach', 'City', 'Culture', 'Nature', 'Luxury'];

  const countries = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => {
      if (d.country && d.country.trim()) set.add(d.country.trim());
    });
    return ['All', ...Array.from(set).sort()];
  }, [destinations]);

  const filteredDestinations = useMemo(() => {
    return destinations.filter((d) => {
      const matchCat = selectedCategory === 'All' || d.category === selectedCategory;
      const matchCountry = selectedCountry === 'All' || d.country === selectedCountry;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        (d.cityRegion && d.cityRegion.toLowerCase().includes(q)) ||
        d.description.toLowerCase().includes(q);
      return matchCat && matchCountry && matchQuery;
    });
  }, [destinations, selectedCategory, selectedCountry, searchQuery]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedCountry('All');
  };

  const canonicalUrl = `${SITE_URL}/destinations`;

  const structuredData = [
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Destinations', url: '/destinations' },
    ]),
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-fadeIn">
      <SEOHead
        title="Top Travel Destinations for Bangladeshi Tourists – AzraqTrips"
        description="Discover top vacation destinations for Bangladeshi travelers. Direct flights from Dhaka, BDT budget calculators, visa guidelines, and seasonal weather forecasts."
        canonical={canonicalUrl}
        keywords={[
          'Travel destinations Bangladesh',
          'Tour packages Dhaka',
          'Best holiday spots for Bangladeshis',
          'Malaysia Thailand Bali Singapore Dubai travel',
        ]}
        structuredData={structuredData}
      />

      <Breadcrumbs
        items={[
          { name: 'Home', url: '/' },
          { name: 'Destinations' },
        ]}
      />

      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#0D6EFD] text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5" />
          <span>Destination Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#071A33] tracking-tight">
          Explore Asian Destinations
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Handcrafted escapes with verified visa guidelines, seasonal weather forecasts, and direct flights from Dhaka.
        </p>
      </div>

      {/* Filter and Search Bar with Country Selector */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-white/70 backdrop-blur-xl p-4 rounded-none border border-slate-200/80 shadow-[0_8px_32px_rgba(7,26,51,0.05)]">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city or country (e.g. Bali, Bangkok, Dubai)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-none bg-white/80 border border-slate-200 text-sm text-[#071A33] placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#0D6EFD]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Country Selector Dropdown */}
          <div className="relative min-w-[170px]">
            <label htmlFor="country-selector" className="sr-only">Filter by Country</label>
            <select
              id="country-selector"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-none bg-white/80 border border-slate-200 text-xs sm:text-sm font-semibold text-[#071A33] focus:bg-white focus:outline-none focus:border-[#0D6EFD] cursor-pointer shadow-xs"
            >
              <option value="All">All Countries ({countries.length - 1})</option>
              {countries.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-none text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0D6EFD] text-white font-bold shadow-xs'
                    : 'bg-white/80 text-slate-700 hover:bg-white hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Clear Filters Reset Button */}
          {(searchQuery || selectedCategory !== 'All' || selectedCountry !== 'All') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Full-Bleed Photographic Destination Cards (Square Corners: border-radius: 0) */}
      {filteredDestinations.length === 0 ? (
        <div className="text-center py-16 bg-white/70 backdrop-blur-xl rounded-none border border-slate-200/80 p-8 space-y-3 shadow-[0_8px_32px_rgba(7,26,51,0.05)]">
          <p className="text-base font-bold text-slate-700">No destinations found</p>
          <p className="text-xs text-slate-500">
            Try adjusting your search criteria, country selector, or category filter.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-none bg-blue-50 text-[#0D6EFD] font-bold text-xs hover:bg-blue-100 cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest) => (
            <div
              key={dest.id}
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
              className="group relative rounded-none overflow-hidden h-[460px] sm:h-[480px] cursor-pointer shadow-md hover:shadow-2xl border border-slate-200/40 transition-all duration-500 flex flex-col justify-between p-6 bg-[#071A33]"
            >
              {/* Full-bleed photograph occupying 100% width and 100% height */}
              <img
                src={getOptimizedUnsplashUrl(dest.imageUrl, 800, 80)}
                srcSet={getUnsplashSrcSet(dest.imageUrl, [400, 600, 800, 1200], 80)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                alt={`Travel photograph of ${dest.name}, ${dest.country}`}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover rounded-none group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80';
                }}
              />

              {/* Multi-stage dark gradient overlays for impeccable typography contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#071A33] via-[#071A33]/65 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#071A33]/55 via-transparent to-transparent pointer-events-none" />

              {/* Top Badges (Category & Rating) */}
              <div className="relative z-10 flex items-center justify-between gap-2 w-full">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {dest.category && (
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 uppercase tracking-wider">
                      {dest.category}
                    </span>
                  )}
                  {dest.badge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#17BEBB] text-[10px] font-extrabold text-[#071A33] uppercase tracking-wide">
                      {dest.badge}
                    </span>
                  )}
                </div>

                {typeof dest.rating === 'number' && dest.rating > 0 && (
                  <div className="px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 border border-white/15 shadow-sm shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{dest.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Bottom Editorial Content Overlay */}
              <div className="relative z-10 space-y-3 text-white">
                {/* Location / Country */}
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#17BEBB]">
                  <MapPin className="w-3.5 h-3.5 text-[#17BEBB] shrink-0" />
                  <span>{dest.country}</span>
                  {dest.cityRegion && (
                    <span className="text-white/60 font-normal">· {dest.cityRegion}</span>
                  )}
                </div>

                {/* Destination Name */}
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug group-hover:text-teal-200 transition-colors">
                    {dest.name}
                  </h3>
                  {dest.description && (
                    <p className="text-xs sm:text-sm text-slate-200/90 font-light line-clamp-2 mt-1 leading-relaxed">
                      {dest.description}
                    </p>
                  )}
                </div>

                {/* Verified Travel Info Row (Only when actual data exists) */}
                <div className="pt-2.5 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-3 text-slate-300">
                    {dest.recommendedDays && (
                      <span className="font-mono text-[11px] text-white/90">
                        {dest.recommendedDays}
                      </span>
                    )}
                    {dest.flightDuration && (
                      <span className="text-[11px] text-white/80">
                        ✈ {dest.flightDuration}
                      </span>
                    )}
                    {dest.visaFee && (
                      <span className="text-[11px] text-[#17BEBB] font-semibold">
                        Visa: {dest.visaFee}
                      </span>
                    )}
                  </div>

                  {/* Clear Explore Action */}
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-[#17BEBB] text-white hover:text-[#071A33] text-xs font-bold backdrop-blur-md border border-white/30 transition-all duration-200 shrink-0 group-hover:bg-[#17BEBB] group-hover:text-[#071A33] group-hover:border-transparent">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

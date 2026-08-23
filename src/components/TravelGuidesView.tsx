import React, { useState } from 'react';
import { TRAVEL_GUIDES, TravelGuide } from '../data/travelGuidesData';
import { Breadcrumbs } from './Breadcrumbs';
import { SEOHead } from './SEOHead';
import { getBreadcrumbSchema, SITE_URL } from '../lib/seo';
import { BookOpen, Clock, Calendar, ArrowRight, Sparkles, MapPin, Search } from 'lucide-react';

interface TravelGuidesViewProps {
  onSelectGuide: (slug: string) => void;
  onNavigateToView: (view: string) => void;
}

export const TravelGuidesView: React.FC<TravelGuidesViewProps> = ({
  onSelectGuide,
  onNavigateToView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  const countries = ['All', ...Array.from(new Set(TRAVEL_GUIDES.map((g) => g.country)))];

  const filteredGuides = TRAVEL_GUIDES.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.metaDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'All' || g.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  const canonicalUrl = `${SITE_URL}/travel-guides`;

  const structuredData = [
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Travel Guides', url: '/travel-guides' },
    ]),
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-20">
      <SEOHead
        title="Travel Guides for Bangladeshi Travelers – AzraqTrips"
        description="Comprehensive, authentic travel guides for Bangladeshi travelers. Practical visa advice, Dhaka flight routes, BDT budget breakdowns, halal dining, and itinerary suggestions."
        canonical={canonicalUrl}
        keywords={[
          'Travel guides Bangladesh',
          'Malaysia travel guide Dhaka',
          'Thailand travel guide from Bangladesh',
          'Bali travel guide Bangladesh',
          'Singapore travel guide BD',
          'Japan travel guide Dhaka',
          'Dubai travel guide Bangladesh',
        ]}
        structuredData={structuredData}
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#002B66] to-[#0759B8] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={[
              { name: 'Home', onClick: () => onNavigateToView('discover') },
              { name: 'Travel Guides' },
            ]}
            className="text-white/80 mb-6"
          />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
              <BookOpen className="w-3.5 h-3.5" />
              <span>AzraqTrips Editorial Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Travel Guides for Bangladeshi Travelers
            </h1>
            <p className="mt-3 text-sm sm:text-base text-blue-100 leading-relaxed max-w-2xl">
              Authentic destination guides written specifically for travelers departing from Dhaka. Includes official embassy visa rules, flight schedules, BDT budget guidelines, and halal food spots.
            </p>
          </div>

          {/* Search & Country Filter Bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country, city, or topic..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#38BDF8] shadow-md"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {countries.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCountry(c)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCountry === c
                      ? 'bg-white text-[#002B66] shadow-sm'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <article
              key={guide.slug}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all flex flex-col group cursor-pointer"
              onClick={() => onSelectGuide(guide.slug)}
            >
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={guide.featuredImage}
                  alt={guide.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#38BDF8]" />
                  <span>{guide.country}</span>
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{guide.readingTimeMinutes} min read</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0D6EFD] transition-colors leading-snug line-clamp-2">
                    {guide.title}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {guide.metaDescription}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0D6EFD]">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Updated {guide.modifiedDate}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredGuides.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm mt-6">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No guides found for "{searchQuery}"</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Try clearing your search query or selecting another country.</p>
          </div>
        )}
      </main>
    </div>
  );
};

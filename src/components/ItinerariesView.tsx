import React from 'react';
import { CURATED_ITINERARIES, CuratedItinerary } from '../data/itinerariesData';
import { Breadcrumbs } from './Breadcrumbs';
import { SEOHead } from './SEOHead';
import { getBreadcrumbSchema, SITE_URL } from '../lib/seo';
import { Compass, Calendar, DollarSign, Clock, ArrowRight, Sparkles, MapPin, Check } from 'lucide-react';

interface ItinerariesViewProps {
  onSelectItinerary: (slug: string) => void;
  onNavigateToView: (view: string) => void;
  onPlanTripPrompt: (prompt: string) => void;
}

export const ItinerariesView: React.FC<ItinerariesViewProps> = ({
  onSelectItinerary,
  onNavigateToView,
  onPlanTripPrompt,
}) => {
  const canonicalUrl = `${SITE_URL}/itineraries`;

  const structuredData = [
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Itineraries', url: '/itineraries' },
    ]),
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-20">
      <SEOHead
        title="Curated Travel Itineraries for Bangladeshi Travelers – AzraqTrips"
        description="Explore handpicked day-by-day travel itineraries designed for Bangladeshi travelers. 5-Day Malaysia, 7-Day Thailand, 5-Day Bali, 7-Day Japan, 4-Day Dubai, with BDT budgets and halal food spots."
        canonical={canonicalUrl}
        keywords={[
          'Travel itineraries Bangladesh',
          'Malaysia 5 day itinerary Dhaka',
          'Thailand 7 day itinerary BD',
          'Bali 5 day trip plan',
          'Japan 7 day itinerary Dhaka',
          'Dubai 4 day tour plan',
        ]}
        structuredData={structuredData}
      />

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#002B66] to-[#0759B8] text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs
            items={[
              { name: 'Home', onClick: () => onNavigateToView('discover') },
              { name: 'Itineraries' },
            ]}
            className="text-white/80 mb-6"
          />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/10">
              <Compass className="w-3.5 h-3.5" />
              <span>Curated Travel Blueprints</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Curated Itineraries for Bangladeshi Travelers
            </h1>
            <p className="mt-3 text-sm sm:text-base text-blue-100 leading-relaxed max-w-2xl">
              Complete day-by-day holiday schedules with exact BDT budget estimates, recommended flight times from Dhaka, visa checklists, and customizable AI travel plans.
            </p>
          </div>
        </div>
      </section>

      {/* Itineraries List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURATED_ITINERARIES.map((itinerary) => (
            <article
              key={itinerary.slug}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 transition-all flex flex-col group cursor-pointer"
              onClick={() => onSelectItinerary(itinerary.slug)}
            >
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={itinerary.heroImage}
                  alt={itinerary.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#38BDF8]" />
                  <span>{itinerary.country}</span>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-md bg-emerald-600/95 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{itinerary.durationDays} Days / {itinerary.durationDays - 1} Nights</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#0D6EFD] transition-colors leading-snug line-clamp-2">
                    {itinerary.title}
                  </h2>

                  <div className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg w-fit">
                    <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                    <span>Est. {itinerary.estimatedBudgetBDT}</span>
                  </div>

                  <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {itinerary.overview}
                  </p>

                  <div className="mt-4 space-y-1.5">
                    {itinerary.includedHighlights.slice(0, 3).map((hl, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0D6EFD]">
                  <span className="text-slate-500 font-medium">{itinerary.bestSeason}</span>
                  <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View Day-by-Day</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

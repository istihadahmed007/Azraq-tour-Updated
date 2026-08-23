import React from 'react';
import { CuratedItinerary } from '../data/itinerariesData';
import { Breadcrumbs } from './Breadcrumbs';
import { SEOHead } from './SEOHead';
import {
  getBreadcrumbSchema,
  SITE_URL,
} from '../lib/seo';
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Compass,
  Utensils,
} from 'lucide-react';
import { TRAVEL_GUIDES } from '../data/travelGuidesData';

interface ItineraryDetailViewProps {
  itinerary: CuratedItinerary;
  onNavigateToView: (view: string, extra?: any) => void;
  onPlanTripPrompt: (prompt: string) => void;
  onOpenVisaQuote?: (country?: string) => void;
}

export const ItineraryDetailView: React.FC<ItineraryDetailViewProps> = ({
  itinerary,
  onNavigateToView,
  onPlanTripPrompt,
  onOpenVisaQuote,
}) => {
  const itineraryUrl = `/itineraries/${itinerary.slug}`;
  const canonicalUrl = `${SITE_URL}${itineraryUrl}`;

  const relatedGuide = TRAVEL_GUIDES.find(
    (g) => g.slug === itinerary.relatedGuideSlug || g.country.toLowerCase() === itinerary.country.toLowerCase()
  );

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Trip',
      name: itinerary.title,
      description: itinerary.metaDescription,
      image: itinerary.heroImage,
      url: canonicalUrl,
      itinerary: {
        '@type': 'ItemList',
        itemListElement: itinerary.days.map((day, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: day.title,
          description: day.summary,
        })),
      },
    },
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Itineraries', url: '/itineraries' },
      { name: itinerary.title, url: itineraryUrl },
    ]),
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-20">
      <SEOHead
        title={itinerary.seoTitle}
        description={itinerary.metaDescription}
        canonical={canonicalUrl}
        ogImage={itinerary.heroImage}
        keywords={[
          `${itinerary.destination} itinerary`,
          `${itinerary.country} tour plan from Bangladesh`,
          `${itinerary.durationDays} day ${itinerary.country} trip`,
          `${itinerary.destination} budget BDT`,
        ]}
        structuredData={structuredData}
      />

      {/* Header Banner */}
      <header className="bg-white border-b border-slate-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs
            items={[
              { name: 'Home', onClick: () => onNavigateToView('discover') },
              { name: 'Itineraries', onClick: () => onNavigateToView('itineraries') },
              { name: itinerary.title },
            ]}
          />

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>{itinerary.country} • {itinerary.durationDays} Days / {itinerary.durationDays - 1} Nights</span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
            {itinerary.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pb-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{itinerary.estimatedBudgetBDT}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Best Season: {itinerary.bestSeason}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="rounded-2xl overflow-hidden shadow-lg aspect-[16/9] sm:aspect-[21/9] relative bg-slate-900">
          <img
            src={itinerary.heroImage}
            alt={itinerary.title}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Overview Card */}
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Trip Overview</h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{itinerary.overview}</p>

          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Transportation Advice</h3>
              <p className="text-xs sm:text-sm text-slate-700">{itinerary.transportationAdvice}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Visa Guidance</h3>
              <p className="text-xs sm:text-sm text-slate-700">{itinerary.visaRequirementSummary}</p>
            </div>
          </div>
        </section>

        {/* Day-by-Day Schedule */}
        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Day-by-Day Itinerary</h2>

          {itinerary.days.map((day) => (
            <div key={day.dayNumber} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#002B66] to-[#0759B8] text-white flex items-center justify-center font-black text-sm shadow-md">
                  D{day.dayNumber}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{day.title}</h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed pl-12">{day.summary}</p>

              {/* Time Slots */}
              <div className="space-y-3 pl-12 border-l-2 border-slate-100 ml-4">
                {day.spots.map((spot, sIdx) => (
                  <div key={sIdx} className="relative pl-6 pb-2">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-[#0D6EFD] border-2 border-white shadow-xs" />
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0D6EFD] bg-blue-50 px-2 py-0.5 rounded-md">
                        {spot.time}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{spot.name}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{spot.description}</p>
                    {spot.aiTip && (
                      <p className="text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-md mt-1.5 border border-amber-100 font-medium">
                        💡 <strong>Azraq Pro-Tip:</strong> {spot.aiTip}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {day.mealsRecommendation && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600 pl-12">
                  <Utensils className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Halal Food Tip:</strong> {day.mealsRecommendation}</span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* AI Itinerary Customization Callout */}
        <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#002B66] to-[#0759B8] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customize in AI Trip Planner</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Want to Adjust Dates, Budget or Spots?</h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-md">
              Load this {itinerary.destination} blueprint directly into the AI Trip Planner and adjust pace, traveler count, and hotel preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onPlanTripPrompt(`${itinerary.destination}, ${itinerary.country}`)}
            className="px-6 py-3.5 rounded-xl bg-white text-[#002B66] font-extrabold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-lg shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Open in AI Planner</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Related Guide Card */}
        {relatedGuide && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D6EFD]">Complete Country Guide</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{relatedGuide.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-1">{relatedGuide.metaDescription}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToView(`guide-${relatedGuide.slug}`)}
              className="px-5 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0D6EFD] font-bold text-xs sm:text-sm transition-all shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>Read Travel Guide</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

import React from 'react';
import { Destination } from '../types';
import { Breadcrumbs } from './Breadcrumbs';
import { SEOHead } from './SEOHead';
import {
  getTouristDestinationSchema,
  getBreadcrumbSchema,
  getFAQSchema,
  SITE_URL,
} from '../lib/seo';
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
} from 'lucide-react';
import { TRAVEL_GUIDES } from '../data/travelGuidesData';
import { CURATED_ITINERARIES } from '../data/itinerariesData';

interface DestinationSeoViewProps {
  destination: Destination;
  onNavigateToView: (view: string, extra?: any) => void;
  onPlanTripPrompt: (prompt: string) => void;
  onOpenVisaQuote?: (country?: string) => void;
}

export const DestinationSeoView: React.FC<DestinationSeoViewProps> = ({
  destination,
  onNavigateToView,
  onPlanTripPrompt,
  onOpenVisaQuote,
}) => {
  const destinationUrl = `/destinations/${destination.id}`;
  const canonicalUrl = `${SITE_URL}${destinationUrl}`;

  // Find related travel guide and itinerary
  const relatedGuide = TRAVEL_GUIDES.find(
    (g) =>
      g.relatedDestinationId === destination.id ||
      g.country.toLowerCase() === destination.country.toLowerCase()
  );
  const relatedItinerary = CURATED_ITINERARIES.find(
    (it) =>
      it.relatedDestinationId === destination.id ||
      it.country.toLowerCase() === destination.country.toLowerCase()
  );

  const destinationFaqs = [
    {
      question: `What is the best time to visit ${destination.name} from Bangladesh?`,
      answer: `The ideal season to visit ${destination.name} (${destination.country}) is during ${destination.bestTimeToVisit || 'the dry and mild season'}, when weather conditions are most favorable for sightseeing and outdoor tours.`,
    },
    {
      question: `What is the estimated budget for a trip to ${destination.name} from Dhaka?`,
      answer: `An average 4 to 6-day holiday to ${destination.name} typically ranges around ${destination.priceRange || destination.estimatedBudget || 'BDT 55,000 - 85,000'} per person, including round-trip flights from Dhaka, central accommodation, local transport, and meals.`,
    },
    {
      question: `Do Bangladeshi citizens need a visa for ${destination.country}?`,
      answer: destination.visaInfo || `Bangladeshi passport holders require a valid tourist visa or eVisa prior to traveling to ${destination.country}. Ensure your passport has at least 6 months validity from the date of travel.`,
    },
  ];

  const structuredData = [
    getTouristDestinationSchema({
      name: destination.name,
      country: destination.country,
      description: destination.description,
      imageUrl: destination.imageUrl,
      bestTimeToVisit: destination.bestTimeToVisit,
      currency: destination.currency,
      url: destinationUrl,
      rating: destination.rating,
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Destinations', url: '/destinations' },
      { name: destination.name, url: destinationUrl },
    ]),
    getFAQSchema(destinationFaqs),
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-20">
      <SEOHead
        title={`${destination.name}, ${destination.country} – Travel Guide, Flights, Budget & Visa for Bangladeshis`}
        description={`Explore ${destination.name}, ${destination.country}. Discover flight routes from Dhaka, BDT budget estimates (${destination.priceRange || destination.estimatedBudget}), best time to visit (${destination.bestTimeToVisit}), visa guidance, and top things to do.`}
        canonical={canonicalUrl}
        ogImage={destination.imageUrl}
        ogType="place"
        keywords={[
          `${destination.name} travel guide`,
          `${destination.name} from Bangladesh`,
          `${destination.country} tour package Dhaka`,
          `${destination.name} budget in BDT`,
          `${destination.name} visa for Bangladeshi`,
        ]}
        structuredData={structuredData}
      />

      {/* Hero Banner with Optimized Image */}
      <section className="relative w-full h-[380px] sm:h-[480px] lg:h-[520px] bg-slate-950 overflow-hidden">
        <img
          src={destination.imageUrl}
          alt={`${destination.name} skyline and landmark scenery in ${destination.country}`}
          className="w-full h-full object-cover opacity-75 transform scale-105 transition-transform duration-1000"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-900/30" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between py-6 sm:py-10">
          <Breadcrumbs
            items={[
              { name: 'Home', onClick: () => onNavigateToView('discover') },
              { name: 'Destinations', onClick: () => onNavigateToView('destinations') },
              { name: destination.name },
            ]}
            className="text-white/80"
          />

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold uppercase tracking-wider mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{destination.country} {destination.flag}</span>
              {destination.badge && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/50" />
                  <span className="text-[#38BDF8]">{destination.badge}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
              {destination.name}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-200 line-clamp-3 leading-relaxed max-w-2xl">
              {destination.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onPlanTripPrompt(`${destination.name}, ${destination.country}`)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1389E8] to-[#0759B8] hover:from-[#0E7FE3] hover:to-[#064B9C] text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Create AI Itinerary for {destination.name}</span>
              </button>

              {onOpenVisaQuote && (
                <button
                  type="button"
                  onClick={() => onOpenVisaQuote(destination.country)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#38BDF8]" />
                  <span>Check Visa from Dhaka</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Quick Highlights Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0D6EFD] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">Best Season</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{destination.bestTimeToVisit || 'Nov – Mar'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">Ideal Duration</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{destination.recommendedDays || '4 – 6 Days'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">Est. Budget</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">{destination.priceRange || destination.estimatedBudget || '৳55k – ৳85k'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">Visa Status</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[130px] sm:max-w-none">
                {destination.country === 'Maldives' ? 'Free 30-Day On Arrival' : 'Tourist Visa / eVisa'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center 2 Columns: In-Depth Overview, Things to Do, Visa & Tips */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Compass className="w-6 h-6 text-[#0D6EFD]" />
                <span>About {destination.name}, {destination.country}</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {destination.description}
              </p>
              {destination.localFood && destination.localFood.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Must-Try Local Culinary Specialties (Halal & Street Food)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {destination.localFood.map((food, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-orange-50 text-orange-800 text-xs font-semibold border border-orange-100"
                      >
                        🍲 {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Things to Do & Top Attractions */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>Top Attractions & Things to Do in {destination.name}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(destination.popularAttractions || destination.thingsToDo || ['Sightseeing Tour', 'City Landmark Walk', 'Shopping', 'Local Culture Experience']).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center font-bold text-xs text-[#0D6EFD] shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{item}</h3>
                      <p className="text-xs text-slate-500 mt-1">Recommended for Bangladeshi solo travelers, couples & families.</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bangladesh Traveler Advice & Visa Info */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <span>Visa & Travel Guidelines for Bangladeshi Citizens</span>
              </h2>
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-sm text-slate-700 leading-relaxed mb-6">
                <p className="font-semibold text-indigo-950 mb-1">Official Visa Information:</p>
                <p>{destination.visaInfo || `Bangladeshi passport holders traveling to ${destination.country} require a valid tourist visa or eVisa before departure. Application requirements typically include a valid passport (minimum 6 months validity), 6-month bank statement, bank solvency certificate, round-trip flight booking, and hotel reservations.`}</p>
              </div>

              {destination.travelTips && destination.travelTips.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Practical Travel Tips for Dhaka Travelers:</h3>
                  <ul className="space-y-2.5">
                    {destination.travelTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* FAQs Section */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-amber-500" />
                <span>Frequently Asked Questions about {destination.name}</span>
              </h2>
              <div className="space-y-4">
                {destinationFaqs.map((faq, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{faq.question}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: AI Trip Planner CTA, Related Guides & Itineraries */}
          <div className="space-y-6">
            {/* AI Trip Planner Card */}
            <div className="bg-gradient-to-br from-[#002B66] to-[#0759B8] rounded-2xl p-6 text-white shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="text-lg font-bold">Personalized {destination.name} AI Trip Plan</h3>
              <p className="text-xs sm:text-sm text-blue-100 mt-2 leading-relaxed">
                Generate a full day-by-day itinerary tailored to your travel dates, BDT budget, and companion preferences in seconds.
              </p>
              <button
                type="button"
                onClick={() => onPlanTripPrompt(`${destination.name}, ${destination.country}`)}
                className="w-full mt-5 py-3 rounded-xl bg-white text-[#002B66] font-bold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Generate Itinerary Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Related Travel Guide Card */}
            {relatedGuide && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0D6EFD] mb-2">
                  <FileText className="w-4 h-4" />
                  <span>Featured Travel Guide</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{relatedGuide.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{relatedGuide.metaDescription}</p>
                <button
                  type="button"
                  onClick={() => onNavigateToView(`guide-${relatedGuide.slug}`)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#0D6EFD] hover:underline cursor-pointer"
                >
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Related Curated Itinerary Card */}
            {relatedItinerary && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
                  <Compass className="w-4 h-4" />
                  <span>Recommended Itinerary</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{relatedItinerary.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{relatedItinerary.durationDays} Days • {relatedItinerary.estimatedBudgetBDT}</p>
                <button
                  type="button"
                  onClick={() => onNavigateToView(`itinerary-${relatedItinerary.slug}`)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  <span>View Day-by-Day Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Flights & Visa Quick Links */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-3">Dhaka Travel Services</h4>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onNavigateToView('flights', { params: { origin: 'DAC', destination: destination.name } })}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 text-xs font-semibold text-slate-700 hover:text-[#0D6EFD] transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-[#0D6EFD]" />
                    <span>Search Flights from Dhaka (DAC)</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {onOpenVisaQuote && (
                  <button
                    type="button"
                    onClick={() => onOpenVisaQuote(destination.country)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>{destination.country} Visa Assistance</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

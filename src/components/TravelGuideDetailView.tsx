import React from 'react';
import { TravelGuide } from '../data/travelGuidesData';
import { Breadcrumbs } from './Breadcrumbs';
import { SEOHead } from './SEOHead';
import {
  getArticleSchema,
  getBreadcrumbSchema,
  getFAQSchema,
  SITE_URL,
} from '../lib/seo';
import {
  Calendar,
  Clock,
  User,
  Plane,
  ShieldCheck,
  DollarSign,
  Utensils,
  MapPin,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Share2,
  CheckCircle2,
  Ticket,
  Car,
  Wifi,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import { CURATED_ITINERARIES } from '../data/itinerariesData';
import { AZRAQ_AFFILIATE_LINKS } from '../data/agencyConfig';

interface TravelGuideDetailViewProps {
  guide: TravelGuide;
  onNavigateToView: (view: string, extra?: any) => void;
  onPlanTripPrompt: (prompt: string) => void;
  onOpenVisaQuote?: (country?: string) => void;
}

export const TravelGuideDetailView: React.FC<TravelGuideDetailViewProps> = ({
  guide,
  onNavigateToView,
  onPlanTripPrompt,
  onOpenVisaQuote,
}) => {
  const guideUrl = `/travel-guides/${guide.slug}`;
  const canonicalUrl = `${SITE_URL}${guideUrl}`;

  const relatedItinerary = CURATED_ITINERARIES.find(
    (it) => it.slug === guide.relatedItinerarySlug || it.country.toLowerCase() === guide.country.toLowerCase()
  );

  const structuredData = [
    getArticleSchema({
      title: guide.title,
      description: guide.metaDescription,
      url: guideUrl,
      imageUrl: guide.featuredImage,
      publishedDate: guide.publishedDate,
      modifiedDate: guide.modifiedDate,
      authorName: guide.author,
    }),
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Travel Guides', url: '/travel-guides' },
      { name: guide.title, url: guideUrl },
    ]),
    getFAQSchema(guide.faqs),
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-20">
      <SEOHead
        title={guide.seoTitle}
        description={guide.metaDescription}
        canonical={canonicalUrl}
        ogImage={guide.featuredImage}
        ogType="article"
        publishedTime={guide.publishedDate}
        modifiedTime={guide.modifiedDate}
        author={guide.author}
        keywords={[
          `${guide.country} travel guide`,
          `${guide.country} from Bangladesh`,
          `${guide.country} visa Dhaka`,
          `${guide.country} budget BDT`,
          `Halal food in ${guide.country}`,
        ]}
        structuredData={structuredData}
      />

      {/* Article Header & Breadcrumbs */}
      <header className="bg-white border-b border-slate-100 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs
            items={[
              { name: 'Home', onClick: () => onNavigateToView('discover') },
              { name: 'Travel Guides', onClick: () => onNavigateToView('guides') },
              { name: guide.title },
            ]}
          />

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0D6EFD] text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>{guide.country} Travel Guide</span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
            {guide.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pb-2">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <User className="w-4 h-4 text-slate-400" />
              <span>{guide.author}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Published {guide.publishedDate} (Updated {guide.modifiedDate})</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{guide.readingTimeMinutes} min read</span>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Hero Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="rounded-2xl overflow-hidden shadow-lg aspect-[16/9] sm:aspect-[21/9] relative bg-slate-900">
          <img
            src={guide.featuredImage}
            alt={guide.imageAlt}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Main Article Content & Side Panels */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 gap-8">
        {/* Intro */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 prose prose-slate max-w-none text-slate-700 leading-relaxed text-sm sm:text-base">
          <p className="text-base sm:text-lg font-medium text-slate-900 leading-relaxed">
            {guide.intro}
          </p>

          {/* Quick Summary Grid */}
          <div className="not-prose my-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
              <Plane className="w-5 h-5 text-[#0D6EFD] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Flight from Dhaka (DAC)</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">{guide.dhakaFlightInfo}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Visa for Bangladeshi Citizens</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">{guide.visaSummary}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Estimated Budget (BDT)</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">{guide.budgetSummaryBDT}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
              <Utensils className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Halal Dining & Mosques</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">{guide.halalFoodAndPrayerInfo}</p>
              </div>
            </div>
          </div>

          {/* Section: Top Attractions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Top Attractions to Visit in {guide.destination}
            </h2>
            <a
              href={AZRAQ_AFFILIATE_LINKS.klook}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition shadow-2xs self-start sm:self-auto not-prose"
            >
              <Ticket className="w-3.5 h-3.5 text-amber-600" />
              <span>Book Tickets on Klook</span>
              <ExternalLink className="w-3 h-3 text-amber-600" />
            </a>
          </div>
          <div className="not-prose space-y-3 mb-6">
            {guide.topAttractions.map((attr, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#0D6EFD] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{attr.name}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">{attr.description}</p>
                  </div>
                </div>
                <a
                  href={AZRAQ_AFFILIATE_LINKS.klook}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200/80 inline-flex items-center gap-1 shrink-0"
                >
                  <span>Passes</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            ))}
          </div>

          {/* Section: Transportation */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-3">
            Getting Around & Local Transportation
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed mb-4">
            {guide.localTransportation}
          </p>
          <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            <a
              href={AZRAQ_AFFILIATE_LINKS.kiwitaxi}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="p-3.5 rounded-xl bg-blue-50/60 hover:bg-blue-100/60 border border-blue-200 flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-900 block">Kiwitaxi Airport Pickup</span>
                  <span className="text-[10px] text-slate-500">Terminal meetup with nameplate</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            </a>
            <a
              href={AZRAQ_AFFILIATE_LINKS.gettransfer}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="p-3.5 rounded-xl bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200 flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center gap-2.5">
                <Car className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-900 block">GetTransfer Private Cars</span>
                  <span className="text-[10px] text-slate-500">Compare driver quotes</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            </a>
          </div>

          {/* Section: Practical Tips for Bangladesh Travelers */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-4">
            Essential Travel Tips for Bangladeshi Tourists
          </h2>
          <div className="not-prose space-y-2.5 mb-6">
            {guide.bangladeshTravelTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>

          {/* Stay Connected Abroad Box */}
          <div className="not-prose p-5 rounded-2xl bg-sky-50/70 border border-sky-200 mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-sm">Stay Connected in {guide.destination} (Digital eSIM)</h3>
              </div>
              <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-full">Instant 4G/5G</span>
            </div>
            <p className="text-xs text-slate-600">
              Never worry about high roaming fees. Activate high-speed mobile data immediately upon landing while keeping your Bangladeshi SIM for WhatsApp & OTPs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <a
                href={AZRAQ_AFFILIATE_LINKS.yesim}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="py-2 px-3 rounded-lg bg-[#006ce4] hover:bg-[#0057b8] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Yesim Unlimited eSIM (Recommended)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={AZRAQ_AFFILIATE_LINKS.airalo}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Airalo Regional eSIM</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

          {/* Interactive AI Trip Planner Callout */}
          <div className="not-prose my-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#002B66] to-[#0759B8] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Travel Customization</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">Want a Tailored {guide.country} Trip?</h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-md">
                Generate an AI-powered day-by-day plan with your specific dates, BDT budget, and travel preferences.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onPlanTripPrompt(`${guide.destination}, ${guide.country}`)}
              className="px-6 py-3.5 rounded-xl bg-white text-[#002B66] font-extrabold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-lg shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>Plan {guide.country} with AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* FAQs */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-4 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-amber-500" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="not-prose space-y-4 mb-6">
            {guide.faqs.map((faq, idx) => (
              <div key={idx} className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">{faq.question}</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related Itinerary & Services Footer */}
        {relatedItinerary && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Recommended Itinerary</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{relatedItinerary.title}</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{relatedItinerary.durationDays} Days • {relatedItinerary.estimatedBudgetBDT}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToView(`itinerary-${relatedItinerary.slug}`)}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>View Full Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

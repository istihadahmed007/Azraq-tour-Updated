import React from 'react';
import { BookOpen, Clock, ArrowRight, Plane, Sparkles } from 'lucide-react';
import { TRAVEL_GUIDES, TravelGuide } from '../../data/travelGuidesData';
import { getOptimizedUnsplashUrl } from '../../utils/imageOptimization';

interface EditorialStoriesSectionProps {
  onSelectGuide?: (slug: string) => void;
  onNavigateToGuides?: () => void;
}

export const EditorialStoriesSection: React.FC<EditorialStoriesSectionProps> = ({
  onSelectGuide,
  onNavigateToGuides,
}) => {
  // Use real editorial guides from our dataset
  const featuredGuide = TRAVEL_GUIDES[0]; // Malaysia or first guide
  const secondaryGuides = TRAVEL_GUIDES.slice(1, 4); // Thailand, Bali, Singapore

  const handleGuideClick = (slug: string) => {
    if (onSelectGuide) {
      onSelectGuide(slug);
    } else if (onNavigateToGuides) {
      onNavigateToGuides();
    }
  };

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#17BEBB]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Travel Stories & Insights</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#071A33] tracking-tight font-serif-display">
            Curated Guides for Bangladeshi Travelers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-inter max-w-xl">
            Authentic, practical advice written for trips originating in Dhaka. Direct flight timings, verified embassy visa rules, and realistic BDT budgets.
          </p>
        </div>

        {onNavigateToGuides && (
          <button
            type="button"
            onClick={onNavigateToGuides}
            className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-slate-100 text-[#071A33] border border-slate-200/80 font-semibold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto"
          >
            <span>All Travel Guides</span>
            <ArrowRight className="w-4 h-4 text-[#17BEBB]" />
          </button>
        )}
      </div>

      {/* Editorial Grid: 1 Large Feature + 3 Column Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Main Featured Editorial Story */}
        {featuredGuide && (
          <div
            onClick={() => handleGuideClick(featuredGuide.slug)}
            className="lg:col-span-7 group cursor-pointer rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-900">
              <img
                src={getOptimizedUnsplashUrl(featuredGuide.featuredImage, 1000, 80)}
                alt={featuredGuide.imageAlt}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071A33]/90 via-[#071A33]/30 to-transparent" />
              
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#071A33] text-xs font-bold uppercase tracking-wider font-mono">
                  {featuredGuide.country}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#071A33]/80 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#17BEBB]" />
                  {featuredGuide.readingTimeMinutes} min read
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white space-y-2">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-normal font-serif-display leading-snug group-hover:text-[#17BEBB] transition-colors">
                  {featuredGuide.title}
                </h3>
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-4 flex-1 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-inter line-clamp-3">
                {featuredGuide.intro}
              </p>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-inter">
                  <Plane className="w-4 h-4 text-[#17BEBB]" />
                  <span className="font-medium text-slate-700">Flight:</span>
                  <span>Direct from Dhaka (DAC)</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-[#071A33] group-hover:text-[#17BEBB] transition-colors">
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Secondary Column: 3 Editorial Cards */}
        <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
          {secondaryGuides.map((guide) => (
            <div
              key={guide.slug}
              onClick={() => handleGuideClick(guide.slug)}
              className="group cursor-pointer p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#17BEBB]/40 transition-all flex items-center gap-4"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-900 relative">
                <img
                  src={getOptimizedUnsplashUrl(guide.featuredImage, 300, 75)}
                  alt={guide.imageAlt}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#17BEBB] font-mono">
                    {guide.country}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {guide.readingTimeMinutes} min read
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-[#071A33] group-hover:text-[#17BEBB] transition-colors font-inter line-clamp-2 leading-snug">
                  {guide.title}
                </h4>

                <p className="text-xs text-slate-500 line-clamp-1 font-inter">
                  {guide.destination}
                </p>
              </div>

              <div className="shrink-0 pl-1 text-slate-300 group-hover:text-[#17BEBB] transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

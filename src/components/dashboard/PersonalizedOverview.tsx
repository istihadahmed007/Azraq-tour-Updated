import React from 'react';
import { Itinerary, QuoteRequest, NavView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle2,
  Plane,
  Stamp,
  Compass,
  MessageCircle,
  Package,
  MapPin,
  Calendar,
  Activity,
  Users,
  Heart,
  ArrowRight,
  Globe,
  Clock,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';

interface PersonalizedOverviewProps {
  savedItineraries: Itinerary[];
  userQuotes: QuoteRequest[];
  savedDestinationsCount: number;
  communityPostsCount: number;
  onNavigateToTab: (tab: any) => void;
  onSelectItinerary: (itinerary: Itinerary) => void;
  onOpenFlightQuote?: () => void;
  onOpenVisaQuote?: () => void;
  onNavigate?: (view: NavView) => void;
}

export const PersonalizedOverview: React.FC<PersonalizedOverviewProps> = ({
  savedItineraries,
  userQuotes,
  savedDestinationsCount,
  communityPostsCount,
  onNavigateToTab,
  onOpenFlightQuote,
  onOpenVisaQuote,
  onNavigate,
}) => {
  const { user } = useAuth();

  const pendingQuotesCount = userQuotes.filter(
    (q) => q.status === 'Pending' || q.status === 'New' || q.status === 'Processing' || q.status === 'Reviewing'
  ).length;

  const latestQuote = userQuotes.length > 0 ? userQuotes[0] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Welcome & Traveler Identity Banner */}
      <div className="rounded-2xl p-6 sm:p-8 border border-white/12 bg-[#0F2339]/95 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/40 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Traveler Dashboard</span>
              </span>
              {user?.emailVerified && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Email</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.fullName || 'Traveler'}
            </h2>

            <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-2xl leading-relaxed">
              Your Azraq Trips travel hub. Track active flight quotes, visa processing status, custom trip itineraries, and access our 24/7 travel desk.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenFlightQuote && (
              <button
                type="button"
                onClick={onOpenFlightQuote}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
              >
                <Plane className="w-4 h-4" />
                <span>Request Flight Quote</span>
              </button>
            )}

            {onOpenVisaQuote && (
              <button
                type="button"
                onClick={onOpenVisaQuote}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white"
              >
                <Stamp className="w-4 h-4" />
                <span>Visa Assistance</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Real Metrics Grid (Strictly Authentic Data, NO Fake Numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Quotes */}
        <button
          type="button"
          onClick={() => onNavigateToTab('travel_activity')}
          className="rounded-2xl p-5 border border-white/10 bg-[#0F2339]/90 shadow-md hover:border-[#2563EB]/60 transition-all text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
        >
          <div className="flex items-center justify-between text-[#CBD5E1] mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
              Travel Quotes
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-300 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {userQuotes.length}
          </p>
          <p className="text-xs text-[#CBD5E1] mt-1">
            {pendingQuotesCount > 0 ? (
              <span className="text-[#2DD4BF] font-semibold">{pendingQuotesCount} in review</span>
            ) : (
              'All quotes processed'
            )}
          </p>
        </button>

        {/* Metric 2: Saved Itineraries */}
        <button
          type="button"
          onClick={() => onNavigateToTab('itineraries')}
          className="rounded-2xl p-5 border border-white/10 bg-[#0F2339]/90 shadow-md hover:border-[#2563EB]/60 transition-all text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
        >
          <div className="flex items-center justify-between text-[#CBD5E1] mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
              Saved Itineraries
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {savedItineraries.length}
          </p>
          <p className="text-xs text-[#CBD5E1] mt-1">Custom trip itineraries</p>
        </button>

        {/* Metric 3: Saved Destinations */}
        <button
          type="button"
          onClick={() => onNavigateToTab('saved_destinations')}
          className="rounded-2xl p-5 border border-white/10 bg-[#0F2339]/90 shadow-md hover:border-[#2563EB]/60 transition-all text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
        >
          <div className="flex items-center justify-between text-[#CBD5E1] mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
              Wishlist Spots
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-[#2DD4BF] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {savedDestinationsCount}
          </p>
          <p className="text-xs text-[#CBD5E1] mt-1">Saved travel destinations</p>
        </button>

        {/* Metric 4: Community Posts */}
        <button
          type="button"
          onClick={() => onNavigateToTab('community_activity')}
          className="rounded-2xl p-5 border border-white/10 bg-[#0F2339]/90 shadow-md hover:border-[#2563EB]/60 transition-all text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
        >
          <div className="flex items-center justify-between text-[#CBD5E1] mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
              Community Posts
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white">
            {communityPostsCount}
          </p>
          <p className="text-xs text-[#CBD5E1] mt-1">Stories & travel buddies</p>
        </button>
      </div>

      {/* 3. Latest Active Journey / Status Callout */}
      {latestQuote && (
        <div className="rounded-2xl p-6 border border-white/12 bg-[#0F2339]/95 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2563EB]/20 text-[#2DD4BF] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Latest Active Quotation
                </h3>
                <span className="text-xs text-[#CBD5E1] font-mono">Ref: {latestQuote.id}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('travel_activity')}
              className="text-xs font-bold text-[#2DD4BF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Quotes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#071426]/70 border border-white/5">
            <div className="space-y-1">
              <span className="text-sm sm:text-base font-bold text-white block">
                {latestQuote.type === 'flight'
                  ? `${latestQuote.from} ✈️ ${latestQuote.to}`
                  : `${(latestQuote as any).destinationCountry || 'International'} Visa Service`}
              </span>
              <p className="text-xs text-[#CBD5E1]">
                Submitted on {new Date(latestQuote.createdAt).toLocaleDateString()} for{' '}
                <strong className="text-white">{latestQuote.customerName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/30">
                Status: {latestQuote.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Travel Services Launchpad */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span>Azraq Travel Services</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Service 1: Flight Quotes & Engine */}
          <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4 flex flex-col justify-between hover:border-[#2563EB]/50 transition-all">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Flight Search & Offline Hold
              </h4>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                Compare verified fares on US-Bangla, Biman, Emirates, Saudia, and Singapore Airlines with offline seat hold capabilities.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              {onOpenFlightQuote && (
                <button
                  type="button"
                  onClick={onOpenFlightQuote}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Request Quote</span>
                </button>
              )}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('flights')}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#CBD5E1] text-xs font-semibold transition-colors cursor-pointer"
                  title="Open Flight Engine"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Service 2: Visa Assistance */}
          <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4 flex flex-col justify-between hover:border-[#2DD4BF]/50 transition-all">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-[#2DD4BF] flex items-center justify-center">
                <Stamp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Visa Processing & Checklist
              </h4>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                Expert visa documentation for Thailand, Malaysia, Singapore, Dubai, Japan, Schengen, UK, and USA with verified embassy checklists.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              {onOpenVisaQuote && (
                <button
                  type="button"
                  onClick={onOpenVisaQuote}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Stamp className="w-3.5 h-3.5" />
                  <span>Visa Assessment</span>
                </button>
              )}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('visa')}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#CBD5E1] text-xs font-semibold transition-colors cursor-pointer"
                  title="Open Visa Guides"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Service 3: AI Itinerary Planner */}
          <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4 flex flex-col justify-between hover:border-[#2563EB]/50 transition-all">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                AI Multi-Day Trip Planner
              </h4>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                Create structured day-by-day itineraries tailored to your budget in BDT, travel style, family requirements, and favorite activities.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('planner')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Launch AI Planner</span>
                </button>
              )}
            </div>
          </div>

          {/* Service 4: 24/7 Dedicated WhatsApp Desk */}
          <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4 flex flex-col justify-between hover:border-emerald-500/50 transition-all">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                24/7 Operations Concierge
              </h4>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                Direct WhatsApp contact with our Dhaka operations desk (+880 1851-172032) for date changes, booking verification, and rapid support.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              <a
                href="https://wa.me/8801851172032?text=Hello%20Azraq%20Trips,%20I%20need%20assistance%20with%20my%20travel%20plans."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message +880 1851-172032</span>
              </a>
            </div>
          </div>

          {/* Service 5: Holiday Tour Packages */}
          <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4 flex flex-col justify-between hover:border-indigo-500/50 transition-all">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Holiday Packages & Tours
              </h4>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                Explore curated group & private packages with premium 4★/5★ hotels, airport transfers, and guided sightseeing included.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('packages')}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Browse Holiday Packages</span>
                </button>
              )}
            </div>
          </div>

          {/* Service 6: Destinations Explorer */}
          <div className="rounded-2xl p-6 border border-white/10 bg-[#0F2339]/90 shadow-md space-y-4 flex flex-col justify-between hover:border-sky-500/50 transition-all">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Destinations & Travel Guides
              </h4>
              <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                Comprehensive destination guides covering visa requirements, flight durations, local halal food, and estimated costs in BDT.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('destinations')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Explore 50+ Destinations</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

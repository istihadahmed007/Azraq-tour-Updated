import React from 'react';
import { User, Itinerary, QuoteRequest, Destination, NavView } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Crown,
  CheckCircle2,
  Sparkles,
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
  ShieldCheck,
  Globe,
  Clock,
  ChevronRight,
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
  onSelectItinerary,
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
    <div className="space-y-8 animate-fade-in">
      {/* 1. VIP Welcome & Active Status Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-400/25 bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-[#0a192f]/90 shadow-2xl relative overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 flex items-center gap-1.5 shadow-md">
                <Crown className="w-3.5 h-3.5 fill-slate-950" />
                <span>Azraq VIP Member</span>
              </span>
              {user?.emailVerified && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Traveler</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif-display font-black text-white tracking-tight">
              Welcome back, {user?.fullName || 'Distinguished Traveler'}!
            </h1>

            <p className="text-xs sm:text-sm text-sky-200/80 max-w-2xl leading-relaxed">
              Your personalized Azraq Trips travel command center. Access real-time flight quotes, visa approvals, custom itineraries, and direct VIP concierge support.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenFlightQuote && (
              <button
                type="button"
                onClick={onOpenFlightQuote}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                <Plane className="w-4 h-4" />
                <span>Flight Quote</span>
              </button>
            )}

            {onOpenVisaQuote && (
              <button
                type="button"
                onClick={onOpenVisaQuote}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
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
          className="glass-card rounded-3xl p-5 border border-white/10 bg-slate-900/90 shadow-xl hover:border-amber-400/40 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
              Travel Quotes
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-400/15 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif-display font-black text-white">
            {userQuotes.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {pendingQuotesCount > 0 ? (
              <span className="text-amber-300 font-bold">{pendingQuotesCount} in review</span>
            ) : (
              'All quotes reviewed'
            )}
          </p>
        </button>

        {/* Metric 2: Saved Itineraries */}
        <button
          type="button"
          onClick={() => onNavigateToTab('itineraries')}
          className="glass-card rounded-3xl p-5 border border-white/10 bg-slate-900/90 shadow-xl hover:border-sky-400/40 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
              Saved Itineraries
            </span>
            <div className="w-9 h-9 rounded-2xl bg-sky-400/15 text-sky-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif-display font-black text-white">
            {savedItineraries.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Bespoke AI trip plans</p>
        </button>

        {/* Metric 3: Saved Destinations */}
        <button
          type="button"
          onClick={() => onNavigateToTab('saved_destinations')}
          className="glass-card rounded-3xl p-5 border border-white/10 bg-slate-900/90 shadow-xl hover:border-emerald-400/40 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
              Wishlist Spots
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-400/15 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif-display font-black text-white">
            {savedDestinationsCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Saved holiday destinations</p>
        </button>

        {/* Metric 4: Community Posts */}
        <button
          type="button"
          onClick={() => onNavigateToTab('community_activity')}
          className="glass-card rounded-3xl p-5 border border-white/10 bg-slate-900/90 shadow-xl hover:border-purple-400/40 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
              Community Posts
            </span>
            <div className="w-9 h-9 rounded-2xl bg-purple-400/15 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-serif-display font-black text-white">
            {communityPostsCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Stories & buddy posts</p>
        </button>
      </div>

      {/* 3. Latest Active Journey / Status Callout */}
      {latestQuote && (
        <div className="glass-card rounded-3xl p-6 border border-white/15 bg-slate-900/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Latest Active Journey Assessment
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Ref: {latestQuote.id}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('travel_activity')}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
            >
              <span>View All Quotes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-white/5">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white font-serif-display text-base block">
                {latestQuote.type === 'flight'
                  ? `${latestQuote.from} ✈️ ${latestQuote.to}`
                  : `${(latestQuote as any).destinationCountry} Visa Service`}
              </span>
              <p className="text-xs text-slate-300">
                Created on {new Date(latestQuote.createdAt).toLocaleDateString()} for{' '}
                <strong className="text-white">{latestQuote.customerName}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Status: {latestQuote.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Travel Services Launchpad */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif-display font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Azraq Travel Services & Launchpad</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Service 1: Flight Quotes & Engine */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4 flex flex-col justify-between hover:border-sky-400/40 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plane className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif-display">
                Flight Search & Offline Hold
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Compare verified fares on US-Bangla, Biman, Emirates, Saudia, and Singapore Airlines with offline seat hold capabilities.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              {onOpenFlightQuote && (
                <button
                  type="button"
                  onClick={onOpenFlightQuote}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Request Quote</span>
                </button>
              )}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('flights')}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sky-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Open Flight Engine"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Service 2: Visa Assistance */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4 flex flex-col justify-between hover:border-teal-400/40 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stamp className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif-display">
                Visa Processing & Checklist
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Expert visa documentation for Thailand, Malaysia, Singapore, Dubai, Japan, Schengen, UK, and USA with verified embassy checklists.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center gap-2">
              {onOpenVisaQuote && (
                <button
                  type="button"
                  onClick={onOpenVisaQuote}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Stamp className="w-3.5 h-3.5" />
                  <span>Visa Assessment</span>
                </button>
              )}
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('visa')}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-teal-200 text-xs font-semibold transition-colors cursor-pointer"
                  title="Open Visa Guides"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Service 3: AI Itinerary Planner */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4 flex flex-col justify-between hover:border-amber-400/40 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif-display">
                AI Multi-Day Trip Planner
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Create structured day-by-day itineraries tailored to your budget in BDT, travel style, family requirements, and favorite activities.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('planner')}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:brightness-110 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Launch AI Planner</span>
                </button>
              )}
            </div>
          </div>

          {/* Service 4: 24/7 Dedicated WhatsApp Desk */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4 flex flex-col justify-between hover:border-emerald-400/40 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif-display">
                24/7 WhatsApp Concierge
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Direct one-touch messaging with our Dhaka & international operations desk (+880 1851-172032) for amendments, ticket reissuance, and emergency assistance.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              <a
                href="https://wa.me/8801851172032?text=Hello%20Azraq%20Trips,%20I%20need%20assistance%20with%20my%20travel%20plans."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message +880 1851-172032</span>
              </a>
            </div>
          </div>

          {/* Service 5: Holiday Tour Packages */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4 flex flex-col justify-between hover:border-purple-400/40 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif-display">
                Holiday Packages & Tours
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore curated group & private packages with premium 4★/5★ hotels, airport transfers, and guided sightseeing included.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('packages')}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Browse Holiday Packages</span>
                </button>
              )}
            </div>
          </div>

          {/* Service 6: Destinations Explorer */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/90 shadow-xl space-y-4 flex flex-col justify-between hover:border-sky-400/40 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white font-serif-display">
                Destinations & Travel Guides
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Detailed guides covering best time to visit, flight durations, local halal food, budget estimations, and must-see attractions.
              </p>
            </div>

            <div className="pt-3 border-t border-white/10">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('destinations')}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md"
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

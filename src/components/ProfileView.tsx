import React, { useState, useEffect } from 'react';
import { Destination, Itinerary, QuoteRequest, NavView } from '../types';
import { ALL_DESTINATIONS } from '../data/destinationsData';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';
import {
  User as UserIcon,
  Sparkles,
  Compass,
  Heart,
  Calendar,
  Activity,
  Users,
  Settings,
  Plane,
  Stamp,
  Package,
  BookOpen,
  MessageCircle,
  Camera,
  Crown,
  CheckCircle2,
  Lock,
  ChevronRight,
  RefreshCw,
  Globe,
  Sliders,
  DollarSign,
  Share2,
} from 'lucide-react';
import { SEOHead } from './SEOHead';
import { ProfilePictureModal } from './ProfilePictureModal';
import { PersonalizedOverview } from './dashboard/PersonalizedOverview';
import { ProfileDetailsTab } from './dashboard/ProfileDetailsTab';
import { TravelPreferencesTab } from './dashboard/TravelPreferencesTab';
import { SavedItinerariesTab } from './dashboard/SavedItinerariesTab';
import { TravelActivityTab } from './dashboard/TravelActivityTab';
import { CommunityActivityTab } from './dashboard/CommunityActivityTab';
import { SavedDestinationsTab } from './dashboard/SavedDestinationsTab';
import { AccountSettingsTab } from './dashboard/AccountSettingsTab';

interface ProfileViewProps {
  savedItineraries: Itinerary[];
  onSelectItinerary: (itinerary: Itinerary) => void;
  onRemoveItinerary: (id: string) => void;
  onNavigateToFeed?: () => void;
  onSelectDestination?: (dest: Destination) => void;
  onOpenFlightQuote?: () => void;
  onOpenVisaQuote?: () => void;
  onNavigate?: (view: NavView) => void;
}

export type DashboardTab =
  | 'overview'
  | 'profile'
  | 'itineraries'
  | 'travel_activity'
  | 'community_activity'
  | 'preferences'
  | 'saved_destinations'
  | 'settings';

export const ProfileView: React.FC<ProfileViewProps> = ({
  savedItineraries,
  onSelectItinerary,
  onRemoveItinerary,
  onNavigateToFeed,
  onSelectDestination,
  onOpenFlightQuote,
  onOpenVisaQuote,
  onNavigate,
}) => {
  const { user, isGuest, isLoading, openAuthModal, logout, updateUserProfile, showToast } = useAuth();
  const { userPosts, bookmarkedPosts } = useFeed();

  // Active Dashboard Sub-Tab
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Profile Picture Modal State
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = useState(false);

  // Quotes and timeline state
  const [userQuotes, setUserQuotes] = useState<QuoteRequest[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);

  // Saved Destinations from User State
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);

  // Load User Quotes & Personalized Activity Timeline from API
  const loadUserQuotes = async () => {
    if (!user?.email) {
      setUserQuotes([]);
      setTimelineEvents([]);
      return;
    }
    setIsLoadingQuotes(true);
    try {
      // 1. Fetch user quotes
      const res = await fetch(`/api/quotes/track?query=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.quotes)) {
        setUserQuotes(data.quotes);
      } else {
        setUserQuotes([]);
      }

      // 2. Fetch personalized step-by-step activity timeline
      const timelineRes = await fetch(`/api/users/me/timeline?email=${encodeURIComponent(user.email)}`);
      if (timelineRes.ok) {
        const timelineData = await timelineRes.json();
        if (timelineData.success && Array.isArray(timelineData.timeline)) {
          setTimelineEvents(timelineData.timeline);
        }
      }
    } catch {
      setUserQuotes([]);
      setTimelineEvents([]);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  // Sync Saved Destinations
  useEffect(() => {
    if (user?.savedDestinationIds && user.savedDestinationIds.length > 0) {
      const dests = ALL_DESTINATIONS.filter((d) => user.savedDestinationIds?.includes(d.id));
      setSavedDestinations(dests);
    } else {
      setSavedDestinations([]);
    }
  }, [user]);

  // Load quotes on mount / when user changes
  useEffect(() => {
    if (user) {
      loadUserQuotes();
    } else {
      setUserQuotes([]);
      setTimelineEvents([]);
    }
  }, [user]);

  const handleRemoveSavedDestination = async (destId: string) => {
    if (!user) return;
    const nextIds = (user.savedDestinationIds || []).filter((id) => id !== destId);
    try {
      await updateUserProfile({ savedDestinationIds: nextIds });
      showToast('Destination removed from wishlist', 'info');
    } catch {
      showToast('Could not update saved destinations', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 pt-20">
      <SEOHead
        title="User Dashboard & Travel Hub | Azraq Trips"
        description="Access your personalized Azraq Trips travel dashboard. Manage saved itineraries, track live flight & visa quotes, update travel preferences, and connect with Travel Buddies."
        url="/profile"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ========================================================================= */}
        {/* TOP PLATFORM QUICK NAVIGATION TABS (Destinations, Packages, Visa, etc.)  */}
        {/* ========================================================================= */}
        <div className="glass-card rounded-2xl p-2.5 sm:p-3 border border-white/10 bg-slate-900/80 shadow-lg flex items-center justify-between overflow-x-auto hide-scrollbar gap-2">
          <div className="flex items-center gap-1.5 min-w-max">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 px-2 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Explore Azraq:</span>
            </span>

            {onNavigate && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('destinations')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Destinations</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('packages')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 text-purple-400" />
                  <span>Packages</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('visa')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Stamp className="w-3.5 h-3.5 text-teal-400" />
                  <span>Visa</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('guides')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guides</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('flights')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plane className="w-3.5 h-3.5 text-sky-400" />
                  <span>Flights</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('feed')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Community</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('planner')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Planner</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              <span>User Dashboard</span>
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GUEST VIEW / AUTHENTICATION PROMPT                                        */}
        {/* ========================================================================= */}
        {!user ? (
          <div className="space-y-8 animate-fade-in">
            {/* Guest Banner */}
            <div className="glass-card rounded-3xl p-8 sm:p-12 border border-amber-400/30 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0a192f] shadow-2xl text-center space-y-6 max-w-3xl mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-2xl">
                <Crown className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-serif-display font-black text-white">
                  Welcome to Azraq Trips VIP Hub
                </h1>
                <p className="text-xs sm:text-sm text-sky-200/80 max-w-xl mx-auto leading-relaxed">
                  Sign in with your email or OTP to unlock real-time flight and visa quote tracking, save multi-day AI itineraries, customize travel preferences, and access the 24/7 WhatsApp concierge.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('otp_entry', '/profile')}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-sm shadow-xl transition-all flex items-center gap-2 cursor-pointer min-h-[48px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sign In with OTP / Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('register', '/profile')}
                  className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer min-h-[48px]"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Create Free Account</span>
                </button>
              </div>
            </div>

            {/* Platform Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/80 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center">
                  <Plane className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-serif-display">
                  Live Quotation Tracking
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Track flight fare holds and visa assessments with real-time status updates and official pricing in Bangladeshi Taka (BDT ৳).
                </p>
              </div>

              <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/80 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-serif-display">
                  Saved AI Itineraries
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Store custom day-by-day travel schedules for Bali, Thailand, Kashmir, Dubai, and beyond with offline export capabilities.
                </p>
              </div>

              <div className="glass-card rounded-3xl p-6 border border-white/10 bg-slate-900/80 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white font-serif-display">
                  24/7 Dedicated Concierge
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Direct WhatsApp access to our Dhaka operations desk (+880 1851-172032) for instant booking verification and amendments.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* AUTHENTICATED USER DASHBOARD                                              */
          /* ========================================================================= */
          <div className="space-y-8 animate-fade-in">
            {/* Authenticated Top Profile Header Bar */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0a192f] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left z-10">
                {/* Avatar with quick edit trigger */}
                <div className="relative group shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsProfilePictureModalOpen(true)}
                    className="relative block rounded-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-amber-400/40 cursor-pointer group"
                    title="Click to update avatar"
                  >
                    <img
                      src={
                        user.photoURL ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                          user.fullName || user.email || 'traveler'
                        )}`
                      }
                      alt={user.fullName || 'Traveler'}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-400/60 shadow-2xl group-hover:brightness-90 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Camera className="w-5 h-5 text-amber-300 mb-0.5" />
                      <span className="text-[9px] font-bold text-amber-200 uppercase">Change</span>
                    </div>
                  </button>
                  <div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-slate-950 flex items-center justify-center text-slate-950 text-xs font-black shadow-lg"
                    title="Azraq VIP Member"
                  >
                    👑
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-sm">
                      Azraq VIP Member
                    </span>
                    {user.emailVerified && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-serif-display font-black text-white">
                    {user.fullName || 'Distinguished Traveler'}
                  </h1>

                  <p className="text-xs text-sky-200/80 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span>{user.email}</span>
                    <span>•</span>
                    <span>{user.phone || '+880 1851-172032'}</span>
                    <span>•</span>
                    <span>{user.homeLocation || user.country || 'Dhaka, Bangladesh'}</span>
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <UserIcon className="w-4 h-4 text-amber-400" />
                  <span>View Full Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preferences')}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-xs shadow-xl transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Travel Preferences</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DASHBOARD PRINCIPAL NAVIGATION TABS                                       */}
            {/* ========================================================================= */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 hide-scrollbar">
              {/* Tab 1: Overview */}
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Overview</span>
              </button>

              {/* Tab 2: Profile */}
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                  activeTab === 'profile'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </button>

              {/* Tab 3: Saved Itineraries */}
              <button
                type="button"
                onClick={() => setActiveTab('itineraries')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                  activeTab === 'itineraries'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Saved Itineraries ({savedItineraries.length})</span>
              </button>

              {/* Tab 4: Travel Activity */}
              <button
                type="button"
                onClick={() => setActiveTab('travel_activity')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                  activeTab === 'travel_activity'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Travel Activity ({userQuotes.length})</span>
              </button>

              {/* Tab 5: Community Activity */}
              <button
                type="button"
                onClick={() => setActiveTab('community_activity')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                  activeTab === 'community_activity'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Community Activity ({userPosts.length + bookmarkedPosts.length})</span>
              </button>

              {/* Tab 6: Travel Preferences */}
              <button
                type="button"
                onClick={() => setActiveTab('preferences')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                  activeTab === 'preferences'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Travel Preferences</span>
              </button>

              {/* Tab 7: Saved Wishlist */}
              <button
                type="button"
                onClick={() => setActiveTab('saved_destinations')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                  activeTab === 'saved_destinations'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Saved Wishlist ({savedDestinations.length})</span>
              </button>

              {/* Tab 8: Settings */}
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 ${
                  activeTab === 'settings'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/10'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* SUB-VIEW RENDERING                                                        */}
            {/* ========================================================================= */}
            {activeTab === 'overview' && (
              <PersonalizedOverview
                savedItineraries={savedItineraries}
                userQuotes={userQuotes}
                savedDestinationsCount={savedDestinations.length}
                communityPostsCount={userPosts.length}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onSelectItinerary={onSelectItinerary}
                onOpenFlightQuote={onOpenFlightQuote}
                onOpenVisaQuote={onOpenVisaQuote}
                onNavigate={onNavigate}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileDetailsTab onSelectDestination={onSelectDestination} />
            )}

            {activeTab === 'itineraries' && (
              <SavedItinerariesTab
                savedItineraries={savedItineraries}
                onSelectItinerary={onSelectItinerary}
                onRemoveItinerary={onRemoveItinerary}
                onNavigateToPlanner={() => onNavigate && onNavigate('planner')}
              />
            )}

            {activeTab === 'travel_activity' && (
              <TravelActivityTab
                userQuotes={userQuotes}
                timelineEvents={timelineEvents}
                isLoadingQuotes={isLoadingQuotes}
                onRefreshQuotes={loadUserQuotes}
                onOpenFlightQuote={onOpenFlightQuote}
                onOpenVisaQuote={onOpenVisaQuote}
              />
            )}

            {activeTab === 'community_activity' && (
              <CommunityActivityTab
                onNavigateToFeed={onNavigateToFeed || (() => onNavigate && onNavigate('feed'))}
              />
            )}

            {activeTab === 'preferences' && <TravelPreferencesTab />}

            {activeTab === 'saved_destinations' && (
              <SavedDestinationsTab
                savedDestinations={savedDestinations}
                onSelectDestination={onSelectDestination}
                onRemoveSavedDestination={handleRemoveSavedDestination}
                onNavigateToDestinations={() => onNavigate && onNavigate('destinations')}
              />
            )}

            {activeTab === 'settings' && (
              <AccountSettingsTab
                onOpenProfilePictureModal={() => setIsProfilePictureModalOpen(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* Profile Picture / Avatar Modal */}
      <ProfilePictureModal
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
        onSuccess={() => {
          showToast('Profile photo updated successfully!', 'success');
        }}
      />
    </div>
  );
};

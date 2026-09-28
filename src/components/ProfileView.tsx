import React, { useState, useEffect } from 'react';
import { Destination, Itinerary, QuoteRequest, NavView } from '../types';
import { ALL_DESTINATIONS } from '../data/destinationsData';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../context/FeedContext';
import { authService } from '../services/authService';
import {
  User as UserIcon,
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
  CheckCircle2,
  Globe,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SEOHead } from './SEOHead';
import { ProfilePictureModal } from './ProfilePictureModal';
import { UserAvatar } from './UserAvatar';
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
  const { user, openAuthModal, updateUserProfile, showToast } = useAuth();
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

  // Load User Quotes & Activity Timeline
  const loadUserQuotes = async () => {
    if (!user?.email) {
      setUserQuotes([]);
      setTimelineEvents([]);
      return;
    }
    setIsLoadingQuotes(true);
    try {
      const token = authService.getSessionToken();
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch user quotes
      const res = await fetch('/api/users/me/quotes', { headers: authHeaders });
      const data = await res.json();
      if (res.ok && Array.isArray(data.quotes)) {
        setUserQuotes(data.quotes);
      } else {
        setUserQuotes([]);
      }

      // 2. Fetch personalized activity timeline
      const timelineRes = await fetch('/api/users/me/timeline', { headers: authHeaders });
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
    <div className="min-h-screen bg-[#071426] text-[#F8FAFC] pb-32 pt-20">
      <SEOHead
        title="User Dashboard & Travel Profile | Azraq Trips"
        description="Access your personalized Azraq Trips travel account. Manage saved itineraries, track live flight & visa quotes, and update traveler preferences."
        url="/profile"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ========================================================================= */}
        {/* TOP PLATFORM QUICK NAVIGATION TABS (Destinations, Packages, Visa, etc.)  */}
        {/* ========================================================================= */}
        <nav
          aria-label="Platform exploration"
          className="rounded-2xl p-2.5 sm:p-3 border border-white/10 bg-[#0F2339]/95 shadow-md flex items-center justify-between overflow-x-auto hide-scrollbar gap-2"
        >
          <div className="flex items-center gap-1.5 min-w-max">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF] px-2 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Explore:</span>
            </span>

            {onNavigate && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('destinations')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#CBD5E1] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Destinations</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('packages')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#CBD5E1] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <Package className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Packages</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('visa')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#CBD5E1] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <Stamp className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>Visa</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('guides')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#CBD5E1] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Guides</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('flights')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#CBD5E1] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <Plane className="w-3.5 h-3.5 text-sky-400" />
                  <span>Flights</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('feed')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#CBD5E1] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  <span>Community</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('planner')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#CBD5E1] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <Compass className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>Planner</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-[#2563EB]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Travel Profile</span>
            </span>
          </div>
        </nav>

        {/* ========================================================================= */}
        {/* SIGNED-OUT VISITOR EXPERIENCE: Compact, High-Contrast Welcome Panel      */}
        {/* ========================================================================= */}
        {!user ? (
          <div className="space-y-6 animate-fade-in">
            {/* Welcome Card */}
            <div className="rounded-2xl p-6 sm:p-10 border border-white/15 bg-[#0F2339]/95 shadow-xl text-center space-y-5 max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/20 border border-[#2563EB]/40 text-[#2DD4BF] flex items-center justify-center mx-auto shadow-md">
                <UserIcon className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
                  Welcome to Your Azraq Trips Account
                </h1>
                <p className="text-sm sm:text-base text-[#CBD5E1] max-w-lg mx-auto leading-relaxed">
                  Sign in to view real-time flight quotes, track visa applications, save custom multi-day itineraries, and manage travel preferences.
                </p>
              </div>

              {/* Action Buttons: Sign In primary, Create Account secondary */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('otp_entry', '/profile')}
                  className="px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                >
                  <Sparkles className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Sign In with OTP / Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('register', '/profile')}
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#F8FAFC] font-semibold text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  <UserIcon className="w-4 h-4 text-[#CBD5E1]" />
                  <span>Create Free Account</span>
                </button>
              </div>
            </div>

            {/* Platform Feature Highlights (Working Features Only) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              <div className="rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0F2339]/80 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                  <Plane className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">Live Fare & Quote Tracking</h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                  Monitor flight holds and visa assessment statuses with verified pricing in Bangladeshi Taka (BDT ৳).
                </p>
              </div>

              <div className="rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0F2339]/80 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-[#2DD4BF] flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">Saved AI Itineraries</h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                  Save multi-day travel schedules for Bali, Thailand, Kashmir, Dubai, and more with day-by-day activity plans.
                </p>
              </div>

              <div className="rounded-2xl p-5 sm:p-6 border border-white/10 bg-[#0F2339]/80 space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">24/7 Operations Desk</h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed">
                  Direct WhatsApp access to our Dhaka operations desk (+880 1851-172032) for booking verification and itinerary amendments.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* AUTHENTICATED USER DASHBOARD                                              */
          /* ========================================================================= */
          <div className="space-y-6 animate-fade-in">
            {/* Authenticated Top Profile Header Bar */}
            <div className="rounded-2xl p-6 sm:p-8 border border-white/12 bg-[#0F2339]/95 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left z-10">
                {/* Avatar with Initials Fallback & Obvious Change Photo Button */}
                <div className="relative group shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsProfilePictureModalOpen(true)}
                    className="relative block rounded-full overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#2563EB]/50 cursor-pointer group"
                    title="Change profile photo"
                    aria-label="Change profile photo"
                  >
                    <UserAvatar
                      photoURL={user.photoURL}
                      name={user.fullName}
                      email={user.email}
                      size="xl"
                      className="border-3 border-white/20 group-hover:brightness-90 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Camera className="w-5 h-5 text-[#2DD4BF] mb-0.5" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsProfilePictureModalOpen(true)}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center text-xs shadow-md border-2 border-[#0F2339] cursor-pointer"
                    title="Change photo"
                    aria-label="Change profile picture"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/40">
                      Traveler Account
                    </span>
                    {user.emailVerified && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Email</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                    {user.fullName || 'Valued Traveler'}
                  </h1>

                  <div className="text-xs sm:text-sm text-[#CBD5E1] flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <span>{user.email}</span>
                    {user.phone && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span>{user.phone}</span>
                      </>
                    )}
                    {(user.homeLocation || user.country) && (
                      <>
                        <span className="text-slate-500">•</span>
                        <span>{user.homeLocation || user.country}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 z-10">
                <button
                  type="button"
                  onClick={() => setIsProfilePictureModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#F8FAFC] font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer border border-white/15 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <Camera className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Change Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DASHBOARD PRINCIPAL NAVIGATION TABS                                       */}
            {/* ========================================================================= */}
            <div
              role="tablist"
              aria-label="Dashboard views"
              className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 hide-scrollbar"
            >
              {/* Tab 1: Overview */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] ${
                  activeTab === 'overview'
                    ? 'bg-[#2563EB] text-white font-bold shadow-md'
                    : 'bg-[#0F2339]/80 hover:bg-[#0F2339] text-[#CBD5E1] border border-white/10'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Overview</span>
              </button>

              {/* Tab 2: Profile */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] ${
                  activeTab === 'profile'
                    ? 'bg-[#2563EB] text-white font-bold shadow-md'
                    : 'bg-[#0F2339]/80 hover:bg-[#0F2339] text-[#CBD5E1] border border-white/10'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Profile</span>
              </button>

              {/* Tab 3: Saved Itineraries */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'itineraries'}
                onClick={() => setActiveTab('itineraries')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] ${
                  activeTab === 'itineraries'
                    ? 'bg-[#2563EB] text-white font-bold shadow-md'
                    : 'bg-[#0F2339]/80 hover:bg-[#0F2339] text-[#CBD5E1] border border-white/10'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Saved Itineraries ({savedItineraries.length})</span>
              </button>

              {/* Tab 4: Travel Activity */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'travel_activity'}
                onClick={() => setActiveTab('travel_activity')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] ${
                  activeTab === 'travel_activity'
                    ? 'bg-[#2563EB] text-white font-bold shadow-md'
                    : 'bg-[#0F2339]/80 hover:bg-[#0F2339] text-[#CBD5E1] border border-white/10'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Travel Quotes ({userQuotes.length})</span>
              </button>

              {/* Tab 5: Community Activity */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'community_activity'}
                onClick={() => setActiveTab('community_activity')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] ${
                  activeTab === 'community_activity'
                    ? 'bg-[#2563EB] text-white font-bold shadow-md'
                    : 'bg-[#0F2339]/80 hover:bg-[#0F2339] text-[#CBD5E1] border border-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Community ({userPosts.length + bookmarkedPosts.length})</span>
              </button>

              {/* Tab 6: Travel Preferences */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'preferences'}
                onClick={() => setActiveTab('preferences')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] ${
                  activeTab === 'preferences'
                    ? 'bg-[#2563EB] text-white font-bold shadow-md'
                    : 'bg-[#0F2339]/80 hover:bg-[#0F2339] text-[#CBD5E1] border border-white/10'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Preferences</span>
              </button>

              {/* Tab 7: Saved Wishlist */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'saved_destinations'}
                onClick={() => setActiveTab('saved_destinations')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] ${
                  activeTab === 'saved_destinations'
                    ? 'bg-[#2563EB] text-white font-bold shadow-md'
                    : 'bg-[#0F2339]/80 hover:bg-[#0F2339] text-[#CBD5E1] border border-white/10'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Wishlist ({savedDestinations.length})</span>
              </button>

              {/* Tab 8: Settings */}
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] shrink-0 focus:outline-none focus:ring-2 focus:ring-[#2DD4BF] ${
                  activeTab === 'settings'
                    ? 'bg-[#2563EB] text-white font-bold shadow-md'
                    : 'bg-[#0F2339]/80 hover:bg-[#0F2339] text-[#CBD5E1] border border-white/10'
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

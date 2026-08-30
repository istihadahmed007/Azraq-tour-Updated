import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  User,
  Inbox,
  BookOpen,
  Search,
  Filter,
  ShieldCheck,
  Users,
  Sparkles,
  RefreshCw,
  Plus,
  Lock,
  ArrowRight,
  Bell,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import {
  TravelBuddyProfile,
  TravelBuddyRequest,
  MatchedTravelBuddy,
} from '../../types';
import {
  fetchBuddyProfiles,
  fetchMyBuddyProfile,
  saveBuddyProfile,
  fetchUserRequests,
  sendBuddyRequest,
  respondToBuddyRequest,
  cancelBuddyRequest,
  calculateBuddyMatch,
  filterBuddyProfiles,
  fetchSocialNotifications,
  AVAILABLE_DESTINATIONS,
  AVAILABLE_TRAVEL_STYLES,
} from '../../lib/travelBuddyQueries';
import { useAuth } from '../../context/AuthContext';
import { TravelBuddyCard } from './TravelBuddyCard';
import { SEOHead } from '../SEOHead';
import { TravelBuddyConnectModal } from './TravelBuddyConnectModal';
import { TravelBuddyProfileEditor } from './TravelBuddyProfileEditor';
import { TravelBuddyRequests } from './TravelBuddyRequests';
import { TravelBuddiesFeed } from './TravelBuddiesFeed';
import { CommunitiesView } from './CommunitiesView';
import { GroupTripsView } from './GroupTripsView';
import { SocialNotificationsView } from './SocialNotificationsView';

export type BuddyTabType =
  | 'stories'
  | 'find'
  | 'communities'
  | 'trips'
  | 'requests'
  | 'notifications'
  | 'profile';

interface TravelBuddiesHubProps {
  initialTab?: BuddyTabType;
  onSelectDestinationByName?: (name: string) => void;
  onNavigateToProfile?: () => void;
}

export const TravelBuddiesHub: React.FC<TravelBuddiesHubProps> = ({
  initialTab = 'stories',
  onSelectDestinationByName,
  onNavigateToProfile,
}) => {
  const { user, isGuest, openAuthModal, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState<BuddyTabType>(initialTab);
  const [profiles, setProfiles] = useState<TravelBuddyProfile[]>([]);
  const [myProfile, setMyProfile] = useState<TravelBuddyProfile | null>(null);
  const [requests, setRequests] = useState<TravelBuddyRequest[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('All');

  // Modal State
  const [selectedCandidate, setSelectedCandidate] =
    useState<MatchedTravelBuddy | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  // Load all profiles, user profile, and user requests
  const loadData = useCallback(async () => {
    try {
      const [fetchedProfiles, fetchedMyProfile, fetchedRequests, notifs] =
        await Promise.all([
          fetchBuddyProfiles(),
          user ? fetchMyBuddyProfile(user.uid) : Promise.resolve(null),
          user ? fetchUserRequests(user.uid) : Promise.resolve([]),
          user ? fetchSocialNotifications(user.uid) : Promise.resolve({ notifications: [], unreadCount: 0 }),
        ]);

      setProfiles(fetchedProfiles || []);
      setMyProfile(fetchedMyProfile);
      setRequests(fetchedRequests || []);
      setUnreadNotifsCount(notifs.unreadCount || 0);
    } catch {
      setProfiles([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute matched candidate list with match scores
  const matchedBuddies: MatchedTravelBuddy[] = useMemo(() => {
    // 1. Filter out inactive profiles & current user
    const candidateProfiles = profiles.filter((p) => {
      if (!p.isActive) return false;
      if (user && p.id === user.uid) return false;
      return true;
    });

    // 2. Score each candidate against current user's profile and requests
    const list = candidateProfiles.map((candidate) =>
      calculateBuddyMatch(
        myProfile,
        candidate,
        requests,
        user?.uid
      )
    );

    // 3. Sort by highest match score first
    list.sort((a, b) => b.matchScore - a.matchScore);

    return list;
  }, [profiles, myProfile, requests, user]);

  // Filter matched candidates by search input, destination, and travel style
  const filteredBuddies = useMemo(() => {
    return filterBuddyProfiles(
      matchedBuddies,
      searchQuery,
      selectedDestination,
      selectedStyle
    );
  }, [matchedBuddies, searchQuery, selectedDestination, selectedStyle]);

  // Pending incoming requests count
  const pendingIncomingCount = useMemo(() => {
    if (!user) return 0;
    return requests.filter(
      (r) => r.receiverId === user.uid && r.status === 'pending'
    ).length;
  }, [requests, user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    showToast('Travel Buddies data refreshed.', 'info');
  };

  const handleOpenConnectModal = (buddy: MatchedTravelBuddy) => {
    if (isGuest || !user) {
      openAuthModal();
      showToast('Please sign in to connect with fellow travelers.', 'info');
      return;
    }
    setSelectedCandidate(buddy);
    setIsConnectModalOpen(true);
  };

  const handleSendRequest = async (receiverId: string, message: string) => {
    if (!user) {
      openAuthModal();
      return { success: false, error: 'Authentication required' };
    }

    const candidate = profiles.find((p) => p.id === receiverId);
    const result = await sendBuddyRequest(
      user.uid,
      receiverId,
      message,
      myProfile || {
        displayName: user.fullName || 'Azraq Traveler',
        avatarUrl: user.photoURL,
        homeLocation: user.homeLocation || 'Bangladesh',
      },
      candidate
        ? {
            displayName: candidate.displayName,
            avatarUrl: candidate.avatarUrl,
            homeLocation: candidate.homeLocation,
            destinations: candidate.destinations,
          }
        : undefined
    );

    if (result.success) {
      showToast('Connection request sent!', 'success');
      const updatedRequests = await fetchUserRequests(user.uid);
      setRequests(updatedRequests);
    }
    return result;
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!user) return;
    const res = await respondToBuddyRequest(requestId, 'accepted', user.uid);
    if (res.success) {
      showToast('Connection accepted!', 'success');
      const updatedRequests = await fetchUserRequests(user.uid);
      setRequests(updatedRequests);
    } else {
      showToast('Failed to accept connection.', 'error');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (!user) return;
    const res = await respondToBuddyRequest(requestId, 'declined', user.uid);
    if (res.success) {
      showToast('Request declined.', 'info');
      const updatedRequests = await fetchUserRequests(user.uid);
      setRequests(updatedRequests);
    } else {
      showToast('Failed to decline request.', 'error');
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!user) return;
    const res = await cancelBuddyRequest(requestId, user.uid);
    if (res.success) {
      showToast('Request cancelled.', 'info');
      const updatedRequests = await fetchUserRequests(user.uid);
      setRequests(updatedRequests);
    } else {
      showToast('Failed to cancel request.', 'error');
    }
  };

  const handleSaveProfile = async (profile: TravelBuddyProfile) => {
    const res = await saveBuddyProfile(profile);
    if (res.success) {
      setMyProfile(profile);
      await loadData();
    }
    return res;
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDestination('All');
    setSelectedStyle('All');
  };

  return (
    <article id="azraq-travel-buddies-hub" className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <SEOHead
        title="Find Travel Buddies & Join Asian Tour Groups – Azraq Trips"
        description="Connect with verified solo travelers and small tour groups from Bangladesh exploring Thailand, Malaysia, Maldives, Kashmir, and Vietnam. Safe verified profiles."
        canonical="https://www.azraqtrips.com/buddies"
      />
      {/* Hero Header */}
      <section aria-labelledby="buddies-hero-heading" className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 border border-sky-500/20 mb-3">
                <Users className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                Azraq Travel Buddies & Community
              </div>
              <h1 id="buddies-hero-heading" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Connect, Share & Explore Together
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Discover verified Bangladeshi and international travelers, join active destination communities, organize group trips, and share authentic travel stories.
              </p>
            </div>

            {/* Quick Action / Status Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="btn-refresh-buddies"
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors min-h-[44px] cursor-pointer"
                title="Refresh listings"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {!myProfile && (
                <button
                  id="btn-create-my-buddy-profile"
                  type="button"
                  onClick={() => {
                    if (isGuest || !user) {
                      openAuthModal('login');
                      showToast('Please sign in to set up your Travel Buddy profile.', 'info');
                    } else {
                      setActiveTab('profile');
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all min-h-[44px] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Set Up Buddy Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Privacy & Safety Statement Banner */}
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-900/80 border border-white/10 px-4 py-3 text-xs text-slate-300">
            <Lock className="h-4 w-4 shrink-0 text-sky-400" />
            <div className="flex-1">
              <span className="font-semibold text-white">
                Privacy Protected:
              </span>{' '}
              Personal contact details remain confidential until both travelers accept a connection. Zero mock travelers or fabricated statistics.
            </div>
          </div>

          {/* 7 Main Navigation Tabs */}
          <div className="mt-8 flex overflow-x-auto border-b border-white/10 scrollbar-none gap-1">
            {/* 1. Feed */}
            <button
              id="tab-community-stories"
              type="button"
              onClick={() => setActiveTab('stories')}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                activeTab === 'stories'
                  ? 'border-sky-400 text-sky-400 bg-sky-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Feed</span>
            </button>

            {/* 2. Discover Travelers */}
            <button
              id="tab-find-buddies"
              type="button"
              onClick={() => setActiveTab('find')}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                activeTab === 'find'
                  ? 'border-sky-400 text-sky-400 bg-sky-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Discover Travelers</span>
              {filteredBuddies.length > 0 && (
                <span className="rounded-full bg-slate-800 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                  {filteredBuddies.length}
                </span>
              )}
            </button>

            {/* 3. Communities */}
            <button
              id="tab-communities"
              type="button"
              onClick={() => setActiveTab('communities')}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                activeTab === 'communities'
                  ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Communities</span>
            </button>

            {/* 4. Group Trips */}
            <button
              id="tab-group-trips"
              type="button"
              onClick={() => setActiveTab('trips')}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                activeTab === 'trips'
                  ? 'border-indigo-400 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Group Trips</span>
            </button>

            {/* 5. Connections */}
            <button
              id="tab-requests"
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                activeTab === 'requests'
                  ? 'border-sky-400 text-sky-400 bg-sky-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Inbox className="h-4 w-4" />
              <span>Connections</span>
              {pendingIncomingCount > 0 && (
                <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                  {pendingIncomingCount}
                </span>
              )}
            </button>

            {/* 6. Notifications */}
            <button
              id="tab-notifications"
              type="button"
              onClick={() => setActiveTab('notifications')}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                activeTab === 'notifications'
                  ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
              {unreadNotifsCount > 0 && (
                <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-950 animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* 7. My Profile */}
            <button
              id="tab-my-profile"
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-sky-400 text-sky-400 bg-sky-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="h-4 w-4" />
              <span>My Profile</span>
              {myProfile && (
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Main Tab Views */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: FEED (Community Stories, Post Types, Reactions, Comments) */}
        {activeTab === 'stories' && (
          <div className="space-y-6">
            <TravelBuddiesFeed
              onSelectDestinationByName={onSelectDestinationByName}
              onNavigateToProfile={onNavigateToProfile}
            />
          </div>
        )}

        {/* TAB 2: DISCOVER TRAVELERS (Real Database Profiles Only) */}
        {activeTab === 'find' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                {/* Search Input */}
                <div className="sm:col-span-6 relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="input-search-buddies"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, city, destination, or interests..."
                    className="w-full rounded-xl border border-white/10 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-hidden min-h-[44px]"
                  />
                </div>

                {/* Destination Filter */}
                <div className="sm:col-span-3">
                  <select
                    id="select-filter-destination"
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-hidden min-h-[44px]"
                  >
                    <option value="All">All Destinations</option>
                    {AVAILABLE_DESTINATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Travel Style Filter */}
                <div className="sm:col-span-3">
                  <select
                    id="select-filter-style"
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-sky-500 focus:outline-hidden min-h-[44px]"
                  >
                    <option value="All">All Travel Styles</option>
                    {AVAILABLE_TRAVEL_STYLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filter Chips & Clear Option */}
              {(searchQuery ||
                selectedDestination !== 'All' ||
                selectedStyle !== 'All') && (
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-400">Filtered by:</span>
                    {searchQuery && (
                      <span className="rounded-md bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 font-medium text-sky-300">
                        Query: "{searchQuery}"
                      </span>
                    )}
                    {selectedDestination !== 'All' && (
                      <span className="rounded-md bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 font-medium text-sky-300">
                        {selectedDestination}
                      </span>
                    )}
                    {selectedStyle !== 'All' && (
                      <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-medium text-emerald-300">
                        {selectedStyle}
                      </span>
                    )}
                  </div>
                  <button
                    id="btn-reset-filters"
                    type="button"
                    onClick={handleResetFilters}
                    className="font-semibold text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {/* Travel Buddy Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-2xl border border-white/5 bg-slate-900/40 p-5"
                  />
                ))}
              </div>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-white text-lg">
                  No travelers here yet.
                </h3>
                <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Be the first traveler to create and publish your profile! Connect with other verified explorers heading to Thailand, Malaysia, UAE, Maldives, and beyond.
                </p>
                <button
                  id="btn-be-first-travel-buddy"
                  type="button"
                  onClick={() => {
                    if (isGuest || !user) {
                      openAuthModal('login');
                      showToast('Please sign in to set up your Travel Buddy profile.', 'info');
                    } else {
                      setActiveTab('profile');
                    }
                  }}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-400 px-6 py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-md transition-all min-h-[44px] cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Your Travel Buddy Profile</span>
                </button>
              </div>
            ) : filteredBuddies.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-900/40 p-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400 mb-3">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-white text-base">
                  No Travelers Match Your Filters
                </h3>
                <p className="mt-1 max-w-sm text-xs text-slate-400">
                  Try adjusting your destination or travel style filters to view more travel companions.
                </p>
                <button
                  id="btn-clear-empty-filters"
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 rounded-xl bg-sky-500 hover:bg-sky-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md transition-all min-h-[44px] cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBuddies.map((buddy) => (
                  <TravelBuddyCard
                    key={buddy.id}
                    buddy={buddy}
                    isCurrentUser={user ? buddy.id === user.uid : false}
                    onConnectClick={handleOpenConnectModal}
                    onEditProfileClick={() => setActiveTab('profile')}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMMUNITIES */}
        {activeTab === 'communities' && (
          <CommunitiesView
            onSelectCommunity={() => setActiveTab('stories')}
          />
        )}

        {/* TAB 4: GROUP TRIPS */}
        {activeTab === 'trips' && <GroupTripsView />}

        {/* TAB 5: CONNECTIONS & REQUESTS */}
        {activeTab === 'requests' && (
          <TravelBuddyRequests
            requests={requests}
            currentUserId={user?.uid || ''}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
            onCancel={handleCancelRequest}
            onNavigateToFindBuddies={() => setActiveTab('find')}
          />
        )}

        {/* TAB 6: SOCIAL NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <SocialNotificationsView
            onNavigateTab={(tab) => {
              if (tab === 'requests') setActiveTab('requests');
              else if (tab === 'trips') setActiveTab('trips');
              else if (tab === 'communities') setActiveTab('communities');
              else setActiveTab('stories');
            }}
          />
        )}

        {/* TAB 7: MY PROFILE */}
        {activeTab === 'profile' && (
          <TravelBuddyProfileEditor
            existingProfile={myProfile}
            onSave={handleSaveProfile}
            onViewBuddiesTab={() => setActiveTab('find')}
          />
        )}
      </div>

      {/* Connect Request Modal */}
      <TravelBuddyConnectModal
        isOpen={isConnectModalOpen}
        buddy={selectedCandidate}
        onClose={() => setIsConnectModalOpen(false)}
        onSendRequest={handleSendRequest}
        onAcceptIncoming={handleAcceptRequest}
        onDeclineIncoming={handleDeclineRequest}
      />
    </article>
  );
};

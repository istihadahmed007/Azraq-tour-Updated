import React, { useState, useEffect, useCallback } from 'react';
import {
  Compass,
  User,
  MessageSquare,
  Bookmark,
  Bell,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavbar } from '../../context/NavbarContext';
import { SEOHead } from '../SEOHead';
import { TravelBuddiesFeed } from './TravelBuddiesFeed';
import { GroupTripsView } from './GroupTripsView';
import { TravelBuddyMessagesView } from './TravelBuddyMessagesView';
import { TravelBuddyProfileView } from './TravelBuddyProfileView';
import { SocialNotificationsView } from './SocialNotificationsView';
import { CommunityModerationView } from './CommunityModerationView';
import { CreatePostModal } from './CreatePostModal';
import {
  apiGetTrips,
  apiGetSavedPosts,
  apiGetConversations,
  apiGetNotifications,
  ApiTrip,
  ApiPost,
} from '../../lib/communityApi';
import { PostCard } from './PostCard';

export type CommunityTab =
  | 'feed'
  | 'trips'
  | 'messages'
  | 'saved'
  | 'notifications'
  | 'profile'
  | 'moderation';

interface TravelBuddiesHubProps {
  initialTab?: string;
  onSelectDestinationByName?: (name: string) => void;
  onNavigateToProfile?: () => void;
}

export const TravelBuddiesHub: React.FC<TravelBuddiesHubProps> = ({
  initialTab = 'feed',
  onSelectDestinationByName,
  onNavigateToProfile,
}) => {
  const { user, isGuest, openAuthModal, logout, showToast } = useAuth();
  const { navbarHeight } = useNavbar();

  // Normalize legacy tab names
  const normalizedInitialTab: CommunityTab =
    initialTab === 'stories' ? 'feed' :
    initialTab === 'profile' ? 'profile' :
    initialTab === 'trips' ? 'trips' :
    initialTab === 'messages' ? 'messages' :
    initialTab === 'notifications' ? 'notifications' :
    initialTab === 'moderation' ? 'moderation' :
    'feed';

  const [activeTab, setActiveTab] = useState<CommunityTab>(normalizedInitialTab);
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);

  // Counters
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);

  // Right sidebar data
  const [upcomingTrips, setUpcomingTrips] = useState<ApiTrip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState<boolean>(true);

  // Saved Posts Tab State
  const [savedPosts, setSavedPosts] = useState<ApiPost[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState<boolean>(false);

  // Modals
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || user?.isAdmin === true;

  // Poll counters and upcoming companion trips
  const loadSidebarAndStats = useCallback(async () => {
    try {
      // 1. Live upcoming trips for right column with stable record ID deduplication
      const tripsData = await apiGetTrips({ upcomingOnly: true });
      const uniqueTrips = Array.from(new Map(tripsData.map((t) => [t.id, t])).values());
      setUpcomingTrips(uniqueTrips.slice(0, 3));
    } catch {
      setUpcomingTrips([]);
    } finally {
      setIsLoadingTrips(false);
    }

    if (user && !isGuest) {
      try {
        const [convs, notifs] = await Promise.all([
          apiGetConversations(),
          apiGetNotifications(),
        ]);
        const totalUnreadMsgs = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        setUnreadMessagesCount(totalUnreadMsgs);
        setUnreadNotifsCount(notifs.unreadCount || 0);
      } catch {}
    }
  }, [user, isGuest]);

  useEffect(() => {
    loadSidebarAndStats();
    const interval = setInterval(loadSidebarAndStats, 15000);
    return () => clearInterval(interval);
  }, [loadSidebarAndStats]);

  // Load saved posts if tab active
  useEffect(() => {
    if (activeTab === 'saved') {
      setIsLoadingSaved(true);
      apiGetSavedPosts()
        .then((posts) => setSavedPosts(posts))
        .finally(() => setIsLoadingSaved(false));
    }
  }, [activeTab]);

  const handleStartChatWithUser = (convId: string) => {
    setActiveChatId(convId);
    setActiveTab('messages');
    setSelectedProfileUserId(null);
  };

  const handleViewUserProfile = (uid: string) => {
    setSelectedProfileUserId(uid);
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen bg-[#071A33] text-white">
      <SEOHead
        title="Travel Buddies — Social Community | Azraq Trips"
        description="Connect with authentic verified travelers across Bangladesh and the globe. Plan companion trips, share visual travel stories, and coordinate group departures safely."
      />

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================================================================= */}
          {/* LEFT COLUMN: Community Navigation & Safety Guidelines (Desktop)    */}
          {/* ================================================================= */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-5">
            {/* Branding Card */}
            <div className="bg-[#0A1628]/90 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0047BA] to-[#17BEBB] flex items-center justify-center text-white shadow-lg shadow-[#0047BA]/30">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-white text-base leading-tight">Travel Buddies</h2>
                  <p className="text-[11px] text-[#17BEBB] font-semibold">Azraq Social Community</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1 text-sm font-semibold">
                <button
                  onClick={() => {
                    setSelectedProfileUserId(null);
                    setActiveTab('feed');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                    activeTab === 'feed'
                      ? 'bg-[#0047BA] text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4" />
                    Community Feed
                  </span>
                </button>

                <button
                  onClick={() => {
                    setSelectedProfileUserId(null);
                    setActiveTab('trips');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                    activeTab === 'trips'
                      ? 'bg-[#0047BA] text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    Companion Trips
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (!user || isGuest) {
                      openAuthModal('login');
                      return;
                    }
                    setSelectedProfileUserId(null);
                    setActiveTab('messages');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                    activeTab === 'messages'
                      ? 'bg-[#0047BA] text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4" />
                    Messages
                  </span>
                  {unreadMessagesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#17BEBB] text-[#071A33] text-[10px] font-black">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (!user || isGuest) {
                      openAuthModal('login');
                      return;
                    }
                    setSelectedProfileUserId(null);
                    setActiveTab('saved');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                    activeTab === 'saved'
                      ? 'bg-[#0047BA] text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4" />
                    Saved Stories
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (!user || isGuest) {
                      openAuthModal('login');
                      return;
                    }
                    setSelectedProfileUserId(null);
                    setActiveTab('notifications');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                    activeTab === 'notifications'
                      ? 'bg-[#0047BA] text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </span>
                  {unreadNotifsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (!user || isGuest) {
                      openAuthModal('login');
                      return;
                    }
                    setSelectedProfileUserId(user.uid);
                    setActiveTab('profile');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                    activeTab === 'profile' && (!selectedProfileUserId || selectedProfileUserId === user?.uid)
                      ? 'bg-[#0047BA] text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <User className="w-4 h-4" />
                    My Profile
                  </span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setSelectedProfileUserId(null);
                      setActiveTab('moderation');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                      activeTab === 'moderation'
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      Moderation
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px]">Admin</span>
                  </button>
                )}
              </nav>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/10 mt-4 space-y-2">
                <button
                  onClick={() => {
                    if (!user || isGuest) {
                      openAuthModal('login');
                    } else {
                      setIsCreatePostOpen(true);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#0047BA] to-[#0759B8] hover:from-[#0759B8] hover:to-[#0047BA] text-white font-bold text-xs shadow-lg shadow-[#0047BA]/30 transition-transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Share Travel Story
                </button>

                <button
                  onClick={() => {
                    setSelectedProfileUserId(null);
                    setActiveTab('trips');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  <Compass className="w-4 h-4 text-[#17BEBB]" />
                  Plan a Companion Trip
                </button>
              </div>
            </div>

            {/* Safety Reminder Card */}
            <div className="p-4 bg-gradient-to-br from-[#071322] to-[#0A1628] border border-amber-500/20 rounded-3xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <ShieldCheck className="w-4 h-4" />
                Community Safety Promise
              </div>
              <p className="text-white/70 leading-relaxed text-[11px]">
                Always meet new travel companions in busy public places. Azraq Trips never exposes your personal phone number or email address to the public.
              </p>
            </div>
          </aside>

          {/* ================================================================= */}
          {/* CENTER COLUMN: Main Content Area (Feed, Trips, Messages, Profile) */}
          {/* ================================================================= */}
          <main className="lg:col-span-6 space-y-6 min-h-[600px]">
            {/* When Tab is FEED / STORIES */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* Trigger box to write post */}
                <div className="p-4 bg-[#0A1628]/90 border border-white/10 rounded-3xl shadow-xl flex items-center gap-3">
                  <img
                    src={
                      user?.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Traveler')}&background=0047BA&color=fff`
                    }
                    alt={user?.fullName || 'Traveler'}
                    className="w-10 h-10 rounded-full object-cover border border-white/20 flex-shrink-0"
                  />
                  <button
                    onClick={() => {
                      if (!user || isGuest) {
                        openAuthModal('login');
                      } else {
                        setIsCreatePostOpen(true);
                      }
                    }}
                    className="flex-1 text-left px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/50 transition-colors"
                  >
                    Share your travel story, tips, or scenic photos...
                  </button>
                  <button
                    onClick={() => {
                      if (!user || isGuest) {
                        openAuthModal('login');
                      } else {
                        setIsCreatePostOpen(true);
                      }
                    }}
                    className="p-3 rounded-2xl bg-[#0047BA] text-white hover:bg-[#0759B8] transition-colors"
                    title="Upload photo"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Feed Component */}
                <TravelBuddiesFeed
                  onSelectDestinationByName={onSelectDestinationByName}
                  onNavigateToProfile={() => setActiveTab('profile')}
                />
              </div>
            )}

            {/* When Tab is COMPANION TRIPS */}
            {activeTab === 'trips' && (
              <GroupTripsView onNavigateToUserProfile={handleViewUserProfile} />
            )}

            {/* When Tab is PRIVATE MESSAGING */}
            {activeTab === 'messages' && (
              <TravelBuddyMessagesView
                initialConversationId={activeChatId}
                onNavigateToUserProfile={handleViewUserProfile}
              />
            )}

            {/* When Tab is SAVED POSTS */}
            {activeTab === 'saved' && (
              <div className="bg-[#0A1628]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex items-center gap-2 pb-4 border-b border-white/10">
                  <Bookmark className="w-5 h-5 text-[#17BEBB]" />
                  <h2 className="text-lg font-bold text-white">Private Saved Stories</h2>
                </div>

                {isLoadingSaved ? (
                  <div className="py-12 text-center text-white/50 text-xs">Loading saved posts...</div>
                ) : savedPosts.length === 0 ? (
                  <div className="py-12 text-center text-white/40 text-xs flex flex-col items-center">
                    <Bookmark className="w-8 h-8 text-white/20 mb-2" />
                    <p className="font-semibold text-white/70">No saved stories yet</p>
                    <p className="text-white/50 mt-1 max-w-xs">
                      Bookmark inspiring itineraries or photography tips from the feed to view them privately here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedPosts.map((post) => (
                      <div key={post.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <img
                            src={post.mediaUrls[0]}
                            alt={post.caption}
                            className="w-full h-44 object-cover rounded-xl border border-white/10"
                          />
                        )}
                        <p className="text-xs text-white/90">{post.caption}</p>
                        <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/5">
                          <span>By @{post.author?.username}</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* When Tab is NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <SocialNotificationsView onSelectNotificationLink={(url) => {
                if (url.includes('chat=')) {
                  const match = url.match(/chat=([^&]+)/);
                  if (match) handleStartChatWithUser(match[1]);
                } else if (url.includes('trip=')) {
                  setActiveTab('trips');
                } else if (url.includes('user=')) {
                  const match = url.match(/user=([^&]+)/);
                  if (match) handleViewUserProfile(match[1]);
                } else {
                  setActiveTab('feed');
                }
              }} />
            )}

            {/* When Tab is USER PROFILE */}
            {activeTab === 'profile' && (
              <TravelBuddyProfileView
                userId={selectedProfileUserId || undefined}
                onStartChat={handleStartChatWithUser}
                onClose={() => {
                  setSelectedProfileUserId(null);
                  setActiveTab('feed');
                }}
              />
            )}

            {/* When Tab is MODERATION (Admin only) */}
            {activeTab === 'moderation' && isAdmin && (
              <CommunityModerationView />
            )}
          </main>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: Real Upcoming Companion Trips & Live Handoff (Desktop)*/}
          {/* ================================================================= */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-5">
            {/* Quick Traveler Account Status */}
            <div className="bg-[#0A1628]/90 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl">
              {user && !isGuest ? (
                <div className="flex items-center gap-3">
                  <img
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'Traveler')}&background=0047BA&color=fff`
                    }
                    alt={user.fullName || 'User'}
                    className="w-11 h-11 rounded-2xl object-cover border border-white/20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white text-xs truncate">{user.fullName || 'Traveler'}</p>
                    <p className="text-[11px] text-[#17BEBB] truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <p className="text-xs font-bold text-white">Join Azraq Travel Community</p>
                  <p className="text-[11px] text-white/60">
                    Sign in to publish travel stories, connect with companions, and exchange private messages.
                  </p>
                  <button
                    onClick={() => openAuthModal('login')}
                    className="w-full py-2 bg-[#0047BA] hover:bg-[#0759B8] text-white font-bold text-xs rounded-xl shadow-md transition-transform active:scale-95"
                  >
                    Sign In / Register
                  </button>
                </div>
              )}
            </div>

            {/* Upcoming Companion Trips (Genuine Real Database Records) */}
            <div className="bg-[#0A1628]/90 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#17BEBB]" />
                  Upcoming Companion Trips
                </h3>
                <button
                  onClick={() => {
                    setSelectedProfileUserId(null);
                    setActiveTab('trips');
                  }}
                  className="text-[11px] text-[#17BEBB] hover:underline font-semibold"
                >
                  View All
                </button>
              </div>

              {isLoadingTrips ? (
                <div className="py-6 text-center text-white/40 text-xs">Loading trips...</div>
              ) : upcomingTrips.length === 0 ? (
                <div className="py-6 text-center text-white/40 text-xs">
                  <p>No upcoming companion trips.</p>
                  <button
                    onClick={() => {
                      setSelectedProfileUserId(null);
                      setActiveTab('trips');
                    }}
                    className="text-[#17BEBB] underline mt-1 block w-full"
                  >
                    Organize a trip
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingTrips.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedProfileUserId(null);
                        setActiveTab('trips');
                      }}
                      className="p-3 bg-white/5 border border-white/5 hover:border-white/20 rounded-2xl cursor-pointer transition-all hover:bg-white/10 group"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#17BEBB] font-bold">
                        <span className="truncate">{t.destination}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          {t.availableSpaces} open spots
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white truncate mt-1 group-hover:text-[#17BEBB] transition-colors">
                        {t.title}
                      </h4>
                      <p className="text-[10px] text-white/50 mt-1">
                        {new Date(t.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        {t.budgetMax ? ` • ৳${t.budgetMax.toLocaleString()}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Travel Essentials & Flight Quick Handoff (Preserved Core Platform Integration) */}
            <div className="p-4 bg-gradient-to-br from-[#071322] to-[#0A1628] border border-white/10 rounded-3xl text-xs space-y-2.5">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <Globe className="w-4 h-4 text-[#17BEBB]" />
                Azraq Travel Gateway
              </div>
              <p className="text-white/60 text-[11px] leading-relaxed">
                Coordinate flights and hotels for your companion trips directly with verified partner rates:
              </p>
              <div className="flex flex-col gap-1.5 pt-1">
                <a
                  href="https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <span>Search Flights (BDT ৳)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#17BEBB]" />
                </a>
                <a
                  href="/hotels"
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                >
                  <span>Book Hotels & Activities</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#17BEBB]" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Accessibility & 44px+ touch targets)*/}
      {/* ================================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#071322]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => {
            setSelectedProfileUserId(null);
            setActiveTab('feed');
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-xl transition-colors ${
            activeTab === 'feed' ? 'text-[#17BEBB]' : 'text-white/60 hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Feed</span>
        </button>

        <button
          onClick={() => {
            setSelectedProfileUserId(null);
            setActiveTab('trips');
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-xl transition-colors ${
            activeTab === 'trips' ? 'text-[#17BEBB]' : 'text-white/60 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Trips</span>
        </button>

        {/* Center Create Action Button */}
        <button
          onClick={() => {
            if (!user || isGuest) {
              openAuthModal('login');
            } else {
              setIsCreatePostOpen(true);
            }
          }}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#0047BA] to-[#17BEBB] text-white shadow-xl shadow-[#0047BA]/40 active:scale-95 transition-transform -mt-5 border-2 border-[#071A33]"
          title="Share Story"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => {
            if (!user || isGuest) {
              openAuthModal('login');
              return;
            }
            setSelectedProfileUserId(null);
            setActiveTab('messages');
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-xl relative transition-colors ${
            activeTab === 'messages' ? 'text-[#17BEBB]' : 'text-white/60 hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Chat</span>
          {unreadMessagesCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 bg-[#17BEBB] text-[#071A33] text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (!user || isGuest) {
              openAuthModal('login');
              return;
            }
            setSelectedProfileUserId(user.uid);
            setActiveTab('profile');
          }}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] rounded-xl relative transition-colors ${
            activeTab === 'profile' ? 'text-[#17BEBB]' : 'text-white/60 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Profile</span>
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-amber-400 rounded-full" />
          )}
        </button>
      </nav>

      {/* Post Creator Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={() => {
          setIsCreatePostOpen(false);
          setActiveTab('feed');
        }}
      />
    </div>
  );
};

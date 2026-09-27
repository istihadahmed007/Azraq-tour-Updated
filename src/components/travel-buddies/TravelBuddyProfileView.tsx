import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  MapPin,
  Calendar,
  Compass,
  Edit3,
  MessageSquare,
  UserPlus,
  UserCheck,
  Shield,
  Trash2,
  Lock,
  Globe,
  Tag,
  AlertTriangle,
  X,
  Camera,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  apiGetPublicProfile,
  apiGetMyProfile,
  apiUpdateMyProfile,
  apiFollowUser,
  apiUnfollowUser,
  apiGetFollowers,
  apiGetFollowing,
  apiGetPosts,
  apiGetTrips,
  apiStartConversation,
  apiUploadPostMedia,
  apiBlockUser,
  apiSubmitReport,
  ApiProfile,
  ApiPost,
  ApiTrip,
} from '../../lib/communityApi';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from './PostCard';
import { AVAILABLE_DESTINATIONS, AVAILABLE_TRAVEL_STYLES, AVAILABLE_LANGUAGES } from '../../lib/travelBuddyQueries';

interface TravelBuddyProfileViewProps {
  userId?: string; // If undefined, views current user's profile
  onStartChat?: (convId: string) => void;
  onClose?: () => void;
}

export const TravelBuddyProfileView: React.FC<TravelBuddyProfileViewProps> = ({
  userId,
  onStartChat,
  onClose,
}) => {
  const { user, isGuest, openAuthModal, showToast } = useAuth();
  const isMe = !userId || (user && user.uid === userId);

  const [profile, setProfile] = useState<ApiProfile | null>(null);
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'trips'>('posts');

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [followersModal, setFollowersModal] = useState<ApiProfile[] | null>(null);
  const [followingModal, setFollowingModal] = useState<ApiProfile[] | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  // Edit Profile Form State
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editHomeCity, setEditHomeCity] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editLanguages, setEditLanguages] = useState<string[]>([]);
  const [editStyles, setEditStyles] = useState<string[]>([]);
  const [editDestinations, setEditDestinations] = useState<string[]>([]);
  const [editIsPrivate, setEditIsPrivate] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      let res;
      if (isMe) {
        res = await apiGetMyProfile();
      } else {
        res = await apiGetPublicProfile(userId!);
      }

      if (res.success && res.profile) {
        setProfile(res.profile);
        // Load user's posts
        const postRes = await apiGetPosts({ authorId: res.profile.userId });
        setPosts(postRes.posts || []);
        // Load user's trips
        const allTrips = await apiGetTrips();
        const userTrips = allTrips.filter(
          (t) => t.organizerId === res.profile!.userId || t.approvedTravelers.some((p) => p.userId === res.profile!.userId)
        );
        setTrips(userTrips);

        // Prep edit fields
        if (isMe) {
          setEditDisplayName(res.profile.displayName);
          setEditUsername(res.profile.username);
          setEditBio(res.profile.bio || '');
          setEditHomeCity(res.profile.homeCity || '');
          setEditAvatarUrl(res.profile.avatarUrl || '');
          setEditCoverUrl(res.profile.coverUrl || '');
          setEditLanguages(res.profile.languages || ['English', 'Bangla']);
          setEditStyles(res.profile.travelStyles || []);
          setEditDestinations(res.profile.destinationsVisited || []);
          setEditIsPrivate(res.profile.isPrivate || false);
        }
      }
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [isMe, userId]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleToggleFollow = async () => {
    if (!user || isGuest) {
      openAuthModal('login');
      return;
    }
    if (!profile) return;

    if (profile.isFollowing) {
      const res = await apiUnfollowUser(profile.userId);
      if (res.success) {
        setProfile((prev) => prev ? { ...prev, isFollowing: false, followersCount: Math.max(0, prev.followersCount - 1) } : null);
        showToast(`Unfollowed @${profile.username}`, 'info');
      }
    } else {
      const res = await apiFollowUser(profile.userId);
      if (res.success) {
        setProfile((prev) => prev ? { ...prev, isFollowing: true, followersCount: prev.followersCount + 1 } : null);
        showToast(`Following @${profile.username}!`, 'success');
      }
    }
  };

  const handleStartChat = async () => {
    if (!user || isGuest) {
      openAuthModal('login');
      return;
    }
    if (!profile) return;

    const res = await apiStartConversation(profile.userId);
    if (res.success && res.conversation) {
      if (onStartChat) onStartChat(res.conversation.id);
    } else {
      showToast(res.error || 'Could not start conversation', 'error');
    }
  };

  const handleOpenFollowers = async () => {
    if (!profile) return;
    const list = await apiGetFollowers(profile.userId);
    setFollowersModal(list);
  };

  const handleOpenFollowing = async () => {
    if (!profile) return;
    const list = await apiGetFollowing(profile.userId);
    setFollowingModal(list);
  };

  const handleImageUpload = async (file: File, target: 'avatar' | 'cover') => {
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await apiUploadPostMedia(dataUrl);
      if (res.success && res.url) {
        if (target === 'avatar') {
          setEditAvatarUrl(res.url);
        } else {
          setEditCoverUrl(res.url);
        }
        showToast(`${target === 'avatar' ? 'Profile picture' : 'Cover image'} optimized & updated!`, 'success');
      } else {
        showToast(res.error || 'Upload failed', 'error');
      }
    } catch {
      showToast('Image processing failed', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const res = await apiUpdateMyProfile({
      displayName: editDisplayName.trim(),
      username: editUsername.trim().toLowerCase(),
      bio: editBio.trim(),
      homeCity: editHomeCity.trim(),
      avatarUrl: editAvatarUrl,
      coverUrl: editCoverUrl,
      languages: editLanguages,
      travelStyles: editStyles,
      destinationsVisited: editDestinations,
      isPrivate: editIsPrivate,
    });
    setIsSavingProfile(false);

    if (res.success && res.profile) {
      setProfile(res.profile);
      setIsEditOpen(false);
      showToast('Profile updated successfully!', 'success');
    } else {
      showToast(res.error || 'Failed to update profile', 'error');
    }
  };

  const handleBlockUser = async () => {
    if (!profile) return;
    const res = await apiBlockUser(profile.userId);
    setShowBlockModal(false);
    if (res.success) {
      showToast(`@${profile.username} has been blocked.`, 'info');
      if (onClose) onClose();
    } else {
      showToast(res.error || 'Could not block user', 'error');
    }
  };

  const handleReportUser = async () => {
    if (!profile || !reportReason) return;
    const res = await apiSubmitReport({
      targetType: 'user',
      targetId: profile.userId,
      reason: reportReason,
      details: reportDetails,
    });
    setShowReportModal(false);
    setReportReason('');
    setReportDetails('');
    if (res.success) {
      showToast('User report submitted for moderation review.', 'success');
    } else {
      showToast(res.error || 'Failed to submit report', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0A1628]/90 border border-white/10 rounded-3xl p-16 text-center text-white/50 text-sm">
        Loading traveler profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#0A1628]/90 border border-white/10 rounded-3xl p-12 text-center text-white/60">
        <h3 className="text-lg font-bold text-white mb-2">Profile Not Found</h3>
        <p className="text-sm">This traveler profile may have been removed or is unavailable.</p>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#0A1628]/90 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Cover Photo */}
      <div className="h-44 sm:h-56 w-full relative bg-gradient-to-r from-[#071A33] via-[#0047BA] to-[#0759B8]">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <Compass className="w-16 h-16" />
          </div>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="px-6 pb-6 pt-0 relative">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
          {/* Avatar & Identifiers */}
          <div className="flex items-end gap-4">
            <img
              src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=0047BA&color=fff&size=200`}
              alt={profile.displayName}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-[#0A1628] shadow-2xl bg-[#071A33]"
            />
            <div className="mb-2">
              <h1 className="text-2xl font-black text-white leading-tight flex items-center gap-2">
                {profile.displayName}
              </h1>
              <p className="text-sm font-semibold text-[#17BEBB]">@{profile.username}</p>
              {profile.homeCity && (
                <p className="text-xs text-white/60 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#17BEBB]" />
                  {profile.homeCity}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isMe ? (
              <button
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all shadow"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  onClick={handleToggleFollow}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                    profile.isFollowing
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-[#17BEBB] hover:bg-[#15a8a5] text-[#071A33]'
                  }`}
                >
                  {profile.isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
                <button
                  onClick={handleStartChat}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0047BA] hover:bg-[#0759B8] text-white text-xs font-bold rounded-xl transition-all shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-xl text-white/40 hover:text-amber-400 hover:bg-white/5"
                  title="Report user"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Counts & Stats */}
        <div className="flex items-center gap-6 py-3 border-y border-white/10 text-xs">
          <div>
            <strong className="text-white font-bold text-sm">{posts.length}</strong>{' '}
            <span className="text-white/60">Stories</span>
          </div>
          <button onClick={handleOpenFollowers} className="hover:text-white transition-colors">
            <strong className="text-white font-bold text-sm">{profile.followersCount}</strong>{' '}
            <span className="text-white/60">Followers</span>
          </button>
          <button onClick={handleOpenFollowing} className="hover:text-white transition-colors">
            <strong className="text-white font-bold text-sm">{profile.followingCount}</strong>{' '}
            <span className="text-white/60">Following</span>
          </button>
          <div>
            <strong className="text-white font-bold text-sm">{trips.length}</strong>{' '}
            <span className="text-white/60">Companion Trips</span>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-white/80 leading-relaxed mt-4 max-w-2xl whitespace-pre-line">
            {profile.bio}
          </p>
        )}

        {/* Self-Reported Tags Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Self-Reported Travel Styles */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#17BEBB]" />
                Travel Styles
              </span>
              <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded">Self-Reported</span>
            </div>
            {profile.travelStyles && profile.travelStyles.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.travelStyles.map((style) => (
                  <span key={style} className="text-xs bg-[#0047BA]/30 text-blue-200 border border-blue-400/20 px-2.5 py-1 rounded-xl">
                    {style}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 italic">No travel styles specified yet.</p>
            )}
          </div>

          {/* Self-Reported Destinations Visited */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#17BEBB]" />
                Destinations Visited
              </span>
              <span className="text-[10px] text-white/40 bg-white/5 px-2 py-0.5 rounded">Self-Reported</span>
            </div>
            {profile.destinationsVisited && profile.destinationsVisited.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile.destinationsVisited.map((dest) => (
                  <span key={dest} className="text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                    {dest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 italic">No destinations listed yet.</p>
            )}
          </div>
        </div>

        {/* Content Tabs (Posts vs Trips) */}
        <div className="flex items-center gap-2 mt-8 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'posts'
                ? 'bg-[#0047BA] text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Stories & Photos ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'trips'
                ? 'bg-[#0047BA] text-white shadow'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Companion Trips ({trips.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'posts' ? (
            posts.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-xs">
                No travel stories published yet by this traveler.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <img
                        src={post.mediaUrls[0]}
                        alt={post.caption}
                        className="w-full h-44 object-cover rounded-xl mb-3 border border-white/10"
                      />
                    )}
                    <p className="text-xs text-white/90 line-clamp-2">{post.caption}</p>
                    <div className="flex items-center justify-between text-[11px] text-white/40 mt-3 pt-2 border-t border-white/5">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>{post.likesCount} Likes • {post.commentsCount} Comments</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            trips.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-xs">
                No companion trips scheduled currently.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trips.map((trip) => (
                  <div key={trip.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs text-[#17BEBB] font-bold mb-1">
                      <span>{trip.destination}</span>
                      <span className="uppercase text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/70">{trip.status}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{trip.title}</h4>
                    <p className="text-xs text-white/60 mb-2">
                      {new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-white/70 line-clamp-2">{trip.description}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#17BEBB]" />
                Edit Traveler Profile
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-white/50 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Photo Uploads */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Profile Photo</label>
                  <label className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <Camera className="w-4 h-4 text-[#17BEBB]" />
                    <span className="text-[11px] text-white/70 truncate">Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'avatar')}
                    />
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-white/80 mb-1">Cover Image</label>
                  <label className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <Camera className="w-4 h-4 text-[#17BEBB]" />
                    <span className="text-[11px] text-white/70 truncate">Upload Cover</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0], 'cover')}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">Username (@handle) *</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">Home City</label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka, Bangladesh"
                  value={editHomeCity}
                  onChange={(e) => setEditHomeCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">Biography</label>
                <textarea
                  rows={3}
                  placeholder="Share a bit about your travel style and favorite trip memories..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                />
              </div>

              {/* Travel Styles Selector */}
              <div>
                <label className="block font-semibold text-white/80 mb-1">Travel Styles (Self-Reported)</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-white/5 rounded-xl">
                  {AVAILABLE_TRAVEL_STYLES.map((style) => {
                    const isSelected = editStyles.includes(style);
                    return (
                      <button
                        type="button"
                        key={style}
                        onClick={() => {
                          setEditStyles((prev) =>
                            isSelected ? prev.filter((s) => s !== style) : [...prev, style]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#0047BA] text-white border border-blue-400'
                            : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Destinations Visited */}
              <div>
                <label className="block font-semibold text-white/80 mb-1">Destinations Visited (Self-Reported)</label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-white/5 rounded-xl">
                  {AVAILABLE_DESTINATIONS.map((dest) => {
                    const isSelected = editDestinations.includes(dest);
                    return (
                      <button
                        type="button"
                        key={dest}
                        onClick={() => {
                          setEditDestinations((prev) =>
                            isSelected ? prev.filter((d) => d !== dest) : [...prev, dest]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border border-emerald-400'
                            : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {dest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Privacy Setting */}
              <div className="pt-2 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer text-white/80">
                  <input
                    type="checkbox"
                    checked={editIsPrivate}
                    onChange={(e) => setEditIsPrivate(e.target.checked)}
                    className="rounded border-white/20 text-[#0047BA] focus:ring-0"
                  />
                  <span>Private Account (Only approved followers can view full stories)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-white/70 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#0047BA] to-[#0759B8] text-white font-bold shadow-lg"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Followers / Following List Modal */}
      {(followersModal || followingModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/15 rounded-3xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h3 className="font-bold text-white text-sm">
                {followersModal ? 'Followers' : 'Following'}
              </h3>
              <button
                onClick={() => {
                  setFollowersModal(null);
                  setFollowingModal(null);
                }}
                className="text-white/50 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(followersModal || followingModal || []).length === 0 ? (
                <p className="text-center py-6 text-white/40 text-xs">No travelers found.</p>
              ) : (
                (followersModal || followingModal || []).map((u) => (
                  <div key={u.userId} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5">
                    <img
                      src={u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName)}&background=0047BA&color=fff`}
                      alt={u.displayName}
                      className="w-8 h-8 rounded-full object-cover border border-white/20"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{u.displayName}</p>
                      <p className="text-[10px] text-white/50 truncate">@{u.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report User Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Report @{profile.username}
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Help us maintain an authentic, respectful community. Reports are reviewed by human moderators.
            </p>
            <label className="block text-xs font-semibold text-white/80 mb-1">Reason</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mb-3 focus:outline-none"
            >
              <option value="" className="bg-[#0A1628]">Select a reason...</option>
              <option value="fake_account" className="bg-[#0A1628]">Fake or impersonated account</option>
              <option value="spam" className="bg-[#0A1628]">Spam or unauthorized commercial promotion</option>
              <option value="harassment" className="bg-[#0A1628]">Harassment or abusive behavior</option>
              <option value="scam" className="bg-[#0A1628]">Scam or fraud attempt</option>
              <option value="other" className="bg-[#0A1628]">Other concern</option>
            </select>
            <label className="block text-xs font-semibold text-white/80 mb-1">Additional Notes</label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Provide context for our moderation team..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/40 mb-4 focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-sm rounded-xl text-white/70 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                disabled={!reportReason}
                onClick={handleReportUser}
                className="px-5 py-2 text-sm rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-semibold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

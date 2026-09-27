// Client API client for Azraq Trips Travel Buddies Social Community
// All requests talk directly to /api/travel-buddies/* with real persistent data and zero mocks.

const TOKEN_STORAGE_KEY = 'azraq_tours_session_token';

function getAuthToken(): string | null {
  try {
    return (
      localStorage.getItem('azraq_tours_session_token') ||
      localStorage.getItem('azraq_auth_token') ||
      null
    );
  } catch {
    return null;
  }
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(path, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      if (!res.ok || json.success === false) {
        return { success: false, error: json.error || `Server error (${res.status})` };
      }
      return { success: true, data: json };
    }

    if (!res.ok) {
      return { success: false, error: `Request failed with status ${res.status}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network request failed' };
  }
}

// --- MEDIA UPLOAD ---
export async function apiUploadPostMedia(dataUrl: string): Promise<{ success: boolean; url?: string; error?: string }> {
  const res = await request<{ url: string }>('/api/travel-buddies/upload', {
    method: 'POST',
    body: JSON.stringify({ dataUrl }),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, url: res.data?.url };
}

// --- PROFILES ---
export interface ApiProfile {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  homeCity?: string;
  languages: string[];
  travelInterests: string[];
  travelStyles: string[];
  destinationsVisited: string[];
  isPrivate: boolean;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isBlocked?: boolean;
  hasBlocked?: boolean;
}

export async function apiGetMyProfile(): Promise<{ success: boolean; profile?: ApiProfile; error?: string }> {
  const res = await request<{ profile: ApiProfile }>('/api/travel-buddies/profiles/me');
  if (!res.success) return { success: false, error: res.error };
  return { success: true, profile: res.data?.profile };
}

export async function apiUpdateMyProfile(data: Partial<ApiProfile>): Promise<{ success: boolean; profile?: ApiProfile; error?: string }> {
  const res = await request<{ profile: ApiProfile }>('/api/travel-buddies/profiles/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, profile: res.data?.profile };
}

export async function apiGetPublicProfile(identifier: string): Promise<{ success: boolean; profile?: ApiProfile; error?: string }> {
  const res = await request<{ profile: ApiProfile }>(`/api/travel-buddies/profiles/${encodeURIComponent(identifier)}`);
  if (!res.success) return { success: false, error: res.error };
  return { success: true, profile: res.data?.profile };
}

export async function apiFollowUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/profiles/${userId}/follow`, { method: 'POST' });
  return { success: res.success, error: res.error };
}

export async function apiUnfollowUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/profiles/${userId}/follow`, { method: 'DELETE' });
  return { success: res.success, error: res.error };
}

export async function apiGetFollowers(userId: string): Promise<ApiProfile[]> {
  const res = await request<{ followers: ApiProfile[] }>(`/api/travel-buddies/profiles/${userId}/followers`);
  return res.data?.followers || [];
}

export async function apiGetFollowing(userId: string): Promise<ApiProfile[]> {
  const res = await request<{ following: ApiProfile[] }>(`/api/travel-buddies/profiles/${userId}/following`);
  return res.data?.following || [];
}

// --- POSTS & FEED ---
export interface ApiPost {
  id: string;
  authorId: string;
  caption: string;
  mediaUrls: string[];
  destination?: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  author: ApiProfile;
}

export async function apiGetPosts(params: {
  feed?: 'explore' | 'following';
  cursor?: string;
  limit?: number;
  authorId?: string;
}): Promise<{ posts: ApiPost[]; nextCursor?: string; error?: string }> {
  const query = new URLSearchParams();
  if (params.feed) query.set('feed', params.feed);
  if (params.cursor) query.set('cursor', params.cursor);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.authorId) query.set('authorId', params.authorId);

  const res = await request<{ posts: ApiPost[]; nextCursor?: string }>(`/api/travel-buddies/posts?${query.toString()}`);
  if (!res.success) return { posts: [], error: res.error };
  return { posts: res.data?.posts || [], nextCursor: res.data?.nextCursor };
}

export async function apiCreatePost(data: {
  caption: string;
  mediaUrls: string[];
  destination?: string;
}): Promise<{ success: boolean; post?: ApiPost; error?: string }> {
  const res = await request<{ post: ApiPost }>('/api/travel-buddies/posts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, post: res.data?.post };
}

export async function apiGetPost(id: string): Promise<{ success: boolean; post?: ApiPost; error?: string }> {
  const res = await request<{ post: ApiPost }>(`/api/travel-buddies/posts/${id}`);
  if (!res.success) return { success: false, error: res.error };
  return { success: true, post: res.data?.post };
}

export async function apiUpdatePost(id: string, updates: { caption?: string; destination?: string }): Promise<{ success: boolean; post?: ApiPost; error?: string }> {
  const res = await request<{ post: ApiPost }>(`/api/travel-buddies/posts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, post: res.data?.post };
}

export async function apiDeletePost(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/posts/${id}`, { method: 'DELETE' });
  return { success: res.success, error: res.error };
}

export async function apiToggleLike(id: string): Promise<{ success: boolean; liked?: boolean; likesCount?: number; error?: string }> {
  const res = await request<{ liked: boolean; likesCount: number }>(`/api/travel-buddies/posts/${id}/like`, {
    method: 'POST',
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, liked: res.data?.liked, likesCount: res.data?.likesCount };
}

export async function apiToggleSave(id: string): Promise<{ success: boolean; saved?: boolean; error?: string }> {
  const res = await request<{ saved: boolean }>(`/api/travel-buddies/posts/${id}/save`, {
    method: 'POST',
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, saved: res.data?.saved };
}

export async function apiGetSavedPosts(): Promise<ApiPost[]> {
  const res = await request<{ posts: ApiPost[] }>('/api/travel-buddies/saved-posts');
  return res.data?.posts || [];
}

// --- COMMENTS ---
export interface ApiComment {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string | null;
  text: string;
  createdAt: string;
  updatedAt: string;
  author: ApiProfile;
}

export async function apiGetComments(postId: string): Promise<ApiComment[]> {
  const res = await request<{ comments: ApiComment[] }>(`/api/travel-buddies/posts/${postId}/comments`);
  return res.data?.comments || [];
}

export async function apiAddComment(
  postId: string,
  text: string,
  parentId?: string
): Promise<{ success: boolean; comment?: ApiComment; error?: string }> {
  const res = await request<{ comment: ApiComment }>(`/api/travel-buddies/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text, parentId }),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, comment: res.data?.comment };
}

export async function apiEditComment(
  postId: string,
  commentId: string,
  text: string
): Promise<{ success: boolean; comment?: ApiComment; error?: string }> {
  const res = await request<{ comment: ApiComment }>(`/api/travel-buddies/posts/${postId}/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ text }),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, comment: res.data?.comment };
}

export async function apiDeleteComment(postId: string, commentId: string): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
  return { success: res.success, error: res.error };
}

// --- TRIPS ---
export interface ApiTrip {
  id: string;
  organizerId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetMin?: number;
  budgetMax?: number;
  currency: 'BDT' | 'USD';
  travelStyle: string;
  interests: string[];
  languages: string[];
  maxTravelers: number;
  currentTravelers: number;
  availableSpaces: number;
  status: 'open' | 'full' | 'cancelled' | 'completed';
  description: string;
  meetingNotes?: string;
  createdAt: string;
  updatedAt: string;
  isOrganizer: boolean;
  isApproved: boolean;
  userRequestStatus: 'none' | 'pending' | 'accepted' | 'declined';
  organizer: ApiProfile;
  approvedTravelers: ApiProfile[];
}

export async function apiGetTrips(params: {
  destination?: string;
  style?: string;
  language?: string;
  maxBudget?: number;
  upcomingOnly?: boolean;
} = {}): Promise<ApiTrip[]> {
  const query = new URLSearchParams();
  if (params.destination && params.destination !== 'All') query.set('destination', params.destination);
  if (params.style && params.style !== 'All') query.set('style', params.style);
  if (params.language && params.language !== 'All') query.set('language', params.language);
  if (params.maxBudget) query.set('maxBudget', String(params.maxBudget));
  if (params.upcomingOnly !== undefined) query.set('upcomingOnly', String(params.upcomingOnly));

  const res = await request<{ trips: ApiTrip[] }>(`/api/travel-buddies/trips?${query.toString()}`);
  return res.data?.trips || [];
}

export async function apiCreateTrip(data: {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetMin?: number;
  budgetMax?: number;
  currency?: 'BDT' | 'USD';
  travelStyle: string;
  interests: string[];
  languages: string[];
  maxTravelers: number;
  description: string;
  meetingNotes?: string;
}): Promise<{ success: boolean; trip?: ApiTrip; error?: string }> {
  const res = await request<{ trip: ApiTrip }>('/api/travel-buddies/trips', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, trip: res.data?.trip };
}

export async function apiGetTrip(id: string): Promise<{ success: boolean; trip?: ApiTrip; error?: string }> {
  const res = await request<{ trip: ApiTrip }>(`/api/travel-buddies/trips/${id}`);
  if (!res.success) return { success: false, error: res.error };
  return { success: true, trip: res.data?.trip };
}

export async function apiUpdateTrip(id: string, data: Partial<ApiTrip>): Promise<{ success: boolean; trip?: ApiTrip; error?: string }> {
  const res = await request<{ trip: ApiTrip }>(`/api/travel-buddies/trips/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, trip: res.data?.trip };
}

export async function apiLeaveTrip(id: string): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/trips/${id}/leave`, { method: 'POST' });
  return { success: res.success, error: res.error };
}

export async function apiGetMyTrips(): Promise<ApiTrip[]> {
  const res = await request<{ trips: ApiTrip[] }>('/api/travel-buddies/my-trips');
  return res.data?.trips || [];
}

// --- TRIP REQUESTS ---
export interface ApiTripRequest {
  id: string;
  tripId: string;
  applicantId: string;
  introduction: string;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
  applicant?: ApiProfile;
}

export async function apiSubmitTripRequest(tripId: string, introduction: string): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/trips/${tripId}/requests`, {
    method: 'POST',
    body: JSON.stringify({ introduction }),
  });
  return { success: res.success, error: res.error };
}

export async function apiGetTripRequests(tripId: string): Promise<ApiTripRequest[]> {
  const res = await request<{ requests: ApiTripRequest[] }>(`/api/travel-buddies/trips/${tripId}/requests`);
  return res.data?.requests || [];
}

export async function apiRespondTripRequest(requestId: string, action: 'accept' | 'decline'): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/trip-requests/${requestId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
  return { success: res.success, error: res.error };
}

export async function apiWithdrawTripRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/trip-requests/${requestId}/withdraw`, { method: 'DELETE' });
  return { success: res.success, error: res.error };
}

// --- PRIVATE CONVERSATIONS & MESSAGING ---
export interface ApiConversation {
  id: string;
  participants: string[];
  status: 'active' | 'request';
  requestedBy: string;
  acceptedBy?: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  otherUser: ApiProfile;
}

export interface ApiMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  readBy: string[];
  createdAt: string;
}

export async function apiGetConversations(): Promise<ApiConversation[]> {
  const res = await request<{ conversations: ApiConversation[] }>('/api/travel-buddies/conversations');
  return res.data?.conversations || [];
}

export async function apiStartConversation(targetUserId: string): Promise<{ success: boolean; conversation?: ApiConversation; error?: string }> {
  const res = await request<{ conversation: ApiConversation }>('/api/travel-buddies/conversations', {
    method: 'POST',
    body: JSON.stringify({ targetUserId }),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, conversation: res.data?.conversation };
}

export async function apiAcceptConversation(convId: string): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/conversations/${convId}/accept`, { method: 'POST' });
  return { success: res.success, error: res.error };
}

export async function apiGetMessages(convId: string): Promise<ApiMessage[]> {
  const res = await request<{ messages: ApiMessage[] }>(`/api/travel-buddies/conversations/${convId}/messages`);
  return res.data?.messages || [];
}

export async function apiSendMessage(convId: string, text: string): Promise<{ success: boolean; message?: ApiMessage; error?: string }> {
  const res = await request<{ message: ApiMessage }>(`/api/travel-buddies/conversations/${convId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, message: res.data?.message };
}

// --- BLOCKING ---
export async function apiBlockUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/blocks/${userId}`, { method: 'POST' });
  return { success: res.success, error: res.error };
}

export async function apiUnblockUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/blocks/${userId}`, { method: 'DELETE' });
  return { success: res.success, error: res.error };
}

export async function apiGetBlockedIds(): Promise<string[]> {
  const res = await request<{ blockedIds: string[] }>('/api/travel-buddies/blocks');
  return res.data?.blockedIds || [];
}

// --- NOTIFICATIONS ---
export interface ApiNotification {
  id: string;
  recipientId: string;
  actorId: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

export async function apiGetNotifications(): Promise<{ notifications: ApiNotification[]; unreadCount: number }> {
  const res = await request<{ notifications: ApiNotification[]; unreadCount: number }>('/api/travel-buddies/notifications');
  return {
    notifications: res.data?.notifications || [],
    unreadCount: res.data?.unreadCount || 0,
  };
}

export async function apiMarkNotificationRead(id: string): Promise<void> {
  await request(`/api/travel-buddies/notifications/${id}/read`, { method: 'POST' });
}

export async function apiMarkAllNotificationsRead(): Promise<void> {
  await request('/api/travel-buddies/notifications/read-all', { method: 'POST' });
}

// --- REPORTS & MODERATION ---
export async function apiSubmitReport(data: {
  targetType: 'post' | 'comment' | 'user' | 'trip' | 'conversation';
  targetId: string;
  reason: string;
  details?: string;
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await request<{ message: string }>('/api/travel-buddies/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.success) return { success: false, error: res.error };
  return { success: true, message: res.data?.message };
}

export async function apiGetAdminReports(status?: string): Promise<any[]> {
  const query = status ? `?status=${status}` : '';
  const res = await request<{ reports: any[] }>(`/api/travel-buddies/admin/reports${query}`);
  return res.data?.reports || [];
}

export async function apiResolveAdminReport(
  reportId: string,
  data: { action: 'resolved' | 'dismissed'; resolutionNotes?: string; deleteContent?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const res = await request(`/api/travel-buddies/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return { success: res.success, error: res.error };
}

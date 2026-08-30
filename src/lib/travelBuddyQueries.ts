import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  TravelBuddyProfile,
  TravelBuddyRequest,
  MatchedTravelBuddy,
  BuddyRequestStatus,
} from '../types';

// Storage keys for offline resilience and local dev caching
const LOCAL_PROFILES_KEY = 'azraq_travel_buddy_profiles_cache';
const LOCAL_REQUESTS_KEY = 'azraq_travel_buddy_requests_cache';

// No fake or mock buddy profiles; real profiles stored in Firestore
export const DEMO_BUDDY_PROFILES: TravelBuddyProfile[] = [];

export const AVAILABLE_DESTINATIONS = [
  'Bangkok',
  'Phuket',
  'Pattaya',
  'Dubai',
  'Abu Dhabi',
  'Kuala Lumpur',
  'Langkawi',
  'Penang',
  'Maldives',
  'Bali',
  'Singapore',
  "Cox's Bazar",
  'Sajek Valley',
  'Sylhet & Sreemangal',
  'Kathmandu & Pokhara',
  'Istanbul',
];

export const AVAILABLE_TRAVEL_STYLES = [
  'Food & Culture',
  'Luxury',
  'Backpacking / Budget',
  'Family',
  'Adventure & Nature',
  'Beach & Relaxation',
  'Photography',
  'Shopping',
  'Solo Travel',
];

export const AVAILABLE_LANGUAGES = [
  'Bangla',
  'English',
  'Hindi',
  'Arabic',
  'Malay',
  'Thai',
];

/**
 * Generate a deterministic request ID between two users
 */
export function getBuddyRequestId(senderId: string, receiverId: string): string {
  return `${senderId}__${receiverId}`;
}

/**
 * Validates travel buddy profile form fields
 */
export function validateBuddyProfile(data: Partial<TravelBuddyProfile>): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.displayName || !data.displayName.trim()) {
    errors.displayName = 'Display name is required.';
  } else if (data.displayName.trim().length > 60) {
    errors.displayName = 'Display name cannot exceed 60 characters.';
  }

  if (!data.destinations || data.destinations.length === 0) {
    errors.destinations = 'Please select at least one destination.';
  }

  if (data.bio && data.bio.length > 350) {
    errors.bio = 'Biography cannot exceed 350 characters.';
  }

  if (data.travelStart && data.travelEnd) {
    if (new Date(data.travelStart) > new Date(data.travelEnd)) {
      errors.travelEnd = 'Return date must be on or after departure date.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Check if two date ranges overlap
 */
export function checkDateOverlap(
  startA?: string,
  endA?: string,
  startB?: string,
  endB?: string
): boolean {
  if (!startA || !endA || !startB || !endB) return false;
  const a1 = new Date(startA).getTime();
  const a2 = new Date(endA).getTime();
  const b1 = new Date(startB).getTime();
  const b2 = new Date(endB).getTime();
  if (isNaN(a1) || isNaN(a2) || isNaN(b1) || isNaN(b2)) return false;
  return a1 <= b2 && b1 <= a2;
}

/**
 * Pure matching function that calculates match score, match reasons, and request relationship
 */
export function calculateBuddyMatch(
  currentUserProfile: Partial<TravelBuddyProfile> | null,
  candidate: TravelBuddyProfile,
  existingRequests: TravelBuddyRequest[] = [],
  currentUserId?: string | null
): MatchedTravelBuddy {
  const matchedOn: string[] = [];
  let score = 25; // Baseline compatibility when user profile is active

  if (currentUserProfile) {
    // 1. Shared Destinations (Highest weight: up to +35 points)
    const userDestinations = currentUserProfile.destinations || [];
    const sharedDestinations = candidate.destinations.filter((d) =>
      userDestinations.some((ud) => ud.toLowerCase() === d.toLowerCase())
    );
    if (sharedDestinations.length > 0) {
      score += Math.min(35, sharedDestinations.length * 20);
      matchedOn.push(`${sharedDestinations[0]} plans`);
    }

    // 2. Overlapping Travel Dates (+25 points)
    const datesOverlap = checkDateOverlap(
      currentUserProfile.travelStart,
      currentUserProfile.travelEnd,
      candidate.travelStart,
      candidate.travelEnd
    );
    if (datesOverlap) {
      score += 25;
      matchedOn.push('Dates overlap');
    }

    // 3. Shared Travel Styles (+15 points)
    const userStyles = currentUserProfile.travelStyles || [];
    const sharedStyles = candidate.travelStyles.filter((s) =>
      userStyles.some((us) => us.toLowerCase() === s.toLowerCase())
    );
    if (sharedStyles.length > 0) {
      score += Math.min(15, sharedStyles.length * 8);
      matchedOn.push(`${sharedStyles[0]} style`);
    }

    // 4. Shared Languages (+10 points)
    const userLangs = currentUserProfile.languages || ['Bangla', 'English'];
    const sharedLangs = candidate.languages.filter((l) =>
      userLangs.some((ul) => ul.toLowerCase() === l.toLowerCase())
    );
    if (sharedLangs.length > 0) {
      score += Math.min(10, sharedLangs.length * 5);
      if (sharedLangs.includes('Bangla')) {
        matchedOn.push('Bangla speaking');
      } else {
        matchedOn.push(`${sharedLangs[0]} speaking`);
      }
    }

    // 5. Same Home City (+10 points)
    if (
      currentUserProfile.homeLocation &&
      candidate.homeLocation &&
      currentUserProfile.homeLocation.toLowerCase().split(',')[0].trim() ===
        candidate.homeLocation.toLowerCase().split(',')[0].trim()
    ) {
      score += 10;
      const city = candidate.homeLocation.split(',')[0].trim();
      matchedOn.push(`Same city (${city})`);
    }
  } else {
    // Default score & reasons when browsing as guest
    score = 65;
    if (candidate.destinations.length > 0) {
      matchedOn.push(`${candidate.destinations[0]} trip`);
    }
    if (candidate.travelStyles.length > 0) {
      matchedOn.push(candidate.travelStyles[0]);
    }
    if (candidate.languages.includes('Bangla')) {
      matchedOn.push('Bangla speaking');
    }
  }

  // Ensure score is capped between 35 and 99
  const matchScore = Math.min(99, Math.max(35, Math.round(score)));

  // Trim to max 3 match reasons
  const displayReasons = matchedOn.slice(0, 3);
  if (displayReasons.length === 0) {
    displayReasons.push('Verified explorer');
  }

  // Check request status
  let requestStatus: BuddyRequestStatus | 'connected' | undefined = undefined;
  let requestDirection: 'incoming' | 'outgoing' | undefined = undefined;
  let activeRequestId: string | undefined = undefined;
  let existingRequest: TravelBuddyRequest | undefined = undefined;

  if (currentUserId) {
    const outgoing = existingRequests.find(
      (r) => r.senderId === currentUserId && r.receiverId === candidate.id
    );
    const incoming = existingRequests.find(
      (r) => r.senderId === candidate.id && r.receiverId === currentUserId
    );

    if (outgoing) {
      requestStatus = outgoing.status === 'accepted' ? 'connected' : outgoing.status;
      requestDirection = 'outgoing';
      activeRequestId = outgoing.id;
      existingRequest = outgoing;
    } else if (incoming) {
      requestStatus = incoming.status === 'accepted' ? 'connected' : incoming.status;
      requestDirection = 'incoming';
      activeRequestId = incoming.id;
      existingRequest = incoming;
    }
  }

  return {
    ...candidate,
    matchScore,
    matchedOn: displayReasons,
    requestStatus,
    requestDirection,
    activeRequestId,
    existingRequest,
  };
}

/**
 * Filter buddy candidates based on search terms, destination, and travel style
 */
export function filterBuddyProfiles(
  candidates: MatchedTravelBuddy[],
  search: string,
  destination: string,
  style: string
): MatchedTravelBuddy[] {
  return candidates.filter((b) => {
    // Search filter (name, city, destination, bio)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = b.displayName.toLowerCase().includes(q);
      const matchCity = b.homeLocation.toLowerCase().includes(q);
      const matchBio = b.bio.toLowerCase().includes(q);
      const matchDest = b.destinations.some((d) => d.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchBio && !matchDest) {
        return false;
      }
    }

    // Destination filter
    if (destination && destination !== 'All') {
      const matchDest = b.destinations.some(
        (d) => d.toLowerCase() === destination.toLowerCase()
      );
      if (!matchDest) return false;
    }

    // Travel style filter
    if (style && style !== 'All') {
      const matchStyle = b.travelStyles.some(
        (s) => s.toLowerCase() === style.toLowerCase()
      );
      if (!matchStyle) return false;
    }

    return true;
  });
}

// ----------------------------------------------------
// TRAVEL BUDDIES & SOCIAL PERSISTENCE API FUNCTIONS
// ----------------------------------------------------

/**
 * Fetch all active public buddy profiles with real database users only
 */
export async function fetchBuddyProfiles(): Promise<TravelBuddyProfile[]> {
  try {
    const res = await fetch('/api/travel-buddies/profiles', {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.profiles)) {
        try {
          localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(data.profiles));
        } catch {}
        return data.profiles;
      }
    }
  } catch (err) {
    console.warn('API fetchBuddyProfiles failed, falling back:', err);
  }

  // Fallback to Firestore
  try {
    const profilesRef = collection(db, 'buddy_profiles');
    const q = query(profilesRef, where('isActive', '==', true));
    const snapshot = await getDocs(q);

    const remoteProfiles: TravelBuddyProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as TravelBuddyProfile;
      remoteProfiles.push({
        ...data,
        id: docSnap.id,
      });
    });

    if (remoteProfiles.length > 0) {
      return remoteProfiles;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'buddy_profiles');
  }

  // Fallback to local storage
  try {
    const cached = localStorage.getItem(LOCAL_PROFILES_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return [];
}

/**
 * Fetch single travel buddy profile
 */
export async function fetchMyBuddyProfile(
  userId: string
): Promise<TravelBuddyProfile | null> {
  if (!userId) return null;

  try {
    const res = await fetch(`/api/travel-buddies/profiles/${userId}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.profile) {
        return data.profile;
      }
    }
  } catch {}

  try {
    const docRef = doc(db, 'buddy_profiles', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as TravelBuddyProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `buddy_profiles/${userId}`);
  }

  // Local storage fallback
  try {
    const myCached = localStorage.getItem(`azraq_my_buddy_profile_${userId}`);
    if (myCached) {
      return JSON.parse(myCached) as TravelBuddyProfile;
    }
  } catch {}

  return null;
}

/**
 * Create or update travel buddy profile
 */
export async function saveBuddyProfile(
  profile: TravelBuddyProfile
): Promise<{ success: boolean; profile?: TravelBuddyProfile; error?: string }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch('/api/travel-buddies/profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      const data = await res.json();
      try {
        localStorage.setItem(`azraq_my_buddy_profile_${profile.id}`, JSON.stringify(data.profile || profile));
      } catch {}
      return { success: true, profile: data.profile || profile };
    }
  } catch (err) {
    console.warn('API saveBuddyProfile error:', err);
  }

  // Firestore backup
  try {
    const now = new Date().toISOString();
    const cleanProfile: TravelBuddyProfile = {
      ...profile,
      updatedAt: now,
      createdAt: profile.createdAt || now,
      isActive: profile.isActive ?? true,
    };

    const docRef = doc(db, 'buddy_profiles', profile.id);
    await setDoc(docRef, cleanProfile, { merge: true });

    try {
      localStorage.setItem(`azraq_my_buddy_profile_${profile.id}`, JSON.stringify(cleanProfile));
    } catch {}

    return { success: true, profile: cleanProfile };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `buddy_profiles/${profile.id}`);
    return { success: true, profile };
  }
}

/**
 * Fetch all incoming & outgoing buddy requests for a user
 */
export async function fetchUserRequests(
  userId: string
): Promise<TravelBuddyRequest[]> {
  if (!userId) return [];

  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/requests?userId=${encodeURIComponent(userId)}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.requests)) {
        return data.requests;
      }
    }
  } catch {}

  const requests: TravelBuddyRequest[] = [];
  try {
    const reqRef = collection(db, 'buddy_requests');
    const qSender = query(reqRef, where('senderId', '==', userId));
    const senderSnap = await getDocs(qSender);
    senderSnap.forEach((d) => {
      requests.push(d.data() as TravelBuddyRequest);
    });

    const qReceiver = query(reqRef, where('receiverId', '==', userId));
    const receiverSnap = await getDocs(qReceiver);
    receiverSnap.forEach((d) => {
      const data = d.data() as TravelBuddyRequest;
      if (!requests.some((r) => r.id === data.id)) {
        requests.push(data);
      }
    });

    return requests;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'buddy_requests');
  }

  return [];
}

/**
 * Send a connection request
 */
export async function sendBuddyRequest(
  senderId: string,
  receiverId: string,
  message: string,
  senderProfile?: Partial<TravelBuddyProfile>,
  receiverProfile?: Partial<TravelBuddyProfile>
): Promise<{ success: boolean; request?: TravelBuddyRequest; error?: string }> {
  if (!senderId || !receiverId) {
    return { success: false, error: 'Invalid sender or receiver ID.' };
  }
  if (senderId === receiverId) {
    return { success: false, error: 'Cannot send connection request to yourself.' };
  }

  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch('/api/travel-buddies/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        senderId,
        receiverId,
        message,
        senderProfile,
        receiverProfile,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, request: data.request };
    } else {
      const errData = await res.json().catch(() => ({}));
      return { success: false, error: errData.error || 'Failed to send request' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error sending request' };
  }
}

/**
 * Respond to an incoming buddy request (accept or decline)
 */
export async function respondToBuddyRequest(
  requestId: string,
  status: 'accepted' | 'declined',
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/requests/${encodeURIComponent(requestId)}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status, userId: currentUserId }),
    });

    if (res.ok) {
      return { success: true };
    }
  } catch {}

  return { success: true };
}

/**
 * Cancel a pending outgoing buddy request
 */
export async function cancelBuddyRequest(
  requestId: string,
  currentUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/requests/${encodeURIComponent(requestId)}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (res.ok) {
      return { success: true };
    }
  } catch {}

  return { success: true };
}

// ----------------------------------------------------
// COMMUNITIES API
// ----------------------------------------------------

export async function fetchCommunities(userId?: string): Promise<any[]> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const url = userId ? `/api/travel-buddies/communities?userId=${encodeURIComponent(userId)}` : '/api/travel-buddies/communities';
    const res = await fetch(url, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.communities || [];
    }
  } catch (err) {
    console.warn('fetchCommunities error:', err);
  }
  return [];
}

export async function joinCommunity(communityId: string, userId: string): Promise<{ success: boolean; community?: any }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/communities/${encodeURIComponent(communityId)}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, community: data.community };
    }
  } catch {}
  return { success: false };
}

export async function leaveCommunity(communityId: string, userId: string): Promise<{ success: boolean; community?: any }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/communities/${encodeURIComponent(communityId)}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, community: data.community };
    }
  } catch {}
  return { success: false };
}

export async function createCommunity(communityData: any): Promise<{ success: boolean; community?: any; error?: string }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch('/api/travel-buddies/communities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(communityData),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, community: data.community };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to create community' };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// GROUP TRIPS API
// ----------------------------------------------------

export async function fetchGroupTrips(userId?: string): Promise<any[]> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const url = userId ? `/api/travel-buddies/trips?userId=${encodeURIComponent(userId)}` : '/api/travel-buddies/trips';
    const res = await fetch(url, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      return data.trips || [];
    }
  } catch (err) {
    console.warn('fetchGroupTrips error:', err);
  }
  return [];
}

export async function joinGroupTrip(tripId: string, userId: string): Promise<{ success: boolean; trip?: any; error?: string }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/trips/${encodeURIComponent(tripId)}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, trip: data.trip };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to join group trip' };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function leaveGroupTrip(tripId: string, userId: string): Promise<{ success: boolean; trip?: any; error?: string }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/trips/${encodeURIComponent(tripId)}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, trip: data.trip };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to leave group trip' };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createGroupTrip(tripData: any): Promise<{ success: boolean; trip?: any; error?: string }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch('/api/travel-buddies/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(tripData),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, trip: data.trip };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to create group trip' };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// SOCIAL POSTS & FEED API
// ----------------------------------------------------

export async function fetchSocialPosts(options: {
  post_type?: string;
  hashtag?: string;
  filter?: string;
  community_id?: string;
  userId?: string;
  limitCount?: number;
} = {}): Promise<any[]> {
  try {
    const params = new URLSearchParams();
    if (options.post_type) params.set('post_type', options.post_type);
    if (options.hashtag) params.set('hashtag', options.hashtag);
    if (options.filter) params.set('filter', options.filter);
    if (options.community_id) params.set('community_id', options.community_id);
    if (options.userId) params.set('userId', options.userId);
    if (options.limitCount) params.set('limitCount', String(options.limitCount));

    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/posts?${params.toString()}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (res.ok) {
      const data = await res.json();
      return data.posts || [];
    }
  } catch (err) {
    console.warn('fetchSocialPosts error:', err);
  }
  return [];
}

export async function createSocialPost(postData: any): Promise<{ success: boolean; post?: any; error?: string }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch('/api/travel-buddies/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(postData),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, post: data.post };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to create post' };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function togglePostReaction(postId: string, reaction_type: string, userId: string): Promise<{
  success: boolean;
  likes_count?: number;
  reaction_counts?: Record<string, number>;
  user_reaction?: string | null;
}> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/posts/${encodeURIComponent(postId)}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ reaction_type, userId }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return { success: false };
}

export async function getPostComments(postId: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/travel-buddies/posts/${encodeURIComponent(postId)}/comments`);
    if (res.ok) {
      const data = await res.json();
      return data.comments || [];
    }
  } catch {}
  return [];
}

export async function addPostComment(postId: string, content: string, userId: string): Promise<{ success: boolean; comment?: any; error?: string }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/posts/${encodeURIComponent(postId)}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content, userId }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, comment: data.comment };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to add comment' };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleSavePost(postId: string, userId: string): Promise<{ success: boolean; is_saved?: boolean }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/posts/${encodeURIComponent(postId)}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, is_saved: data.is_saved };
    }
  } catch {}
  return { success: false };
}

export async function deleteSocialPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/posts/${encodeURIComponent(postId)}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (res.ok) {
      return { success: true };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to delete post' };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// SOCIAL NOTIFICATIONS API
// ----------------------------------------------------

export async function fetchSocialNotifications(userId: string): Promise<{ notifications: any[]; unreadCount: number }> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/notifications?userId=${encodeURIComponent(userId)}`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        notifications: data.notifications || [],
        unreadCount: data.unreadCount || 0,
      };
    }
  } catch {}
  return { notifications: [], unreadCount: 0 };
}

export async function markNotificationAsRead(id: string, userId: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch(`/api/travel-buddies/notifications/${encodeURIComponent(id)}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const token = localStorage.getItem('azraq_auth_token') || '';
    const res = await fetch('/api/travel-buddies/notifications/read-all', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

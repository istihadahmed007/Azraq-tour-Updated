import fs from 'fs';
import path from 'path';

export interface CommunityProfile {
  userId: string;
  username: string; // unique, lowercase
  displayName: string;
  avatarUrl: string;
  coverUrl?: string;
  bio?: string;
  homeCity?: string;
  languages: string[];
  travelInterests: string[];
  travelStyles: string[]; // self-reported
  destinationsVisited: string[]; // self-reported
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityFollow {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  caption: string;
  mediaUrls: string[];
  destination?: string;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface CommunityLike {
  postId: string;
  userId: string;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunitySavedPost {
  userId: string;
  postId: string;
  createdAt: string;
}

export type TripStatus = 'open' | 'full' | 'cancelled' | 'completed';

export interface CommunityTrip {
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
  approvedTravelers: string[]; // User IDs (includes organizer)
  status: TripStatus;
  description: string;
  meetingNotes?: string; // Private to approved members
  createdAt: string;
  updatedAt: string;
}

export type TripRequestStatus = 'pending' | 'accepted' | 'declined' | 'withdrawn';

export interface CommunityTripRequest {
  id: string;
  tripId: string;
  applicantId: string;
  introduction: string;
  status: TripRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityConversation {
  id: string;
  participants: string[];
  status: 'active' | 'request';
  requestedBy: string;
  acceptedBy?: string;
  lastMessageText: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readBy: string[];
}

export interface CommunityBlock {
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export type CommunityNotificationType =
  | 'follow'
  | 'comment'
  | 'like'
  | 'trip_request'
  | 'trip_accepted'
  | 'trip_declined'
  | 'message';

export interface CommunityNotification {
  id: string;
  recipientId: string;
  actorId: string;
  type: CommunityNotificationType;
  title: string;
  message: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

export type ReportTargetType = 'post' | 'comment' | 'user' | 'trip' | 'conversation';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface CommunityReport {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  details?: string;
  status: ReportStatus;
  adminNotes?: string;
  resolvedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

interface TravelBuddiesDbFileSchema {
  profiles: Record<string, CommunityProfile>; // userId -> CommunityProfile
  follows: CommunityFollow[];
  posts: Record<string, CommunityPost>; // postId -> CommunityPost
  likes: CommunityLike[];
  comments: Record<string, CommunityComment[]>; // postId -> CommunityComment[]
  savedPosts: CommunitySavedPost[];
  trips: Record<string, CommunityTrip>; // tripId -> CommunityTrip
  tripRequests: Record<string, CommunityTripRequest>; // requestId -> CommunityTripRequest
  conversations: Record<string, CommunityConversation>; // convId -> CommunityConversation
  messages: Record<string, CommunityMessage[]>; // convId -> CommunityMessage[]
  blocks: CommunityBlock[];
  notifications: Record<string, CommunityNotification[]>; // recipientId -> CommunityNotification[]
  reports: Record<string, CommunityReport>; // reportId -> CommunityReport
}

const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp' : process.cwd());
const DB_FILE = path.join(DATA_DIR, '.travel_buddies_db.json');

export class TravelBuddiesStore {
  private data: TravelBuddiesDbFileSchema;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): TravelBuddiesDbFileSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          profiles: parsed.profiles || {},
          follows: Array.isArray(parsed.follows) ? parsed.follows : [],
          posts: parsed.posts || {},
          likes: Array.isArray(parsed.likes) ? parsed.likes : [],
          comments: parsed.comments || {},
          savedPosts: Array.isArray(parsed.savedPosts) ? parsed.savedPosts : [],
          trips: parsed.trips || {},
          tripRequests: parsed.tripRequests || {},
          conversations: parsed.conversations || {},
          messages: parsed.messages || {},
          blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
          notifications: parsed.notifications || {},
          reports: parsed.reports || {},
        };
      }
    } catch (e) {
      console.warn('[TravelBuddiesStore] Could not load DB file from disk:', e);
    }

    return {
      profiles: {},
      follows: [],
      posts: {},
      likes: [],
      comments: {},
      savedPosts: [],
      trips: {},
      tripRequests: {},
      conversations: {},
      messages: {},
      blocks: [],
      notifications: {},
      reports: {},
    };
  }

  public saveToDisk() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (e) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.error('[TravelBuddiesStore] Failed to write DB file:', err);
      }
    }
  }

  // --------------------------------------------------------------------------
  // PROFILES
  // --------------------------------------------------------------------------
  public getProfile(userId: string): CommunityProfile | null {
    return this.data.profiles[userId] || null;
  }

  public getProfileByUsername(username: string): CommunityProfile | null {
    const norm = username.trim().toLowerCase();
    for (const p of Object.values(this.data.profiles)) {
      if (p.username.toLowerCase() === norm) return p;
    }
    return null;
  }

  public isUsernameTaken(username: string, excludeUserId?: string): boolean {
    const norm = username.trim().toLowerCase();
    for (const p of Object.values(this.data.profiles)) {
      if (p.username.toLowerCase() === norm && p.userId !== excludeUserId) {
        return true;
      }
    }
    return false;
  }

  public upsertProfile(profile: CommunityProfile): CommunityProfile {
    this.data.profiles[profile.userId] = profile;
    this.saveToDisk();
    return profile;
  }

  public listPublicProfiles(limit = 20, search?: string): CommunityProfile[] {
    let profiles = Object.values(this.data.profiles).filter((p) => !p.isPrivate);
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      profiles = profiles.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.username.toLowerCase().includes(q) ||
          (p.homeCity && p.homeCity.toLowerCase().includes(q)) ||
          p.destinationsVisited.some((d) => d.toLowerCase().includes(q)) ||
          p.travelStyles.some((s) => s.toLowerCase().includes(q))
      );
    }
    profiles.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    return profiles.slice(0, limit);
  }

  public deleteProfile(userId: string) {
    delete this.data.profiles[userId];
    // Remove their posts
    for (const [postId, post] of Object.entries(this.data.posts)) {
      if (post.authorId === userId) {
        delete this.data.posts[postId];
        delete this.data.comments[postId];
      }
    }
    // Remove follows
    this.data.follows = this.data.follows.filter(
      (f) => f.followerId !== userId && f.followingId !== userId
    );
    // Remove likes
    this.data.likes = this.data.likes.filter((l) => l.userId !== userId);
    // Remove saved posts
    this.data.savedPosts = this.data.savedPosts.filter((s) => s.userId !== userId);
    this.saveToDisk();
  }

  // --------------------------------------------------------------------------
  // FOLLOWS
  // --------------------------------------------------------------------------
  public isFollowing(followerId: string, followingId: string): boolean {
    return this.data.follows.some(
      (f) => f.followerId === followerId && f.followingId === followingId
    );
  }

  public followUser(followerId: string, followingId: string): boolean {
    if (followerId === followingId) return false;
    if (this.isFollowing(followerId, followingId)) return true;
    this.data.follows.push({
      followerId,
      followingId,
      createdAt: new Date().toISOString(),
    });
    this.saveToDisk();
    return true;
  }

  public unfollowUser(followerId: string, followingId: string): boolean {
    const initialLen = this.data.follows.length;
    this.data.follows = this.data.follows.filter(
      (f) => !(f.followerId === followerId && f.followingId === followingId)
    );
    if (this.data.follows.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public getFollowersCount(userId: string): number {
    return this.data.follows.filter((f) => f.followingId === userId).length;
  }

  public getFollowingCount(userId: string): number {
    return this.data.follows.filter((f) => f.followerId === userId).length;
  }

  public getFollowingIds(userId: string): string[] {
    return this.data.follows
      .filter((f) => f.followerId === userId)
      .map((f) => f.followingId);
  }

  public getFollowerIds(userId: string): string[] {
    return this.data.follows
      .filter((f) => f.followingId === userId)
      .map((f) => f.followerId);
  }

  // --------------------------------------------------------------------------
  // POSTS
  // --------------------------------------------------------------------------
  public getPost(postId: string): CommunityPost | null {
    return this.data.posts[postId] || null;
  }

  public createPost(post: CommunityPost): CommunityPost {
    this.data.posts[post.id] = post;
    this.saveToDisk();
    return post;
  }

  public updatePost(postId: string, updates: Partial<CommunityPost>): CommunityPost | null {
    const existing = this.data.posts[postId];
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.data.posts[postId] = updated;
    this.saveToDisk();
    return updated;
  }

  public deletePost(postId: string): boolean {
    if (this.data.posts[postId]) {
      delete this.data.posts[postId];
      delete this.data.comments[postId];
      this.data.likes = this.data.likes.filter((l) => l.postId !== postId);
      this.data.savedPosts = this.data.savedPosts.filter((s) => s.postId !== postId);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public getPostsFeed(options: {
    type: 'explore' | 'following';
    currentUserId?: string;
    authorId?: string;
    limit?: number;
    cursor?: string;
  }): { posts: CommunityPost[]; nextCursor?: string } {
    const limit = options.limit || 15;
    let list = Object.values(this.data.posts);

    // Filter blocked users
    if (options.currentUserId) {
      const blockedIds = new Set(this.getBlockedUserIds(options.currentUserId));
      list = list.filter((p) => !blockedIds.has(p.authorId));
    }

    if (options.authorId) {
      list = list.filter((p) => p.authorId === options.authorId);
    } else if (options.type === 'following') {
      if (!options.currentUserId) return { posts: [] };
      const following = new Set(this.getFollowingIds(options.currentUserId));
      // Include following authors + self
      list = list.filter((p) => following.has(p.authorId) || p.authorId === options.currentUserId);
    }

    // Chronological order (newest first)
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let startIndex = 0;
    if (options.cursor) {
      const idx = list.findIndex((p) => p.id === options.cursor);
      if (idx !== -1) startIndex = idx + 1;
    }

    const sliced = list.slice(startIndex, startIndex + limit);
    const nextCursor = sliced.length === limit ? sliced[sliced.length - 1].id : undefined;

    return { posts: sliced, nextCursor };
  }

  // --------------------------------------------------------------------------
  // LIKES
  // --------------------------------------------------------------------------
  public isPostLiked(postId: string, userId: string): boolean {
    return this.data.likes.some((l) => l.postId === postId && l.userId === userId);
  }

  public toggleLike(postId: string, userId: string): { isLiked: boolean; count: number } {
    const post = this.data.posts[postId];
    if (!post) return { isLiked: false, count: 0 };

    const idx = this.data.likes.findIndex((l) => l.postId === postId && l.userId === userId);
    let isLiked = false;

    if (idx !== -1) {
      this.data.likes.splice(idx, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
      isLiked = false;
    } else {
      this.data.likes.push({ postId, userId, createdAt: new Date().toISOString() });
      post.likesCount += 1;
      isLiked = true;
    }

    this.saveToDisk();
    return { isLiked, count: post.likesCount };
  }

  // --------------------------------------------------------------------------
  // COMMENTS
  // --------------------------------------------------------------------------
  public getComments(postId: string): CommunityComment[] {
    return this.data.comments[postId] || [];
  }

  public addComment(comment: CommunityComment): CommunityComment {
    if (!this.data.comments[comment.postId]) {
      this.data.comments[comment.postId] = [];
    }
    this.data.comments[comment.postId].push(comment);
    if (this.data.posts[comment.postId]) {
      this.data.posts[comment.postId].commentsCount = this.data.comments[comment.postId].length;
    }
    this.saveToDisk();
    return comment;
  }

  public updateComment(postId: string, commentId: string, text: string): CommunityComment | null {
    const list = this.data.comments[postId];
    if (!list) return null;
    const comment = list.find((c) => c.id === commentId);
    if (!comment) return null;
    comment.text = text;
    comment.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return comment;
  }

  public deleteComment(postId: string, commentId: string): boolean {
    const list = this.data.comments[postId];
    if (!list) return false;
    const idx = list.findIndex((c) => c.id === commentId);
    if (idx !== -1) {
      // Remove the comment and any direct replies to it
      this.data.comments[postId] = list.filter((c) => c.id !== commentId && c.parentId !== commentId);
      if (this.data.posts[postId]) {
        this.data.posts[postId].commentsCount = this.data.comments[postId].length;
      }
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // SAVED POSTS (PRIVATE)
  // --------------------------------------------------------------------------
  public isPostSaved(postId: string, userId: string): boolean {
    return this.data.savedPosts.some((s) => s.postId === postId && s.userId === userId);
  }

  public toggleSavePost(postId: string, userId: string): boolean {
    const idx = this.data.savedPosts.findIndex(
      (s) => s.postId === postId && s.userId === userId
    );
    let saved = false;
    if (idx !== -1) {
      this.data.savedPosts.splice(idx, 1);
      saved = false;
    } else {
      this.data.savedPosts.push({ postId, userId, createdAt: new Date().toISOString() });
      saved = true;
    }
    this.saveToDisk();
    return saved;
  }

  public getSavedPosts(userId: string): CommunityPost[] {
    const savedIds = new Set(
      this.data.savedPosts.filter((s) => s.userId === userId).map((s) => s.postId)
    );
    const list: CommunityPost[] = [];
    for (const post of Object.values(this.data.posts)) {
      if (savedIds.has(post.id)) {
        list.push(post);
      }
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  // --------------------------------------------------------------------------
  // TRIPS & COMPANIONS
  // --------------------------------------------------------------------------
  public getTrip(tripId: string): CommunityTrip | null {
    return this.data.trips[tripId] || null;
  }

  public createTrip(trip: CommunityTrip): CommunityTrip {
    this.data.trips[trip.id] = trip;
    this.saveToDisk();
    return trip;
  }

  public updateTrip(tripId: string, updates: Partial<CommunityTrip>): CommunityTrip | null {
    const existing = this.data.trips[tripId];
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.data.trips[tripId] = updated;
    this.saveToDisk();
    return updated;
  }

  public deleteTrip(tripId: string): boolean {
    if (this.data.trips[tripId]) {
      delete this.data.trips[tripId];
      // Clean up any requests for this trip
      for (const [reqId, req] of Object.entries(this.data.tripRequests)) {
        if (req.tripId === tripId) {
          delete this.data.tripRequests[reqId];
        }
      }
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public getTrips(filters: {
    destination?: string;
    travelStyle?: string;
    language?: string;
    maxBudget?: number;
    organizerId?: string;
    excludeExpired?: boolean;
    currentUserId?: string;
  } = {}): CommunityTrip[] {
    let list = Object.values(this.data.trips);
    const nowIso = new Date().toISOString().slice(0, 10);

    if (filters.excludeExpired) {
      list = list.filter((t) => t.endDate >= nowIso && t.status !== 'cancelled' && t.status !== 'completed');
    }

    if (filters.organizerId) {
      list = list.filter((t) => t.organizerId === filters.organizerId);
    }

    if (filters.destination && filters.destination !== 'All') {
      const q = filters.destination.toLowerCase().trim();
      list = list.filter((t) => t.destination.toLowerCase().includes(q));
    }

    if (filters.travelStyle && filters.travelStyle !== 'All') {
      list = list.filter((t) => t.travelStyle === filters.travelStyle);
    }

    if (filters.language && filters.language !== 'All') {
      list = list.filter((t) => t.languages && t.languages.includes(filters.language!));
    }

    if (filters.maxBudget && filters.maxBudget > 0) {
      list = list.filter((t) => (t.budgetMax ? t.budgetMax <= filters.maxBudget! : true));
    }

    if (filters.currentUserId) {
      const blockedIds = new Set(this.getBlockedUserIds(filters.currentUserId));
      list = list.filter((t) => !blockedIds.has(t.organizerId));
    }

    list.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return list;
  }

  // --------------------------------------------------------------------------
  // TRIP JOIN REQUESTS
  // --------------------------------------------------------------------------
  public getTripRequestsForTrip(tripId: string): CommunityTripRequest[] {
    return Object.values(this.data.tripRequests).filter((r) => r.tripId === tripId);
  }

  public getUserTripRequests(userId: string): CommunityTripRequest[] {
    return Object.values(this.data.tripRequests).filter((r) => r.applicantId === userId);
  }

  public getExistingTripRequest(tripId: string, applicantId: string): CommunityTripRequest | null {
    for (const r of Object.values(this.data.tripRequests)) {
      if (r.tripId === tripId && r.applicantId === applicantId && r.status === 'pending') {
        return r;
      }
    }
    return null;
  }

  public createTripRequest(req: CommunityTripRequest): CommunityTripRequest {
    this.data.tripRequests[req.id] = req;
    this.saveToDisk();
    return req;
  }

  public updateTripRequestStatus(
    requestId: string,
    status: TripRequestStatus
  ): CommunityTripRequest | null {
    const existing = this.data.tripRequests[requestId];
    if (!existing) return null;
    existing.status = status;
    existing.updatedAt = new Date().toISOString();

    const trip = this.data.trips[existing.tripId];
    if (trip) {
      if (status === 'accepted') {
        if (!trip.approvedTravelers.includes(existing.applicantId)) {
          trip.approvedTravelers.push(existing.applicantId);
          if (trip.approvedTravelers.length >= trip.maxTravelers) {
            trip.status = 'full';
          }
        }
      } else if (status === 'withdrawn' || status === 'declined') {
        trip.approvedTravelers = trip.approvedTravelers.filter((id) => id !== existing.applicantId);
        if (trip.approvedTravelers.length < trip.maxTravelers && trip.status === 'full') {
          trip.status = 'open';
        }
      }
    }

    this.saveToDisk();
    return existing;
  }

  public leaveTrip(tripId: string, userId: string): boolean {
    const trip = this.data.trips[tripId];
    if (!trip) return false;
    if (trip.organizerId === userId) return false; // Organizer cannot leave own trip (must cancel)

    const initialLen = trip.approvedTravelers.length;
    trip.approvedTravelers = trip.approvedTravelers.filter((id) => id !== userId);
    if (trip.approvedTravelers.length !== initialLen) {
      if (trip.approvedTravelers.length < trip.maxTravelers && trip.status === 'full') {
        trip.status = 'open';
      }
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // PRIVATE MESSAGING & CONVERSATIONS
  // --------------------------------------------------------------------------
  public getOrCreateConversation(userA: string, userB: string): CommunityConversation {
    const participants = [userA, userB].sort();
    for (const c of Object.values(this.data.conversations)) {
      if (
        c.participants.length === 2 &&
        c.participants.includes(userA) &&
        c.participants.includes(userB)
      ) {
        return c;
      }
    }

    const id = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    // If userB follows userA, auto-active; otherwise message request
    const isMutualOrFollowing = this.isFollowing(userB, userA);
    const conv: CommunityConversation = {
      id,
      participants,
      status: isMutualOrFollowing ? 'active' : 'request',
      requestedBy: userA,
      lastMessageText: '',
      lastMessageAt: now,
      createdAt: now,
      updatedAt: now,
    };

    this.data.conversations[id] = conv;
    this.data.messages[id] = [];
    this.saveToDisk();
    return conv;
  }

  public getConversation(convId: string): CommunityConversation | null {
    return this.data.conversations[convId] || null;
  }

  public getUserConversations(userId: string): CommunityConversation[] {
    const blocked = new Set(this.getBlockedUserIds(userId));
    const list = Object.values(this.data.conversations).filter((c) => {
      if (!c.participants.includes(userId)) return false;
      const otherId = c.participants.find((p) => p !== userId);
      return !otherId || !blocked.has(otherId);
    });
    list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    return list;
  }

  public acceptMessageRequest(convId: string, userId: string): boolean {
    const conv = this.data.conversations[convId];
    if (!conv || !conv.participants.includes(userId)) return false;
    conv.status = 'active';
    conv.acceptedBy = userId;
    conv.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return true;
  }

  public getMessages(convId: string): CommunityMessage[] {
    return this.data.messages[convId] || [];
  }

  public sendMessage(convId: string, senderId: string, text: string): CommunityMessage | null {
    const conv = this.data.conversations[convId];
    if (!conv || !conv.participants.includes(senderId)) return null;

    // Check if blocked by any participant
    const otherId = conv.participants.find((p) => p !== senderId);
    if (otherId && this.isBlocked(otherId, senderId)) {
      return null;
    }

    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const msg: CommunityMessage = {
      id,
      conversationId: convId,
      senderId,
      text: text.trim(),
      createdAt: now,
      readBy: [senderId],
    };

    if (!this.data.messages[convId]) {
      this.data.messages[convId] = [];
    }
    this.data.messages[convId].push(msg);

    conv.lastMessageText = text.trim();
    conv.lastMessageAt = now;
    conv.updatedAt = now;

    this.saveToDisk();
    return msg;
  }

  public markMessagesRead(convId: string, userId: string) {
    const list = this.data.messages[convId];
    if (!list) return;
    let changed = false;
    for (const m of list) {
      if (!m.readBy.includes(userId)) {
        m.readBy.push(userId);
        changed = true;
      }
    }
    if (changed) this.saveToDisk();
  }

  public getUnreadMessagesCount(userId: string): number {
    let unread = 0;
    for (const conv of Object.values(this.data.conversations)) {
      if (conv.participants.includes(userId)) {
        const msgs = this.data.messages[conv.id] || [];
        for (const m of msgs) {
          if (m.senderId !== userId && !m.readBy.includes(userId)) {
            unread++;
          }
        }
      }
    }
    return unread;
  }

  // --------------------------------------------------------------------------
  // BLOCKING & SAFETY
  // --------------------------------------------------------------------------
  public isBlocked(blockerId: string, blockedId: string): boolean {
    return this.data.blocks.some(
      (b) => b.blockerId === blockerId && b.blockedId === blockedId
    );
  }

  public getBlockedUserIds(userId: string): string[] {
    return this.data.blocks
      .filter((b) => b.blockerId === userId)
      .map((b) => b.blockedId);
  }

  public blockUser(blockerId: string, blockedId: string): boolean {
    if (blockerId === blockedId) return false;
    if (this.isBlocked(blockerId, blockedId)) return true;
    this.data.blocks.push({
      blockerId,
      blockedId,
      createdAt: new Date().toISOString(),
    });
    // Unfollow both ways
    this.unfollowUser(blockerId, blockedId);
    this.unfollowUser(blockedId, blockerId);
    this.saveToDisk();
    return true;
  }

  public unblockUser(blockerId: string, blockedId: string): boolean {
    const len = this.data.blocks.length;
    this.data.blocks = this.data.blocks.filter(
      (b) => !(b.blockerId === blockerId && b.blockedId === blockedId)
    );
    if (this.data.blocks.length !== len) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // NOTIFICATIONS
  // --------------------------------------------------------------------------
  public createNotification(notif: CommunityNotification) {
    if (!this.data.notifications[notif.recipientId]) {
      this.data.notifications[notif.recipientId] = [];
    }
    // Prevent duplicate unread notifications of same type & actor
    const existing = this.data.notifications[notif.recipientId].find(
      (n) => n.actorId === notif.actorId && n.type === notif.type && !n.isRead
    );
    if (existing) {
      existing.createdAt = notif.createdAt;
      existing.message = notif.message;
    } else {
      this.data.notifications[notif.recipientId].unshift(notif);
    }
    // Keep max 100 notifications per user
    if (this.data.notifications[notif.recipientId].length > 100) {
      this.data.notifications[notif.recipientId] = this.data.notifications[notif.recipientId].slice(0, 100);
    }
    this.saveToDisk();
  }

  public getUserNotifications(userId: string): CommunityNotification[] {
    return this.data.notifications[userId] || [];
  }

  public markNotificationRead(userId: string, notifId: string): boolean {
    const list = this.data.notifications[userId];
    if (!list) return false;
    const n = list.find((item) => item.id === notifId);
    if (n) {
      n.isRead = true;
      this.saveToDisk();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string): boolean {
    const list = this.data.notifications[userId];
    if (!list) return false;
    list.forEach((n) => (n.isRead = true));
    this.saveToDisk();
    return true;
  }

  // --------------------------------------------------------------------------
  // REPORTS & MODERATION
  // --------------------------------------------------------------------------
  public createReport(report: CommunityReport): CommunityReport {
    this.data.reports[report.id] = report;
    this.saveToDisk();
    return report;
  }

  public getReports(status?: ReportStatus): CommunityReport[] {
    const list = Object.values(this.data.reports);
    if (status) {
      return list.filter((r) => r.status === status);
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }

  public resolveReport(
    reportId: string,
    action: 'resolved' | 'dismissed',
    adminId: string,
    notes?: string
  ): CommunityReport | null {
    const rep = this.data.reports[reportId];
    if (!rep) return null;
    rep.status = action;
    rep.resolvedBy = adminId;
    rep.adminNotes = notes || '';
    rep.resolvedAt = new Date().toISOString();
    this.saveToDisk();
    return rep;
  }
}

export const travelBuddiesStore = new TravelBuddiesStore();

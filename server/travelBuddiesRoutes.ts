import express from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import {
  travelBuddiesStore,
  CommunityProfile,
  CommunityPost,
  CommunityTrip,
  CommunityTripRequest,
  CommunityConversation,
  CommunityMessage,
  CommunityComment,
  CommunityNotification,
  CommunityReport,
  TripRequestStatus,
  ReportStatus,
} from './travelBuddiesStore';
import { sessionStore } from './sessionStore';

export interface UserLookup {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isAdmin?: boolean;
  role?: string;
  isSuspended?: boolean;
}

export interface TravelBuddiesRouteOptions {
  findUserById: (uid: string) => UserLookup | undefined;
  findUserByEmail: (email: string) => UserLookup | undefined;
}

export function createTravelBuddiesRouter(options: TravelBuddiesRouteOptions): express.Router {
  const router = express.Router();
  const { findUserById, findUserByEmail } = options;

  const postUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'posts');
  if (!fs.existsSync(postUploadsDir)) {
    fs.mkdirSync(postUploadsDir, { recursive: true });
  }

  // --- Auth Helpers ---
  function getCallerUser(req: express.Request): UserLookup | null {
    const authHeader = req.headers.authorization || '';
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-auth-token']) {
      token = String(req.headers['x-auth-token']).trim();
    }
    if (!token) return null;

    const session = sessionStore.getSession(token);
    if (!session) return null;

    let user = findUserById(session.userId);
    if (!user && session.email) {
      user = findUserByEmail(session.email);
    }
    if (!user) {
      user = {
        uid: session.userId,
        email: session.email,
        role: session.role,
        isAdmin: session.role === 'admin' || session.role === 'owner',
      };
    }
    if (user.isSuspended) return null;
    return user;
  }

  function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const caller = getCallerUser(req);
    if (!caller) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in to Azraq Trips to continue.',
      });
    }
    (req as any).user = caller;
    next();
  }

  function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
    const caller = getCallerUser(req);
    if (!caller) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in as an administrator.',
      });
    }
    const isAdmin = caller.role === 'admin' || caller.role === 'owner' || caller.isAdmin === true;
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Admin privilege required.',
      });
    }
    (req as any).user = caller;
    next();
  }

  function notifyUser(
    recipientId: string,
    actorId: string,
    type: CommunityNotification['type'],
    title: string,
    message: string,
    linkUrl: string
  ) {
    const notif: CommunityNotification = {
      id: `notif_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      recipientId,
      actorId,
      type,
      title,
      message,
      linkUrl,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    travelBuddiesStore.createNotification(notif);
  }

  // Helper to get or create basic community profile for a registered user
  function ensureCommunityProfile(user: UserLookup): CommunityProfile {
    let profile = travelBuddiesStore.getProfile(user.uid);
    if (!profile) {
      const emailPrefix = (user.email || 'traveler').split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
      let baseUsername = emailPrefix.length >= 3 ? emailPrefix : `user_${user.uid.slice(0, 6)}`;
      let finalUsername = baseUsername;
      let counter = 1;
      while (travelBuddiesStore.isUsernameTaken(finalUsername)) {
        finalUsername = `${baseUsername}_${counter++}`;
      }

      profile = travelBuddiesStore.upsertProfile({
        userId: user.uid,
        username: finalUsername,
        displayName: user.displayName || finalUsername,
        avatarUrl: user.photoURL || '',
        coverUrl: '',
        bio: '',
        homeCity: '',
        languages: ['English', 'Bangla'],
        travelInterests: [],
        travelStyles: [],
        destinationsVisited: [],
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    return profile;
  }

  // Sanitizer: Strictly omit private email, phone, and credentials from public profile
  function sanitizeProfile(
    profile: CommunityProfile,
    callerId?: string
  ) {
    const followersCount = travelBuddiesStore.getFollowersCount(profile.userId);
    const followingCount = travelBuddiesStore.getFollowingCount(profile.userId);
    const isFollowing = callerId ? travelBuddiesStore.isFollowing(callerId, profile.userId) : false;
    const isBlocked = callerId ? travelBuddiesStore.isBlocked(profile.userId, callerId) : false;
    const hasBlocked = callerId ? travelBuddiesStore.isBlocked(callerId, profile.userId) : false;

    return {
      userId: profile.userId,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      coverUrl: profile.coverUrl || '',
      bio: profile.bio || '',
      homeCity: profile.homeCity || '',
      languages: profile.languages || [],
      travelInterests: profile.travelInterests || [],
      travelStyles: profile.travelStyles || [],
      destinationsVisited: profile.destinationsVisited || [],
      isPrivate: !!profile.isPrivate,
      createdAt: profile.createdAt,
      followersCount,
      followingCount,
      isFollowing,
      isBlocked,
      hasBlocked,
    };
  }

  // --- 1. MEDIA UPLOAD (EXIF/GPS metadata stripping with sharp) ---
  router.post('/upload', requireAuth, async (req: express.Request, res: express.Response) => {
    try {
      const { dataUrl } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing or invalid dataUrl.' });
      }

      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ success: false, error: 'Invalid dataUrl format. Must be base64 data URL.' });
      }

      const mimeType = matches[1].toLowerCase();
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: 'Image exceeds 10MB maximum limit.' });
      }

      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
      if (!allowedMimes.includes(mimeType)) {
        return res.status(400).json({ success: false, error: 'Only JPG, PNG, and WebP images are permitted.' });
      }

      const processedBuffer = await sharp(buffer)
        .rotate()
        .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
        .withMetadata({ orientation: undefined })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();

      const uniqueName = `post_${Date.now()}_${crypto.randomBytes(6).toString('hex')}.jpg`;
      const targetPath = path.join(postUploadsDir, uniqueName);
      fs.writeFileSync(targetPath, processedBuffer);

      const publicUrl = `/uploads/posts/${uniqueName}`;
      return res.status(200).json({
        success: true,
        url: publicUrl,
        sizeBytes: processedBuffer.length,
      });
    } catch (err: any) {
      console.error('Post image upload error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to process and optimize image: ' + (err?.message || 'Server error'),
      });
    }
  });

  // --- 2. PROFILES ---
  router.get('/profiles/me', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const profile = ensureCommunityProfile(caller);
    res.json({
      success: true,
      profile: sanitizeProfile(profile, caller.uid),
    });
  });

  router.put('/profiles/me', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const {
      username,
      displayName,
      avatarUrl,
      coverUrl,
      bio,
      homeCity,
      languages,
      travelInterests,
      travelStyles,
      destinationsVisited,
      isPrivate,
    } = req.body;

    const existing = ensureCommunityProfile(caller);

    let cleanUsername = existing.username;
    if (username && typeof username === 'string') {
      const candidate = username.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,30}$/.test(candidate)) {
        return res.status(400).json({
          success: false,
          error: 'Username must be 3-30 characters and contain only lowercase letters, numbers, and underscores.',
        });
      }
      if (candidate !== existing.username && travelBuddiesStore.isUsernameTaken(candidate, caller.uid)) {
        return res.status(400).json({
          success: false,
          error: 'Username is already taken by another traveler.',
        });
      }
      cleanUsername = candidate;
    }

    const updated = travelBuddiesStore.upsertProfile({
      userId: caller.uid,
      username: cleanUsername,
      displayName: (displayName && typeof displayName === 'string') ? displayName.trim().slice(0, 60) : existing.displayName,
      avatarUrl: (typeof avatarUrl === 'string') ? avatarUrl.trim() : existing.avatarUrl,
      coverUrl: (typeof coverUrl === 'string') ? coverUrl.trim() : existing.coverUrl,
      bio: (typeof bio === 'string') ? bio.trim().slice(0, 500) : existing.bio,
      homeCity: (typeof homeCity === 'string') ? homeCity.trim().slice(0, 60) : existing.homeCity,
      languages: Array.isArray(languages) ? languages.map((s) => String(s).trim()).slice(0, 10) : existing.languages,
      travelInterests: Array.isArray(travelInterests) ? travelInterests.map((s) => String(s).trim()).slice(0, 15) : existing.travelInterests,
      travelStyles: Array.isArray(travelStyles) ? travelStyles.map((s) => String(s).trim()).slice(0, 10) : existing.travelStyles,
      destinationsVisited: Array.isArray(destinationsVisited) ? destinationsVisited.map((s) => String(s).trim()).slice(0, 30) : existing.destinationsVisited,
      isPrivate: typeof isPrivate === 'boolean' ? isPrivate : existing.isPrivate,
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      profile: sanitizeProfile(updated, caller.uid),
    });
  });

  router.delete('/profiles/me', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    travelBuddiesStore.deleteProfile(caller.uid);
    res.json({ success: true, message: 'Community profile deleted successfully.' });
  });

  router.get('/profiles', (req: express.Request, res: express.Response) => {
    const caller = getCallerUser(req);
    const search = (req.query.search as string) || undefined;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 50);

    const profiles = travelBuddiesStore.listPublicProfiles(limit, search);
    res.json({
      success: true,
      profiles: profiles.map((p) => sanitizeProfile(p, caller?.uid)),
    });
  });

  router.get('/profiles/:identifier', (req: express.Request, res: express.Response) => {
    const caller = getCallerUser(req);
    const identifier = req.params.identifier;

    let profile = travelBuddiesStore.getProfile(identifier);
    if (!profile) {
      profile = travelBuddiesStore.getProfileByUsername(identifier);
    }

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Traveler profile not found.' });
    }

    if (caller && travelBuddiesStore.isBlocked(profile.userId, caller.uid)) {
      return res.status(403).json({ success: false, error: 'You are blocked by this traveler.' });
    }

    res.json({
      success: true,
      profile: sanitizeProfile(profile, caller?.uid),
    });
  });

  // --- 3. FOLLOWS ---
  router.post('/profiles/:id/follow', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const targetId = req.params.id;

    if (caller.uid === targetId) {
      return res.status(400).json({ success: false, error: 'You cannot follow yourself.' });
    }

    const targetProfile = travelBuddiesStore.getProfile(targetId);
    if (!targetProfile) {
      return res.status(404).json({ success: false, error: 'Target traveler not found.' });
    }

    if (travelBuddiesStore.isBlocked(targetId, caller.uid) || travelBuddiesStore.isBlocked(caller.uid, targetId)) {
      return res.status(403).json({ success: false, error: 'Cannot follow a blocked user.' });
    }

    travelBuddiesStore.followUser(caller.uid, targetId);

    const callerProfile = ensureCommunityProfile(caller);
    notifyUser(
      targetId,
      caller.uid,
      'follow',
      'New Follower',
      `${callerProfile.displayName} started following your travel stories.`,
      `/travel-buddies?user=${caller.uid}`
    );

    res.json({ success: true, isFollowing: true });
  });

  router.delete('/profiles/:id/follow', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const targetId = req.params.id;
    travelBuddiesStore.unfollowUser(caller.uid, targetId);
    res.json({ success: true, isFollowing: false });
  });

  router.get('/profiles/:id/followers', (req: express.Request, res: express.Response) => {
    const caller = getCallerUser(req);
    const targetId = req.params.id;
    const followerIds = travelBuddiesStore.getFollowerIds(targetId);
    const profiles = followerIds.map((id) => {
      const p = travelBuddiesStore.getProfile(id);
      return p ? sanitizeProfile(p, caller?.uid) : null;
    }).filter(Boolean);

    res.json({ success: true, followers: profiles });
  });

  router.get('/profiles/:id/following', (req: express.Request, res: express.Response) => {
    const caller = getCallerUser(req);
    const targetId = req.params.id;
    const followingIds = travelBuddiesStore.getFollowingIds(targetId);
    const profiles = followingIds.map((id) => {
      const p = travelBuddiesStore.getProfile(id);
      return p ? sanitizeProfile(p, caller?.uid) : null;
    }).filter(Boolean);

    res.json({ success: true, following: profiles });
  });

  // --- 4. POSTS & FEED ---
  function enrichPost(post: CommunityPost, callerId?: string) {
    const authorProfile = travelBuddiesStore.getProfile(post.authorId);
    const isLiked = callerId ? travelBuddiesStore.isPostLiked(post.id, callerId) : false;
    const isSaved = callerId ? travelBuddiesStore.isPostSaved(post.id, callerId) : false;

    return {
      id: post.id,
      authorId: post.authorId,
      caption: post.caption,
      mediaUrls: post.mediaUrls,
      destination: post.destination || '',
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      isLiked,
      isSaved,
      author: authorProfile
        ? sanitizeProfile(authorProfile, callerId)
        : {
            userId: post.authorId,
            username: 'traveler',
            displayName: 'Azraq Traveler',
            avatarUrl: '',
            followersCount: 0,
            followingCount: 0,
            isFollowing: false,
          },
    };
  }

  router.get('/posts', (req: express.Request, res: express.Response) => {
    const caller = getCallerUser(req);
    const feedType = (req.query.feed as 'explore' | 'following') || 'explore';
    const cursor = (req.query.cursor as string) || undefined;
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 50);
    const authorId = (req.query.authorId as string) || undefined;

    if (feedType === 'following' && !caller) {
      return res.status(401).json({
        success: false,
        error: 'Please log in to view stories from travelers you follow.',
      });
    }

    const { posts, nextCursor } = travelBuddiesStore.getPostsFeed({
      type: feedType,
      currentUserId: caller?.uid,
      authorId,
      cursor,
      limit,
    });

    res.json({
      success: true,
      posts: posts.map((p) => enrichPost(p, caller?.uid)),
      nextCursor,
    });
  });

  router.post('/posts', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const { caption, mediaUrls, destination } = req.body;

    if (!caption && (!mediaUrls || mediaUrls.length === 0)) {
      return res.status(400).json({ success: false, error: 'A travel story must have either text or photos.' });
    }

    const cleanCaption = (caption && typeof caption === 'string') ? caption.trim().slice(0, 2500) : '';
    const cleanMedia = Array.isArray(mediaUrls)
      ? mediaUrls.filter((u) => typeof u === 'string' && u.startsWith('/uploads/posts/')).slice(0, 10)
      : [];

    ensureCommunityProfile(caller);

    const now = new Date().toISOString();
    const newPost: CommunityPost = {
      id: `post_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      authorId: caller.uid,
      caption: cleanCaption,
      mediaUrls: cleanMedia,
      destination: (destination && typeof destination === 'string') ? destination.trim().slice(0, 60) : undefined,
      createdAt: now,
      updatedAt: now,
      likesCount: 0,
      commentsCount: 0,
    };

    const post = travelBuddiesStore.createPost(newPost);

    res.status(201).json({
      success: true,
      post: enrichPost(post, caller.uid),
    });
  });

  router.get('/posts/:id', (req: express.Request, res: express.Response) => {
    const caller = getCallerUser(req);
    const post = travelBuddiesStore.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    if (caller && travelBuddiesStore.isBlocked(post.authorId, caller.uid)) {
      return res.status(403).json({ success: false, error: 'Cannot view posts from this user.' });
    }

    res.json({
      success: true,
      post: enrichPost(post, caller?.uid),
    });
  });

  router.patch('/posts/:id', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const post = travelBuddiesStore.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    if (post.authorId !== caller.uid && caller.role !== 'admin' && caller.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'You can only edit your own posts.' });
    }

    const { caption, destination } = req.body;
    const updated = travelBuddiesStore.updatePost(post.id, {
      caption: typeof caption === 'string' ? caption.trim().slice(0, 2500) : post.caption,
      destination: typeof destination === 'string' ? destination.trim().slice(0, 60) : post.destination,
    });

    res.json({
      success: true,
      post: enrichPost(updated!, caller.uid),
    });
  });

  router.delete('/posts/:id', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const post = travelBuddiesStore.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    if (post.authorId !== caller.uid && caller.role !== 'admin' && caller.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'You can only delete your own posts.' });
    }

    travelBuddiesStore.deletePost(post.id);
    res.json({ success: true, message: 'Post deleted successfully.' });
  });

  router.post('/posts/:id/like', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const post = travelBuddiesStore.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    const result = travelBuddiesStore.toggleLike(post.id, caller.uid);

    if (result.isLiked && post.authorId !== caller.uid) {
      const callerProfile = ensureCommunityProfile(caller);
      notifyUser(
        post.authorId,
        caller.uid,
        'like',
        'Post Liked',
        `${callerProfile.displayName} liked your travel story.`,
        `/travel-buddies?post=${post.id}`
      );
    }

    res.json({
      success: true,
      liked: result.isLiked,
      likesCount: result.count,
    });
  });

  // --- 5. COMMENTS ---
  router.get('/posts/:id/comments', (req: express.Request, res: express.Response) => {
    const caller = getCallerUser(req);
    const post = travelBuddiesStore.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    const comments = travelBuddiesStore.getComments(post.id);
    const enriched = comments.map((c) => {
      const author = travelBuddiesStore.getProfile(c.authorId);
      return {
        id: c.id,
        postId: c.postId,
        authorId: c.authorId,
        parentId: c.parentId || null,
        text: c.text,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        author: author ? sanitizeProfile(author, caller?.uid) : null,
      };
    });

    res.json({ success: true, comments: enriched });
  });

  router.post('/posts/:id/comments', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const post = travelBuddiesStore.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    const { text, parentId } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Comment text cannot be empty.' });
    }

    let parentComment: CommunityComment | undefined;
    if (parentId && typeof parentId === 'string') {
      const allComments = travelBuddiesStore.getComments(post.id);
      parentComment = allComments.find((c) => c.id === parentId);
      if (!parentComment) {
        return res.status(400).json({ success: false, error: 'Parent comment not found.' });
      }
    }

    const cleanText = text.trim().slice(0, 500);
    const now = new Date().toISOString();
    const commentObj: CommunityComment = {
      id: `comm_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      postId: post.id,
      authorId: caller.uid,
      parentId: parentComment ? parentComment.id : undefined,
      text: cleanText,
      createdAt: now,
      updatedAt: now,
    };

    const comment = travelBuddiesStore.addComment(commentObj);
    const callerProfile = ensureCommunityProfile(caller);

    // Notify parent comment author if reply, or post author if top-level comment
    if (parentComment && parentComment.authorId !== caller.uid) {
      notifyUser(
        parentComment.authorId,
        caller.uid,
        'comment',
        'New Reply',
        `${callerProfile.displayName} replied: "${cleanText.slice(0, 60)}${cleanText.length > 60 ? '...' : ''}"`,
        `/travel-buddies?post=${post.id}`
      );
    } else if (post.authorId !== caller.uid) {
      notifyUser(
        post.authorId,
        caller.uid,
        'comment',
        'New Comment',
        `${callerProfile.displayName} commented: "${cleanText.slice(0, 60)}${cleanText.length > 60 ? '...' : ''}"`,
        `/travel-buddies?post=${post.id}`
      );
    }

    res.status(201).json({
      success: true,
      comment: {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        parentId: comment.parentId || null,
        text: comment.text,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: sanitizeProfile(callerProfile, caller.uid),
      },
    });
  });

  router.patch('/posts/:postId/comments/:commentId', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const { postId, commentId } = req.params;
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Comment text cannot be empty.' });
    }

    const comments = travelBuddiesStore.getComments(postId);
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    if (comment.authorId !== caller.uid && caller.role !== 'admin' && caller.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this comment.' });
    }

    const updated = travelBuddiesStore.updateComment(postId, commentId, text.trim().slice(0, 500));
    if (!updated) {
      return res.status(500).json({ success: false, error: 'Failed to update comment.' });
    }

    const author = travelBuddiesStore.getProfile(updated.authorId);
    res.json({
      success: true,
      comment: {
        id: updated.id,
        postId: updated.postId,
        authorId: updated.authorId,
        parentId: updated.parentId || null,
        text: updated.text,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        author: author ? sanitizeProfile(author, caller.uid) : null,
      },
    });
  });

  router.delete('/posts/:postId/comments/:commentId', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const { postId, commentId } = req.params;
    const post = travelBuddiesStore.getPost(postId);
    const comments = travelBuddiesStore.getComments(postId);
    const comment = comments.find((c) => c.id === commentId);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    const canDelete =
      comment.authorId === caller.uid ||
      post?.authorId === caller.uid ||
      caller.role === 'admin' ||
      caller.role === 'owner';

    if (!canDelete) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this comment.' });
    }

    travelBuddiesStore.deleteComment(postId, commentId);
    res.json({ success: true, message: 'Comment deleted successfully.' });
  });

  // --- 6. SAVED POSTS (Private Bookmarks) ---
  router.post('/posts/:id/save', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const post = travelBuddiesStore.getPost(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    const saved = travelBuddiesStore.toggleSavePost(post.id, caller.uid);
    res.json({
      success: true,
      saved,
    });
  });

  router.get('/saved-posts', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const posts = travelBuddiesStore.getSavedPosts(caller.uid);
    res.json({
      success: true,
      posts: posts.map((p) => enrichPost(p, caller.uid)),
    });
  });

  // --- 7. COMPANION TRIPS & JOIN REQUESTS ---
  function enrichTrip(trip: CommunityTrip, callerId?: string) {
    const organizer = travelBuddiesStore.getProfile(trip.organizerId);
    const isApproved = callerId ? trip.approvedTravelers.includes(callerId) : false;
    const isOrganizer = callerId ? trip.organizerId === callerId : false;

    let userRequestStatus: string = 'none';
    if (callerId) {
      const myReq = travelBuddiesStore.getTripRequestsForTrip(trip.id).find((r) => r.applicantId === callerId);
      if (myReq) userRequestStatus = myReq.status;
    }

    const canSeeMeetingNotes = isOrganizer || isApproved;
    const approvedProfiles = trip.approvedTravelers.map((uid) => {
      const p = travelBuddiesStore.getProfile(uid);
      return p ? sanitizeProfile(p, callerId) : null;
    }).filter(Boolean);

    return {
      id: trip.id,
      organizerId: trip.organizerId,
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budgetMin: trip.budgetMin,
      budgetMax: trip.budgetMax,
      currency: trip.currency,
      travelStyle: trip.travelStyle,
      interests: trip.interests,
      languages: trip.languages,
      maxTravelers: trip.maxTravelers,
      currentTravelers: trip.approvedTravelers.length,
      availableSpaces: Math.max(0, trip.maxTravelers - trip.approvedTravelers.length),
      status: trip.status,
      description: trip.description,
      meetingNotes: canSeeMeetingNotes ? trip.meetingNotes || '' : undefined,
      privateNotes: canSeeMeetingNotes ? trip.meetingNotes || '' : undefined,
      createdAt: trip.createdAt,
      updatedAt: trip.updatedAt,
      isOrganizer,
      isApproved,
      userRequestStatus,
      organizer: organizer ? sanitizeProfile(organizer, callerId) : null,
      approvedTravelers: approvedProfiles,
    };
  }

  router.get('/trips', (req: express.Request, res: express.Response) => {
    const caller = getCallerUser(req);
    const destination = req.query.destination as string;
    const travelStyle = req.query.style as string;
    const language = req.query.language as string;
    const maxBudget = req.query.maxBudget ? parseFloat(req.query.maxBudget as string) : undefined;
    const excludeExpired = req.query.upcomingOnly !== 'false';

    const trips = travelBuddiesStore.getTrips({
      destination,
      travelStyle,
      language,
      maxBudget,
      excludeExpired,
      currentUserId: caller?.uid,
    });

    res.json({
      success: true,
      trips: trips.map((t) => enrichTrip(t, caller?.uid)),
    });
  });

  router.post('/trips', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const {
      title,
      destination,
      startDate,
      endDate,
      budgetMin,
      budgetMax,
      currency,
      travelStyle,
      interests,
      languages,
      maxTravelers,
      totalSpaces,
      description,
      meetingNotes,
      privateNotes,
    } = req.body;

    if (!title || !destination || !startDate || !endDate || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required trip fields (title, destination, startDate, endDate, description).',
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, error: 'End date must be on or after start date.' });
    }

    ensureCommunityProfile(caller);

    const now = new Date().toISOString();
    const tripObj: CommunityTrip = {
      id: `trip_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      organizerId: caller.uid,
      title: String(title).trim().slice(0, 100),
      destination: String(destination).trim().slice(0, 80),
      startDate: String(startDate),
      endDate: String(endDate),
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      currency: currency === 'USD' ? 'USD' : 'BDT',
      travelStyle: String(travelStyle || 'Adventure & Nature').trim(),
      interests: Array.isArray(interests) ? interests.map(String).slice(0, 10) : [],
      languages: Array.isArray(languages) ? languages.map(String).slice(0, 10) : ['English', 'Bangla'],
      maxTravelers: Math.min(Math.max(parseInt(maxTravelers || totalSpaces) || 4, 2), 20),
      approvedTravelers: [caller.uid],
      status: 'open',
      description: String(description).trim().slice(0, 2000),
      meetingNotes: (meetingNotes || privateNotes) ? String(meetingNotes || privateNotes).trim().slice(0, 1000) : '',
      createdAt: now,
      updatedAt: now,
    };

    const trip = travelBuddiesStore.createTrip(tripObj);

    res.status(201).json({
      success: true,
      trip: enrichTrip(trip, caller.uid),
    });
  });

  router.get('/trips/:id', (req: express.Request, res: express.Response) => {
    const caller = getCallerUser(req);
    const trip = travelBuddiesStore.getTrip(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    res.json({
      success: true,
      trip: enrichTrip(trip, caller?.uid),
    });
  });

  router.patch('/trips/:id', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const trip = travelBuddiesStore.getTrip(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    if (trip.organizerId !== caller.uid && caller.role !== 'admin' && caller.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'Only the organizer can modify this trip.' });
    }

    const {
      title,
      destination,
      startDate,
      endDate,
      budgetMin,
      budgetMax,
      travelStyle,
      interests,
      languages,
      maxTravelers,
      description,
      meetingNotes,
      status,
    } = req.body;

    const updated = travelBuddiesStore.updateTrip(trip.id, {
      title: title ? String(title).trim().slice(0, 100) : undefined,
      destination: destination ? String(destination).trim().slice(0, 80) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      budgetMin: budgetMin !== undefined ? Number(budgetMin) : undefined,
      budgetMax: budgetMax !== undefined ? Number(budgetMax) : undefined,
      travelStyle: travelStyle ? String(travelStyle).trim() : undefined,
      interests: Array.isArray(interests) ? interests.map(String).slice(0, 10) : undefined,
      languages: Array.isArray(languages) ? languages.map(String).slice(0, 10) : undefined,
      maxTravelers: maxTravelers ? Math.min(Math.max(parseInt(maxTravelers), 2), 20) : undefined,
      description: description ? String(description).trim().slice(0, 2000) : undefined,
      meetingNotes: meetingNotes !== undefined ? String(meetingNotes).trim().slice(0, 1000) : undefined,
      status: ['open', 'full', 'cancelled', 'completed'].includes(status) ? status : undefined,
    });

    res.json({
      success: true,
      trip: enrichTrip(updated!, caller.uid),
    });
  });

  router.post('/trips/:id/requests', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const trip = travelBuddiesStore.getTrip(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    if (trip.organizerId === caller.uid) {
      return res.status(400).json({ success: false, error: 'You are the organizer of this trip.' });
    }

    if (trip.approvedTravelers.includes(caller.uid)) {
      return res.status(400).json({ success: false, error: 'You are already an approved traveler on this trip.' });
    }

    if (trip.status === 'full' || trip.status === 'cancelled' || trip.status === 'completed') {
      return res.status(400).json({ success: false, error: `Trip is currently ${trip.status}.` });
    }

    const existingReq = travelBuddiesStore.getExistingTripRequest(trip.id, caller.uid);
    if (existingReq) {
      return res.status(400).json({ success: false, error: 'You already have a pending request for this trip.' });
    }

    const { introduction } = req.body;
    if (!introduction || typeof introduction !== 'string' || !introduction.trim()) {
      return res.status(400).json({ success: false, error: 'Please include a brief introduction to join.' });
    }

    ensureCommunityProfile(caller);

    const now = new Date().toISOString();
    const reqObj: CommunityTripRequest = {
      id: `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      tripId: trip.id,
      applicantId: caller.uid,
      introduction: introduction.trim().slice(0, 500),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const request = travelBuddiesStore.createTripRequest(reqObj);

    const callerProfile = ensureCommunityProfile(caller);
    notifyUser(
      trip.organizerId,
      caller.uid,
      'trip_request',
      'Join Trip Request',
      `${callerProfile.displayName} requested to join your trip to ${trip.destination}.`,
      `/travel-buddies?trip=${trip.id}`
    );

    res.status(201).json({
      success: true,
      request,
    });
  });

  router.get('/trips/:id/requests', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const trip = travelBuddiesStore.getTrip(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    if (trip.organizerId !== caller.uid && caller.role !== 'admin' && caller.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'Only the organizer can view join requests.' });
    }

    const requests = travelBuddiesStore.getTripRequestsForTrip(trip.id);
    const enriched = requests.map((r) => {
      const applicant = travelBuddiesStore.getProfile(r.applicantId);
      return {
        ...r,
        applicant: applicant ? sanitizeProfile(applicant, caller.uid) : null,
      };
    });

    res.json({ success: true, requests: enriched });
  });

  router.post('/trip-requests/:id/respond', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const requestId = req.params.id;
    const { action } = req.body;

    if (action !== 'accept' && action !== 'decline') {
      return res.status(400).json({ success: false, error: "Action must be 'accept' or 'decline'." });
    }

    const allRequests = Object.values((travelBuddiesStore as any).data.tripRequests) as CommunityTripRequest[];
    const request = allRequests.find((r) => r.id === requestId);
    if (!request) {
      return res.status(404).json({ success: false, error: 'Trip request not found.' });
    }

    const trip = travelBuddiesStore.getTrip(request.tripId);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    if (trip.organizerId !== caller.uid && caller.role !== 'admin' && caller.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'Only the trip organizer can accept or decline requests.' });
    }

    const targetStatus: TripRequestStatus = action === 'accept' ? 'accepted' : 'declined';
    const updated = travelBuddiesStore.updateTripRequestStatus(requestId, targetStatus);

    const organizerProfile = ensureCommunityProfile(caller);
    notifyUser(
      request.applicantId,
      caller.uid,
      action === 'accept' ? 'trip_accepted' : 'trip_declined',
      action === 'accept' ? 'Trip Request Accepted!' : 'Trip Request Update',
      action === 'accept'
        ? `${organizerProfile.displayName} accepted your request to join the trip to ${trip.destination}! 🎉`
        : `${organizerProfile.displayName} was unable to accept your request for ${trip.destination}.`,
      `/travel-buddies?trip=${trip.id}`
    );

    const updatedTrip = travelBuddiesStore.getTrip(request.tripId);
    res.json({
      success: true,
      request: updated,
      trip: updatedTrip ? enrichTrip(updatedTrip, caller.uid) : null,
    });
  });

  router.delete('/trip-requests/:id/withdraw', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const requestId = req.params.id;
    const allRequests = Object.values((travelBuddiesStore as any).data.tripRequests) as CommunityTripRequest[];
    const request = allRequests.find((r) => r.id === requestId);

    if (!request) {
      return res.status(404).json({ success: false, error: 'Trip request not found.' });
    }

    if (request.applicantId !== caller.uid) {
      return res.status(403).json({ success: false, error: 'You can only withdraw your own request.' });
    }

    travelBuddiesStore.updateTripRequestStatus(requestId, 'withdrawn');
    res.json({ success: true, message: 'Request withdrawn successfully.' });
  });

  router.post('/trips/:id/leave', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const trip = travelBuddiesStore.getTrip(req.params.id);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found.' });
    }

    if (trip.organizerId === caller.uid) {
      return res.status(400).json({ success: false, error: 'Organizers cannot leave their own trip. You can cancel or delete it.' });
    }

    const success = travelBuddiesStore.leaveTrip(trip.id, caller.uid);
    if (!success) {
      return res.status(400).json({ success: false, error: 'You are not an approved member of this trip.' });
    }

    res.json({ success: true, message: 'Successfully left trip.' });
  });

  router.get('/my-trips', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const allTrips = travelBuddiesStore.getTrips();
    const myTrips = allTrips.filter(
      (t) => t.organizerId === caller.uid || t.approvedTravelers.includes(caller.uid)
    );
    res.json({
      success: true,
      trips: myTrips.map((t) => enrichTrip(t, caller.uid)),
    });
  });

  // --- 8. PRIVATE MESSAGING ---
  router.get('/conversations', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const convs = travelBuddiesStore.getUserConversations(caller.uid);

    const enriched = convs.map((c) => {
      const otherId = c.participants.find((p) => p !== caller.uid) || c.participants[0];
      const otherProfile = travelBuddiesStore.getProfile(otherId);
      const messages = travelBuddiesStore.getMessages(c.id);
      const unreadCount = messages.filter((m) => m.senderId !== caller.uid && !m.readBy.includes(caller.uid)).length;

      return {
        id: c.id,
        participants: c.participants,
        status: c.status,
        requestedBy: c.requestedBy,
        acceptedBy: c.acceptedBy,
        lastMessageText: c.lastMessageText,
        lastMessageAt: c.lastMessageAt,
        unreadCount,
        otherUser: otherProfile ? sanitizeProfile(otherProfile, caller.uid) : null,
      };
    });

    res.json({ success: true, conversations: enriched });
  });

  router.post('/conversations', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const { targetUserId, recipientId, text } = req.body;
    const target = targetUserId || recipientId;

    if (!target || typeof target !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing target traveler ID.' });
    }

    if (caller.uid === target) {
      return res.status(400).json({ success: false, error: 'You cannot message yourself.' });
    }

    if (travelBuddiesStore.isBlocked(caller.uid, target) || travelBuddiesStore.isBlocked(target, caller.uid)) {
      return res.status(403).json({ success: false, error: 'Cannot start a conversation with a blocked user.' });
    }

    const conv = travelBuddiesStore.getOrCreateConversation(caller.uid, target);
    if (text && typeof text === 'string' && text.trim()) {
      travelBuddiesStore.sendMessage(conv.id, caller.uid, text.trim().slice(0, 2000));
    }

    const otherProfile = travelBuddiesStore.getProfile(target);

    res.status(201).json({
      success: true,
      conversation: {
        id: conv.id,
        participants: conv.participants,
        status: conv.status,
        requestedBy: conv.requestedBy,
        acceptedBy: conv.acceptedBy,
        lastMessageText: conv.lastMessageText,
        lastMessageAt: conv.lastMessageAt,
        otherUser: otherProfile ? sanitizeProfile(otherProfile, caller.uid) : null,
      },
    });
  });

  router.post('/conversations/:id/accept', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const conv = travelBuddiesStore.getConversation(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    if (!conv.participants.includes(caller.uid)) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    if (conv.requestedBy === caller.uid) {
      return res.status(400).json({ success: false, error: 'You are the requester.' });
    }

    const ok = travelBuddiesStore.acceptMessageRequest(conv.id, caller.uid);
    res.json({ success: ok, conversation: travelBuddiesStore.getConversation(conv.id) });
  });

  router.get('/conversations/:id/messages', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const conv = travelBuddiesStore.getConversation(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    if (!conv.participants.includes(caller.uid)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this conversation.' });
    }

    travelBuddiesStore.markMessagesRead(conv.id, caller.uid);
    const messages = travelBuddiesStore.getMessages(conv.id);
    res.json({ success: true, messages });
  });

  router.post('/conversations/:id/messages', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const conv = travelBuddiesStore.getConversation(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    if (!conv.participants.includes(caller.uid)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to send message in this conversation.' });
    }

    const otherId = conv.participants.find((p) => p !== caller.uid);
    if (otherId && (travelBuddiesStore.isBlocked(caller.uid, otherId) || travelBuddiesStore.isBlocked(otherId, caller.uid))) {
      return res.status(403).json({ success: false, error: 'Cannot send message to a blocked traveler.' });
    }

    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
    }

    const cleanText = text.trim().slice(0, 1000);
    const msg = travelBuddiesStore.sendMessage(conv.id, caller.uid, cleanText);
    if (!msg) {
      return res.status(400).json({ success: false, error: 'Could not send message.' });
    }

    if (otherId) {
      const callerProfile = ensureCommunityProfile(caller);
      notifyUser(
        otherId,
        caller.uid,
        'message',
        'New Message',
        `${callerProfile.displayName}: ${cleanText.slice(0, 50)}${cleanText.length > 50 ? '...' : ''}`,
        `/travel-buddies?chat=${conv.id}`
      );
    }

    res.status(201).json({ success: true, message: msg });
  });

  router.post('/conversations/:id/read', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const conv = travelBuddiesStore.getConversation(req.params.id);
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }
    if (!conv.participants.includes(caller.uid)) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }
    travelBuddiesStore.markMessagesRead(conv.id, caller.uid);
    res.json({ success: true, message: 'Messages marked as read.' });
  });

  // --- 9. BLOCKING ---
  router.post('/blocks/:userId', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const targetId = req.params.userId;
    if (caller.uid === targetId) {
      return res.status(400).json({ success: false, error: 'You cannot block yourself.' });
    }

    travelBuddiesStore.blockUser(caller.uid, targetId);
    res.json({ success: true, message: 'Traveler blocked. They can no longer message or interact with you.' });
  });

  router.delete('/blocks/:userId', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const targetId = req.params.userId;
    travelBuddiesStore.unblockUser(caller.uid, targetId);
    res.json({ success: true, message: 'Traveler unblocked.' });
  });

  router.get('/blocks', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const blockedIds = travelBuddiesStore.getBlockedUserIds(caller.uid);
    res.json({ success: true, blockedIds });
  });

  // --- 10. NOTIFICATIONS ---
  router.get('/notifications', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const notifs = travelBuddiesStore.getUserNotifications(caller.uid);
    const unreadCount = notifs.filter((n) => !n.isRead).length;
    res.json({ success: true, notifications: notifs, unreadCount });
  });

  router.post('/notifications/:id/read', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    travelBuddiesStore.markNotificationRead(caller.uid, req.params.id);
    res.json({ success: true });
  });

  router.post('/notifications/read-all', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    travelBuddiesStore.markAllNotificationsRead(caller.uid);
    res.json({ success: true });
  });

  // --- 11. REPORTS & ADMIN MODERATION ---
  router.post('/reports', requireAuth, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const { targetType, targetId, reason, details } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, error: 'Missing required report fields (targetType, targetId, reason).' });
    }

    const reportObj: CommunityReport = {
      id: `rep_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      reporterId: caller.uid,
      targetType,
      targetId,
      reason: String(reason).trim().slice(0, 100),
      details: details ? String(details).trim().slice(0, 500) : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const report = travelBuddiesStore.createReport(reportObj);

    res.status(201).json({
      success: true,
      message: 'Thank you for keeping our community safe. Our moderation team will review this shortly.',
      reportId: report.id,
      report,
    });
  });

  router.get('/admin/reports', requireAdmin, (req: express.Request, res: express.Response) => {
    const status = req.query.status as ReportStatus;
    const reports = travelBuddiesStore.getReports(status);
    res.json({ success: true, reports });
  });

  router.post('/admin/reports/:id/resolve', requireAdmin, (req: express.Request, res: express.Response) => {
    const caller = (req as any).user as UserLookup;
    const { action, status, resolutionNotes, adminNotes, deleteContent } = req.body;
    const targetStatus = action || status;
    const notes = resolutionNotes || adminNotes;

    if (targetStatus !== 'resolved' && targetStatus !== 'dismissed') {
      return res.status(400).json({ success: false, error: "Action must be 'resolved' or 'dismissed'." });
    }

    const report = travelBuddiesStore.resolveReport(req.params.id, targetStatus, caller.uid, notes);
    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    if (deleteContent) {
      if (report.targetType === 'post') {
        travelBuddiesStore.deletePost(report.targetId);
      } else if (report.targetType === 'comment') {
        const allPosts = Object.values((travelBuddiesStore as any).data.posts) as CommunityPost[];
        for (const p of allPosts) {
          travelBuddiesStore.deleteComment(p.id, report.targetId);
        }
      }
    }

    res.json({ success: true, report });
  });

  return router;
}

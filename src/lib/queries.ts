import { supabase, isSupabaseConfigured } from './supabase';
import { Post, Comment, Reaction, SavedPost, Story, Profile, ReactionType } from './types';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
} from 'firebase/firestore';

const LOCAL_STORAGE_POSTS_KEY = 'azraq_travel_buddies_posts';
const LOCAL_STORAGE_SAVED_KEY = 'azraq_travel_buddies_saved';
const LOCAL_STORAGE_STORIES_KEY = 'azraq_travel_buddies_stories';

// Authentic community posts & stories (real user data only, zero fake demo accounts)
export const INITIAL_COMMUNITY_STORIES: Story[] = [];
export const INITIAL_COMMUNITY_POSTS: Post[] = [];

// Helper to extract hashtags from caption
export function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#[a-zA-Z0-9_\u0980-\u09FF]+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Fetch paginated approved posts
 */
export async function getPostsPage({
  limitCount = 10,
  cursorCreatedAt,
  filterHashtag,
  userId,
  feedType,
}: {
  limitCount?: number;
  cursorCreatedAt?: string;
  filterHashtag?: string;
  userId?: string;
  feedType?: 'explore' | 'following';
} = {}): Promise<{ posts: Post[]; nextCursor?: string }> {
  // 1. Try Supabase if configured
  if (isSupabaseConfigured) {
    try {
      let q = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (*)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(limitCount);

      if (cursorCreatedAt) {
        q = q.lt('created_at', cursorCreatedAt);
      }

      if (filterHashtag) {
        q = q.ilike('caption', `%${filterHashtag}%`);
      }

      const { data, error } = await q;

      if (!error && data && data.length > 0) {
        const posts: Post[] = data.map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          location: row.location || 'Global Explorer',
          caption: row.caption || '',
          media_urls: row.media_urls || [],
          created_at: row.created_at,
          likes_count: row.likes_count || 0,
          comments_count: row.comments_count || 0,
          is_approved: row.is_approved,
          profile: row.profiles
            ? {
                id: row.profiles.id,
                username: row.profiles.username,
                full_name: row.profiles.full_name,
                avatar_url: row.profiles.avatar_url,
                bio: row.profiles.bio,
                created_at: row.profiles.created_at,
                is_verified: row.profiles.is_verified,
              }
            : undefined,
          hashtags: extractHashtags(row.caption || ''),
        }));

        const nextCursor = posts.length === limitCount ? posts[posts.length - 1].created_at : undefined;
        return { posts, nextCursor };
      }
    } catch (err) {
      console.warn('Supabase query fallback:', err);
    }
  }

  // 2. Fetch genuine posts from Azraq Trips backend API
  try {
    const q = new URLSearchParams();
    q.set('limit', String(limitCount));
    if (cursorCreatedAt) q.set('cursor', cursorCreatedAt);
    if (userId) q.set('authorId', userId);
    if (feedType) q.set('feed', feedType);
    const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('azraq_tours_session_token') || localStorage.getItem('azraq_auth_token')) : null;
    const res = await fetch(`/api/travel-buddies/posts?${q.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.posts)) {
        let posts: Post[] = json.posts.map((p: any) => ({
          id: p.id,
          user_id: p.authorId,
          location: p.destination || 'Global Explorer',
          caption: p.caption,
          media_urls: p.mediaUrls || [],
          created_at: p.createdAt,
          likes_count: p.likesCount || 0,
          comments_count: p.commentsCount || 0,
          is_approved: true,
          is_saved: p.isSaved,
          user_reaction: p.isLiked ? 'like' : null,
          profile: p.author ? {
            id: p.author.userId,
            username: p.author.username,
            full_name: p.author.displayName,
            avatar_url: p.author.avatarUrl,
            bio: p.author.bio,
            created_at: p.author.createdAt,
            is_verified: false,
          } : undefined,
          hashtags: extractHashtags(p.caption || ''),
        }));

        if (filterHashtag) {
          posts = posts.filter((p) =>
            p.caption.toLowerCase().includes(filterHashtag.toLowerCase())
          );
        }

        return { posts, nextCursor: json.nextCursor };
      }
    }
  } catch (e) {
    console.warn('API posts fetch error:', e);
  }

  return { posts: [] };
}

/**
 * Fetch active Stories
 */
export async function getStories(): Promise<Story[]> {
  if (isSupabaseConfigured) {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('stories')
        .select(`*, profiles:user_id (*)`)
        .gt('expires_at', now)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          media_url: row.media_url,
          media_type: row.media_type || 'image',
          caption: row.caption,
          location: row.location,
          created_at: row.created_at,
          expires_at: row.expires_at,
          profile: row.profiles,
          seen: false,
        }));
      }
    } catch (e) {
      console.warn('Stories Supabase query notice:', e);
    }
  }

  const saved = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return INITIAL_COMMUNITY_STORIES;
}

/**
 * Create a new Post
 * User posts are immediately approved and visible in the feed
 */
export async function createPost({
  userId,
  userProfile,
  location,
  caption,
  mediaUrls,
  postType = 'story',
  tripDetails,
  isAdmin = false,
}: {
  userId: string;
  userProfile: Profile;
  location: string;
  caption: string;
  mediaUrls: string[];
  postType?: string;
  tripDetails?: any;
  isAdmin?: boolean;
}): Promise<{ success: boolean; post?: Post; error?: string }> {
  const isApproved = true; // Instantly visible to the traveler and community

  const newPost: Post = {
    id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    user_id: userId,
    location: location.trim() || 'Global Explorer',
    caption: caption.trim(),
    media_urls: mediaUrls,
    created_at: new Date().toISOString(),
    likes_count: 0,
    comments_count: 0,
    is_approved: isApproved,
    profile: userProfile,
    hashtags: extractHashtags(caption),
    reaction_counts: { love: 0, fire: 0, wow: 0, like: 0 },
  };

  // Attach canonical properties for maximum cross-compatibility
  (newPost as any).post_type = postType;
  (newPost as any).trip_details = tripDetails;
  (newPost as any).imageUrl = mediaUrls.length > 0 ? mediaUrls[0] : '';
  (newPost as any).authorAvatar = userProfile.avatar_url;
  (newPost as any).authorName = userProfile.full_name || userProfile.username;

  // 1. Instantly write to local storage caches for immediate UI response (0ms latency)
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_POSTS_KEY);
    const posts: Post[] = saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
    const filtered = posts.filter((p) => p.id !== newPost.id);
    filtered.unshift(newPost);
    localStorage.setItem(LOCAL_STORAGE_POSTS_KEY, JSON.stringify(filtered));

    // Also sync to FeedContext storage key
    const feedSaved = localStorage.getItem('azraq_tours_feed_posts_v2');
    if (feedSaved) {
      try {
        const feedPosts = JSON.parse(feedSaved);
        if (Array.isArray(feedPosts)) {
          feedPosts.unshift({
            id: newPost.id,
            authorId: userId,
            authorName: userProfile.full_name || userProfile.username,
            authorAvatar: userProfile.avatar_url,
            caption: newPost.caption,
            location: newPost.location,
            imageUrl: (newPost as any).imageUrl,
            mediaUrls: newPost.media_urls,
            likes: 0,
            likedBy: [],
            comments: [],
            shares: 0,
            views: 1,
            isVerified: userProfile.is_verified || false,
            tags: newPost.hashtags,
            createdAt: newPost.created_at,
          });
          localStorage.setItem('azraq_tours_feed_posts_v2', JSON.stringify(feedPosts));
        }
      } catch {}
    }
  } catch (e) {
    console.warn('Local storage write notice:', e);
  }

  // 2. Asynchronously background sync to server REST API
  try {
    const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('azraq_tours_session_token') || localStorage.getItem('azraq_auth_token')) : null;
    fetch('/api/travel-buddies/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        caption: newPost.caption,
        destination: newPost.location,
        mediaUrls: newPost.media_urls,
      }),
    }).then(async (res) => {
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.post) {
          newPost.id = json.post.id;
        }
      }
    }).catch(() => {});
  } catch {}

  // 3. Asynchronously background-sync to Firestore (non-blocking, will not stall UI)
  if (db) {
    const syncFirestore = async () => {
      try {
        const feedRef = doc(db, 'feed_posts', newPost.id);
        await setDoc(feedRef, {
          id: newPost.id,
          user_id: userId,
          authorId: userId,
          authorName: userProfile.full_name || userProfile.username,
          authorAvatar: userProfile.avatar_url,
          photoURL: userProfile.avatar_url,
          location: newPost.location,
          caption: newPost.caption,
          imageUrl: (newPost as any).imageUrl,
          media_urls: newPost.media_urls,
          is_approved: true,
          created_at: newPost.created_at,
          likes_count: 0,
          comments_count: 0,
          hashtags: newPost.hashtags,
          profile: userProfile,
        });
      } catch (firestoreErr) {
        console.warn('Firestore background post sync notice:', firestoreErr);
      }
    };
    syncFirestore();
  }

  // 3. Asynchronously background-sync to Supabase if configured
  if (isSupabaseConfigured) {
    const syncSupabase = async () => {
      try {
        await supabase.from('posts').insert([
          {
            id: newPost.id,
            user_id: userId,
            location: newPost.location,
            caption: newPost.caption,
            media_urls: newPost.media_urls,
            is_approved: isApproved,
            created_at: newPost.created_at,
          },
        ]);
      } catch (e) {
        console.warn('Supabase post insert notice:', e);
      }
    };
    syncSupabase();
  }

  return { success: true, post: newPost };
}

/**
 * Add / Toggle reaction
 */
export async function togglePostReaction({
  postId,
  userId,
  reactionType,
  currentReaction,
}: {
  postId: string;
  userId: string;
  reactionType: ReactionType;
  currentReaction?: ReactionType | null;
}): Promise<{ newReaction: ReactionType | null; likesDelta: number }> {
  const isRemoving = currentReaction === reactionType;
  const newReaction = isRemoving ? null : reactionType;
  const likesDelta = isRemoving ? -1 : currentReaction ? 0 : 1;

  if (isSupabaseConfigured) {
    try {
      if (isRemoving) {
        await supabase
          .from('reactions')
          .delete()
          .match({ post_id: postId, user_id: userId });
      } else {
        await supabase.from('reactions').upsert([
          {
            post_id: postId,
            user_id: userId,
            reaction_type: reactionType,
          },
        ]);
      }
    } catch (e) {
      console.warn('Supabase reaction error:', e);
    }
  }

  // Sync to Express backend store
  try {
    const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('azraq_tours_session_token') || localStorage.getItem('azraq_auth_token')) : null;
    if (token) {
      fetch(`/api/travel-buddies/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  } catch {}

  return { newReaction, likesDelta };
}

/**
 * Fetch Comments for a Post
 */
export async function getComments(postId: string): Promise<Comment[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`*, profiles:user_id (*)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          post_id: row.post_id,
          user_id: row.user_id,
          content: row.content,
          created_at: row.created_at,
          profile: row.profiles,
        }));
      }
    } catch (e) {}
  }

  // 2. Fetch genuine comments from Azraq Trips backend API
  try {
    const res = await fetch(`/api/travel-buddies/posts/${postId}/comments`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.comments)) {
        return json.comments.map((c: any) => ({
          id: c.id,
          post_id: c.postId,
          user_id: c.authorId,
          content: c.text,
          created_at: c.createdAt,
          profile: c.author ? {
            id: c.author.userId,
            username: c.author.username,
            full_name: c.author.displayName,
            avatar_url: c.author.avatarUrl,
            bio: c.author.bio,
            created_at: c.author.createdAt,
            is_verified: false,
          } : undefined,
        }));
      }
    }
  } catch (e) {
    console.warn('API comments fetch error:', e);
  }

  return [];
}

/**
 * Add Comment to a Post
 */
export async function createComment({
  postId,
  userId,
  userProfile,
  content,
  parentId,
}: {
  postId: string;
  userId: string;
  userProfile: Profile;
  content: string;
  parentId?: string | null;
}): Promise<Comment> {
  const newComment: Comment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    post_id: postId,
    user_id: userId,
    parentId: parentId || null,
    content: content.trim(),
    created_at: new Date().toISOString(),
    profile: userProfile,
  };

  if (isSupabaseConfigured) {
    try {
      await supabase.from('comments').insert([
        {
          id: newComment.id,
          post_id: postId,
          user_id: userId,
          content: newComment.content,
          created_at: newComment.created_at,
        },
      ]);
    } catch (e) {}
  }

  // Sync comment to Express backend store
  try {
    const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('azraq_tours_session_token') || localStorage.getItem('azraq_auth_token')) : null;
    if (token) {
      fetch(`/api/travel-buddies/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: content.trim(), parentId }),
      }).catch(() => {});
    }
  } catch {}

  return newComment;
}

/**
 * Toggle Save / Bookmark
 */
export async function toggleSavePost({
  postId,
  userId,
  isCurrentlySaved,
}: {
  postId: string;
  userId: string;
  isCurrentlySaved: boolean;
}): Promise<boolean> {
  const newSavedState = !isCurrentlySaved;

  if (isSupabaseConfigured) {
    try {
      if (isCurrentlySaved) {
        await supabase.from('saved_posts').delete().match({ post_id: postId, user_id: userId });
      } else {
        await supabase.from('saved_posts').upsert([{ post_id: postId, user_id: userId }]);
      }
    } catch (e) {}
  }

  // Sync bookmark to Express backend store
  try {
    const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('azraq_tours_session_token') || localStorage.getItem('azraq_auth_token')) : null;
    if (token) {
      fetch(`/api/travel-buddies/posts/${postId}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  } catch {}

  return newSavedState;
}

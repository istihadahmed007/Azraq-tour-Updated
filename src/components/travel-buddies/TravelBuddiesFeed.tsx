import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Post } from '../../lib/types';
import { getPostsPage } from '../../lib/queries';
import { useAuth } from '../../context/AuthContext';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { PostCommentsModal } from './PostCommentsModal';
import { FeedSkeleton } from './FeedSkeleton';
import { EmptyState } from './EmptyState';
import {
  Compass,
  Users,
  Bookmark,
  RefreshCw,
  Plus,
  Sparkles,
} from 'lucide-react';
import { apiGetPost } from '../../lib/communityApi';

const POPULAR_HASHTAGS = [
  '#AzraqDiaries',
  '#BangladeshTravel',
  '#TravelBuddies',
  '#ExploreBangladesh',
  '#MaldivesLuxury',
  '#BaliVibes',
  '#SoloTraveler',
];

interface TravelBuddiesFeedProps {
  onSelectDestinationByName?: (name: string) => void;
  onNavigateToProfile?: () => void;
}

export const TravelBuddiesFeed: React.FC<TravelBuddiesFeedProps> = ({
  onSelectDestinationByName,
  onNavigateToProfile,
}) => {
  const { user, isGuest, openAuthModal, showToast } = useAuth();

  // Feed State: Explore vs Following vs Saved
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [feedType, setFeedType] = useState<'explore' | 'following' | 'saved'>('explore');
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Handle shareable direct link (?post=postId)
  const [linkedPostId, setLinkedPostId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('post');
    }
    return null;
  });

  // Fetch initial posts based on feed type & hashtag
  const loadInitialPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // If a linked post was requested via URL, try fetching it directly
      let directPost: Post | null = null;
      if (linkedPostId) {
        try {
          const directRes = await apiGetPost(linkedPostId);
          if (directRes.success && directRes.post) {
            const p = directRes.post;
            directPost = {
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
              hashtags: [],
            };
          }
        } catch {}
      }

      const res = await getPostsPage({
        limitCount: 10,
        filterHashtag: activeHashtag || undefined,
        feedType: feedType === 'following' ? 'following' : 'explore',
      });

      let loadedPosts = res.posts;
      if (feedType === 'saved') {
        loadedPosts = loadedPosts.filter((p) => p.is_saved);
      }

      if (directPost && !loadedPosts.some((p) => p.id === directPost!.id)) {
        loadedPosts = [directPost, ...loadedPosts];
      }

      setPosts(loadedPosts);
      setNextCursor(res.nextCursor);
    } catch (err: any) {
      setError(err?.message || 'Failed to load community feed.');
    } finally {
      setIsLoading(false);
    }
  }, [feedType, activeHashtag, linkedPostId]);

  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  // Infinite Scroll Observer
  const loadMorePosts = useCallback(async () => {
    if (!nextCursor || isLoadingMore || isLoading) return;

    setIsLoadingMore(true);
    try {
      const res = await getPostsPage({
        limitCount: 10,
        cursorCreatedAt: nextCursor,
        filterHashtag: activeHashtag || undefined,
        feedType: feedType === 'following' ? 'following' : 'explore',
      });

      let incoming = res.posts;
      if (feedType === 'saved') {
        incoming = incoming.filter((p) => p.is_saved);
      }

      setPosts((prev) => [...prev, ...incoming]);
      setNextCursor(res.nextCursor);
    } catch (err) {
      console.warn('Infinite scroll error:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore, isLoading, activeHashtag, feedType]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [loadMorePosts, nextCursor, isLoadingMore]);

  const handleOpenCreatePost = () => {
    if (isGuest || !user) {
      openAuthModal('login');
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div className="space-y-5">
      {/* Feed Filter Bar: Explore vs Following vs Saved */}
      <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-[#0A1628]/95 backdrop-blur-xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setFeedType('explore');
              setActiveHashtag(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              feedType === 'explore' && !activeHashtag
                ? 'bg-[#0047BA] text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => {
              if (isGuest || !user) {
                openAuthModal('login');
                return;
              }
              setFeedType('following');
              setActiveHashtag(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              feedType === 'following' && !activeHashtag
                ? 'bg-[#0047BA] text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Following</span>
          </button>

          <button
            onClick={() => {
              if (isGuest || !user) {
                openAuthModal('login');
                return;
              }
              setFeedType('saved');
              setActiveHashtag(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              feedType === 'saved' && !activeHashtag
                ? 'bg-[#0047BA] text-white shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
          </button>
        </div>

        {activeHashtag && (
          <div className="flex items-center gap-1.5 bg-[#17BEBB]/20 text-[#17BEBB] px-2.5 py-1 rounded-full text-xs font-semibold">
            <span>{activeHashtag}</span>
            <button
              onClick={() => setActiveHashtag(null)}
              className="text-[#17BEBB] hover:text-white ml-1 font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Popular Community Hashtag Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        {POPULAR_HASHTAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveHashtag(tag === activeHashtag ? null : tag)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium border transition-colors shrink-0 cursor-pointer ${
              activeHashtag === tag
                ? 'bg-[#0047BA] text-white border-[#17BEBB]'
                : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Feed Content */}
      {isLoading ? (
        <FeedSkeleton />
      ) : error ? (
        <div className="p-8 text-center bg-[#0A1628]/90 border border-rose-500/30 rounded-3xl space-y-3">
          <p className="text-xs text-rose-300">{error}</p>
          <button
            onClick={loadInitialPosts}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      ) : posts.length === 0 ? (
        <EmptyState onCreatePost={handleOpenCreatePost} />
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onHashtagClick={(tag) => setActiveHashtag(tag)}
              onDeletePost={handleDeletePost}
              onOpenComments={(p) => setActiveCommentPost(p)}
            />
          ))}

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="py-4 text-center">
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin text-[#17BEBB]" />
                <span>Loading more travel memories...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={() => {
          setIsCreateModalOpen(false);
          loadInitialPosts();
        }}
      />

      {/* Single Dedicated Comments Dialog (Rendered via React Portal outside feed clipping ancestors) */}
      <PostCommentsModal
        post={activeCommentPost}
        isOpen={Boolean(activeCommentPost)}
        onClose={() => setActiveCommentPost(null)}
        onCommentCountChange={(postId, newCount) => {
          setPosts((prev) =>
            prev.map((p) => (p.id === postId ? { ...p, comments_count: newCount } : p))
          );
          if (activeCommentPost && activeCommentPost.id === postId) {
            setActiveCommentPost((prev) => (prev ? { ...prev, comments_count: newCount } : null));
          }
        }}
      />
    </div>
  );
};

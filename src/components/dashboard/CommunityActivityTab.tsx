import React, { useState } from 'react';
import { useFeed } from '../../context/FeedContext';
import { useAuth } from '../../context/AuthContext';
import { FeedPost } from '../../types';
import {
  Users,
  Heart,
  Bookmark,
  MessageCircle,
  Share2,
  Trash2,
  ExternalLink,
  Sparkles,
  MapPin,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface CommunityActivityTabProps {
  onNavigateToFeed?: () => void;
}

export const CommunityActivityTab: React.FC<CommunityActivityTabProps> = ({ onNavigateToFeed }) => {
  const { user } = useAuth();
  const { userPosts, bookmarkedPosts, toggleBookmark, deletePost, toggleLike } = useFeed();
  const [subTab, setSubTab] = useState<'my_posts' | 'bookmarks'>('my_posts');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0a192f] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-400/20 text-sky-300 border border-sky-400/30">
            <Users className="w-3.5 h-3.5" />
            <span>Travel Buddies & Social Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-white">
            Community Activity & Saved Stories
          </h2>
          <p className="text-xs text-sky-200/80 max-w-xl">
            Manage your published travel stories, group buddy requests, and bookmarked travel guides from fellow explorers.
          </p>
        </div>

        {onNavigateToFeed && (
          <button
            type="button"
            onClick={onNavigateToFeed}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-400 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Travel Feed</span>
          </button>
        )}
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setSubTab('my_posts')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[40px] ${
            subTab === 'my_posts'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>My Stories & Posts ({userPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('bookmarks')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[40px] ${
            subTab === 'bookmarks'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Bookmarked Travel Tips ({bookmarkedPosts.length})</span>
        </button>
      </div>

      {/* Tab 1: My Posts */}
      {subTab === 'my_posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-white/10 bg-slate-900/80 space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-sky-400/10 border border-sky-400/20 text-sky-300 flex items-center justify-center mx-auto shadow-inner">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white font-serif-display">No stories published yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Share your recent trip photos, find travel companions for your upcoming journey, or post travel tips for the Azraq community.
                </p>
              </div>

              {onNavigateToFeed && (
                <button
                  type="button"
                  onClick={onNavigateToFeed}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg cursor-pointer min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create First Community Post</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="glass-card rounded-3xl border border-white/15 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {post.imageUrl && (
                      <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                        <img
                          src={post.imageUrl}
                          alt={post.caption || 'Travel Post'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {post.badgeLabel && (
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-400/30">
                            {post.badgeLabel}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-sky-300 font-semibold">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{post.location}</span>
                        </span>
                        <span>{post.timeAgo || 'Recently'}</span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed">
                        {post.caption}
                      </p>

                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.hashtags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-[11px] font-mono text-sky-400">
                              #{tag.replace(/^#/, '')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/70 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <span className="flex items-center gap-1 font-semibold text-rose-300">
                        <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
                        <span>{post.likes || 0}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-sky-300">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{post.commentsCount || 0}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookmarks */}
      {subTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarkedPosts.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-white/10 bg-slate-900/80 space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
                <Bookmark className="w-8 h-8" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white font-serif-display">No bookmarked stories yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  When browsing the Travel Buddies social feed, click the bookmark icon on any guide, visa insight, or traveler story to save it here for offline reference.
                </p>
              </div>

              {onNavigateToFeed && (
                <button
                  type="button"
                  onClick={onNavigateToFeed}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg cursor-pointer min-h-[44px]"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse Travel Buddies Feed</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedPosts.map((post) => (
                <div
                  key={post.id}
                  className="glass-card rounded-3xl border border-white/15 bg-slate-900/90 shadow-xl overflow-hidden flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {post.imageUrl && (
                      <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                        <img
                          src={post.imageUrl}
                          alt={post.caption || 'Bookmarked Story'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={post.authorName}
                          className="w-7 h-7 rounded-full object-cover border border-amber-400/40"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate">{post.authorName}</span>
                          <span className="text-[10px] text-sky-300 block truncate">{post.location}</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed">
                        {post.caption}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/70 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                        post.isLiked ? 'text-rose-400' : 'text-slate-400 hover:text-rose-300'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-400' : ''}`} />
                      <span>{post.likes || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(post.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-slate-950 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Saved</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

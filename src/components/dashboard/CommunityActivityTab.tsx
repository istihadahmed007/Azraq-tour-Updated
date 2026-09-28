import React, { useState } from 'react';
import { useFeed } from '../../context/FeedContext';
import {
  Users,
  Heart,
  Bookmark,
  MessageCircle,
  Trash2,
  ExternalLink,
  MapPin,
  Compass,
} from 'lucide-react';

interface CommunityActivityTabProps {
  onNavigateToFeed?: () => void;
}

export const CommunityActivityTab: React.FC<CommunityActivityTabProps> = ({ onNavigateToFeed }) => {
  const { userPosts, bookmarkedPosts, toggleBookmark, deletePost, toggleLike } = useFeed();
  const [subTab, setSubTab] = useState<'my_posts' | 'bookmarks'>('my_posts');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 border border-white/12 bg-[#0F2339]/95 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/40">
            <Users className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Travel Buddies & Social Feed</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Community Activity & Saved Stories
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-xl">
            Manage your published travel stories, group buddy requests, and bookmarked travel guides from fellow travelers.
          </p>
        </div>

        {onNavigateToFeed && (
          <button
            type="button"
            onClick={onNavigateToFeed}
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Travel Feed</span>
          </button>
        )}
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setSubTab('my_posts')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer min-h-[40px] ${
            subTab === 'my_posts'
              ? 'bg-[#2563EB] text-white font-bold shadow-xs'
              : 'bg-[#0F2339]/80 hover:bg-[#0F2339] text-[#CBD5E1] border border-white/10'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>My Stories & Posts ({userPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('bookmarks')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer min-h-[40px] ${
            subTab === 'bookmarks'
              ? 'bg-[#2563EB] text-white font-bold shadow-xs'
              : 'bg-[#0F2339]/80 hover:bg-[#0F2339] text-[#CBD5E1] border border-white/10'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Bookmarked Stories ({bookmarkedPosts.length})</span>
        </button>
      </div>

      {/* Tab 1: My Posts */}
      {subTab === 'my_posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="rounded-2xl p-10 sm:p-12 text-center border border-white/10 bg-[#0F2339]/80 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/15 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
                <Users className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-white">No stories published yet</h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
                  Share your recent trip photos, find travel companions for your upcoming journey, or post travel tips for the Azraq community.
                </p>
              </div>

              {onNavigateToFeed && (
                <button
                  type="button"
                  onClick={onNavigateToFeed}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer min-h-[44px]"
                >
                  <Compass className="w-4 h-4" />
                  <span>Create First Post</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-white/10 bg-[#0F2339]/90 shadow-md overflow-hidden hover:border-[#2563EB]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    {post.imageUrl && (
                      <div className="h-44 w-full relative overflow-hidden bg-[#071426]">
                        <img
                          src={post.imageUrl}
                          alt={post.caption || 'Travel Post'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {post.badgeLabel && (
                          <span className="absolute top-3 left-3 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#071426]/90 text-[#2DD4BF] border border-white/15">
                            {post.badgeLabel}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#CBD5E1]">
                        <span className="flex items-center gap-1 text-sky-300 font-semibold">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{post.location}</span>
                        </span>
                        <span>{post.timeAgo || 'Recently'}</span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#F8FAFC] line-clamp-3 leading-relaxed">
                        {post.caption}
                      </p>

                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.hashtags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="text-xs font-mono text-[#2DD4BF]">
                              #{tag.replace(/^#/, '')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-[#071426]/70 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-[#CBD5E1]">
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
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#CBD5E1] hover:text-rose-300 transition-colors cursor-pointer"
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

      {/* Tab 2: Bookmarked Posts */}
      {subTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarkedPosts.length === 0 ? (
            <div className="rounded-2xl p-10 sm:p-12 text-center border border-white/10 bg-[#0F2339]/80 space-y-4 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                <Bookmark className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-white">No bookmarked stories</h3>
                <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
                  Browse the Travel Buddies social feed and click the bookmark icon on posts to save trip ideas for later.
                </p>
              </div>

              {onNavigateToFeed && (
                <button
                  type="button"
                  onClick={onNavigateToFeed}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer min-h-[44px]"
                >
                  <Compass className="w-4 h-4" />
                  <span>Browse Travel Feed</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-white/10 bg-[#0F2339]/90 shadow-md overflow-hidden hover:border-[#2563EB]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    {post.imageUrl && (
                      <div className="h-44 w-full relative overflow-hidden bg-[#071426]">
                        <img
                          src={post.imageUrl}
                          alt={post.caption || 'Saved Post'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() => toggleBookmark(post.id)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#071426]/80 text-[#2DD4BF] flex items-center justify-center cursor-pointer"
                          title="Remove bookmark"
                        >
                          <Bookmark className="w-4 h-4 fill-[#2DD4BF]" />
                        </button>
                      </div>
                    )}

                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#CBD5E1]">
                        <span className="flex items-center gap-1 text-sky-300 font-semibold">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{post.location}</span>
                        </span>
                        <span>by {post.authorName}</span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#F8FAFC] line-clamp-3 leading-relaxed">
                        {post.caption}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#071426]/70 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>{post.likes || 0}</span>
                    </button>

                    {onNavigateToFeed && (
                      <button
                        type="button"
                        onClick={onNavigateToFeed}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View in Feed</span>
                      </button>
                    )}
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

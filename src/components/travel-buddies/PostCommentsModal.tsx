import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Post, Profile } from '../../lib/types';
import { ApiComment, apiGetComments, apiAddComment, apiEditComment, apiDeleteComment } from '../../lib/communityApi';
import { useAuth } from '../../context/AuthContext';
import { apiSubmitReport } from '../../lib/communityApi';
import {
  X,
  Send,
  MessageSquare,
  CornerDownRight,
  Edit2,
  Trash2,
  Flag,
  Check,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

interface PostCommentsModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentCountChange?: (postId: string, newCount: number) => void;
}

export const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  post,
  isOpen,
  onClose,
  onCommentCountChange,
}) => {
  const { user, isGuest, openAuthModal, showToast } = useAuth();

  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Composer state
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null);

  // Editing state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Photo carousel for photo posts
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const previousScrollYRef = useRef<number>(0);

  // Prevent background scrolling while modal is open, and restore focus & scroll position on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement | null;
      previousScrollYRef.current = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
        window.scrollTo({ top: previousScrollYRef.current, behavior: 'instant' as ScrollBehavior });
        if (previousActiveElementRef.current && typeof previousActiveElementRef.current.focus === 'function') {
          try {
            previousActiveElementRef.current.focus();
          } catch {
            // Ignore focus failures
          }
        }
      };
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch comments whenever post or modal opens, guarding against race conditions
  useEffect(() => {
    if (!isOpen || !post) return;

    let isCurrent = true;
    setLoading(true);
    setError(null);
    setReplyingTo(null);
    setEditingCommentId(null);
    setCurrentPhotoIndex(0);

    apiGetComments(post.id)
      .then((data) => {
        if (isCurrent) {
          setComments(data);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (isCurrent) {
          setError(err?.message || 'Unable to load comments. Please try again.');
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, post?.id]);

  if (!isOpen || !post) return null;

  // Media URLs extraction (supports both snake_case and camelCase API structures)
  const mediaUrls: string[] =
    Array.isArray(post.media_urls) && post.media_urls.length > 0
      ? post.media_urls
      : Array.isArray((post as any).mediaUrls) && (post as any).mediaUrls.length > 0
      ? (post as any).mediaUrls
      : (post as any).imageUrl
      ? [(post as any).imageUrl]
      : (post as any).image_url
      ? [(post as any).image_url]
      : [];
  const hasPhotos = mediaUrls.length > 0;

  // Author details
  const postAuthorName = post.profile?.full_name || post.profile?.username || 'Traveler';
  const postAuthorHandle = post.profile?.username || 'traveler';
  const postAuthorAvatar =
    post.profile?.photoURL ||
    post.profile?.avatar_url ||
    (post as any).authorAvatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(postAuthorHandle)}`;

  // Organize top-level comments and replies
  const topLevelComments = comments.filter((c) => !c.parentId);
  const getRepliesForComment = (commentId: string) =>
    comments.filter((c) => c.parentId === commentId);

  // Handle posting a comment or reply
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmitting) return;

    if (isGuest || !user) {
      openAuthModal('login');
      return;
    }

    const trimmed = newCommentText.trim();
    setIsSubmitting(true);

    try {
      const res = await apiAddComment(post.id, trimmed, replyingTo?.id);
      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment!]);
        setNewCommentText('');
        setReplyingTo(null);

        const newCount = comments.length + 1;
        if (onCommentCountChange) {
          onCommentCountChange(post.id, newCount);
        }
        showToast('Comment posted successfully!', 'success');

        // Scroll to bottom
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      } else {
        showToast(res.error || 'Failed to post comment. Please try again.', 'error');
      }
    } catch {
      showToast('Failed to post comment. Your text was preserved.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle editing a comment
  const handleSaveEdit = async (commentId: string) => {
    if (!editingText.trim() || isUpdating) return;
    setIsUpdating(true);

    try {
      const res = await apiEditComment(post.id, commentId, editingText.trim());
      if (res.success && res.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, text: res.comment!.text, updatedAt: res.comment!.updatedAt } : c))
        );
        setEditingCommentId(null);
        setEditingText('');
        showToast('Comment updated.', 'success');
      } else {
        showToast(res.error || 'Failed to update comment.', 'error');
      }
    } catch {
      showToast('Network error while updating comment.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await apiDeleteComment(post.id, commentId);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId && c.parentId !== commentId));
        const newCount = Math.max(0, comments.filter((c) => c.id !== commentId && c.parentId !== commentId).length);
        if (onCommentCountChange) {
          onCommentCountChange(post.id, newCount);
        }
        showToast('Comment deleted.', 'info');
      } else {
        showToast(res.error || 'Could not delete comment.', 'error');
      }
    } catch {
      showToast('Could not delete comment.', 'error');
    }
  };

  // Handle reporting a comment
  const handleReportComment = async (commentId: string) => {
    try {
      await apiSubmitReport({
        targetType: 'comment',
        targetId: commentId,
        reason: 'inappropriate',
        details: `Flagged by user from comment thread on post ${post.id}`,
      });
      showToast('Thank you. Comment flagged for moderation.', 'success');
    } catch {
      showToast('Report submitted.', 'info');
    }
  };

  // Format relative timestamp
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'TR';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-comments-dialog-title"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Dialog Container */}
      <div
        className={`relative z-10 w-full bg-[#0A1628] border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[85vh] ${
          hasPhotos ? 'max-w-4xl h-[650px] md:flex-row' : 'max-w-xl h-[580px]'
        }`}
      >
        {/* =================================================================== */}
        {/* LEFT COLUMN: Media Gallery Preview (Desktop split layout for photos)*/}
        {/* =================================================================== */}
        {hasPhotos && (
          <div className="hidden md:flex md:w-1/2 bg-black/90 items-center justify-center relative overflow-hidden border-r border-white/10 select-none">
            <img
              src={mediaUrls[currentPhotoIndex]}
              alt={`Photo ${currentPhotoIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />

            {/* Multiple photos navigation arrows */}
            {mediaUrls.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1))
                  }
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentPhotoIndex((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md">
                  {mediaUrls.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === currentPhotoIndex ? 'w-4 bg-[#17BEBB]' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Header, Post Caption, Scrollable Comments, Composer   */}
        {/* =================================================================== */}
        <div className={`flex flex-col flex-1 h-full min-w-0 ${hasPhotos ? 'md:w-1/2' : 'w-full'}`}>
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-white/10 bg-[#071322] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={postAuthorAvatar}
                alt={postAuthorHandle}
                className="w-9 h-9 rounded-full object-cover border border-white/15 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(postAuthorHandle)}`;
                }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 id="post-comments-dialog-title" className="text-xs font-bold text-white truncate">
                    @{postAuthorHandle}
                  </h3>
                  {post.profile?.is_verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#17BEBB] shrink-0" />
                  )}
                </div>
                {post.location && (
                  <p className="text-[10px] text-white/50 flex items-center gap-1 truncate">
                    <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                    {post.location}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-[11px] font-semibold text-white/70 border border-white/10">
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                aria-label="Close comments dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Original Post Caption Box (Context) */}
          {post.caption && (
            <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] text-xs text-white/80 leading-relaxed max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 shrink-0">
              <span className="font-bold text-sky-300 mr-1.5">@{postAuthorHandle}</span>
              <span>{post.caption}</span>
            </div>
          )}

          {/* Scrollable Comments Thread */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
          >
            {loading ? (
              // Loading Skeleton State
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-3 items-start animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-white/10 rounded w-24" />
                      <div className="h-3.5 bg-white/10 rounded w-full" />
                      <div className="h-3.5 bg-white/10 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              // Error State
              <div className="py-10 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                <p className="text-xs text-rose-300">{error}</p>
                <button
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                    apiGetComments(post.id)
                      .then((data) => {
                        setComments(data);
                        setLoading(false);
                      })
                      .catch((err) => {
                        setError(err?.message || 'Failed to load comments');
                        setLoading(false);
                      });
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            ) : topLevelComments.length === 0 ? (
              // Empty State
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-white/50">
                <div className="w-12 h-12 rounded-2xl bg-[#0047BA]/20 border border-[#0047BA]/40 flex items-center justify-center text-[#17BEBB] mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-white">No comments yet</p>
                <p className="text-xs text-white/50 mt-1 max-w-xs">
                  Start the conversation! Share advice, ask about this destination, or say hello.
                </p>
              </div>
            ) : (
              // Comments Thread List
              topLevelComments.map((comment) => {
                const isAuthor = Boolean(user && user.uid === comment.authorId);
                const isPostAuthor = Boolean(user && user.uid === post.user_id);
                const canDelete = isAuthor || isPostAuthor || user?.role === 'admin';
                const replies = getRepliesForComment(comment.id);

                const authorName = comment.author?.displayName || comment.author?.username || 'Traveler';
                const authorUsername = comment.author?.username || 'traveler';
                const avatar =
                  comment.author?.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorUsername)}`;

                return (
                  <div key={comment.id} className="space-y-2.5">
                    {/* Top-Level Comment */}
                    <div className="flex gap-2.5 items-start group">
                      <img
                        src={avatar}
                        alt={authorUsername}
                        className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorUsername)}`;
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        {editingCommentId === comment.id ? (
                          // Inline Edit Box
                          <div className="bg-white/10 rounded-2xl p-2.5 border border-[#17BEBB]/40 space-y-2">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-black/40 text-white text-xs p-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#17BEBB] resize-none"
                              rows={2}
                              maxLength={500}
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-2.5 py-1 text-[11px] text-white/60 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(comment.id)}
                                disabled={!editingText.trim() || isUpdating}
                                className="px-3 py-1 bg-[#0047BA] hover:bg-[#0759B8] text-white text-[11px] font-bold rounded-lg disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Comment Bubble
                          <div className="bg-white/5 hover:bg-white/[0.08] transition-colors rounded-2xl p-3 border border-white/5">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xs font-bold text-sky-300 truncate">
                                  @{authorUsername}
                                </span>
                                {comment.author?.isVerified && (
                                  <CheckCircle2 className="w-3 h-3 text-[#17BEBB] shrink-0" />
                                )}
                              </div>
                              <span className="text-[10px] text-white/40 shrink-0">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-white/90 leading-relaxed break-words">
                              {comment.text}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons under Comment Bubble */}
                        <div className="flex items-center gap-3 mt-1 px-2 text-[10px] text-white/50">
                          <button
                            onClick={() => {
                              if (isGuest || !user) {
                                openAuthModal('login');
                                return;
                              }
                              setReplyingTo({ id: comment.id, username: authorUsername });
                              if (inputRef.current) inputRef.current.focus();
                            }}
                            className="hover:text-[#17BEBB] flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            Reply
                          </button>

                          {isAuthor && editingCommentId !== comment.id && (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingText(comment.text);
                              }}
                              className="hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              Edit
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              Delete
                            </button>
                          )}

                          {!isAuthor && (
                            <button
                              onClick={() => handleReportComment(comment.id)}
                              className="hover:text-amber-400 flex items-center gap-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Report comment"
                            >
                              <Flag className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Replies (Nested 1 Level) */}
                    {replies.length > 0 && (
                      <div className="border-l-2 border-white/10 pl-3.5 ml-4 space-y-2.5 pt-1">
                        {replies.map((reply) => {
                          const isReplyAuthor = Boolean(user && user.uid === reply.authorId);
                          const canDeleteReply = isReplyAuthor || isPostAuthor || user?.role === 'admin';
                          const replyAuthorUsername = reply.author?.username || 'traveler';
                          const replyAvatar =
                            reply.author?.avatarUrl ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(replyAuthorUsername)}`;

                          return (
                            <div key={reply.id} className="flex gap-2.5 items-start group">
                              <img
                                src={replyAvatar}
                                alt={replyAuthorUsername}
                                className="w-6 h-6 rounded-full object-cover border border-white/10 shrink-0 mt-0.5"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(replyAuthorUsername)}`;
                                }}
                              />

                              <div className="flex-1 min-w-0">
                                {editingCommentId === reply.id ? (
                                  <div className="bg-white/10 rounded-2xl p-2 border border-[#17BEBB]/40 space-y-1.5">
                                    <textarea
                                      value={editingText}
                                      onChange={(e) => setEditingText(e.target.value)}
                                      className="w-full bg-black/40 text-white text-xs p-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#17BEBB] resize-none"
                                      rows={2}
                                      maxLength={500}
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => setEditingCommentId(null)}
                                        className="px-2 py-0.5 text-[10px] text-white/60 hover:text-white"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleSaveEdit(reply.id)}
                                        disabled={!editingText.trim() || isUpdating}
                                        className="px-2.5 py-0.5 bg-[#0047BA] hover:bg-[#0759B8] text-white text-[10px] font-bold rounded-lg disabled:opacity-50"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-white/[0.04] hover:bg-white/[0.07] transition-colors rounded-2xl p-2.5 border border-white/5">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="text-[11px] font-bold text-sky-300 truncate">
                                        @{replyAuthorUsername}
                                      </span>
                                      <span className="text-[9px] text-white/40">
                                        {formatTimeAgo(reply.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-white/90 leading-relaxed break-words">
                                      {reply.text}
                                    </p>
                                  </div>
                                )}

                                <div className="flex items-center gap-3 mt-0.5 px-2 text-[10px] text-white/50">
                                  {isReplyAuthor && editingCommentId !== reply.id && (
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(reply.id);
                                        setEditingText(reply.text);
                                      }}
                                      className="hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit2 className="w-2.5 h-2.5" />
                                      Edit
                                    </button>
                                  )}

                                  {canDeleteReply && (
                                    <button
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                      Delete
                                    </button>
                                  )}

                                  {!isReplyAuthor && (
                                    <button
                                      onClick={() => handleReportComment(reply.id)}
                                      className="hover:text-amber-400 flex items-center gap-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Report reply"
                                    >
                                      <Flag className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* =================================================================== */}
          {/* PINNED COMPOSER AT BOTTOM (Visible always while list scrolls)        */}
          {/* =================================================================== */}
          <div className="p-3 bg-[#071322] border-t border-white/10 shrink-0">
            {/* Replying banner */}
            {replyingTo && (
              <div className="mb-2 px-3 py-1.5 rounded-xl bg-[#0047BA]/20 border border-[#0047BA]/40 flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1.5 text-[#17BEBB]">
                  <CornerDownRight className="w-3.5 h-3.5" />
                  Replying to <strong className="text-white">@{replyingTo.username}</strong>
                </span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-white/60 hover:text-white font-bold text-sm px-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}

            {isGuest || !user ? (
              // Logged out prompt
              <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <span className="text-white/70">Sign in to join the travel conversation</span>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 bg-[#0047BA] hover:bg-[#0759B8] text-white font-bold rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
                >
                  Sign In
                </button>
              </div>
            ) : (
              // Active Comment Form
              <form onSubmit={handleSubmitComment} className="flex items-center gap-2">
                <img
                  src={
                    user.photoURL ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName || 'User')}`
                  }
                  alt={user.fullName || 'User'}
                  className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0 hidden sm:block"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={
                    replyingTo
                      ? `Reply to @${replyingTo.username}...`
                      : 'Add a helpful comment or travel tip...'
                  }
                  className="flex-1 bg-white/10 text-white placeholder-white/40 text-xs px-4 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-[#17BEBB] transition-colors"
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim() || isSubmitting}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-[#0047BA] to-[#17BEBB] hover:from-[#0759B8] hover:to-[#17BEBB] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0 cursor-pointer"
                  title="Send comment"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 ml-0.5" />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

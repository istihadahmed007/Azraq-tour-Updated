import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Heart,
  MessageSquare,
  UserPlus,
  Compass,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchSocialNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../lib/travelBuddyQueries';
import { SocialNotification } from '../../types';

interface SocialNotificationsViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const SocialNotificationsView: React.FC<SocialNotificationsViewProps> = ({
  onNavigateTab,
}) => {
  const { user, isGuest, openAuthModal, showToast } = useAuth();
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchSocialNotifications(user.uid);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (notification: SocialNotification) => {
    if (!user || notification.is_read) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await markNotificationAsRead(notification.id, user.uid);
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    if (!user || unreadCount === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await markAllNotificationsAsRead(user.uid);
      showToast('All notifications marked as read.', 'info');
    } catch {}
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'buddy_request':
        return <UserPlus className="w-4 h-4 text-sky-400" />;
      case 'buddy_accepted':
        return <Check className="w-4 h-4 text-emerald-400" />;
      case 'like':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      case 'trip_join':
        return <Compass className="w-4 h-4 text-amber-400" />;
      case 'community_invite':
        return <Users className="w-4 h-4 text-teal-400" />;
      default:
        return <Bell className="w-4 h-4 text-sky-400" />;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      return `${days}d ago`;
    } catch {
      return '';
    }
  };

  if (isGuest || !user) {
    return (
      <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-white/10">
        <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3">
          <Bell className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          Sign In to View Notifications
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
          Get real-time updates when fellow travelers connect with you, react to your stories, or join your trips.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-white">Social Notifications</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-sky-500 text-slate-950 text-[11px] font-bold">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-16 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-white/10 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <CheckCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            You're all caught up!
          </h3>
          <p className="text-xs text-slate-400">
            No unread notifications at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                handleMarkAsRead(notif);
                if (notif.action_url && onNavigateTab) {
                  onNavigateTab(notif.action_url);
                }
              }}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                notif.is_read
                  ? 'bg-slate-900/40 border-white/5 hover:bg-slate-900/70'
                  : 'bg-slate-900/90 border-sky-500/30 hover:border-sky-500/60 shadow-md'
              }`}
            >
              {/* Actor Avatar / Icon */}
              <div className="relative shrink-0">
                <img
                  src={
                    notif.actor_avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                      notif.actor_name || 'Traveler'
                    )}`
                  }
                  alt={notif.actor_name || 'User'}
                  className="w-10 h-10 rounded-full object-cover border border-white/10 bg-slate-950"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-white/20 flex items-center justify-center">
                  {getIconForType(notif.type)}
                </div>
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatTime(notif.created_at)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
                  {notif.message}
                </p>
              </div>

              {/* Unread Dot */}
              {!notif.is_read && (
                <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

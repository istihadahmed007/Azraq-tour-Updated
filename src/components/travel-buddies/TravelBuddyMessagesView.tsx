import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  ShieldAlert,
  UserX,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  apiGetConversations,
  apiGetMessages,
  apiSendMessage,
  apiAcceptConversation,
  apiBlockUser,
  apiSubmitReport,
  ApiConversation,
  ApiMessage,
  ApiProfile,
} from '../../lib/communityApi';
import { useAuth } from '../../context/AuthContext';

interface TravelBuddyMessagesViewProps {
  initialConversationId?: string;
  onNavigateToUserProfile?: (userId: string) => void;
}

export const TravelBuddyMessagesView: React.FC<TravelBuddyMessagesViewProps> = ({
  initialConversationId,
  onNavigateToUserProfile,
}) => {
  const { user, showToast } = useAuth();
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'requests'>('active');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = useCallback(async () => {
    try {
      const list = await apiGetConversations();
      setConversations(list);
      if (!activeConvId && list.length > 0) {
        // default select first active conversation
        const firstActive = list.find((c) => c.status === 'active') || list[0];
        setActiveConvId(firstActive.id);
      }
    } catch {
      setConversations([]);
    } finally {
      setIsLoadingConvs(false);
    }
  }, [activeConvId]);

  const loadMessages = useCallback(async (convId: string) => {
    setIsLoadingMessages(true);
    try {
      const msgs = await apiGetMessages(convId);
      setMessages(msgs);
    } catch {
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
      // Honest live refresh polling every 6 seconds while in active conversation
      const interval = setInterval(() => {
        apiGetMessages(activeConvId).then((freshMsgs) => {
          setMessages(freshMsgs);
        });
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [activeConvId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConvId || !newMessageText.trim() || isSending) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');
    setIsSending(true);

    const res = await apiSendMessage(activeConvId, textToSend);
    setIsSending(false);

    if (res.success && res.message) {
      setMessages((prev) => [...prev, res.message!]);
      loadConversations(); // update last message snippet
    } else {
      showToast(res.error || 'Failed to send message', 'error');
      setNewMessageText(textToSend); // restore unsent text
    }
  };

  const handleAcceptRequest = async () => {
    if (!activeConvId) return;
    const res = await apiAcceptConversation(activeConvId);
    if (res.success) {
      showToast('Message request accepted! You can now chat.', 'success');
      loadConversations();
    } else {
      showToast(res.error || 'Could not accept message request', 'error');
    }
  };

  const handleBlockUser = async () => {
    if (!activeConversation?.otherUser) return;
    const target = activeConversation.otherUser;
    const res = await apiBlockUser(target.userId);
    setShowBlockModal(false);
    if (res.success) {
      showToast(`${target.displayName} has been blocked.`, 'info');
      setActiveConvId(null);
      loadConversations();
    } else {
      showToast(res.error || 'Could not block traveler', 'error');
    }
  };

  const handleReportConversation = async () => {
    if (!activeConvId || !reportReason) return;
    const res = await apiSubmitReport({
      targetType: 'conversation',
      targetId: activeConvId,
      reason: reportReason,
      details: reportDetails,
    });
    setShowReportModal(false);
    setReportReason('');
    setReportDetails('');
    if (res.success) {
      showToast('Report submitted. Our moderation team will investigate.', 'success');
    } else {
      showToast(res.error || 'Failed to submit report', 'error');
    }
  };

  const activeConvs = conversations.filter((c) => c.status === 'active');
  const requestConvs = conversations.filter((c) => c.status === 'request');

  return (
    <div className="flex flex-col lg:flex-row h-[720px] bg-[#0A1628]/90 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* LEFT: Conversation List */}
      <div
        className={`w-full lg:w-80 flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-[#071322]/80 ${
          activeConvId ? 'hidden lg:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#17BEBB]" />
              Travel Messages
            </h2>
          </div>

          {/* Active vs Requests Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === 'active'
                  ? 'bg-[#0047BA] text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Active ({activeConvs.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-[#0047BA] text-white shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Requests
              {requestConvs.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#17BEBB] text-[#071A33] text-[10px] font-bold flex items-center justify-center">
                  {requestConvs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {isLoadingConvs ? (
            <div className="p-8 text-center text-white/50 text-sm">Loading conversations...</div>
          ) : (activeTab === 'active' ? activeConvs : requestConvs).length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm flex flex-col items-center">
              <MessageSquare className="w-8 h-8 text-white/20 mb-2" />
              {activeTab === 'active' ? 'No active messages yet.' : 'No pending message requests.'}
            </div>
          ) : (
            (activeTab === 'active' ? activeConvs : requestConvs).map((conv) => {
              const other = conv.otherUser;
              const isSelected = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                    isSelected ? 'bg-white/10 border-l-4 border-[#17BEBB]' : 'hover:bg-white/5'
                  }`}
                >
                  <img
                    src={other?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.displayName || 'Traveler')}&background=0047BA&color=fff`}
                    alt={other?.displayName || 'Traveler'}
                    className="w-11 h-11 rounded-full object-cover border border-white/20 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white text-sm truncate">
                        {other?.displayName || 'Traveler'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 bg-[#17BEBB] text-[#071A33] text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/60 truncate mt-0.5">
                      {conv.lastMessageText || 'Started conversation'}
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">
                      {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: Chat Window */}
      <div
        className={`flex-1 flex flex-col bg-[#0A1A2E]/60 ${
          activeConvId ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#071322]/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="lg:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() =>
                    onNavigateToUserProfile && activeConversation.otherUser && onNavigateToUserProfile(activeConversation.otherUser.userId)
                  }
                >
                  <img
                    src={
                      activeConversation.otherUser?.avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.otherUser?.displayName || 'Traveler')}&background=0047BA&color=fff`
                    }
                    alt={activeConversation.otherUser?.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                      {activeConversation.otherUser?.displayName}
                    </h3>
                    <p className="text-xs text-[#17BEBB]">@{activeConversation.otherUser?.username}</p>
                  </div>
                </div>
              </div>

              {/* Actions Dropdown / Quick Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-xl text-white/50 hover:text-amber-400 hover:bg-white/5 transition-colors"
                  title="Report conversation"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowBlockModal(true)}
                  className="p-2 rounded-xl text-white/50 hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Block traveler"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Safety Reminder Banner */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-xs text-amber-200/90">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Safety Notice:</strong> Always meet new travel companions in busy public places. Keep personal financial details and passwords private.
              </span>
            </div>

            {/* Message Request Acceptance Banner */}
            {activeConversation.status === 'request' && activeConversation.requestedBy !== user?.uid && (
              <div className="p-4 bg-[#0047BA]/30 border-b border-[#0047BA]/50 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">Message Request</p>
                  <p className="text-xs text-white/70">
                    Accept to reply and connect with {activeConversation.otherUser?.displayName}.
                  </p>
                </div>
                <button
                  onClick={handleAcceptRequest}
                  className="px-4 py-2 bg-[#17BEBB] hover:bg-[#15a8a5] text-[#071A33] font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  Accept Request
                </button>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoadingMessages ? (
                <div className="text-center text-white/40 text-sm mt-8">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-white/40 text-sm mt-12 flex flex-col items-center">
                  <Sparkles className="w-8 h-8 text-[#17BEBB]/40 mb-2" />
                  <p className="font-semibold text-white/70">No messages yet</p>
                  <p className="text-xs text-white/50 max-w-xs mt-1">
                    Say hello to introduce your travel style or plan your upcoming trip itinerary together!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? 'bg-[#0047BA] text-white rounded-tr-sm shadow-md'
                            : 'bg-white/10 text-white rounded-tl-sm border border-white/10'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-white/40 mt-1 px-1 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isMine && <Check className="w-3 h-3 text-[#17BEBB]" />}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#071322]/80">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder={`Message ${activeConversation.otherUser?.displayName || 'traveler'}...`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#17BEBB] transition-colors"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={!newMessageText.trim() || isSending}
                  className="p-3 rounded-xl bg-[#0047BA] hover:bg-[#0759B8] disabled:opacity-40 text-white transition-all shadow-md active:scale-95 flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/40">
            <MessageSquare className="w-12 h-12 text-white/20 mb-3" />
            <h3 className="font-semibold text-white/70 text-base">Select a conversation</h3>
            <p className="text-xs text-white/40 max-w-sm mt-1">
              Connect with fellow travelers to coordinate group departures, split hotel expenses, or ask local destination tips.
            </p>
          </div>
        )}
      </div>

      {/* Block User Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <UserX className="w-5 h-5 text-red-400" />
              Block {activeConversation?.otherUser?.displayName}?
            </h3>
            <p className="text-sm text-white/70 mb-4 leading-relaxed">
              They will no longer be able to message you, view your stories, or request to join your companion trips.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="px-4 py-2 text-sm rounded-xl text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockUser}
                className="px-5 py-2 text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Block Traveler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Report Conversation
            </h3>
            <p className="text-xs text-white/60 mb-4">
              Help us maintain an authentic, respectful community. Reports are reviewed by human moderators.
            </p>
            <label className="block text-xs font-semibold text-white/80 mb-1">Reason</label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mb-3 focus:outline-none"
            >
              <option value="" className="bg-[#0A1628]">Select a reason...</option>
              <option value="spam" className="bg-[#0A1628]">Spam or commercial promotion</option>
              <option value="harassment" className="bg-[#0A1628]">Harassment or abusive language</option>
              <option value="scam" className="bg-[#0A1628]">Financial scam or fraud attempt</option>
              <option value="inappropriate" className="bg-[#0A1628]">Inappropriate content</option>
              <option value="other" className="bg-[#0A1628]">Other safety concern</option>
            </select>
            <label className="block text-xs font-semibold text-white/80 mb-1">Additional Notes (Optional)</label>
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Provide context for our moderation team..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/40 mb-4 focus:outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-sm rounded-xl text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                disabled={!reportReason}
                onClick={handleReportConversation}
                className="px-5 py-2 text-sm rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-semibold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

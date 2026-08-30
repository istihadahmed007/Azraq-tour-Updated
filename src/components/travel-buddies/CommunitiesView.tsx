import React, { useState, useEffect } from 'react';
import {
  Users,
  MapPin,
  Plus,
  Search,
  Check,
  UserPlus,
  Sparkles,
  MessageSquare,
  Compass,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchCommunities,
  joinCommunity,
  leaveCommunity,
  createCommunity,
} from '../../lib/travelBuddyQueries';
import { TravelCommunity } from '../../types';

interface CommunitiesViewProps {
  onSelectCommunity?: (community: TravelCommunity) => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({
  onSelectCommunity,
}) => {
  const { user, isGuest, openAuthModal, showToast } = useAuth();
  const [communities, setCommunities] = useState<TravelCommunity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCommunities = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCommunities(user?.uid);
      setCommunities(data);
    } catch {
      setCommunities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, [user]);

  const handleJoinLeave = async (community: TravelCommunity) => {
    if (isGuest || !user) {
      openAuthModal('login');
      return;
    }

    const isMember = community.is_member;
    // Optimistic update
    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id === community.id) {
          return {
            ...c,
            is_member: !isMember,
            member_count: Math.max(0, c.member_count + (isMember ? -1 : 1)),
          };
        }
        return c;
      })
    );

    try {
      if (isMember) {
        await leaveCommunity(community.id, user.uid);
        showToast(`Left ${community.name}`, 'info');
      } else {
        await joinCommunity(community.id, user.uid);
        showToast(`Joined ${community.name}! 🎉`, 'success');
      }
    } catch {
      loadCommunities();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !destination.trim() || !description.trim()) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (isGuest || !user) {
      openAuthModal('login');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCommunity({
        name: name.trim(),
        destination: destination.trim(),
        description: description.trim(),
        image_url:
          imageUrl.trim() ||
          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=75',
        userId: user.uid,
      });

      if (res.success && res.community) {
        showToast(`Community "${res.community.name}" created!`, 'success');
        setCommunities((prev) => [res.community, ...prev]);
        setIsCreateOpen(false);
        setName('');
        setDestination('');
        setDescription('');
        setImageUrl('');
      } else {
        showToast(res.error || 'Failed to create community', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating community', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uniqueDestinations = [
    'All',
    ...Array.from(new Set(communities.map((c) => c.destination))).filter(Boolean),
  ];

  const filteredCommunities = communities.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDest =
      selectedDestination === 'All' ||
      c.destination.toLowerCase() === selectedDestination.toLowerCase();
    return matchSearch && matchDest;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Travel Communities
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Connect with verified groups, share local advice, and plan trips together
          </p>
        </div>
        <button
          onClick={() => {
            if (isGuest || !user) {
              openAuthModal('login');
            } else {
              setIsCreateOpen(true);
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Community
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities by name, destination, or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {uniqueDestinations.map((dest) => (
            <button
              key={dest}
              onClick={() => setSelectedDestination(dest)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedDestination === dest
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/10'
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
      </div>

      {/* Communities Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-72 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            No travel communities found
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            {searchQuery
              ? 'Try adjusting your search terms or destination filters.'
              : 'Be the first to start a travel community for your favorite destination!'}
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Create First Community
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCommunities.map((comm) => (
            <div
              key={comm.id}
              className="flex flex-col bg-slate-900/70 border border-white/10 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 group"
            >
              {/* Cover Image */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-950">
                <img
                  src={comm.image_url}
                  alt={comm.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {comm.destination}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                    {comm.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {comm.member_count} {comm.member_count === 1 ? 'member' : 'members'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      {comm.post_count || 0} posts
                    </span>
                  </div>

                  <button
                    onClick={() => handleJoinLeave(comm)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      comm.is_member
                        ? 'bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 border border-white/15 hover:border-rose-500/30'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                    }`}
                  >
                    {comm.is_member ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Joined
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        Join
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Create New Community
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Community Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sajek Valley Trekkers"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination / Region *
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Sajek Valley, Bangladesh or Maldives"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this community about? Who should join?"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cover Image URL (optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Community'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

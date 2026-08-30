import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Compass,
  Check,
  UserPlus,
  Sparkles,
  DollarSign,
  Clock,
  X,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchGroupTrips,
  joinGroupTrip,
  leaveGroupTrip,
  createGroupTrip,
  AVAILABLE_TRAVEL_STYLES,
  AVAILABLE_DESTINATIONS,
} from '../../lib/travelBuddyQueries';
import { GroupTrip } from '../../types';

export const GroupTripsView: React.FC = () => {
  const { user, isGuest, openAuthModal, showToast } = useAuth();
  const [trips, setTrips] = useState<GroupTrip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('All');

  // Form State
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [maxTravelers, setMaxTravelers] = useState<number>(6);
  const [travelStyle, setTravelStyle] = useState('Adventure & Nature');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGroupTrips(user?.uid);
      setTrips(data);
    } catch {
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user]);

  const handleJoinLeave = async (trip: GroupTrip) => {
    if (isGuest || !user) {
      openAuthModal('login');
      return;
    }

    const isJoined = trip.is_joined;

    // Optimistic update
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === trip.id) {
          const nextCount = Math.max(1, t.current_travelers + (isJoined ? -1 : 1));
          return {
            ...t,
            is_joined: !isJoined,
            current_travelers: nextCount,
            status: nextCount >= t.max_travelers ? 'full' : 'open',
          };
        }
        return t;
      })
    );

    try {
      if (isJoined) {
        await leaveGroupTrip(trip.id, user.uid);
        showToast(`Left trip to ${trip.destination}`, 'info');
      } else {
        const res = await joinGroupTrip(trip.id, user.uid);
        if (res.success) {
          showToast(`Joined group trip to ${trip.destination}! 🎉`, 'success');
        } else {
          showToast(res.error || 'Could not join trip', 'error');
          loadTrips();
        }
      }
    } catch {
      loadTrips();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim() || !startDate || !endDate) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast('Return date must be on or after departure date.', 'error');
      return;
    }

    if (isGuest || !user) {
      openAuthModal('login');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createGroupTrip({
        title: title.trim(),
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        estimated_budget: estimatedBudget.trim() || undefined,
        max_travelers: Number(maxTravelers) || 6,
        travel_style: travelStyle,
        description: description.trim(),
        image_url:
          imageUrl.trim() ||
          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=75',
        userId: user.uid,
      });

      if (res.success && res.trip) {
        showToast(`Group trip to "${res.trip.destination}" created!`, 'success');
        setTrips((prev) => [res.trip, ...prev]);
        setIsCreateOpen(false);
        setTitle('');
        setDestination('');
        setStartDate('');
        setEndDate('');
        setEstimatedBudget('');
        setDescription('');
        setImageUrl('');
      } else {
        showToast(res.error || 'Failed to create trip', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error creating trip', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (selectedStyle === 'All') return true;
    return t.travel_style.toLowerCase() === selectedStyle.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-400" />
            Group Trips & Expeditions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Join fellow travelers on planned journeys or post your own trip invitation
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Group Trip
        </button>
      </div>

      {/* Style Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedStyle('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedStyle === 'All'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/10'
          }`}
        >
          All Styles
        </button>
        {AVAILABLE_TRAVEL_STYLES.map((style) => (
          <button
            key={style}
            onClick={() => setSelectedStyle(style)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStyle === style
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-white/10'
            }`}
          >
            {style}
          </button>
        ))}
      </div>

      {/* Trips Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-slate-900/40 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-dashed border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-3">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            No trips created yet
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            Be the first to organize a group trip and invite verified travelers to join you!
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Organize First Group Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map((trip) => {
            const spotsRemaining = Math.max(0, trip.max_travelers - trip.current_travelers);
            const isFull = trip.status === 'full' || spotsRemaining === 0;

            return (
              <div
                key={trip.id}
                className="flex flex-col bg-slate-900/70 border border-white/10 hover:border-sky-500/40 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 group"
              >
                {/* Cover Photo */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                  <img
                    src={
                      trip.image_url ||
                      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=75'
                    }
                    alt={trip.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                        isFull
                          ? 'bg-rose-500/80 text-white border-rose-400/40'
                          : spotsRemaining <= 2
                          ? 'bg-amber-500/80 text-white border-amber-400/40 animate-pulse'
                          : 'bg-emerald-500/80 text-slate-950 border-emerald-400/40'
                      }`}
                    >
                      {isFull ? 'Trip Full' : `${spotsRemaining} spots left`}
                    </span>
                  </div>

                  {/* Destination */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-[11px] font-medium text-sky-300 mb-1">
                      <MapPin className="w-3 h-3 text-sky-400" />
                      {trip.destination}
                    </div>
                    <h3 className="text-sm font-bold text-white line-clamp-1">
                      {trip.title}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    {/* Dates */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>
                        {new Date(trip.start_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(trip.end_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Budget & Style */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {trip.estimated_budget && (
                        <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                          <span className="text-[10px] text-slate-400 block">Est. Budget</span>
                          <span className="font-semibold text-emerald-400">
                            {trip.estimated_budget}
                          </span>
                        </div>
                      )}
                      <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                        <span className="text-[10px] text-slate-400 block">Style</span>
                        <span className="font-semibold text-sky-300 truncate block">
                          {trip.travel_style}
                        </span>
                      </div>
                    </div>

                    {trip.description && (
                      <p className="text-xs text-slate-300 line-clamp-2 pt-1">
                        {trip.description}
                      </p>
                    )}
                  </div>

                  {/* Footer & Join Action */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Users className="w-4 h-4 text-slate-300" />
                      <span>
                        <strong className="text-white">{trip.current_travelers}</strong> /{' '}
                        {trip.max_travelers} travelers
                      </span>
                    </div>

                    <button
                      onClick={() => handleJoinLeave(trip)}
                      disabled={isFull && !trip.is_joined}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        trip.is_joined
                          ? 'bg-white/10 hover:bg-rose-500/20 text-slate-200 hover:text-rose-300 border border-white/15 hover:border-rose-500/30'
                          : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sm'
                      }`}
                    >
                      {trip.is_joined ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Joined
                        </>
                      ) : isFull ? (
                        'Full'
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          Join Trip
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Trip Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                Organize a Group Trip
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
                  Trip Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5D4N Sajek Valley & Bandarban Expedition"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Destination *
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Sajek Valley, Bangladesh"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Est. Budget (e.g. BDT 15,000)
                  </label>
                  <input
                    type="text"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    placeholder="BDT 12,000 - 15,000"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Max Travelers *
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={25}
                    required
                    value={maxTravelers}
                    onChange={(e) => setMaxTravelers(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Travel Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  {AVAILABLE_TRAVEL_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Trip Description & Highlights
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share the day-by-day plan, vehicle info, or hotel expectations..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cover Photo URL (optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500"
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
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Group Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

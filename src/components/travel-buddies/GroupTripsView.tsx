import React, { useState, useEffect, useCallback } from 'react';
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
  Lock,
  Unlock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  apiGetTrips,
  apiCreateTrip,
  apiSubmitTripRequest,
  apiGetTripRequests,
  apiRespondTripRequest,
  apiWithdrawTripRequest,
  apiLeaveTrip,
  ApiTrip,
  ApiTripRequest,
} from '../../lib/communityApi';
import { AVAILABLE_DESTINATIONS, AVAILABLE_TRAVEL_STYLES, AVAILABLE_LANGUAGES } from '../../lib/travelBuddyQueries';

interface GroupTripsViewProps {
  onNavigateToUserProfile?: (userId: string) => void;
}

export const GroupTripsView: React.FC<GroupTripsViewProps> = ({ onNavigateToUserProfile }) => {
  const { user, isGuest, openAuthModal, showToast } = useAuth();
  const [trips, setTrips] = useState<ApiTrip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchDestination, setSearchDestination] = useState<string>('All');
  const [searchStyle, setSearchStyle] = useState<string>('All');
  const [searchLanguage, setSearchLanguage] = useState<string>('All');
  const [maxBudget, setMaxBudget] = useState<string>('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [joiningTrip, setJoiningTrip] = useState<ApiTrip | null>(null);
  const [joinIntro, setJoinIntro] = useState<string>('');
  const [isSubmittingJoin, setIsSubmittingJoin] = useState<boolean>(false);

  // Organizer Management Drawer
  const [managingTrip, setManagingTrip] = useState<ApiTrip | null>(null);
  const [tripRequests, setTripRequests] = useState<ApiTripRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);

  // Form State for Create Trip
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [currency, setCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [travelStyle, setTravelStyle] = useState('Adventure & Nature');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Bangla']);
  const [maxTravelers, setMaxTravelers] = useState<number>(4);
  const [description, setDescription] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [isSubmittingTrip, setIsSubmittingTrip] = useState(false);

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiGetTrips({
        destination: searchDestination,
        style: searchStyle,
        language: searchLanguage,
        maxBudget: maxBudget ? parseFloat(maxBudget) : undefined,
        upcomingOnly: true,
      });
      setTrips(data);
    } catch {
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchDestination, searchStyle, searchLanguage, maxBudget]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleOpenJoinModal = (trip: ApiTrip) => {
    if (!user || isGuest) {
      openAuthModal('login');
      return;
    }
    setJoiningTrip(trip);
    setJoinIntro('');
  };

  const handleSubmitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joiningTrip || !joinIntro.trim()) return;

    setIsSubmittingJoin(true);
    const res = await apiSubmitTripRequest(joiningTrip.id, joinIntro.trim());
    setIsSubmittingJoin(false);

    if (res.success) {
      showToast('Join request sent to trip organizer!', 'success');
      setJoiningTrip(null);
      loadTrips();
    } else {
      showToast(res.error || 'Failed to submit request', 'error');
    }
  };

  const handleWithdrawRequest = async (trip: ApiTrip) => {
    // User request is withdrawn
    if (!user) return;
    try {
      const reqs = await apiGetTripRequests(trip.id);
      const myReq = reqs.find((r) => r.applicantId === user.uid);
      if (myReq) {
        await apiWithdrawTripRequest(myReq.id);
        showToast('Request withdrawn.', 'info');
        loadTrips();
      }
    } catch {
      showToast('Failed to withdraw request', 'error');
    }
  };

  const handleLeaveTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to leave this companion trip?')) return;
    const res = await apiLeaveTrip(tripId);
    if (res.success) {
      showToast('You have left the trip.', 'info');
      loadTrips();
    } else {
      showToast(res.error || 'Could not leave trip', 'error');
    }
  };

  const openManageRequests = async (trip: ApiTrip) => {
    setManagingTrip(trip);
    setIsLoadingRequests(true);
    try {
      const reqs = await apiGetTripRequests(trip.id);
      setTripRequests(reqs);
    } catch {
      setTripRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleRespondRequest = async (requestId: string, action: 'accept' | 'decline') => {
    const res = await apiRespondTripRequest(requestId, action);
    if (res.success) {
      showToast(action === 'accept' ? 'Applicant accepted into trip!' : 'Request declined.', 'success');
      if (managingTrip) {
        openManageRequests(managingTrip);
      }
      loadTrips();
    } else {
      showToast(res.error || 'Failed to respond to request', 'error');
    }
  };

  const handleCreateTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination || !startDate || !endDate || !description) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      showToast('Return date must be on or after departure date.', 'error');
      return;
    }

    setIsSubmittingTrip(true);
    const res = await apiCreateTrip({
      title: title.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      budgetMin: budgetMin ? Number(budgetMin) : undefined,
      budgetMax: budgetMax ? Number(budgetMax) : undefined,
      currency,
      travelStyle,
      interests: selectedInterests,
      languages: selectedLanguages,
      maxTravelers: Number(maxTravelers),
      description: description.trim(),
      meetingNotes: meetingNotes.trim() || undefined,
    });
    setIsSubmittingTrip(false);

    if (res.success) {
      showToast('Trip published! Fellow travelers can now request to join.', 'success');
      setIsCreateOpen(false);
      // Reset form
      setTitle('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      setBudgetMin('');
      setBudgetMax('');
      setDescription('');
      setMeetingNotes('');
      loadTrips();
    } else {
      showToast(res.error || 'Failed to create trip', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Controls */}
      <div className="bg-[#0A1628]/90 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#17BEBB]/20 text-[#17BEBB] border border-[#17BEBB]/30">
              Verified Companion Trips
            </span>
            <h1 className="text-2xl font-black text-white mt-2">Find Travel Companions</h1>
            <p className="text-sm text-white/60 mt-1 max-w-xl">
              Organize group getaways or request to join upcoming trips. Organizer approvals prevent overbooking, and private meeting coordinates stay secure.
            </p>
          </div>

          <button
            onClick={() => {
              if (!user || isGuest) {
                openAuthModal('login');
              } else {
                setIsCreateOpen(true);
              }
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#0047BA] to-[#0759B8] hover:from-[#0759B8] hover:to-[#0047BA] text-white font-bold text-sm shadow-xl hover:shadow-[#0047BA]/30 transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            Plan a Companion Trip
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div>
            <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1">Destination</label>
            <select
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#17BEBB]"
            >
              <option value="All" className="bg-[#0A1628]">All Destinations</option>
              {AVAILABLE_DESTINATIONS.map((d) => (
                <option key={d} value={d} className="bg-[#0A1628]">{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1">Travel Style</label>
            <select
              value={searchStyle}
              onChange={(e) => setSearchStyle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#17BEBB]"
            >
              <option value="All" className="bg-[#0A1628]">All Travel Styles</option>
              {AVAILABLE_TRAVEL_STYLES.map((s) => (
                <option key={s} value={s} className="bg-[#0A1628]">{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1">Language</label>
            <select
              value={searchLanguage}
              onChange={(e) => setSearchLanguage(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#17BEBB]"
            >
              <option value="All" className="bg-[#0A1628]">Any Language</option>
              {AVAILABLE_LANGUAGES.map((l) => (
                <option key={l} value={l} className="bg-[#0A1628]">{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1">Max Budget (BDT)</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#17BEBB]"
            />
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-white/50 text-sm">Searching real upcoming companion trips...</div>
      ) : trips.length === 0 ? (
        <div className="bg-[#0A1628]/60 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
          <Compass className="w-12 h-12 text-[#17BEBB]/40 mb-3" />
          <h3 className="text-lg font-bold text-white">No upcoming trips matching your filters</h3>
          <p className="text-sm text-white/60 max-w-md mt-1 mb-6">
            Be the first traveler to post a group trip for these dates or destination!
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-2.5 bg-[#0047BA] hover:bg-[#0759B8] text-white text-sm font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            Create a Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => {
            const org = trip.organizer;
            const isFull = trip.status === 'full' || trip.availableSpaces <= 0;
            const canManage = trip.isOrganizer;

            return (
              <div
                key={trip.id}
                className="bg-[#0A1628]/80 border border-white/10 hover:border-white/20 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 shadow-xl relative overflow-hidden group"
              >
                <div>
                  {/* Top Bar: Destination & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#17BEBB] bg-[#17BEBB]/10 border border-[#17BEBB]/20 px-3 py-1 rounded-full">
                      <MapPin className="w-3.5 h-3.5" />
                      {trip.destination}
                    </span>

                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        trip.status === 'open'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : trip.status === 'full'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  {/* Title & Dates */}
                  <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#17BEBB] transition-colors">
                    {trip.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/70 mt-2 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#17BEBB]" />
                      {new Date(trip.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} –{' '}
                      {new Date(trip.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    {(trip.budgetMin || trip.budgetMax) && (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <DollarSign className="w-3.5 h-3.5" />
                        {trip.budgetMin ? `৳${trip.budgetMin.toLocaleString()}` : ''}
                        {trip.budgetMin && trip.budgetMax ? ' – ' : ''}
                        {trip.budgetMax ? `৳${trip.budgetMax.toLocaleString()}` : ''} {trip.currency}
                      </span>
                    )}

                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#17BEBB]" />
                      <strong>{trip.currentTravelers}</strong> of <strong>{trip.maxTravelers}</strong> spots ({trip.availableSpaces} open)
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-white/70 line-clamp-3 leading-relaxed mb-4">
                    {trip.description}
                  </p>

                  {/* Badges / Style / Language */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[10px] font-semibold bg-white/5 text-white/80 px-2 py-0.5 rounded-lg border border-white/10">
                      {trip.travelStyle}
                    </span>
                    {trip.languages?.map((lang) => (
                      <span key={lang} className="text-[10px] bg-white/5 text-white/70 px-2 py-0.5 rounded-lg border border-white/5">
                        {lang}
                      </span>
                    ))}
                    {trip.interests?.slice(0, 2).map((item) => (
                      <span key={item} className="text-[10px] bg-[#0047BA]/20 text-blue-300 px-2 py-0.5 rounded-lg border border-blue-400/20">
                        {item}
                      </span>
                    ))}
                  </div>

                  {/* Meeting Notes (Visible only to approved members) */}
                  {trip.meetingNotes ? (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-2xl mb-4 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                        <Unlock className="w-3.5 h-3.5" />
                        Private Companion Notes
                      </div>
                      <p className="text-white/80 italic">{trip.meetingNotes}</p>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-white/5 border border-white/5 rounded-2xl mb-4 text-[11px] text-white/50 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                      <span>Meeting point & itinerary coordinates unlock upon organizer acceptance.</span>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Organizer + Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  {/* Organizer info */}
                  <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => org && onNavigateToUserProfile && onNavigateToUserProfile(org.userId)}
                  >
                    <img
                      src={org?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(org?.displayName || 'Organizer')}&background=0047BA&color=fff`}
                      alt={org?.displayName}
                      className="w-9 h-9 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[120px]">{org?.displayName || 'Organizer'}</p>
                      <p className="text-[10px] text-white/50">Trip Organizer</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {canManage ? (
                      <button
                        onClick={() => openManageRequests(trip)}
                        className="px-4 py-2 bg-[#0047BA] hover:bg-[#0759B8] text-white text-xs font-bold rounded-xl shadow transition-transform active:scale-95"
                      >
                        Manage Requests
                      </button>
                    ) : trip.isApproved ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Approved
                        </span>
                        <button
                          onClick={() => handleLeaveTrip(trip.id)}
                          className="text-[11px] text-red-400/80 hover:text-red-400 p-1.5"
                          title="Leave Trip"
                        >
                          Leave
                        </button>
                      </div>
                    ) : trip.userRequestStatus === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Requested
                        </span>
                        <button
                          onClick={() => handleWithdrawRequest(trip)}
                          className="text-[11px] text-white/50 hover:text-white underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : isFull ? (
                      <span className="px-3 py-1.5 bg-white/5 text-white/40 border border-white/10 text-xs font-semibold rounded-xl">
                        Trip Full
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenJoinModal(trip)}
                        className="px-4 py-2 bg-[#17BEBB] hover:bg-[#15a8a5] text-[#071A33] text-xs font-bold rounded-xl shadow-lg transition-transform active:scale-95"
                      >
                        Request to Join
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* JOIN REQUEST MODAL */}
      {joiningTrip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#17BEBB]" />
                Request to Join Trip
              </h3>
              <button
                onClick={() => setJoiningTrip(null)}
                className="text-white/50 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl mb-4 text-xs text-white/70 space-y-1">
              <p><strong>Destination:</strong> {joiningTrip.destination}</p>
              <p><strong>Organizer:</strong> {joiningTrip.organizer.displayName}</p>
              <p><strong>Departure:</strong> {new Date(joiningTrip.startDate).toLocaleDateString()}</p>
            </div>

            <form onSubmit={handleSubmitJoin}>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Brief Introduction <span className="text-red-400">*</span>
              </label>
              <textarea
                value={joinIntro}
                onChange={(e) => setJoinIntro(e.target.value)}
                placeholder="Share your travel experience, preferred pace, and why you'd like to join..."
                rows={4}
                required
                maxLength={500}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#17BEBB] mb-4"
              />

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4 text-[11px] text-amber-200/80 leading-relaxed flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  The organizer must approve your request before you are added. Overbooking is strictly prevented by the server.
                </span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setJoiningTrip(null)}
                  className="px-4 py-2 text-sm rounded-xl text-white/70 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!joinIntro.trim() || isSubmittingJoin}
                  className="px-5 py-2 text-sm rounded-xl bg-[#0047BA] hover:bg-[#0759B8] disabled:opacity-40 text-white font-bold shadow-lg"
                >
                  {isSubmittingJoin ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORGANIZER MANAGEMENT MODAL */}
      {managingTrip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Manage Join Requests</h3>
                <p className="text-xs text-white/50">{managingTrip.title}</p>
              </div>
              <button
                onClick={() => setManagingTrip(null)}
                className="text-white/50 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingRequests ? (
              <div className="py-8 text-center text-white/50 text-xs">Loading applicant requests...</div>
            ) : tripRequests.length === 0 ? (
              <div className="py-8 text-center text-white/40 text-xs">No join requests received yet.</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {tripRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 bg-white/5 border border-white/10 rounded-2xl flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={req.applicant?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.applicant?.displayName || 'Traveler')}&background=0047BA&color=fff`}
                          alt={req.applicant?.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-white/20"
                        />
                        <div>
                          <p className="text-xs font-bold text-white">{req.applicant?.displayName}</p>
                          <p className="text-[10px] text-white/40">@{req.applicant?.username}</p>
                        </div>
                      </div>
                      <span className="text-[10px] capitalize px-2 py-0.5 rounded-full bg-white/5 text-white/70">
                        {req.status}
                      </span>
                    </div>

                    <p className="text-xs text-white/80 bg-black/20 p-2.5 rounded-xl italic">
                      "{req.introduction}"
                    </p>

                    {req.status === 'pending' && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleRespondRequest(req.id, 'decline')}
                          className="px-3 py-1 text-xs rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 font-semibold"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleRespondRequest(req.id, 'accept')}
                          className="px-3 py-1 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          Accept Member
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE TRIP MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A1628] border border-white/15 rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#17BEBB]" />
                Plan a Companion Trip
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-white/50 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTripSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-white/80 mb-1">Trip Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Day Photography & Beach Retreat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">Destination *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cox's Bazar & Saint Martin, Bangladesh"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Departure Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Return Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    min={startDate || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Min Budget</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Max Budget</label>
                  <input
                    type="number"
                    placeholder="40000"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                  >
                    <option value="BDT" className="bg-[#0A1628]">BDT (৳)</option>
                    <option value="USD" className="bg-[#0A1628]">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Travel Style</label>
                  <select
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                  >
                    {AVAILABLE_TRAVEL_STYLES.map((s) => (
                      <option key={s} value={s} className="bg-[#0A1628]">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Max Travelers (including you)</label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={maxTravelers}
                    onChange={(e) => setMaxTravelers(parseInt(e.target.value) || 4)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#17BEBB]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">Trip Overview & Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the planned day-by-day stops, transportation style, and expectations..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#17BEBB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1 flex items-center justify-between">
                  <span>Private Meeting Notes & Coordinates (Confidential)</span>
                  <span className="text-[#17BEBB] text-[10px]">Only visible to approved travelers</span>
                </label>
                <textarea
                  rows={2}
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="e.g. Meeting at Hazrat Shahjalal Airport Terminal 1, departure lounge near Gate 4."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#17BEBB]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-white/70 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTrip}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#0047BA] to-[#0759B8] text-white font-bold shadow-lg"
                >
                  {isSubmittingTrip ? 'Publishing...' : 'Publish Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

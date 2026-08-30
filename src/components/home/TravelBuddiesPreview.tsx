import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Users, Calendar, MapPin, ArrowRight, ShieldCheck, Plus, Sparkles } from 'lucide-react';
import { fetchBuddyProfiles } from '../../lib/travelBuddyQueries';
import { TravelBuddyProfile } from '../../types';

interface TravelBuddiesPreviewProps {
  onNavigateToBuddies?: () => void;
}

export const TravelBuddiesPreview: React.FC<TravelBuddiesPreviewProps> = ({
  onNavigateToBuddies,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [buddies, setBuddies] = useState<TravelBuddyProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetchBuddyProfiles()
      .then((data) => {
        if (isMounted) {
          setBuddies(data.slice(0, 4));
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setBuddies([]);
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const formatDates = (start?: string, end?: string) => {
    if (start && end) {
      const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${s} – ${e}`;
    }
    if (start) {
      return `From ${new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return 'Flexible Dates';
  };

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#086788]">
            <Users className="w-3.5 h-3.5 text-[#17BEBB]" />
            <span>Community Travel Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-normal text-[#073B4C] tracking-tight font-serif-display">
            Find Compatible Travel Buddies
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-inter">
            Connect with verified Bangladeshi travelers heading to the same destinations on overlapping dates.
          </p>
        </div>

        {onNavigateToBuddies && (
          <button
            onClick={onNavigateToBuddies}
            type="button"
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#EAF7F8] text-[#073B4C] hover:bg-[#17BEBB]/20 hover:text-[#073B4C] font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-2 self-start sm:self-auto border border-[#17BEBB]/30"
          >
            <span>Explore Travel Buddies Hub</span>
            <ArrowRight className="w-4 h-4 text-[#FF6B5A]" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-x-visible no-scrollbar pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-w-[260px] xs:min-w-[280px] sm:min-w-0 w-[78vw] max-w-[320px] sm:w-full snap-start shrink-0 sm:shrink p-5 rounded-2xl bg-white border border-slate-200/80 animate-pulse h-48"
            />
          ))}
        </div>
      ) : buddies.length > 0 ? (
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-x-visible no-scrollbar pb-3 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none">
          {buddies.map((buddy, idx) => (
            <motion.div
              key={buddy.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.25,
                delay: shouldReduceMotion ? 0 : idx * 0.05,
                ease: 'easeOut',
              }}
              whileHover={shouldReduceMotion ? undefined : { y: -3 }}
              className="min-w-[260px] xs:min-w-[280px] sm:min-w-0 w-[78vw] max-w-[320px] sm:w-full snap-start shrink-0 sm:shrink p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between gap-4 relative"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    buddy.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={buddy.displayName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#17BEBB]/30"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#073B4C] truncate font-inter">
                    {buddy.displayName}
                  </h3>
                  <span className="text-[10px] text-[#086788] font-semibold bg-[#EAF7F8] px-2 py-0.5 rounded-full inline-block mt-0.5">
                    Verified Traveler
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#17BEBB] shrink-0" />
                  <span className="truncate font-medium font-inter">
                    {buddy.destinations?.join(', ') || buddy.homeLocation}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#086788] shrink-0" />
                  <span className="font-medium text-slate-700 font-inter">
                    {formatDates(buddy.travelStart, buddy.travelEnd)}
                  </span>
                </div>
                {buddy.bio && (
                  <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2 font-inter">
                    "{buddy.bio}"
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onNavigateToBuddies}
                className="w-full py-2 rounded-xl bg-[#073B4C] hover:bg-[#086788] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px]"
              >
                <span>View Profile & Connect</span>
                <ArrowRight className="w-3 h-3 text-[#17BEBB]" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-purple-50/70 via-white to-sky-50/70 border border-purple-100 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div className="max-w-lg space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">
              No Travel Buddy Profiles Published Yet
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Planning a trip to Bangkok, Dubai, Kuala Lumpur, or the Maldives? Create your verified traveler profile and match with fellow Bangladeshi globetrotters heading your way.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onNavigateToBuddies && (
              <button
                type="button"
                onClick={onNavigateToBuddies}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your Travel Profile</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span>Strict privacy controls: Your exact contact number is never shared without your mutual acceptance.</span>
        </div>
        {onNavigateToBuddies && (
          <button
            type="button"
            onClick={onNavigateToBuddies}
            className="text-purple-700 font-bold hover:underline shrink-0 cursor-pointer"
          >
            Post Your Travel Plan →
          </button>
        )}
      </div>
    </section>
  );
};

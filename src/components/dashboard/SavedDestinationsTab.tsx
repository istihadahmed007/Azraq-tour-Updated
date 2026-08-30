import React from 'react';
import { Destination } from '../../types';
import {
  Heart,
  MapPin,
  Trash2,
  ExternalLink,
  Compass,
  Sparkles,
  ArrowRight,
  Globe,
} from 'lucide-react';

interface SavedDestinationsTabProps {
  savedDestinations: Destination[];
  onSelectDestination?: (dest: Destination) => void;
  onRemoveSavedDestination: (id: string) => void;
  onNavigateToDestinations?: () => void;
}

export const SavedDestinationsTab: React.FC<SavedDestinationsTabProps> = ({
  savedDestinations,
  onSelectDestination,
  onRemoveSavedDestination,
  onNavigateToDestinations,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0a192f] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
            <Heart className="w-3.5 h-3.5 fill-emerald-300" />
            <span>Travel Wishlist</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-white">
            Saved Destinations ({savedDestinations.length})
          </h2>
          <p className="text-xs text-sky-200/80 max-w-xl">
            Countries and holiday spots you’ve bookmarked to explore, compare flight routes, or generate multi-day AI itineraries.
          </p>
        </div>

        {onNavigateToDestinations && (
          <button
            type="button"
            onClick={onNavigateToDestinations}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
          >
            <Compass className="w-4 h-4" />
            <span>Discover More Spots</span>
          </button>
        )}
      </div>

      {/* Content */}
      {savedDestinations.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 bg-slate-900/80 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white font-serif-display">Your wishlist is empty</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Explore our curated destinations across Southeast Asia, the Middle East, Europe, and Bangladesh, and click the heart icon to save your favorite getaways.
            </p>
          </div>

          {onNavigateToDestinations && (
            <button
              type="button"
              onClick={onNavigateToDestinations}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg cursor-pointer min-h-[44px]"
            >
              <Globe className="w-4 h-4" />
              <span>Explore 50+ Destinations</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedDestinations.map((dest) => (
            <div
              key={dest.id}
              className="glass-card rounded-3xl border border-white/15 bg-slate-900/90 shadow-xl overflow-hidden hover:border-emerald-400/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                  <img
                    src={dest.imageUrl || dest.thumbnailUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-400/30">
                    {dest.country}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveSavedDestination(dest.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 hover:bg-rose-500/80 text-rose-400 hover:text-white transition-colors cursor-pointer"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <h4 className="text-base font-bold text-white font-serif-display group-hover:text-emerald-300 transition-colors">
                    {dest.name}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/70 border-t border-white/10 flex items-center justify-between">
                {dest.bestTimeToVisit && (
                  <span className="text-[11px] text-slate-400">
                    Best: <strong className="text-slate-200">{dest.bestTimeToVisit}</strong>
                  </span>
                )}

                {onSelectDestination && (
                  <button
                    type="button"
                    onClick={() => onSelectDestination(dest)}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Guide</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

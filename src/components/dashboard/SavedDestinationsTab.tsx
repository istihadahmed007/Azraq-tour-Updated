import React from 'react';
import { Destination } from '../../types';
import {
  Heart,
  Trash2,
  ExternalLink,
  Compass,
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
      <div className="rounded-2xl p-6 sm:p-8 border border-white/12 bg-[#0F2339]/95 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/40">
            <Heart className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Travel Wishlist</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Saved Destinations ({savedDestinations.length})
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-xl">
            Countries and holiday spots you’ve bookmarked to explore, compare flight routes, or generate multi-day AI itineraries.
          </p>
        </div>

        {onNavigateToDestinations && (
          <button
            type="button"
            onClick={onNavigateToDestinations}
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
          >
            <Compass className="w-4 h-4" />
            <span>Discover More Spots</span>
          </button>
        )}
      </div>

      {/* Content */}
      {savedDestinations.length === 0 ? (
        <div className="rounded-2xl p-10 sm:p-12 text-center border border-white/10 bg-[#0F2339]/80 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/15 text-[#2DD4BF] flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-white">Your wishlist is empty</h3>
            <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
              Explore our curated destinations across Southeast Asia, the Middle East, Europe, and Bangladesh, and save your favorite holiday spots.
            </p>
          </div>

          {onNavigateToDestinations && (
            <button
              type="button"
              onClick={onNavigateToDestinations}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer min-h-[44px]"
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
              className="rounded-2xl border border-white/10 bg-[#0F2339]/90 shadow-md overflow-hidden hover:border-[#2563EB]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 w-full relative overflow-hidden bg-[#071426]">
                  <img
                    src={dest.imageUrl || dest.thumbnailUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071426] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#071426]/90 backdrop-blur-xs text-[#2DD4BF] border border-white/15">
                    {dest.country}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveSavedDestination(dest.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#071426]/80 hover:bg-rose-500/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove from wishlist"
                    aria-label="Remove destination"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <h4 className="text-base font-bold text-white group-hover:text-sky-200 transition-colors">
                    {dest.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#CBD5E1] line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#071426]/70 border-t border-white/10 flex items-center justify-between">
                {dest.bestTimeToVisit && (
                  <span className="text-xs text-[#CBD5E1]">
                    Best: <strong className="text-white">{dest.bestTimeToVisit}</strong>
                  </span>
                )}

                {onSelectDestination && (
                  <button
                    type="button"
                    onClick={() => onSelectDestination(dest)}
                    className="px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
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

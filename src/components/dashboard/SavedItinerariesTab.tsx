import React from 'react';
import { Itinerary } from '../../types';
import {
  Calendar,
  Compass,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
} from 'lucide-react';

interface SavedItinerariesTabProps {
  savedItineraries: Itinerary[];
  onSelectItinerary: (itinerary: Itinerary) => void;
  onRemoveItinerary: (id: string) => void;
  onNavigateToPlanner?: () => void;
}

export const SavedItinerariesTab: React.FC<SavedItinerariesTabProps> = ({
  savedItineraries,
  onSelectItinerary,
  onRemoveItinerary,
  onNavigateToPlanner,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="rounded-2xl p-6 sm:p-8 border border-white/12 bg-[#0F2339]/95 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#2563EB]/20 text-sky-200 border border-[#2563EB]/40">
            <Compass className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>AI Trip Planner Vault</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Saved Custom Itineraries ({savedItineraries.length})
          </h2>
          <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-xl">
            Custom day-by-day travel plans created with our AI Planner or personalized with our travel specialists.
          </p>
        </div>

        {onNavigateToPlanner && (
          <button
            type="button"
            onClick={onNavigateToPlanner}
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#2DD4BF]"
          >
            <Compass className="w-4 h-4" />
            <span>Create New Itinerary</span>
          </button>
        )}
      </div>

      {/* Content */}
      {savedItineraries.length === 0 ? (
        <div className="rounded-2xl p-10 sm:p-12 text-center border border-white/10 bg-[#0F2339]/80 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center mx-auto shadow-inner">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base sm:text-lg font-bold text-white">No saved itineraries yet</h3>
            <p className="text-xs sm:text-sm text-[#CBD5E1] max-w-md mx-auto leading-relaxed">
              Use our AI Itinerary Planner to craft a personalized day-by-day schedule with estimated costs in BDT, local activities, and flight connections.
            </p>
          </div>

          {onNavigateToPlanner && (
            <button
              type="button"
              onClick={onNavigateToPlanner}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer min-h-[44px]"
            >
              <Compass className="w-4 h-4" />
              <span>Launch AI Itinerary Planner</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItineraries.map((itinerary) => {
            const daysCount = itinerary.days?.length || 0;
            const activitiesCount =
              itinerary.days?.reduce((acc, d) => acc + (d.activities?.length || 0), 0) || 0;

            return (
              <div
                key={itinerary.id}
                className="rounded-2xl border border-white/10 bg-[#0F2339]/90 shadow-md overflow-hidden hover:border-[#2563EB]/50 transition-all flex flex-col justify-between group"
              >
                <div className="p-6 space-y-4">
                  {/* Top Metadata */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-400/30 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{itinerary.destination}</span>
                      </span>
                      <h4 className="text-base font-bold text-white group-hover:text-sky-200 transition-colors">
                        {itinerary.title || `${daysCount}-Day ${itinerary.destination} Journey`}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItinerary(itinerary.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-[#CBD5E1] hover:text-rose-300 transition-colors cursor-pointer"
                      title="Remove saved itinerary"
                      aria-label="Remove saved itinerary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary */}
                  {itinerary.overview && (
                    <p className="text-xs sm:text-sm text-[#CBD5E1] line-clamp-3 leading-relaxed">
                      {itinerary.overview}
                    </p>
                  )}

                  {/* Stat badges */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                    <div className="p-2 rounded-lg bg-[#071426]/70 border border-white/5 text-xs flex items-center gap-1.5 text-[#CBD5E1]">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <span>
                        <strong className="text-white">{daysCount}</strong> Days
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-[#071426]/70 border border-white/5 text-xs flex items-center gap-1.5 text-[#CBD5E1]">
                      <Compass className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      <span>
                        <strong className="text-white">{activitiesCount}</strong> Activities
                      </span>
                    </div>
                  </div>

                  {/* Budget preview if present */}
                  {itinerary.budget && (
                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs flex items-center justify-between text-[#2DD4BF]">
                      <span className="font-semibold flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Estimated Budget:</span>
                      </span>
                      <span className="font-bold">{itinerary.budget}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-[#071426]/70 border-t border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectItinerary(itinerary)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[40px]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in AI Planner</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

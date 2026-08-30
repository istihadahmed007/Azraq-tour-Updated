import React from 'react';
import { Itinerary, Destination } from '../../types';
import {
  Calendar,
  Sparkles,
  Trash2,
  ExternalLink,
  MapPin,
  Clock,
  Compass,
  DollarSign,
  ArrowRight,
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
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-gradient-to-r from-slate-900 via-slate-900 to-[#0a192f] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Trip Planner Vault</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif-display font-bold text-white">
            Saved Custom Itineraries ({savedItineraries.length})
          </h2>
          <p className="text-xs text-sky-200/80 max-w-xl">
            Bespoke day-by-day travel plans created with our AI Planner or customized with our travel specialists.
          </p>
        </div>

        {onNavigateToPlanner && (
          <button
            type="button"
            onClick={onNavigateToPlanner}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 min-h-[44px]"
          >
            <Compass className="w-4 h-4" />
            <span>Create New Itinerary</span>
          </button>
        )}
      </div>

      {/* Content */}
      {savedItineraries.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 bg-slate-900/80 space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-amber-400/10 border border-amber-400/20 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white font-serif-display">No saved itineraries yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Use our AI Itinerary Planner to craft a personalized day-by-day schedule with estimated costs in BDT, local activities, and flight connections.
            </p>
          </div>

          {onNavigateToPlanner && (
            <button
              type="button"
              onClick={onNavigateToPlanner}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-lg cursor-pointer min-h-[44px]"
            >
              <Sparkles className="w-4 h-4" />
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
                className="glass-card rounded-3xl border border-white/15 bg-slate-900/90 shadow-xl overflow-hidden hover:border-amber-400/40 transition-all flex flex-col justify-between group"
              >
                <div className="p-6 space-y-4">
                  {/* Top Metadata */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30 inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{itinerary.destination}</span>
                      </span>
                      <h4 className="text-base font-bold text-white font-serif-display group-hover:text-amber-300 transition-colors">
                        {itinerary.title || `${daysCount}-Day ${itinerary.destination} Journey`}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItinerary(itinerary.id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                      title="Remove saved itinerary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Summary */}
                  {itinerary.overview && (
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {itinerary.overview}
                    </p>
                  )}

                  {/* Metrics Badge Row */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-slate-300 font-medium">
                        <strong className="text-white">{daysCount}</strong> Days
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300 font-medium">
                        <strong className="text-white">{activitiesCount}</strong> Activities
                      </span>
                    </div>
                  </div>

                  {/* Budget preview if present */}
                  {itinerary.budget && (
                    <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-xs flex items-center justify-between text-amber-300">
                      <span className="font-semibold flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Estimated Budget:</span>
                      </span>
                      <span className="font-bold">{itinerary.budget}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-950/70 border-t border-white/10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectItinerary(itinerary)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md min-h-[40px]"
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

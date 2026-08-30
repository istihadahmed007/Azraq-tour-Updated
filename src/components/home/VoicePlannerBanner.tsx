import React from 'react';
import { Mic, ArrowRight, Sparkles } from 'lucide-react';

interface VoicePlannerBannerProps {
  onOpenVoiceModal: (initialTranscript?: string) => void;
  onNavigateToPlanner?: () => void;
}

export const VoicePlannerBanner: React.FC<VoicePlannerBannerProps> = ({
  onOpenVoiceModal,
  onNavigateToPlanner,
}) => {
  const samplePrompts = [
    '5-day family escape in Bangkok & Phuket',
    '7-day Maldives overwater luxury honeymoon',
    '4-day Dubai shopping & Burj Khalifa getaway',
  ];

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#073B4C] via-[#086788] to-[#073B4C] text-white p-6 sm:p-8 shadow-xl border border-[#17BEBB]/20">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 bg-[#17BEBB]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#17BEBB]/20 text-[#EAF7F8] border border-[#17BEBB]/30 text-xs font-bold tracking-wide uppercase font-mono">
              <Mic className="w-3.5 h-3.5 text-[#17BEBB] animate-pulse" />
              <span>Voice AI Trip Planner</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-white leading-tight font-serif-display">
              Plan your holiday simply by speaking
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal font-inter">
              Speak your dream destination, travel dates, party size, and travel style. Our voice engine parses your preferences and crafts a custom day-by-day plan instantly.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-[#EAF7F8] font-inter">Try speaking:</span>
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onOpenVoiceModal(sample)}
                  className="min-h-[32px] px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[#EAF7F8] border border-white/15 text-xs font-medium transition-colors cursor-pointer"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          <div className="shrink-0 w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenVoiceModal()}
              className="btn-coral-primary !min-h-[48px] !px-6 !py-3 !text-sm !rounded-2xl"
            >
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Mic className="w-3.5 h-3.5 text-white" />
              </div>
              <span>Start Speaking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

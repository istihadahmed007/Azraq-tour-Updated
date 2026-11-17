import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Send } from 'lucide-react';
import { AzraqTripFinder, FlightSearchParams } from '../AzraqTripFinder';
import { TourPackage } from '../../types';

interface HomeHeroProps {
  onSearchFlights: (params: FlightSearchParams) => void;
  onNavigateToView?: (view: string, extra?: any) => void;
  onPlanTripPrompt: (promptText: any) => void;
  onOpenVisaModal?: (country?: string) => void;
  onOpenQuote?: (pkg?: TourPackage) => void;
  onOpenVoiceModal?: (initialTranscript?: string) => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onSearchFlights,
  onNavigateToView,
  onPlanTripPrompt,
  onOpenVisaModal,
  onOpenQuote,
  onOpenVoiceModal,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative w-full text-[#263B55] pt-8 sm:pt-12 pb-12 sm:pb-16 bg-transparent">
      {/* Light Atmospheric Aircraft Background - Ice-Blue Soft Blended Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2560&q=85"
          alt="Commercial aircraft soaring through clear blue sky and clouds"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out opacity-25"
        />
        {/* Soft ice-blue gradient for luminous readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#DCEAF3]/95 via-[#EAF2F8]/85 to-[#DCEAF3]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Centered Brand Promise Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center space-y-3.5"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F0F8] border border-white/80 shadow-[2px_2px_6px_rgba(166,185,204,0.3),-2px_-2px_6px_rgba(255,255,255,0.85)] text-xs font-semibold text-[#263B55]">
            <span className="w-2 h-2 rounded-full bg-[#73A9D2]" />
            <span className="tracking-widest uppercase font-mono text-[10px] text-[#63778D]">
              AZRAQ TRIPS · DHAKA, BANGLADESH
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[-0.035em] text-[#263B55] leading-[1.06] font-manrope">
            Search smarter. <br className="hidden sm:inline" />
            <span className="text-[#73A9D2]">Fly better.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#63778D] font-normal max-w-2xl mx-auto leading-relaxed font-manrope">
            Compare live direct airfares from Dhaka and verified partner routes across Asia with transparent BDT pricing.
          </p>

          {/* Authentic Agency Features (Real Value Pillars) */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 pt-1 text-xs text-[#263B55] font-semibold">
            <span className="inline-flex items-center gap-1.5 bg-[#E7F0F8] px-3.5 py-1.5 rounded-full border border-white/80 shadow-[2px_2px_6px_rgba(166,185,204,0.25),-2px_-2px_6px_rgba(255,255,255,0.8)]">
              ✈️ Direct Flights from Dhaka (DAC)
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#E7F0F8] px-3.5 py-1.5 rounded-full border border-white/80 shadow-[2px_2px_6px_rgba(166,185,204,0.25),-2px_-2px_6px_rgba(255,255,255,0.8)]">
              🛂 Verified Embassy Visa Guidance
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#E7F0F8] px-3.5 py-1.5 rounded-full border border-white/80 shadow-[2px_2px_6px_rgba(166,185,204,0.25),-2px_-2px_6px_rgba(255,255,255,0.8)]">
              🌴 Curated Asian Holiday Packages
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#E7F0F8] px-3.5 py-1.5 rounded-full border border-white/80 shadow-[2px_2px_6px_rgba(166,185,204,0.25),-2px_-2px_6px_rgba(255,255,255,0.8)]">
              ✨ Custom AI Itineraries
            </span>
          </div>
        </motion.div>

        {/* 5-Mode Travel Search & Conversion Engine (Floating Panel) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: shouldReduceMotion ? 0 : 0.08, ease: 'easeOut' }}
          className="w-full pt-2"
        >
          <AzraqTripFinder
            initialMode="flights"
            onSearchFlights={onSearchFlights}
            onNavigateToView={(view, extra) => {
              if (extra?.prompt) onPlanTripPrompt(extra.prompt);
              else if (onNavigateToView) onNavigateToView(view);
            }}
            onOpenVisaModal={onOpenVisaModal}
            onOpenQuoteModal={onOpenQuote ? () => onOpenQuote() : undefined}
            onOpenVoiceModal={onOpenVoiceModal}
          />
        </motion.div>
      </div>
    </section>
  );
};

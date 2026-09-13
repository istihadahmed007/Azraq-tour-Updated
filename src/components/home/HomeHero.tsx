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
    <section className="relative w-full text-white pt-10 sm:pt-16 pb-16 sm:pb-24 overflow-hidden bg-[#071A33]">
      {/* Cinematic Destination Scenery Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=2560&q=90"
          alt="Tropical emerald bay and limestone cliffs in Thailand"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Subtle cinematic gradient vignette for crisp typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#071A33]/70 via-[#071A33]/45 to-[#071A33]/85" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Brand Promise Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="max-w-3xl text-left space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#17BEBB]" />
            <span className="tracking-widest uppercase font-mono text-[10px] text-slate-200">
              AZRAQ TRIPS · DHAKA, BANGLADESH
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight text-white leading-[1.08] font-serif-display drop-shadow-md">
            Travel farther. <br className="hidden sm:inline" />
            <span className="italic text-[#17BEBB]">Plan better.</span> Experience more.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-100 font-light max-w-2xl leading-relaxed drop-shadow-xs font-sans">
            Plan your next journey with low-fare flights from Dhaka, verified tourist visa assistance, curated Asian holiday packages, and personalized itineraries—all in one place.
          </p>

          {/* Authentic Agency Features (Real Value Pillars) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1 text-xs text-white/90 font-medium">
            <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              ✈️ Direct Flights from Dhaka (DAC)
            </span>
            <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              🛂 Verified Embassy Visa Guidance
            </span>
            <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
              🌴 Curated Asian Holiday Packages
            </span>
            <span className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15">
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

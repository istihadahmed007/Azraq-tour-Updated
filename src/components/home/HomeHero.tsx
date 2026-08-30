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
    <section className="relative w-full text-white pt-8 sm:pt-14 pb-14 sm:pb-20 shadow-lg overflow-hidden bg-slate-950">
      {/* Wonderful Natural Landscape Background - Thailand Phang Nga Bay & Longtail Boat Scenery */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=2560&q=90"
          alt="Thailand James Bond Island and longtail boat in crystal turquoise bay"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-100"
        />
        {/* Soft, minimal dark gradient strictly for white typography contrast, keeping the natural scenery 100% vibrant */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/60" />
      </div>

      {/* Decorative Paper-Airplane Flight Paths */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40 z-1">
        {/* Subtle curved flight path vector */}
        <svg
          className="absolute -top-10 -right-20 w-[600px] h-[400px] text-white"
          viewBox="0 0 600 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 10 350 Q 250 50 580 120"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="8 8"
          />
        </svg>
        <div className="absolute top-20 right-28 animate-float">
          <Send className="w-8 h-8 text-white transform -rotate-12 drop-shadow-lg" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Brand Promise Header */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="max-w-3xl text-left space-y-3.5"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#073B4C]/80 backdrop-blur-md border border-[#17BEBB]/30 text-xs font-semibold text-white shadow-md">
            <Send className="w-3.5 h-3.5 text-[#17BEBB] transform -rotate-45" />
            <span className="tracking-wide uppercase font-mono text-[11px] text-[#EAF7F8]">
              AZRAQ TRIPS · Bangladesh's Premier OTA
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-white leading-[1.12] font-serif-display drop-shadow-md">
            Travel farther. <span className="text-[#17BEBB]">Experience more.</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-100 font-normal max-w-2xl leading-relaxed drop-shadow-sm font-inter">
            Discover the world with Azraq Trips. Compare lowest airfares from Dhaka, book verified luxury hotels, unlock all-inclusive Asian holiday packages, secure fast-track visa processing, and generate personalized AI travel itineraries.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-white/90 font-medium">
            <span className="inline-flex items-center gap-1.5 bg-[#073B4C]/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
              ✈️ 500+ Partner Airlines
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#073B4C]/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
              🏨 Verified 4★ & 5★ Stays
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#073B4C]/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
              🛂 99.2% Visa Success Rate
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#073B4C]/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/20">
              ✨ Gemini AI Trip Engine
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

import React from 'react';
import { Plane, Sparkles, ShieldCheck } from 'lucide-react';

interface FlightLoadingAnimationProps {
  originCode?: string;
  originCity?: string;
  destCode?: string;
  destCity?: string;
  className?: string;
}

export const FlightLoadingAnimation: React.FC<FlightLoadingAnimationProps> = ({
  originCode = 'DAC',
  originCity = 'Dhaka',
  destCode = 'BKK',
  destCity = 'Bangkok',
  className = '',
}) => {
  return (
    <div className={`w-full py-12 px-4 flex flex-col items-center justify-center space-y-6 ${className}`}>
      {/* Aviation flight path animation */}
      <div className="relative w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-lg text-center overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-blue-50/50 pointer-events-none" />

        {/* Airport nodes & Route Line */}
        <div className="relative flex items-center justify-between px-4 sm:px-6 my-4">
          {/* Origin Node */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-[#0B1F3A] text-white flex items-center justify-center font-bold text-xs shadow-md">
              {originCode}
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-2">{originCity}</span>
          </div>

          {/* Animated Route Line */}
          <div className="flex-1 relative mx-4 h-1 bg-slate-200 rounded-full overflow-hidden">
            {/* Pulsing travel beam */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1677FF] to-transparent animate-pulse" />
            <div
              className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-[#1677FF] to-transparent"
              style={{
                animation: 'routeFlightSweep 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              }}
            />
          </div>

          {/* Destination Node */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-[#1677FF] text-white flex items-center justify-center font-bold text-xs shadow-md">
              {destCode}
            </div>
            <span className="text-xs font-semibold text-slate-700 mt-2">{destCity}</span>
          </div>
        </div>

        {/* Flying Airplane icon in center */}
        <div className="flex items-center justify-center gap-2 text-slate-800 font-bold text-base mt-4">
          <Plane className="w-5 h-5 text-[#1677FF] animate-bounce" />
          <span>Searching flights…</span>
        </div>

        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
          Comparing real-time airline tariffs, live inventory, and verified baggage allowances for best rates.
        </p>

        {/* Trust pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold mt-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>No hidden fees · Guaranteed BDT fares</span>
        </div>
      </div>

      {/* Skeletons preview */}
      <div className="w-full max-w-4xl space-y-4 pt-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Airline logo and route info placeholder */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="w-32 h-4 bg-slate-200 rounded-md" />
                  <div className="w-48 h-3 bg-slate-100 rounded-md" />
                </div>
              </div>

              {/* Time and Journey placeholder */}
              <div className="flex items-center gap-6 md:gap-10">
                <div className="space-y-1.5 text-center">
                  <div className="w-14 h-5 bg-slate-200 rounded-md mx-auto" />
                  <div className="w-10 h-3 bg-slate-100 rounded-md mx-auto" />
                </div>
                <div className="w-24 sm:w-32 h-1 bg-slate-200 rounded-full" />
                <div className="space-y-1.5 text-center">
                  <div className="w-14 h-5 bg-slate-200 rounded-md mx-auto" />
                  <div className="w-10 h-3 bg-slate-100 rounded-md mx-auto" />
                </div>
              </div>

              {/* Price and CTA placeholder */}
              <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <div className="w-24 h-6 bg-slate-200 rounded-md" />
                <div className="w-28 h-9 bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { SEOHead } from './SEOHead';
import { Compass, Home, Search, Plane, ShieldCheck, ArrowRight } from 'lucide-react';
import { SITE_URL } from '../lib/seo';

interface NotFoundViewProps {
  onNavigateToView: (view: string) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigateToView }) => {
  return (
    <div className="w-full bg-[#F8FAFC] min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Page Not Found (404) – AzraqTrips"
        description="The page you are looking for does not exist or has been moved. Discover top destinations, travel guides, and flight searches on AzraqTrips."
        canonical={`${SITE_URL}/404`}
        noindex={true}
      />

      <div className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0D6EFD] flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <span className="text-xs font-extrabold uppercase tracking-widest text-[#0D6EFD]">404 Error</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
          Looks like you've wandered off the map!
        </h1>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          The destination or page you are looking for might have been moved or doesn't exist. Let's get you back on track for your next trip.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => onNavigateToView('discover')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#1389E8] to-[#0759B8] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToView('guides')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <span>Browse Travel Guides</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Navigation Links */}
        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => onNavigateToView('destinations')}
            className="p-2.5 rounded-xl hover:bg-slate-50 hover:text-[#0D6EFD] transition-colors cursor-pointer"
          >
            Top Destinations
          </button>
          <button
            type="button"
            onClick={() => onNavigateToView('flights')}
            className="p-2.5 rounded-xl hover:bg-slate-50 hover:text-[#0D6EFD] transition-colors cursor-pointer"
          >
            Dhaka Flights
          </button>
          <button
            type="button"
            onClick={() => onNavigateToView('visa')}
            className="p-2.5 rounded-xl hover:bg-slate-50 hover:text-[#0D6EFD] transition-colors cursor-pointer"
          >
            Visa Guides
          </button>
        </div>
      </div>
    </div>
  );
};

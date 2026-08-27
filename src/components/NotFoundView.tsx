import React, { useState } from 'react';
import { SEOHead } from './SEOHead';
import {
  Compass,
  Home,
  Search,
  MapPin,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Luggage,
  MessageCircle,
} from 'lucide-react';
import { SITE_URL } from '../lib/seo';
import { AZRAQ_AGENCY_CONFIG } from '../data/agencyConfig';

interface NotFoundViewProps {
  onNavigateToView: (view: string, extra?: any) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigateToView }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const popularDestinations = [
    { name: 'Bangkok', country: 'Thailand', slug: 'bangkok' },
    { name: 'Kuala Lumpur', country: 'Malaysia', slug: 'kuala-lumpur' },
    { name: 'Bali', country: 'Indonesia', slug: 'bali' },
    { name: 'Singapore', country: 'Singapore', slug: 'singapore' },
    { name: 'Dubai', country: 'UAE', slug: 'dubai' },
    { name: 'Tokyo', country: 'Japan', slug: 'tokyo' },
    { name: "Cox's Bazar", country: 'Bangladesh', slug: 'coxs-bazar' },
    { name: 'Sylhet', country: 'Bangladesh', slug: 'sylhet' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateToView('search', { query: searchQuery.trim() });
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title="Page Not Found (404) – AzraqTrips"
        description="The page you are looking for does not exist or has been moved. Discover top Asian destinations, travel guides, flight searches, and visa requirements on AzraqTrips."
        canonical={`${SITE_URL}/404`}
        noindex={true}
      />

      <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 text-center space-y-6">
        {/* Animated Compass Icon */}
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0D6EFD] flex items-center justify-center mx-auto shadow-inner">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0D6EFD] text-xs font-bold uppercase tracking-wider">
            404 • Destination Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#071A33] tracking-tight">
            Looks like you've wandered off the itinerary!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            The page or route you requested might have been moved or is unavailable. Let us help you find your dream vacation or visa requirements.
          </p>
        </div>

        {/* Quick Search Input */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city, visa, or holiday (e.g. Bangkok, Malaysia)..."
            className="w-full pl-10 pr-24 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-[#0D6EFD] shadow-xs"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-[#0D6EFD] hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => onNavigateToView('discover')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#071A33] hover:bg-[#0D6EFD] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-97"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToView('guides')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0D6EFD] font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Browse Travel Guides</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToView('ai-planner')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-900" />
            <span>Plan with AI</span>
          </button>
        </div>

        {/* Popular Destinations Quick Jump */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Popular Destinations for Bangladeshi Travelers
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularDestinations.map((dest) => (
              <button
                key={dest.slug}
                type="button"
                onClick={() => onNavigateToView('destination-detail', { slug: dest.slug })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#0D6EFD] border border-slate-200/80 text-xs font-semibold transition-all cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-sky-500" />
                <span>{dest.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Key Service Portals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
          <button
            type="button"
            onClick={() => onNavigateToView('destinations')}
            className="p-3 rounded-xl hover:bg-slate-50 hover:text-[#0D6EFD] transition-colors flex flex-col items-center gap-1 cursor-pointer border border-transparent hover:border-slate-100"
          >
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>All Destinations</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToView('packages')}
            className="p-3 rounded-xl hover:bg-slate-50 hover:text-[#0D6EFD] transition-colors flex flex-col items-center gap-1 cursor-pointer border border-transparent hover:border-slate-100"
          >
            <Luggage className="w-4 h-4 text-emerald-600" />
            <span>Holiday Packages</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToView('visa')}
            className="p-3 rounded-xl hover:bg-slate-50 hover:text-[#0D6EFD] transition-colors flex flex-col items-center gap-1 cursor-pointer border border-transparent hover:border-slate-100"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Visa Requirements</span>
          </button>

          <a
            href={`https://wa.me/${AZRAQ_AGENCY_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              'Hello Azraq Concierge! I need help finding a package or booking assistance.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl hover:bg-slate-50 hover:text-emerald-600 transition-colors flex flex-col items-center gap-1 cursor-pointer border border-transparent hover:border-slate-100"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </div>
  );
};

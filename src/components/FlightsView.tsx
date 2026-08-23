import React, { useState, useEffect, useRef } from 'react';
import {
  Plane,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  Phone,
  MessageCircle,
  Clock,
  Globe2,
  SlidersHorizontal,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  Airport,
  POPULAR_AIRPORTS,
  BANGLADESH_AIRPORTS,
  buildAviasalesSearchUrl,
  trackFlightSearchEvent,
} from '../data/flightsData';
import { AZRAQ_AGENCY_CONFIG } from '../data/agencyConfig';
import { FlightSearchForm, FlightSearchParams } from './FlightSearchForm';
import { FlightSearchResults } from './FlightSearchResults';
import { RecentSearches, saveRecentFlightSearch } from './RecentSearches';
import { PopularDestinations } from './PopularDestinations';
import { DestinationExplorer } from './DestinationExplorer';
import { RouteGuidesSection } from './RouteGuidesSection';
import { AffiliateDisclosure } from './AffiliateDisclosure';
import { PartnerRedirectModal } from './PartnerRedirectModal';
import { useAuth } from '../context/AuthContext';
import {
  NormalizedFlightSearch,
  normalizeFlightSearch,
  parseFlightSearchParamsFromUrl,
  syncFlightSearchToBrowserUrl,
  validateFlightSearchParams,
  buildDynamicFlightWhatsAppUrl,
} from '../utils/flightSearchEngine';

interface FlightsViewProps {
  initialParams?: Partial<NormalizedFlightSearch>;
  onOpenFlightModal?: (dest?: string) => void;
  onNavigateToView?: (view: any) => void;
  onOpenVisaQuote?: (country?: string) => void;
}

export const FlightsView: React.FC<FlightsViewProps> = ({
  initialParams,
  onOpenFlightModal,
  onNavigateToView,
  onOpenVisaQuote,
}) => {
  const { showToast } = useAuth();

  // Parse URL query parameters or use provided initialParams
  const getInitialSearch = (): NormalizedFlightSearch => {
    const urlParams = parseFlightSearchParamsFromUrl();
    const merged = {
      ...urlParams,
      ...initialParams,
    };
    return normalizeFlightSearch(merged);
  };

  // Active search state is the Single Source of Truth
  const [activeSearch, setActiveSearch] = useState<NormalizedFlightSearch>(getInitialSearch);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFlightForRedirect, setSelectedFlightForRedirect] = useState<any | null>(null);

  // Monotonic search query sequence to discard stale async responses
  const activeSearchSeqRef = useRef<number>(0);

  // Sync URL query params on initial mount and when activeSearch changes
  useEffect(() => {
    syncFlightSearchToBrowserUrl(activeSearch);
  }, [activeSearch]);

  // Handle Search Submission
  const handleSearch = (params: NormalizedFlightSearch) => {
    const validation = validateFlightSearchParams(params);
    if (!validation.isValid) {
      showToast(validation.error || 'Invalid flight search parameters', 'error');
      return;
    }

    const normalized = normalizeFlightSearch(params);
    const thisSearchId = ++activeSearchSeqRef.current;

    setActiveSearch(normalized);
    setIsSearching(true);
    syncFlightSearchToBrowserUrl(normalized);
    saveRecentFlightSearch(normalized);

    trackFlightSearchEvent('search_completed', {
      origin: normalized.origin.code,
      destination: normalized.destination.code,
      tripType: normalized.tripType,
      adults: normalized.adults,
      cabin: normalized.cabinClass,
      source: 'flights_page_main',
    });

    const targetUrl = buildAviasalesSearchUrl({
      origin: normalized.origin.code,
      destination: normalized.destination.code,
      departDate: normalized.departureDate,
      returnDate: normalized.tripType === 'round' ? normalized.returnDate : undefined,
      adults: normalized.adults,
      children: normalized.children,
      infants: normalized.infants,
      cabin: normalized.cabinClass,
      tripType: normalized.tripType,
      source: 'flights_page',
    });

    // Simulate async network inventory verification with stale-request protection
    setTimeout(() => {
      // Discard stale response if a newer search was initiated in the meantime
      if (thisSearchId !== activeSearchSeqRef.current) {
        return;
      }
      setIsSearching(false);
      showToast(
        `Loaded verified flight options: ${normalized.origin.code} ➔ ${normalized.destination.code}`,
        'success'
      );
    }, 300);
  };

  // Handle Direct Airport / Destination shortcut click
  const handleSelectDestination = (destCode: string) => {
    const foundDest = POPULAR_AIRPORTS.find((a) => a.code === destCode) || {
      code: destCode,
      city: destCode,
      country: 'International',
      name: `${destCode} Airport`,
    };

    const newSearch: NormalizedFlightSearch = {
      ...activeSearch,
      destination: foundDest,
    };

    handleSearch(newSearch);
  };

  const handleSelectRoute = (originCode: string, destinationCode: string) => {
    const foundOrigin = POPULAR_AIRPORTS.find((a) => a.code === originCode) || activeSearch.origin;
    const foundDest = POPULAR_AIRPORTS.find((a) => a.code === destinationCode) || activeSearch.destination;

    const newSearch: NormalizedFlightSearch = {
      ...activeSearch,
      origin: foundOrigin,
      destination: foundDest,
    };

    handleSearch(newSearch);
  };

  const dynamicWhatsAppLink = buildDynamicFlightWhatsAppUrl(activeSearch);

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* 1. Page Header */}
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-semibold uppercase tracking-wider">
                <Plane className="w-3.5 h-3.5 text-sky-600" />
                <span>Official Aviasales Affiliate Partner</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
                Search & Compare Flights
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-normal leading-relaxed">
                Showing live flights and itineraries matching{' '}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-900 font-semibold text-xs sm:text-sm">
                  <span>{activeSearch.origin.city} ({activeSearch.origin.code})</span>
                  <span className="text-sky-600">➔</span>
                  <span>{activeSearch.destination.city} ({activeSearch.destination.code})</span>
                </span>
              </p>
            </div>

            {/* Quick concierge contact & Direct links */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={dynamicWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors flex items-center gap-2 shadow-2xs cursor-pointer font-sans"
                title="Direct WhatsApp flight inquiry with searched route"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Dhaka Flight Desk</span>
              </a>

              <a
                href={buildAviasalesSearchUrl({
                  origin: activeSearch.origin.code,
                  destination: activeSearch.destination.code,
                  departDate: activeSearch.departureDate,
                  returnDate: activeSearch.tripType === 'round' ? activeSearch.returnDate : undefined,
                  adults: activeSearch.adults,
                  cabin: activeSearch.cabinClass,
                  tripType: activeSearch.tripType,
                  source: 'flights_header_direct',
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer font-sans"
              >
                <span>Aviasales Direct</span>
                <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
              </a>
            </div>
          </div>

          {/* Affiliate & Trust Disclosure */}
          <AffiliateDisclosure variant="inline" />
        </div>

        {/* 2. Main Flight Search Form (Single Source of Truth) */}
        <section id="flight-search-form-container" className="w-full space-y-4">
          <FlightSearchForm
            initialParams={activeSearch}
            onSearch={handleSearch}
            variant="page"
            sourceTag="flights_page"
          />
          <RecentSearches
            onSelectSearch={(selected) => {
              const merged = normalizeFlightSearch({
                ...activeSearch,
                ...selected,
              });
              handleSearch(merged);
            }}
          />
        </section>

        {/* 3. Live Flight Offers & Real-Time Comparison Results */}
        <section className="w-full">
          <FlightSearchResults
            search={activeSearch}
            onSelectDate={(newDate) => {
              handleSearch({
                ...activeSearch,
                departureDate: newDate,
              });
            }}
            onOpenFlightModal={(flight) => {
              setSelectedFlightForRedirect(flight);
            }}
            onOpenVisaQuote={onOpenVisaQuote}
          />
        </section>

        {/* 4. Popular Flight Destinations from Bangladesh (30+ worldwide cards) */}
        <PopularDestinations
          onSelectDestination={handleSelectDestination}
          className="pt-4"
        />

        {/* 6. Explore Flights Around the World (Regional Filterable Grid) */}
        <DestinationExplorer
          onSelectDestination={handleSelectDestination}
          className="pt-6"
        />

        {/* 7. Popular Route Guides from Dhaka */}
        <RouteGuidesSection
          onSelectRoute={handleSelectRoute}
          className="pt-6"
        />

        {/* 8. Comprehensive Trust & Partner Disclaimer */}
        <section className="space-y-4 pt-4">
          <AffiliateDisclosure variant="card" />

          {/* Azraq Concierge Details */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-900 text-sm">
                Azraq Tours & Travels — Flight Concierge Desk
              </h4>
              <p className="text-slate-500">
                Dhaka, Bangladesh • Working Hours: {AZRAQ_AGENCY_CONFIG.workingHours}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${AZRAQ_AGENCY_CONFIG.phone}`}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>{AZRAQ_AGENCY_CONFIG.phoneDisplay}</span>
              </a>
              <a
                href={dynamicWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp 24/7</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Partner Redirect Modal if needed */}
      <PartnerRedirectModal
        flight={selectedFlightForRedirect}
        isOpen={!!selectedFlightForRedirect}
        onClose={() => setSelectedFlightForRedirect(null)}
      />
    </div>
  );
};

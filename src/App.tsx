import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BrandTheme, Destination, Itinerary, NavView, Spot } from './types';
import { INITIAL_DESTINATIONS, INITIAL_KYOTO_ITINERARY } from './data/mockData';
import { findDestinationBySlug } from './data/destinationsData';
import { TRAVEL_GUIDES, TravelGuide } from './data/travelGuidesData';
import { CURATED_ITINERARIES, CuratedItinerary } from './data/itinerariesData';
import {
  VISA_REQUIREMENTS,
  VisaRequirement,
  getVisaRequirement,
  getCanonicalVisaByCountry,
} from './data/visaRequirementsData';

import { AuthProvider } from './context/AuthContext';
import { PackageProvider } from './context/PackageContext';
import { FeedProvider } from './context/FeedContext';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { Navigation } from './components/Navigation';
import { ClientLayout } from './components/ClientLayout';
import { DiscoverView } from './components/DiscoverView';
import { DestinationsView } from './components/DestinationsView';
import { VisaView } from './components/VisaView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { DestinationModal } from './components/DestinationModal';
import { Footer } from './components/Footer';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { VisaQuoteModal } from './components/VisaQuoteModal';
import { AiLocationFinderModal } from './components/AiLocationFinderModal';
import { VoiceTripModal, StructuredVoiceTripData } from './components/VoiceTripModal';
import { FlightSearchParams } from './components/AzraqTripFinder';
import AuthCallback from './pages/AuthCallback';
import { AZRAQ_AGENCY_CONFIG } from './data/agencyConfig';
import { POPULAR_AIRPORTS, buildWhiteLabelSearchUrl } from './data/flightsData';
import { SEOHead } from './components/SEOHead';
import { getOrganizationSchema, getWebSiteSchema } from './lib/seo';

// Lazy-loaded routes for code-splitting and faster initial bundle loading
const PackagesView = lazy(() => import('./components/PackagesView').then((m) => ({ default: m.PackagesView })));
const PlannerView = lazy(() => import('./components/PlannerView').then((m) => ({ default: m.PlannerView })));
const FeedView = lazy(() => import('./components/FeedView').then((m) => ({ default: m.FeedView })));
const MapView = lazy(() => import('./components/MapView').then((m) => ({ default: m.MapView })));
const ProfileView = lazy(() => import('./components/ProfileView').then((m) => ({ default: m.ProfileView })));
const SmartSearchView = lazy(() => import('./components/SmartSearchView').then((m) => ({ default: m.SmartSearchView })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then((m) => ({ default: m.AdminDashboard })));
const HotelsView = lazy(() => import('./components/HotelsView').then((m) => ({ default: m.HotelsView })));
const ActivitiesView = lazy(() => import('./components/ActivitiesView').then((m) => ({ default: m.ActivitiesView })));

// Lazy-loaded Dedicated SEO Route Components
const DestinationSeoView = lazy(() => import('./components/DestinationSeoView').then((m) => ({ default: m.DestinationSeoView })));
const TravelGuidesView = lazy(() => import('./components/TravelGuidesView').then((m) => ({ default: m.TravelGuidesView })));
const TravelGuideDetailView = lazy(() => import('./components/TravelGuideDetailView').then((m) => ({ default: m.TravelGuideDetailView })));
const ItinerariesView = lazy(() => import('./components/ItinerariesView').then((m) => ({ default: m.ItinerariesView })));
const ItineraryDetailView = lazy(() => import('./components/ItineraryDetailView').then((m) => ({ default: m.ItineraryDetailView })));
const VisaSeoDetailView = lazy(() => import('./components/VisaSeoDetailView').then((m) => ({ default: m.VisaSeoDetailView })));
const AiPlannerLandingView = lazy(() => import('./components/AiPlannerLandingView').then((m) => ({ default: m.AiPlannerLandingView })));
const NotFoundView = lazy(() => import('./components/NotFoundView').then((m) => ({ default: m.NotFoundView })));

const RouteLoadingFallback = () => (
  <div className="w-full min-h-[60vh] flex flex-col items-center justify-center space-y-4 py-16 px-4 animate-pulse">
    <div className="w-12 h-12 rounded-full border-3 border-slate-200 border-t-[#0D6EFD] animate-spin" aria-label="Loading page content" />
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Loading Travel Data...</p>
  </div>
);

interface RouteState {
  view: NavView;
  slug?: string;
}

function parseUrlToRoute(): RouteState {
  if (typeof window === 'undefined') return { view: 'discover' };

  const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const search = window.location.search;

  if (
    pathname === '/flights' ||
    pathname === '/flight' ||
    pathname.startsWith('/flights/') ||
    pathname.startsWith('/flight/') ||
    search.includes('view=flights')
  ) {
    const flightSearch = new URLSearchParams(search).get('flightSearch');
    if (flightSearch) {
      window.location.replace(`https://flights.azraqtrips.com/?flightSearch=${encodeURIComponent(flightSearch)}`);
    } else {
      window.location.replace(`https://flights.azraqtrips.com/${search ? search : ''}`);
    }
    return { view: 'discover' };
  }

  if (pathname === '/' || pathname === '') {
    return { view: 'discover' };
  }
  if (pathname === '/destinations' || pathname === '/destination') {
    return { view: 'destinations' };
  }
  if (pathname.startsWith('/destinations/')) {
    const raw = pathname.slice('/destinations/'.length).trim();
    try {
      const slug = decodeURIComponent(raw).replace(/\/+$/, '').trim();
      return slug ? { view: 'destination-detail', slug } : { view: 'destinations' };
    } catch {
      return raw ? { view: 'destination-detail', slug: raw } : { view: 'destinations' };
    }
  }
  if (pathname.startsWith('/destination/')) {
    const raw = pathname.slice('/destination/'.length).trim();
    try {
      const slug = decodeURIComponent(raw).replace(/\/+$/, '').trim();
      return slug ? { view: 'destination-detail', slug } : { view: 'destinations' };
    } catch {
      return raw ? { view: 'destination-detail', slug: raw } : { view: 'destinations' };
    }
  }
  if (pathname === '/travel-guides' || pathname === '/guides' || pathname === '/guide') {
    return { view: 'guides' };
  }
  if (pathname.startsWith('/travel-guides/')) {
    const slug = pathname.replace('/travel-guides/', '');
    return { view: 'guide-detail', slug };
  }
  if (pathname.startsWith('/guides/')) {
    const slug = pathname.replace('/guides/', '');
    return { view: 'guide-detail', slug };
  }
  if (pathname.startsWith('/guide/')) {
    const slug = pathname.replace('/guide/', '');
    return { view: 'guide-detail', slug };
  }
  if (pathname === '/itineraries' || pathname === '/itinerary') {
    return { view: 'itineraries' };
  }
  if (pathname.startsWith('/itineraries/')) {
    const slug = pathname.replace('/itineraries/', '');
    return { view: 'itinerary-detail', slug };
  }
  if (pathname.startsWith('/itinerary/')) {
    const slug = pathname.replace('/itinerary/', '');
    return { view: 'itinerary-detail', slug };
  }
  if (pathname === '/visa' || pathname === '/visa-requirements' || pathname === '/visas') {
    return { view: 'visa' };
  }
  if (pathname.startsWith('/visa/')) {
    const slug = pathname.replace('/visa/', '');
    return { view: 'visa-detail', slug };
  }
  if (pathname.startsWith('/visas/')) {
    const slug = pathname.replace('/visas/', '');
    return { view: 'visa-detail', slug };
  }
  if (pathname.startsWith('/visa-requirements/')) {
    const slug = pathname.replace('/visa-requirements/', '');
    return { view: 'visa-detail', slug };
  }
  if (pathname === '/ai-travel-planner' || pathname === '/ai-planner' || pathname === '/ai') {
    return { view: 'ai-planner' };
  }
  if (pathname === '/packages' || pathname === '/package' || pathname === '/tours' || pathname === '/tour') {
    return { view: 'packages' };
  }
  if (pathname.startsWith('/packages/') || pathname.startsWith('/package/') || pathname.startsWith('/tours/') || pathname.startsWith('/tour/')) {
    return { view: 'packages' };
  }
  if (pathname === '/hotels' || pathname === '/hotel' || pathname === '/resorts') {
    return { view: 'hotels' };
  }
  if (pathname === '/activities' || pathname === '/activity' || pathname === '/tours-activities' || pathname === '/experiences') {
    return { view: 'activities' };
  }
  if (pathname === '/planner' || pathname === '/trip-planner') {
    return { view: 'planner' };
  }
  if (pathname === '/buddies' || pathname === '/feed' || pathname === '/community') {
    return { view: 'feed' };
  }
  if (pathname === '/about' || pathname === '/about-us') {
    return { view: 'about' };
  }
  if (pathname === '/contact' || pathname === '/contact-us') {
    return { view: 'contact' };
  }
  if (pathname === '/map') {
    return { view: 'map' };
  }
  if (pathname === '/profile') {
    return { view: 'profile' };
  }
  if (pathname === '/search') {
    return { view: 'search' };
  }
  if (pathname === '/admin') {
    return { view: 'admin' };
  }
  if (pathname === '/404' || pathname === '/not-found') {
    return { view: 'not-found' };
  }

  return { view: 'discover' };
}

function resolveFlightAirportCode(value: unknown, fallback: string): string {
  const rawValue = typeof value === 'string' ? value : (value as any)?.code;
  if (!rawValue) return fallback;

  const normalized = String(rawValue).trim();
  if (/^[A-Za-z]{3}$/.test(normalized)) return normalized.toUpperCase();

  const match = POPULAR_AIRPORTS.find((airport) => {
    const haystack = `${airport.code} ${airport.city} ${airport.name}`.toLowerCase();
    return haystack.includes(normalized.toLowerCase());
  });

  return match?.code || fallback;
}

function buildWhiteLabelUrlFromFlightParams(raw?: any): string {
  return buildWhiteLabelSearchUrl({
    origin: resolveFlightAirportCode(raw?.origin, 'DAC'),
    destination: resolveFlightAirportCode(raw?.destination, 'BKK'),
    departDate: raw?.departureDate || raw?.departDate,
    returnDate: raw?.returnDate,
    adults: raw?.adults,
    children: raw?.children,
    infants: raw?.infants,
    cabin: raw?.cabinClass || raw?.cabin,
    tripType: raw?.tripType || 'round',
  });
}

function getViewUrl(view: NavView, slug?: string): string {
  switch (view) {
    case 'discover':
      return '/';
    case 'destinations':
      return '/destinations';
    case 'destination-detail':
      return slug ? `/destinations/${slug}` : '/destinations';
    case 'guides':
      return '/travel-guides';
    case 'guide-detail':
      return slug ? `/travel-guides/${slug}` : '/travel-guides';
    case 'itineraries':
      return '/itineraries';
    case 'itinerary-detail':
      return slug ? `/itineraries/${slug}` : '/itineraries';
    case 'visa':
      return '/visa';
    case 'visa-detail':
      return slug ? `/visa/${slug}` : '/visa';
    case 'ai-planner':
      return '/ai-travel-planner';
    case 'flights':
      return '/';
    case 'packages':
      return '/packages';
    case 'hotels':
      return '/hotels';
    case 'activities':
      return '/activities';
    case 'planner':
      return '/planner';
    case 'feed':
      return '/feed';
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    case 'map':
      return '/map';
    case 'profile':
      return '/profile';
    case 'search':
      return '/search';
    case 'admin':
      return '/admin';
    case 'not-found':
      return '/404';
    default:
      return '/';
  }
}

function AppContent() {
  const shouldReduceMotion = useReducedMotion();
  const [routeState, setRouteState] = useState<RouteState>(() => parseUrlToRoute());

  const currentView = routeState.view;
  const currentSlug = routeState.slug;

  const [brandTheme, setBrandTheme] = useState<BrandTheme>('azraq');
  const [isVisaModalOpen, setIsVisaModalOpen] = useState(false);
  const [visaModalCountry, setVisaModalCountry] = useState<string | undefined>(undefined);
  const [isLocationFinderOpen, setIsLocationFinderOpen] = useState(false);
  const [locationFinderQuery, setLocationFinderQuery] = useState('');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceModalTranscript, setVoiceModalTranscript] = useState('');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setRouteState(parseUrlToRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Application State
  const [destinations] = useState<Destination[]>(INITIAL_DESTINATIONS);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary>(INITIAL_KYOTO_ITINERARY);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>(() => {
    try {
      const stored = localStorage.getItem('azraq_saved_itineraries');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('azraq_saved_itineraries', JSON.stringify(savedItineraries));
    } catch {
      // Local storage fallback
    }
  }, [savedItineraries]);

  const [modalDestination, setModalDestination] = useState<Destination | null>(null);
  const [mapSpot, setMapSpot] = useState<Spot | undefined>(undefined);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');

  // Toggle brand theme
  const handleToggleBrand = () => {
    setBrandTheme((prev) => (prev === 'globetrotter' ? 'azraq' : 'globetrotter'));
  };

  const handleNavigate = useCallback((view: NavView | string, extra?: any) => {
    if (extra?.query) {
      setActiveSearchQuery(extra.query);
    } else if (view !== 'search') {
      setActiveSearchQuery('');
    }

    let targetView: NavView = 'discover';
    let targetSlug: string | undefined = undefined;

    if (view === 'destination-detail') {
      targetView = 'destination-detail';
      targetSlug = extra?.slug;
    } else if (view === 'guide-detail') {
      targetView = 'guide-detail';
      targetSlug = extra?.slug;
    } else if (view === 'itinerary-detail') {
      targetView = 'itinerary-detail';
      targetSlug = extra?.slug;
    } else if (view === 'visa-detail') {
      targetView = 'visa-detail';
      targetSlug = extra?.slug;
    } else if (view.startsWith('guide-')) {
      targetView = 'guide-detail';
      targetSlug = view.replace('guide-', '');
    } else if (view.startsWith('itinerary-')) {
      targetView = 'itinerary-detail';
      targetSlug = view.replace('itinerary-', '');
    } else if (view.startsWith('destination-')) {
      targetView = 'destination-detail';
      targetSlug = view.replace('destination-', '');
    } else if (view.startsWith('visa-')) {
      targetView = 'visa-detail';
      targetSlug = view.replace('visa-', '');
    } else if (view === 'buddies' || view === 'community') {
      targetView = 'feed';
    } else if (view === 'ai-planner' || view === 'ai-travel-planner') {
      targetView = 'ai-planner';
    } else {
      targetView = view as NavView;
      targetSlug = extra?.slug;
    }

    if (targetView === 'flights' && typeof window !== 'undefined') {
      const requestedFlightParams = extra?.params || extra?.searchParams;
      const redirectUrl = requestedFlightParams
        ? buildWhiteLabelUrlFromFlightParams(requestedFlightParams)
        : 'https://flights.azraqtrips.com/';
      window.location.href = redirectUrl;
      return;
    }

    setRouteState({ view: targetView, slug: targetSlug });

    // Update browser URL without full page reload
    if (typeof window !== 'undefined' && window.history) {
      const newUrl = getViewUrl(targetView, targetSlug);
      window.history.pushState({}, '', newUrl);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchFlights = (params: FlightSearchParams) => {
    const redirectUrl = buildWhiteLabelUrlFromFlightParams(params);
    if (typeof window !== 'undefined') {
      window.location.href = redirectUrl;
    }
  };

  // Quick prompt handler from Discover Search Bar & Voice Trip Planner
  const handlePlanTripPrompt = async (
    input:
      | string
      | {
          destination?: string;
          startDate?: string;
          endDate?: string;
          vibes?: string[];
          travelerCount?: number;
          structuredPrompt?: string;
          prompt?: string;
          durationDays?: number;
        }
  ) => {
    handleNavigate('planner');

    let destination =
      typeof input === 'string'
        ? input
        : input.destination || input.structuredPrompt || input.prompt || 'Bangkok, Thailand';
    let startDate = typeof input === 'object' && input.startDate ? input.startDate : '2026-11-01';
    let endDate = typeof input === 'object' && input.endDate ? input.endDate : '2026-11-07';
    let vibes = typeof input === 'object' && input.vibes ? input.vibes : ['Culture', 'Local Cuisine', 'Sightseeing'];
    let travelerCount = typeof input === 'object' && input.travelerCount ? input.travelerCount : 2;

    try {
      const response = await fetch('/api/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          vibes,
          travelerCount,
        }),
      });
      const data = await response.json();
      if (data && data.title) {
        const generatedItinerary: Itinerary = {
          id: Date.now().toString(),
          title: data.title,
          destination: data.destination || destination,
          durationDays:
            data.durationDays || (typeof input === 'object' && input.durationDays ? input.durationDays : 5),
          weatherSummary: data.weatherSummary || '20°C Mild & Pleasant',
          aiSummary: data.aiSummary || 'AI curated itinerary based on your voice travel preferences.',
          days: data.days || [],
          packingList: data.packingList || [],
          savedAt: new Date().toISOString(),
        };
        setCurrentItinerary(generatedItinerary);
      }
    } catch (err) {
      console.error('Quick generation error:', err);
    }
  };

  // Quick generate itinerary for a specific destination
  const handleQuickGenerateItinerary = (destName: string) => {
    handleNavigate('planner');
    handlePlanTripPrompt(destName);
  };

  // Save or unsave itinerary
  const handleSaveItinerary = (itineraryToSave: Itinerary) => {
    const exists = savedItineraries.some((i) => i.id === itineraryToSave.id);
    if (exists) {
      setSavedItineraries(savedItineraries.filter((i) => i.id !== itineraryToSave.id));
    } else {
      setSavedItineraries([...savedItineraries, itineraryToSave]);
    }
  };

  // Remove saved itinerary
  const handleRemoveSavedItinerary = (id: string) => {
    setSavedItineraries(savedItineraries.filter((i) => i.id !== id));
  };

  // View spot on Map
  const handleViewOnMap = (spot?: Spot) => {
    setMapSpot(spot);
    handleNavigate('planner');
  };

  // Select destination by name (from hashtags or feed)
  const handleSelectDestinationByName = (name: string) => {
    const found = findDestinationBySlug(name, destinations);
    if (found) {
      handleNavigate('destination-detail', { slug: found.id });
    } else {
      handleQuickGenerateItinerary(name);
    }
  };

  const handleOpenVisaQuote = (country?: string) => {
    setVisaModalCountry(country);
    setIsVisaModalOpen(true);
  };

  const isCurrentItinerarySaved = savedItineraries.some((i) => i.id === currentItinerary.id);

  // Selected SEO data models with resilient lookup
  const activeGuide: TravelGuide | undefined = currentSlug
    ? TRAVEL_GUIDES.find((g) => {
        const s = currentSlug.toLowerCase();
        return (
          g.slug.toLowerCase() === s ||
          g.slug.replace('-travel-guide', '').toLowerCase() === s.replace('-travel-guide', '') ||
          g.country.toLowerCase() === s ||
          g.country.toLowerCase().replace(/[^a-z0-9]+/g, '-') === s ||
          g.destination.toLowerCase().includes(s) ||
          s.includes(g.country.toLowerCase())
        );
      })
    : undefined;

  const activeItinerary: CuratedItinerary | undefined = currentSlug
    ? CURATED_ITINERARIES.find((it) => {
        const s = currentSlug.toLowerCase();
        return (
          it.slug.toLowerCase() === s ||
          it.country.toLowerCase() === s ||
          it.country.toLowerCase().replace(/[^a-z0-9]+/g, '-') === s ||
          it.destination.toLowerCase().includes(s) ||
          s.includes(it.country.toLowerCase()) ||
          it.slug.split('-')[0] === s.split('-')[0]
        );
      })
    : undefined;

  const activeDestination: Destination | undefined = currentSlug
    ? findDestinationBySlug(currentSlug, destinations)
    : undefined;

  const activeVisa: VisaRequirement | undefined = currentSlug
    ? (getVisaRequirement(currentSlug) as any) ||
      (getCanonicalVisaByCountry(currentSlug) as any) ||
      VISA_REQUIREMENTS.find((v) => {
        const s = currentSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
        const vId = v.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const vCountry = v.country.toLowerCase().replace(/[^a-z0-9]/g, '');
        return vId === s || vCountry === s || vCountry.includes(s) || s.includes(vCountry);
      })
    : undefined;

  // Handle Supabase Auth Callback URL if redirected here
  const isAuthCallbackRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/auth/callback') ||
      window.location.hash.includes('access_token=') ||
      window.location.search.includes('code='));

  if (isAuthCallbackRoute) {
    return <AuthCallback />;
  }

  return (
    <ClientLayout
      className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#0D6EFD] selection:text-white"
      mainClassName="w-full min-h-screen flex flex-col transition-all duration-300 pb-16 md:pb-0"
      navbar={(navRef) => (
        <Navigation
          ref={navRef as React.Ref<HTMLElement>}
          currentView={currentView}
          onViewChange={handleNavigate}
          brandTheme={brandTheme}
          onToggleBrand={handleToggleBrand}
          onNewTripClick={() => handleNavigate('planner')}
          savedTripsCount={savedItineraries.length}
          onOpenQuote={() => handleOpenVisaQuote()}
          onOpenLocationFinder={() => {
            setLocationFinderQuery('');
            setIsLocationFinderOpen(true);
          }}
          onOpenVoiceModal={(text) => {
            setVoiceModalTranscript(text || '');
            setIsVoiceModalOpen(true);
          }}
        />
      )}
    >
      {/* Root Website & Organization Schema for Home View */}
      {currentView === 'discover' && (
        <SEOHead
          title="AI Travel Planning & Holiday Packages from Bangladesh"
          description="AzraqTrips is Bangladesh's premier AI-powered travel agency. Instant flight search from Dhaka (DAC), verified tourist visa assistance, curated holiday packages, and custom itineraries."
          canonical="https://www.azraqtrips.com/"
          structuredData={[getOrganizationSchema(), getWebSiteSchema()]}
        />
      )}

      <motion.div
        key={currentView + (currentSlug || '')}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex-1 w-full"
      >
        <Suspense fallback={<RouteLoadingFallback />}>
          {/* Main Views */}
          {currentView === 'discover' && (
            <DiscoverView
              destinations={destinations}
              onSelectDestination={(dest) => handleNavigate('destination-detail', { slug: dest.id })}
              onPlanTripPrompt={handlePlanTripPrompt}
              onQuickGenerateItinerary={handleQuickGenerateItinerary}
              onNavigateToView={handleNavigate}
              onSearchFlights={handleSearchFlights}
              onOpenVisaModal={handleOpenVisaQuote}
              onOpenQuote={() => handleOpenVisaQuote()}
              onOpenLocationFinder={() => {
                setLocationFinderQuery('');
                setIsLocationFinderOpen(true);
              }}
              onOpenVoiceModal={(text) => {
                setVoiceModalTranscript(text || '');
                setIsVoiceModalOpen(true);
              }}
            />
          )}

        {currentView === 'destinations' && (
          <DestinationsView
            destinations={destinations}
            onSelectDestination={(dest) => handleNavigate('destination-detail', { slug: dest.id })}
            onPlanTripPrompt={handlePlanTripPrompt}
          />
        )}

        {currentView === 'destination-detail' && activeDestination && (
          <DestinationSeoView
            destination={activeDestination}
            onNavigateToView={handleNavigate}
            onPlanTripPrompt={handlePlanTripPrompt}
            onOpenVisaQuote={handleOpenVisaQuote}
          />
        )}

        {currentView === 'destination-detail' && !activeDestination && (
          <NotFoundView onNavigateToView={handleNavigate} />
        )}

        {currentView === 'guides' && (
          <TravelGuidesView
            onSelectGuide={(slug) => handleNavigate(`guide-${slug}`)}
            onNavigateToView={handleNavigate}
          />
        )}

        {currentView === 'guide-detail' && activeGuide && (
          <TravelGuideDetailView
            guide={activeGuide}
            onNavigateToView={handleNavigate}
            onPlanTripPrompt={handlePlanTripPrompt}
            onOpenVisaQuote={handleOpenVisaQuote}
          />
        )}

        {currentView === 'guide-detail' && !activeGuide && (
          <NotFoundView onNavigateToView={handleNavigate} />
        )}

        {currentView === 'itineraries' && (
          <ItinerariesView
            onSelectItinerary={(slug) => handleNavigate(`itinerary-${slug}`)}
            onNavigateToView={handleNavigate}
            onPlanTripPrompt={handlePlanTripPrompt}
          />
        )}

        {currentView === 'itinerary-detail' && activeItinerary && (
          <ItineraryDetailView
            itinerary={activeItinerary}
            onNavigateToView={handleNavigate}
            onPlanTripPrompt={handlePlanTripPrompt}
            onOpenVisaQuote={handleOpenVisaQuote}
          />
        )}

        {currentView === 'itinerary-detail' && !activeItinerary && (
          <NotFoundView onNavigateToView={handleNavigate} />
        )}

        {currentView === 'visa' && (
          <VisaView onOpenVisaQuote={handleOpenVisaQuote} />
        )}

        {currentView === 'visa-detail' && activeVisa && (
          <VisaSeoDetailView
            visa={activeVisa}
            onNavigateToView={handleNavigate}
            onOpenVisaQuote={handleOpenVisaQuote}
          />
        )}

        {currentView === 'visa-detail' && !activeVisa && (
          <NotFoundView onNavigateToView={handleNavigate} />
        )}

        {currentView === 'ai-planner' && (
          <AiPlannerLandingView
            onPlanTripPrompt={handlePlanTripPrompt}
            onNavigateToView={handleNavigate}
            onOpenVoiceModal={(text) => {
              setVoiceModalTranscript(text || '');
              setIsVoiceModalOpen(true);
            }}
          />
        )}

        {currentView === 'packages' && <PackagesView />}

        {currentView === 'hotels' && (
          <HotelsView onNavigateToView={handleNavigate} />
        )}

        {currentView === 'activities' && (
          <ActivitiesView
            onNavigateToView={handleNavigate}
            onOpenQuote={() => handleOpenVisaQuote()}
          />
        )}

        {currentView === 'about' && (
          <AboutView
            onNavigateToContact={() => handleNavigate('contact')}
            onOpenTripPlanner={() => handleNavigate('planner')}
          />
        )}

        {currentView === 'contact' && <ContactView />}

        {currentView === 'planner' && (
          <PlannerView
            currentItinerary={currentItinerary}
            onUpdateItinerary={setCurrentItinerary}
            onSaveItinerary={handleSaveItinerary}
            onViewOnMap={handleViewOnMap}
            isSaved={isCurrentItinerarySaved}
            destinations={destinations}
            onSelectDestination={setModalDestination}
            onQuickGenerateItinerary={handleQuickGenerateItinerary}
            onOpenVisaQuote={handleOpenVisaQuote}
          />
        )}

        {currentView === 'feed' && (
          <FeedView
            onSelectDestinationByName={handleSelectDestinationByName}
            onNavigateToProfile={() => handleNavigate('profile')}
          />
        )}

        {currentView === 'map' && (
          <MapView
            destinations={destinations}
            onSelectDestination={setModalDestination}
            selectedSpot={mapSpot}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            savedItineraries={savedItineraries}
            onSelectItinerary={(itinerary) => {
              setCurrentItinerary(itinerary);
              handleNavigate('planner');
            }}
            onRemoveItinerary={handleRemoveSavedItinerary}
            onNavigateToFeed={() => handleNavigate('feed')}
            onSelectDestination={setModalDestination}
            onOpenVisaQuote={() => handleOpenVisaQuote()}
            onNavigate={(view) => handleNavigate(view)}
          />
        )}

        {currentView === 'search' && (
          <SmartSearchView
            initialQuery={activeSearchQuery}
            onNavigateToView={handleNavigate}
            onOpenVisaQuote={handleOpenVisaQuote}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onClose={() => handleNavigate('discover')} />
        )}

        {currentView === 'not-found' && (
          <NotFoundView onNavigateToView={handleNavigate} />
        )}
        </Suspense>
      </motion.div>

      {/* Global Travel Agency Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenVisaQuote={() => handleOpenVisaQuote()}
      />

      {/* Destination Inspector Modal */}
      <DestinationModal
        destination={modalDestination}
        onClose={() => setModalDestination(null)}
        onGenerateItinerary={handleQuickGenerateItinerary}
      />

      {/* Quotation Modals */}
      <VisaQuoteModal
        isOpen={isVisaModalOpen}
        onClose={() => {
          setIsVisaModalOpen(false);
          setVisaModalCountry(undefined);
        }}
        initialCountry={visaModalCountry}
      />

      {/* Global AI Location Scout Modal */}
      <AiLocationFinderModal
        isOpen={isLocationFinderOpen}
        onClose={() => {
          setIsLocationFinderOpen(false);
          setLocationFinderQuery('');
        }}
        initialQuery={locationFinderQuery}
      />

      {/* Global Voice Trip & Flight Modal */}
      <VoiceTripModal
        isOpen={isVoiceModalOpen}
        onClose={() => {
          setIsVoiceModalOpen(false);
          setVoiceModalTranscript('');
        }}
        onConfirmPlan={(planData: StructuredVoiceTripData) => {
          handlePlanTripPrompt(planData.structuredPrompt);
        }}
        onSearchFlights={(flightParams: FlightSearchParams) => {
          handleSearchFlights(flightParams);
        }}
        initialTranscript={voiceModalTranscript}
      />

      {/* Persistent Floating WhatsApp Chat Widget */}
      <FloatingWhatsAppButton
        phoneNumber={AZRAQ_AGENCY_CONFIG.whatsappNumber}
        defaultMessage="Hello Azraq! I would like to inquire about tour packages, flights, or visa assistance."
      />

      {/* Auth Modal & Toast Notifications */}
      <AuthModal brandTitle="Azraq" onNavigate={handleNavigate} />
      <Toast />
    </ClientLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <PackageProvider>
        <FeedProvider>
          <AppContent />
        </FeedProvider>
      </PackageProvider>
    </AuthProvider>
  );
}

export default App;

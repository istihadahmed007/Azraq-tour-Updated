import React, { useState, useEffect, useCallback } from 'react';
import { BrandTheme, Destination, Itinerary, NavView, Spot } from './types';
import { INITIAL_DESTINATIONS, INITIAL_KYOTO_ITINERARY } from './data/mockData';
import { TRAVEL_GUIDES, TravelGuide } from './data/travelGuidesData';
import { CURATED_ITINERARIES, CuratedItinerary } from './data/itinerariesData';
import { VISA_REQUIREMENTS, VisaRequirement } from './data/visaRequirementsData';

import { AuthProvider } from './context/AuthContext';
import { PackageProvider } from './context/PackageContext';
import { FeedProvider } from './context/FeedContext';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { Navigation } from './components/Navigation';
import { ClientLayout } from './components/ClientLayout';
import { DiscoverView } from './components/DiscoverView';
import { DestinationsView } from './components/DestinationsView';
import { FlightsView } from './components/FlightsView';
import { VisaView } from './components/VisaView';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { PackagesView } from './components/PackagesView';
import { PlannerView } from './components/PlannerView';
import { FeedView } from './components/FeedView';
import { MapView } from './components/MapView';
import { ProfileView } from './components/ProfileView';
import { SmartSearchView } from './components/SmartSearchView';
import { DestinationModal } from './components/DestinationModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { VisaQuoteModal } from './components/VisaQuoteModal';
import { AiLocationFinderModal } from './components/AiLocationFinderModal';
import { FlightSearchParams } from './components/AzraqTripFinder';
import AuthCallback from './pages/AuthCallback';
import { AZRAQ_AGENCY_CONFIG } from './data/agencyConfig';
import { parseFlightSearchParamsFromUrl } from './utils/flightSearchEngine';
import { SEOHead } from './components/SEOHead';
import { getOrganizationSchema, getWebSiteSchema } from './lib/seo';

// Dedicated SEO Route Components
import { DestinationSeoView } from './components/DestinationSeoView';
import { TravelGuidesView } from './components/TravelGuidesView';
import { TravelGuideDetailView } from './components/TravelGuideDetailView';
import { ItinerariesView } from './components/ItinerariesView';
import { ItineraryDetailView } from './components/ItineraryDetailView';
import { VisaSeoDetailView } from './components/VisaSeoDetailView';
import { AiPlannerLandingView } from './components/AiPlannerLandingView';
import { NotFoundView } from './components/NotFoundView';

interface RouteState {
  view: NavView;
  slug?: string;
}

function parseUrlToRoute(): RouteState {
  if (typeof window === 'undefined') return { view: 'discover' };

  const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
  const search = window.location.search;

  if (
    search.includes('origin=') ||
    search.includes('destination=') ||
    search.includes('departDate=') ||
    search.includes('departureDate=') ||
    search.includes('view=flights') ||
    pathname === '/flights'
  ) {
    return { view: 'flights' };
  }

  if (pathname === '/' || pathname === '') {
    return { view: 'discover' };
  }
  if (pathname === '/destinations') {
    return { view: 'destinations' };
  }
  if (pathname.startsWith('/destinations/')) {
    const slug = pathname.replace('/destinations/', '');
    return { view: 'destination-detail', slug };
  }
  if (pathname === '/travel-guides' || pathname === '/guides') {
    return { view: 'guides' };
  }
  if (pathname.startsWith('/travel-guides/')) {
    const slug = pathname.replace('/travel-guides/', '');
    return { view: 'guide-detail', slug };
  }
  if (pathname === '/itineraries') {
    return { view: 'itineraries' };
  }
  if (pathname.startsWith('/itineraries/')) {
    const slug = pathname.replace('/itineraries/', '');
    return { view: 'itinerary-detail', slug };
  }
  if (pathname === '/visa') {
    return { view: 'visa' };
  }
  if (pathname.startsWith('/visa/')) {
    const slug = pathname.replace('/visa/', '');
    return { view: 'visa-detail', slug };
  }
  if (pathname === '/ai-travel-planner' || pathname === '/ai-planner') {
    return { view: 'ai-planner' };
  }
  if (pathname === '/packages') {
    return { view: 'packages' };
  }
  if (pathname === '/planner') {
    return { view: 'planner' };
  }
  if (pathname === '/buddies' || pathname === '/feed' || pathname === '/community') {
    return { view: 'feed' };
  }
  if (pathname === '/about') {
    return { view: 'about' };
  }
  if (pathname === '/contact') {
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

  return { view: 'discover' };
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
      return '/flights';
    case 'packages':
      return '/packages';
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
  const [routeState, setRouteState] = useState<RouteState>(() => parseUrlToRoute());

  const currentView = routeState.view;
  const currentSlug = routeState.slug;

  const [activeFlightParams, setActiveFlightParams] = useState<FlightSearchParams | undefined>(() => {
    if (typeof window !== 'undefined' && window.location) {
      const parsed = parseFlightSearchParamsFromUrl();
      if (parsed.origin || parsed.destination || parsed.departureDate) {
        return parsed as FlightSearchParams;
      }
    }
    return undefined;
  });

  const [brandTheme, setBrandTheme] = useState<BrandTheme>('azraq');
  const [isVisaModalOpen, setIsVisaModalOpen] = useState(false);
  const [visaModalCountry, setVisaModalCountry] = useState<string | undefined>(undefined);
  const [isLocationFinderOpen, setIsLocationFinderOpen] = useState(false);
  const [locationFinderQuery, setLocationFinderQuery] = useState('');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setRouteState(parseUrlToRoute());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Supabase Auth Callback URL if redirected here
  const isAuthCallbackRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/auth/callback') ||
      window.location.hash.includes('access_token=') ||
      window.location.search.includes('code='));

  if (isAuthCallbackRoute) {
    return <AuthCallback />;
  }

  // Application State
  const [destinations] = useState<Destination[]>(INITIAL_DESTINATIONS);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary>(INITIAL_KYOTO_ITINERARY);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([INITIAL_KYOTO_ITINERARY]);
  const [modalDestination, setModalDestination] = useState<Destination | null>(null);
  const [mapSpot, setMapSpot] = useState<Spot | undefined>(undefined);
  const [activeSearchQuery, setActiveSearchQuery] = useState<string>('');

  // Toggle brand theme
  const handleToggleBrand = () => {
    setBrandTheme((prev) => (prev === 'globetrotter' ? 'azraq' : 'globetrotter'));
  };

  const handleNavigate = useCallback((view: NavView | string, extra?: any) => {
    if (extra?.params) {
      setActiveFlightParams(extra.params);
    }
    if (extra?.query) {
      setActiveSearchQuery(extra.query);
    } else if (view !== 'search') {
      setActiveSearchQuery('');
    }

    let targetView: NavView = 'discover';
    let targetSlug: string | undefined = undefined;

    if (view.startsWith('guide-')) {
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

    setRouteState({ view: targetView, slug: targetSlug });

    // Update browser URL without full page reload
    if (typeof window !== 'undefined' && window.history) {
      const newUrl = getViewUrl(targetView, targetSlug);
      window.history.pushState({}, '', newUrl);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchFlights = (params: FlightSearchParams) => {
    setActiveFlightParams(params);
    handleNavigate('flights');
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
    const found = destinations.find(
      (d) =>
        d.name.toLowerCase().includes(name.toLowerCase()) ||
        d.country.toLowerCase().includes(name.toLowerCase())
    );
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

  // Selected SEO data models
  const activeGuide: TravelGuide | undefined = currentSlug
    ? TRAVEL_GUIDES.find((g) => g.slug === currentSlug)
    : undefined;

  const activeItinerary: CuratedItinerary | undefined = currentSlug
    ? CURATED_ITINERARIES.find((it) => it.slug === currentSlug)
    : undefined;

  const activeDestination: Destination | undefined = currentSlug
    ? destinations.find((d) => d.id === currentSlug || d.name.toLowerCase() === currentSlug.toLowerCase())
    : undefined;

  const activeVisa: VisaRequirement | undefined = currentSlug
    ? VISA_REQUIREMENTS.find((v) => v.id === currentSlug || v.country.toLowerCase() === currentSlug.toLowerCase())
    : undefined;

  return (
    <ClientLayout
      className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-[#0D6EFD] selection:text-white"
      mainClassName="w-full min-h-screen flex flex-col transition-all duration-300"
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

      <div className="flex-1 w-full">
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
          />
        )}

        {currentView === 'flights' && (
          <FlightsView
            initialParams={activeFlightParams}
            onOpenFlightModal={() => {}}
            onNavigateToView={handleNavigate}
            onOpenVisaQuote={handleOpenVisaQuote}
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
          />
        )}

        {currentView === 'packages' && <PackagesView />}

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
      </div>

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

      {/* Persistent Floating WhatsApp Chat Widget */}
      <FloatingWhatsAppButton
        phoneNumber={AZRAQ_AGENCY_CONFIG.whatsappNumber}
        defaultMessage="Hello Azraq! I would like to inquire about tour packages, flights, or visa assistance."
      />

      {/* Auth Modal & Toast Notifications */}
      <AuthModal brandTitle="Azraq" />
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

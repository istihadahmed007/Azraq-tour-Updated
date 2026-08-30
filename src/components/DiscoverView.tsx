import React, { useState } from 'react';
import { Destination, TourPackage } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePackages } from '../context/PackageContext';
import { FlightSearchParams } from './AzraqTripFinder';
import { VoiceTripModal, StructuredVoiceTripData } from './VoiceTripModal';
import { SEOHead } from './SEOHead';
import { getOrganizationSchema } from '../lib/seo';

// Composed Home Section Components
import { HomeHero } from './home/HomeHero';
import { TrustStrip } from './home/TrustStrip';
import { VoicePlannerBanner } from './home/VoicePlannerBanner';
import { DestinationSection } from './home/DestinationSection';
import { FeaturedPackagesSection } from './home/FeaturedPackagesSection';
import { DealsSection } from './home/DealsSection';
import { ActivitiesSection } from './home/ActivitiesSection';
import { FlightWorkflowSection } from './home/FlightWorkflowSection';
import { ServiceGrid } from './home/ServiceGrid';
import { VisaAssistanceSection } from './home/VisaAssistanceSection';
import { TravelBuddiesPreview } from './home/TravelBuddiesPreview';
import { WhyAzraqSection } from './home/WhyAzraqSection';
import { FinalTravelCta } from './home/FinalTravelCta';
import { OnboardingAgentCard } from './OnboardingAgentCard';


interface DiscoverViewProps {
  destinations: Destination[];
  onSelectDestination: (destination: Destination) => void;
  onPlanTripPrompt: (promptText: any) => void;
  onQuickGenerateItinerary: (destName: string) => void;
  onNavigateToView?: (view: string, extra?: any) => void;
  onSearchFlights?: (params: FlightSearchParams) => void;
  onOpenVisaModal?: (country?: string) => void;
  onOpenFlightModal?: (dest?: string) => void;
  onOpenQuote?: (pkg?: TourPackage) => void;
  onOpenLocationFinder?: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  destinations,
  onSelectDestination,
  onPlanTripPrompt,
  onQuickGenerateItinerary,
  onNavigateToView,
  onSearchFlights,
  onOpenVisaModal,
  onOpenFlightModal,
  onOpenQuote,
  onOpenLocationFinder,
}) => {
  const { showToast } = useAuth();
  const { packages, setActivePackageModal, setActiveQuotationModal } = usePackages();

  // Voice Trip Planning Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceInitialTranscript, setVoiceInitialTranscript] = useState('');

  const handleOpenVoicePlanner = (initialTranscript?: string) => {
    setVoiceInitialTranscript(initialTranscript || '');
    setIsVoiceModalOpen(true);
  };

  const handleConfirmVoicePlan = (data: StructuredVoiceTripData) => {
    showToast(`Voice trip parsed! Generating itinerary for ${data.destination}...`, 'info');
    onPlanTripPrompt({
      destination: data.destination,
      startDate: data.startDate,
      endDate: data.endDate,
      vibes: data.vibes,
      travelerCount: data.travelerCount,
      durationDays: data.durationDays,
      structuredPrompt: data.structuredPrompt,
    });
  };

  return (
    <article className="w-full min-h-screen bg-[#F8FAFC] flex flex-col pb-16">
      <SEOHead
        title="Azraq Trips – Bangladesh’s Smart Travel Platform | Holiday Packages, Flights & Visas"
        description="Book cheap flights, all-inclusive verified Asian holiday packages, fast visa assistance, and customized AI trip itineraries with Azraq Trips Dhaka."
        canonical="https://www.azraqtrips.com/"
        structuredData={getOrganizationSchema()}
      />
      {/* 1. Brand Hero & 5-Mode Trip Finder (White / Clean) */}
      <div className="w-full bg-white pb-6 sm:pb-8">
        <HomeHero
          onSearchFlights={(params) => {
            if (onSearchFlights) {
              onSearchFlights(params);
            } else {
              window.location.href = 'https://flights.azraqtrips.com/';
            }
          }}
          onNavigateToView={onNavigateToView}
          onPlanTripPrompt={onPlanTripPrompt}
          onOpenVisaModal={onOpenVisaModal}
          onOpenQuote={onOpenQuote}
          onOpenVoiceModal={handleOpenVoicePlanner}
        />
      </div>

      {/* 2. Trust Strip & Onboarding (Soft Aqua #EAF7F8) */}
      <div className="w-full bg-[#EAF7F8] py-8 border-y border-[#17BEBB]/15 space-y-6">
        <TrustStrip />
        <OnboardingAgentCard
          currentView="discover"
          onNavigateToView={(view, params) => onNavigateToView && onNavigateToView(view, params)}
          onOpenVisaQuote={onOpenVisaModal}
        />
      </div>

      {/* 3. Limited-Time OTA Deals & Flash Promotions (White) */}
      <div className="w-full bg-white py-12 sm:py-16">
        <DealsSection
          onOpenQuote={(pkg) => {
            if (onOpenQuote) onOpenQuote(pkg);
            else if (pkg) setActiveQuotationModal(pkg);
          }}
          onNavigateToView={onNavigateToView}
        />
      </div>

      {/* 4. Curated Popular Destinations from Dhaka (Soft Background #F8FAFC) */}
      <div className="w-full bg-[#F8FAFC] py-12 sm:py-16 border-y border-slate-200/60">
        <DestinationSection
          destinations={destinations}
          onSelectDestination={onSelectDestination}
          onQuickGenerateItinerary={onQuickGenerateItinerary}
          onSearchFlights={onSearchFlights}
          onNavigateToDestinations={() => onNavigateToView && onNavigateToView('destinations')}
        />
      </div>

      {/* 5. Featured Asian Tour Packages (White) */}
      {packages && packages.length > 0 && (
        <div className="w-full bg-white py-12 sm:py-16">
          <FeaturedPackagesSection
            packages={packages}
            onViewDetails={(pkg) => setActivePackageModal(pkg)}
            onRequestQuote={(pkg) => {
              if (onOpenQuote) onOpenQuote(pkg);
              else setActiveQuotationModal(pkg);
            }}
            onNavigateToPackages={() => onNavigateToView && onNavigateToView('packages')}
          />
        </div>
      )}

      {/* 6. Activities, Tours & Theme Parks (Soft Aqua #EAF7F8) */}
      <div className="w-full bg-[#EAF7F8] py-12 sm:py-16 border-y border-[#17BEBB]/15">
        <ActivitiesSection
          onNavigateToView={onNavigateToView}
          onOpenQuote={() => {
            if (onOpenQuote) onOpenQuote();
          }}
        />
      </div>

      {/* 7. AI Voice & Interactive Trip Planner Banner (White) */}
      <div className="w-full bg-white py-12 sm:py-16">
        <VoicePlannerBanner
          onOpenVoiceModal={handleOpenVoicePlanner}
          onNavigateToPlanner={() => onNavigateToView && onNavigateToView('planner')}
        />
      </div>

      {/* 8. Flight Booking & Quotation Workflow (Soft Background #F8FAFC) */}
      <div className="w-full bg-[#F8FAFC] py-12 sm:py-16 border-y border-slate-200/60">
        <FlightWorkflowSection
          onNavigateToFlights={() => {
            window.location.href = 'https://flights.azraqtrips.com/';
          }}
        />
      </div>

      {/* 9. Primary Service Grid (White) */}
      <div className="w-full bg-white py-12 sm:py-16">
        <ServiceGrid
          onNavigateToView={onNavigateToView}
          onOpenLocationFinder={onOpenLocationFinder}
        />
      </div>

      {/* 10. Visa Assistance & Checklists (Deep Ocean Gradient) */}
      <div className="w-full bg-[#073B4C] py-12 sm:py-16">
        <VisaAssistanceSection
          onOpenVisaModal={onOpenVisaModal}
          onNavigateToVisa={() => onNavigateToView && onNavigateToView('visa')}
        />
      </div>

      {/* 11. Travel Buddies Verified Preview (White) */}
      <div className="w-full bg-white py-12 sm:py-16">
        <TravelBuddiesPreview
          onNavigateToBuddies={() => onNavigateToView && onNavigateToView('buddies')}
        />
      </div>

      {/* 12. Built for Bangladeshi Travelers (Soft Aqua #EAF7F8) */}
      <div className="w-full bg-[#EAF7F8]/60 py-12 sm:py-16 border-y border-[#17BEBB]/15">
        <WhyAzraqSection />
      </div>

      {/* 13. Final Focused Travel CTA (White) */}
      <div className="w-full bg-white py-12 sm:py-16">
        <FinalTravelCta
          onPlanTrip={() => {
            if (onNavigateToView) onNavigateToView('planner');
          }}
          onNavigateToPackages={() => {
            if (onNavigateToView) onNavigateToView('packages');
          }}
          onNavigateToFlights={() => {
            window.location.href = 'https://flights.azraqtrips.com/';
          }}
          onNavigateToContact={() => onNavigateToView && onNavigateToView('contact')}
        />
      </div>

      {/* Voice Trip Modal */}
      <VoiceTripModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onConfirmPlan={handleConfirmVoicePlan}
        onSearchFlights={(params) => {
          if (onSearchFlights) {
            onSearchFlights(params);
          } else {
            window.location.href = 'https://flights.azraqtrips.com/';
          }
        }}
        initialTranscript={voiceInitialTranscript}
      />
    </article>
  );
};

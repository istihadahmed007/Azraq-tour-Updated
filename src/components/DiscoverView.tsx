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
import { DestinationSection } from './home/DestinationSection';
import { ServiceGrid } from './home/ServiceGrid';
import { FeaturedPackagesSection } from './home/FeaturedPackagesSection';
import { VoicePlannerBanner } from './home/VoicePlannerBanner';
import { VisaAssistanceSection } from './home/VisaAssistanceSection';
import { FlightWorkflowSection } from './home/FlightWorkflowSection';
import { WhyAzraqSection } from './home/WhyAzraqSection';
import { EditorialStoriesSection } from './home/EditorialStoriesSection';
import { TravelBuddiesPreview } from './home/TravelBuddiesPreview';
import { FinalTravelCta } from './home/FinalTravelCta';

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
  onOpenVoiceModal?: (initialTranscript?: string) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  destinations,
  onSelectDestination,
  onPlanTripPrompt,
  onQuickGenerateItinerary,
  onNavigateToView,
  onSearchFlights,
  onOpenVisaModal,
  onOpenQuote,
  onOpenLocationFinder,
  onOpenVoiceModal,
}) => {
  const { showToast } = useAuth();
  const { packages, setActivePackageModal, setActiveQuotationModal } = usePackages();

  // Voice Trip Planning Modal State
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceInitialTranscript, setVoiceInitialTranscript] = useState('');

  const handleOpenVoicePlanner = (initialTranscript?: string) => {
    if (onOpenVoiceModal) {
      onOpenVoiceModal(initialTranscript);
    } else {
      setVoiceInitialTranscript(initialTranscript || '');
      setIsVoiceModalOpen(true);
    }
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
    <article className="w-full min-h-screen bg-transparent flex flex-col pb-16 relative">
      <SEOHead
        title="Azraq Trips – Bangladesh’s Smart Travel Platform | Holiday Packages, Flights & Visas"
        description="Book cheap flights, all-inclusive verified Asian holiday packages, fast visa assistance, and customized AI trip itineraries with Azraq Trips Dhaka."
        canonical="https://www.azraqtrips.com/"
        structuredData={getOrganizationSchema()}
      />

      {/* 01 & 02: Cinematic Hero & Quick Travel Action Area */}
      <div className="w-full pb-4 sm:pb-6">
        <HomeHero
          onSearchFlights={(params) => {
            if (onSearchFlights) {
              onSearchFlights(params);
            } else {
              window.location.replace('https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt');
            }
          }}
          onNavigateToView={onNavigateToView}
          onPlanTripPrompt={onPlanTripPrompt}
          onOpenVisaModal={onOpenVisaModal}
          onOpenQuote={onOpenQuote}
          onOpenVoiceModal={handleOpenVoicePlanner}
        />
      </div>

      {/* Trust Strip - Glassy Floating Bar */}
      <div className="w-full py-3.5 border-y border-white/40 bg-white/25 backdrop-blur-md">
        <TrustStrip />
      </div>

      {/* 03: Featured Destinations (Asymmetric Glassy Editorial Layout) */}
      <div className="w-full py-14 sm:py-20 border-b border-white/40 bg-white/30 backdrop-blur-xl">
        <DestinationSection
          destinations={destinations}
          onSelectDestination={onSelectDestination}
          onQuickGenerateItinerary={onQuickGenerateItinerary}
          onSearchFlights={onSearchFlights}
          onNavigateToDestinations={() => onNavigateToView && onNavigateToView('destinations')}
        />
      </div>

      {/* 04: Travel Services (5 Core Pillars - Frosted Translucent) */}
      <div className="w-full py-14 sm:py-20 bg-white/20 backdrop-blur-md">
        <ServiceGrid
          onNavigateToView={onNavigateToView}
          onOpenLocationFinder={onOpenLocationFinder}
        />
      </div>

      {/* 05: Signature Holiday Packages */}
      {packages && packages.length > 0 && (
        <div className="w-full py-14 sm:py-20 border-y border-white/40 bg-white/30 backdrop-blur-xl">
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

      {/* 06: AI Trip Planner Banner */}
      <div className="w-full py-12 sm:py-16">
        <VoicePlannerBanner
          onOpenVoiceModal={handleOpenVoicePlanner}
          onNavigateToPlanner={() => onNavigateToView && onNavigateToView('planner')}
        />
      </div>

      {/* 07: Visa Assistance Desk */}
      <div className="w-full py-14 sm:py-20 border-y border-white/40 bg-white/25 backdrop-blur-md">
        <VisaAssistanceSection
          onOpenVisaModal={onOpenVisaModal}
          onNavigateToVisa={() => onNavigateToView && onNavigateToView('visa')}
        />
      </div>

      {/* 08: Flight Discovery Workflow */}
      <div className="w-full py-14 sm:py-20 bg-white/30 backdrop-blur-xl">
        <FlightWorkflowSection
          onNavigateToFlights={() => {
            window.location.replace('https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt');
          }}
        />
      </div>

      {/* 09: Why Azraq (Authentic Trust & Local Dhaka Office) */}
      <div className="w-full">
        <WhyAzraqSection />
      </div>

      {/* 10: Travel Stories & Editorial Content */}
      <div className="w-full py-14 sm:py-20 bg-white/25 backdrop-blur-md">
        <EditorialStoriesSection
          onSelectGuide={(slug) => {
            if (onNavigateToView) onNavigateToView('guide-detail', { slug });
          }}
          onNavigateToGuides={() => {
            if (onNavigateToView) onNavigateToView('guides');
          }}
        />
      </div>

      {/* 11: Concierge & Travel Buddies Support */}
      <div className="w-full py-14 sm:py-20 bg-white/30 backdrop-blur-xl border-y border-white/40">
        <TravelBuddiesPreview
          onNavigateToBuddies={() => onNavigateToView && onNavigateToView('buddies')}
        />
      </div>

      {/* 12: Final High-Impact Luxury Travel CTA */}
      <div className="w-full py-14 sm:py-20">
        <FinalTravelCta
          onPlanTrip={() => {
            if (onNavigateToView) onNavigateToView('planner');
          }}
          onNavigateToPackages={() => {
            if (onNavigateToView) onNavigateToView('packages');
          }}
          onNavigateToFlights={() => {
            window.location.replace('https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt');
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
            window.location.replace('https://flights.azraqtrips.com/?marker=765415&trs=565363&currency=bdt');
          }
        }}
        initialTranscript={voiceInitialTranscript}
      />
    </article>
  );
};

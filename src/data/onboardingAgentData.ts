import { OnboardingPathResponse } from '../types';

export const PRESET_ONBOARDING_GOALS = [
  {
    id: 'holiday-package',
    label: '🏖️ Find all-inclusive holiday tour packages',
    goal: 'Explore all-inclusive domestic and international holiday tour packages with transparent pricing.',
    category: 'Tours & Packages',
  },
  {
    id: 'visa-documents',
    label: '🛂 Check tourist visa requirements & checklist',
    goal: 'Check official visa document requirements, bank balance rules, and fees for my upcoming trip.',
    category: 'Visa Assistance',
  },
  {
    id: 'flight-deals',
    label: '✈️ Compare direct flights & airfare from Dhaka',
    goal: 'Find cheapest roundtrip and direct flights departing from Dhaka to top Asian destinations.',
    category: 'Flights',
  },
  {
    id: 'ai-itinerary',
    label: '🗺️ Build a custom day-by-day trip itinerary',
    goal: 'Create a tailored multi-day itinerary with sightseeing, hotels, and travel logistics.',
    category: 'Trip Planner',
  },
  {
    id: 'travel-buddies',
    label: '👥 Connect with travel companions heading my way',
    goal: 'Find fellow verified travelers to share tours, rides, and group package discounts.',
    category: 'Community',
  },
];

export const AVAILABLE_PRODUCT_CAPABILITIES = [
  { id: 'packages', name: 'Tour Packages', description: 'Browse and book verified domestic & international vacation packages' },
  { id: 'destinations', name: 'Destinations', description: 'Explore top tourist spots with curated photo galleries and guides' },
  { id: 'visa', name: 'Visa Assistance', description: 'Official embassy visa requirements, pricing, and document assistance' },
  { id: 'flights', name: 'Flight Deals', description: 'Real-time airfare search and route suggestions from Dhaka' },
  { id: 'planner', name: 'AI Trip Planner', description: 'Generate custom day-by-day itineraries and concierge quotes' },
  { id: 'feed', name: 'Travel Buddies', description: 'Connect with verified fellow travelers for group trips' },
];

export const ONBOARDING_STORAGE_KEY = 'azraq_onboarding_agent_state_v1';
export const ONBOARDING_DISMISSED_KEY = 'azraq_onboarding_dismissed_v1';

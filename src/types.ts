export type NavView =
  | 'discover'
  | 'destinations'
  | 'destination-detail'
  | 'guides'
  | 'guide-detail'
  | 'itineraries'
  | 'itinerary-detail'
  | 'packages'
  | 'hotels'
  | 'activities'
  | 'visa'
  | 'visa-detail'
  | 'ai-planner'
  | 'flights'
  | 'feed'
  | 'planner'
  | 'search'
  | 'about'
  | 'contact'
  | 'map'
  | 'profile'
  | 'admin'
  | 'not-found';

export type QuoteStatus =
  | 'New'
  | 'Pending'
  | 'Processing'
  | 'Reviewing'
  | 'Quotation Prepared'
  | 'Quoted'
  | 'Quoted via WhatsApp'
  | 'Quoted via Email'
  | 'Sent'
  | 'Customer Confirmed'
  | 'Booked'
  | 'Lost'
  | 'Expired'
  | 'Closed'
  | 'Archived';

export type AdminRole = 'super_admin' | 'support_agent';

export interface CanonicalFlightOffer {
  offerId: string;
  provider: 'aviasales' | 'travelpayouts' | string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  airline: string;
  airlineCode?: string;
  airlineLogo?: string;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  stops?: number;
  stopAirports?: string[];
  layoverDuration?: string;
  cabin: string;
  passengers: number;
  baggage?: string;
  currency: string;
  totalPrice: number;
  originalPrice?: number;
  originalCurrency?: string;
  priceInBDT?: number;
  taxesIncluded?: boolean;
  bookingUrl: string;
  market?: string;
  fetchedAt: string;
  expiresAt?: string;
  source: string;
  isIndicative?: boolean;
  isStale?: boolean;
}

export interface PriceRevalidationResult {
  success: boolean;
  cachedPrice: number;
  freshPrice: number;
  originalPrice?: number;
  originalCurrency?: string;
  hasIncreased: boolean;
  hasDecreased: boolean;
  isPriceChanged: boolean;
  priceDifference: number;
  currency: string;
  bookingUrl: string;
  revalidatedAt: string;
  status: 'unchanged' | 'increased' | 'decreased' | 'verified';
  hasLiveApiMatch?: boolean;
  airline?: string;
  flightNumber?: string;
  message?: string;
  error?: string;
}

export interface AutocompleteLocation {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode?: string;
  type: 'airport' | 'city';
  isBangladesh?: boolean;
}

export type FlightAnalyticsEventType =
  | 'airport_query'
  | 'airport_selected'
  | 'quick_route_used'
  | 'search_submitted'
  | 'results_returned'
  | 'partner_redirect'
  | 'desk_quote_started'
  | 'flight_search_started'
  | 'origin_selected'
  | 'destination_selected'
  | 'search_completed'
  | 'destination_card_clicked'
  | 'affiliate_deal_clicked';

export interface InternalNote {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  quoteId: string;
  action: string;
  performedBy: string;
  details?: string;
  timestamp: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  quoteId?: string;
  type: 'quote_new' | 'status_change' | 'sla_warning' | 'staff_assigned';
  isRead: boolean;
  createdAt: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar: string;
  specialty: string;
}

export interface FlightQuoteRequest {
  id: string; // e.g. FLQ-849201 or AZR-1024
  type: 'flight';
  tripType: 'One Way' | 'Round Trip' | 'Multi-City';
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  preferredAirline?: string;
  flexibleDate: 'Yes' | 'No';
  additionalRequirements?: string;
  customerName: string;
  email: string;
  phone: string;
  preferredContactMethod?: 'WhatsApp' | 'Email' | 'Phone Call';
  status: QuoteStatus;
  createdAt: string;
  updatedAt?: string;
  staffNote?: string;
  internalNotes?: InternalNote[];
  quotedPrice?: string;
  flightOptions?: string;
  assignedStaff?: string;
  assignedStaffId?: string;
  isArchived?: boolean;
  acknowledgmentSent?: boolean;
}

export interface VisaQuoteRequest {
  id: string; // e.g. VSQ-930214 or AZR-2048
  type: 'visa';
  destinationCountry: string;
  visaType: 'Tourist' | 'Business' | 'Student' | 'Transit' | 'Medical' | 'Other';
  intendedTravelDate: string;
  applicantsCount: number;
  applicantNationality: string;
  passportValidity: string;
  previousVisa: 'Yes' | 'No';
  previousRefusal: 'Yes' | 'No';
  currentResidence: string;
  requiredService: 'Visa Processing' | 'Consultation' | 'Document Assistance' | 'Full Package';
  additionalInfo?: string;
  customerName: string;
  email: string;
  phone: string;
  preferredContactMethod?: 'WhatsApp' | 'Email' | 'Phone Call';
  status: QuoteStatus;
  createdAt: string;
  updatedAt?: string;
  staffNote?: string;
  internalNotes?: InternalNote[];
  quotedPrice?: string;
  visaFee?: string;
  flightOptions?: string;
  assignedStaff?: string;
  assignedStaffId?: string;
  isArchived?: boolean;
  acknowledgmentSent?: boolean;
}

export type QuoteRequest = FlightQuoteRequest | VisaQuoteRequest | PackageQuoteRequest;

export type TimelineDotColor = 'yellow' | 'green' | 'red' | 'blue';

export interface UserFeedItem {
  id: string;
  feedType: 'personal' | 'announcement';
  title: string;
  message: string;
  timestamp: string;
  quoteId?: string;
  quoteType?: 'flight' | 'visa';
  routeOrDestination?: string;
  status?: QuoteStatus | string;
  dotColor: TimelineDotColor;
  isRead?: boolean;
  category?: 'Quote Status' | 'Trip Milestone' | 'Visa Notice' | 'System Alert' | 'Action Required';
  actionUrl?: string;
  actionLabel?: string;
  quotedPrice?: string;
  agentName?: string;
  iconType?: 'mail' | 'phone' | 'message' | 'check' | 'plane' | 'alert' | 'info' | 'bell';
}

export type BrandTheme = 'globetrotter' | 'azraq';

export interface Spot {
  id?: string;
  name: string;
  description: string;
  timeSlot: string;
  category?: 'Sightseeing' | 'Food' | 'Nature' | 'Culture' | 'Nightlife' | string;
  imageUrl?: string;
  aiTip?: string;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  googleMapsUrl?: string;
}

export interface AiNearbySpot {
  name: string;
  category: string;
  distance: string;
  lat: number;
  lng: number;
  quickNote?: string;
}

export interface AiLocationResult {
  id: string;
  query: string;
  name: string;
  alternateNames?: string[];
  category: 'Sightseeing' | 'Food & Dining' | 'Photo Spot' | 'Nature & Beach' | 'Culture & Temple' | 'Hidden Gem' | 'Shopping' | 'Hotel' | string;
  formattedAddress: string;
  lat: number;
  lng: number;
  neighborhood?: string;
  city: string;
  country: string;
  countryFlag?: string;
  googleMapsUrl: string;
  directionsUrl: string;
  description: string;
  exactLocationGuide: string;
  howToReach: {
    fromAirport?: string;
    publicTransit?: string;
    taxiRideshare?: string;
    nearestStation?: string;
    walkingTips?: string;
  };
  bestTimeToVisit?: string;
  admissionPrice?: string;
  openingHours?: string;
  dressCode?: string;
  halalFoodNearby?: string[];
  insiderTips?: string[];
  photoSpots?: string[];
  safetyNotes?: string;
  imageUrl?: string;
  confidenceScore?: number;
  nearbyAttractions?: AiNearbySpot[];
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  summary?: string;
  spots: Spot[];
  aiInsight?: string;
}

export interface PackingCategory {
  category: string;
  items: string[];
}

export type ExpenseCategory =
  | 'Flights'
  | 'Accommodation'
  | 'Activities'
  | 'Food & Dining'
  | 'Transport'
  | 'Shopping'
  | 'Visa & Insurance'
  | 'Miscellaneous';

export type BudgetTier = 'backpacker' | 'economy' | 'moderate' | 'luxury' | 'custom';

export interface BudgetTierOption {
  id: BudgetTier;
  label: string;
  bengaliLabel: string;
  badge: string;
  icon: string;
  priceRangeBDT: string;
  priceRangeUSD: string;
  approxTotalBDT: number;
  approxTotalUSD: number;
  description: string;
  stayType: string;
  foodType: string;
  transportType: string;
}

export const BUDGET_TIER_OPTIONS: BudgetTierOption[] = [
  {
    id: 'backpacker',
    label: 'Pocket-Friendly / Backpacker',
    bengaliLabel: 'সাধারণ ও স্টুডেন্ট পকেট বাজেট',
    badge: 'Saver / Budget',
    icon: '🎒',
    priceRangeBDT: '৳55,000 - ৳80,000',
    priceRangeUSD: '$450 - $680',
    approxTotalBDT: 68000,
    approxTotalUSD: 560,
    description: 'Realistic budget exploration using budget airfare, top-rated hostels/guesthouses, local public transit, and vibrant street markets.',
    stayType: 'Clean Hostels, Local Guesthouses & Homestays (~৳1,800 - ৳3,200/night)',
    foodType: 'Authentic Street Food, Local Food Courts & Night Markets (~৳1,200 - ৳2,000/day)',
    transportType: 'Public Metro, Suburban Trains, Shared Vans & Buses (~৳500 - ৳900/day)',
  },
  {
    id: 'economy',
    label: 'Smart Economy / Standard',
    bengaliLabel: 'নরমাল ও রেগুলার স্ট্যান্ডার্ড বাজেট',
    badge: 'Most Popular',
    icon: '🪙',
    priceRangeBDT: '৳80,000 - ৳125,000',
    priceRangeUSD: '$680 - $1,050',
    approxTotalBDT: 98000,
    approxTotalUSD: 820,
    description: 'The standard realistic holiday package: scheduled flights with checked bags, central 2-3★ hotels with breakfast, rideshare apps, and key attractions.',
    stayType: 'Private 2-3★ Hotels, Studio Airbnbs with AC (~৳4,000 - ৳6,500/night)',
    foodType: 'Cozy Cafes, Popular Local Restaurants, Halal Eateries (~৳2,000 - ৳3,500/day)',
    transportType: 'City Metro Passes & Rideshare Apps (Grab/Bolt/Uber) (~৳1,000 - ৳2,000/day)',
  },
  {
    id: 'moderate',
    label: 'Comfort & Family',
    bengaliLabel: 'মিডিয়াম ও ফ্যামিলি কমফোর্ট',
    badge: 'Great Comfort',
    icon: '🏨',
    priceRangeBDT: '৳130,000 - ৳210,000',
    priceRangeUSD: '$1,100 - $1,750',
    approxTotalBDT: 165000,
    approxTotalUSD: 1380,
    description: 'Premium flights, curated 4★ hotels with swimming pool & buffet breakfast, guided day tours, and private airport transfers.',
    stayType: '4★ City Hotels with Breakfast, Boutique Stays (~৳8,000 - ৳14,000/night)',
    foodType: 'Reputed Restaurants, Buffet Breakfasts, Rooftop Dining (~৳3,500 - ৳6,000/day)',
    transportType: 'Private Air-conditioned Cabs, Airport Transfers & Day Coaches (~৳2,500 - ৳4,500/day)',
  },
  {
    id: 'luxury',
    label: 'Luxury & VIP',
    bengaliLabel: 'লাক্সারি ও ভিআইপি এস্কেপ',
    badge: '5-Star Premium',
    icon: '✨',
    priceRangeBDT: '৳220,000 - ৳450,000+',
    priceRangeUSD: '$1,850 - $3,800+',
    approxTotalBDT: 290000,
    approxTotalUSD: 2400,
    description: 'Top-tier 5-star international hotels, private speedboat/limo transfers, fine dining, private tours, and bespoke VIP service.',
    stayType: '5★ Luxury Resorts, Overwater Villas, Suite Stays (~৳22,000 - ৳55,000+/night)',
    foodType: 'Fine Dining, Gourmet Seafood & Exclusive Beach Lounges (~৳7,000 - ৳15,000+/day)',
    transportType: 'Private Chauffeur, Yacht Charters & VIP Airport Fast-Track (~৳5,000 - ৳12,000+/day)',
  },
];

export interface BudgetItem {
  id: string;
  name: string;
  category: ExpenseCategory;
  estimatedCost: number;
  actualCost?: number;
  isPaid?: boolean;
  dayNumber?: number;
  spotName?: string;
  notes?: string;
}

export interface ItineraryBudget {
  currency: string;
  totalBudget: number;
  items: BudgetItem[];
}

export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  durationDays: number;
  weatherSummary: string;
  aiSummary: string;
  days: ItineraryDay[];
  packingList: PackingCategory[];
  budget?: ItineraryBudget;
  savedAt?: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timeAgo: string;
}

export interface FeedPost {
  id: string;
  authorId?: string;
  authorEmail?: string;
  authorName: string;
  authorAvatar: string;
  location: string;
  badgeLabel?: string;
  imageUrl: string;
  likes: number;
  commentsCount: number;
  caption: string;
  hashtags: string[];
  timeAgo: string;
  isLiked: boolean;
  isBookmarked: boolean;
  commentsList: Comment[];
  aiVerified?: boolean;
  likedBy?: string[];
  bookmarkedBy?: string[];
  createdAt?: string | any;
}

export interface PricingTier {
  pax: number;
  price: number;
}

export interface PackageItineraryDay {
  day: number | string;
  title: string;
  activities: string[];
  meals?: string;
  overnight?: string;
}

export interface DestinationRecord {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  active: boolean;
  packageCount?: number;
}

export interface TourPackage {
  id: string;
  destination_id: string;
  destination_name: string;
  country: string;
  package_name: string;
  duration: string;
  price: number; // Starting price
  currency: string;
  pricing_tiers: PricingTier[];
  description: string;
  itinerary: PackageItineraryDay[];
  hotel: string;
  meals: string;
  transportation: string;
  inclusions: string[];
  exclusions: string[];
  visa_information: string;
  required_documents: string[];
  important_notes: string[];
  terms_conditions: string[];
  source_pdf: string;
  status: 'published' | 'draft' | 'archived';
  is_published?: boolean;
  created_at: string;
  updated_at: string;
  images: string[];
  highlights: string[];
  departure_info?: string;
  number_of_travelers?: string;
  contact_info?: string;
  visa_fee?: string;
}

export interface PackageQuoteRequest {
  id: string;
  type: 'package';
  customerName: string;
  email: string;
  phone: string;
  destination: string;
  destinationCountry?: string;
  package_id: string;
  package_name: string;
  travelDate: string;
  adults: number;
  children: number;
  specialRequirements?: string;
  message?: string;
  preferredContactMethod?: 'WhatsApp' | 'Email' | 'Phone Call';
  status: QuoteStatus;
  createdAt: string;
  updatedAt?: string;
  staffNote?: string;
  internalNotes?: InternalNote[];
  quotedPrice?: string;
  visaFee?: string;
  flightOptions?: string;
  assignedStaff?: string;
  assignedStaffId?: string;
  isArchived?: boolean;
  acknowledgmentSent?: boolean;
}

export interface Destination {
  id: string;
  name: string;
  cityRegion?: string;
  region?: string;
  country: string;
  flag?: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fallbackImage?: string;
  category: 'Beach' | 'Culture' | 'Nature' | 'City' | 'Mountain' | 'Adventure' | 'Wildlife' | 'Luxury' | string;
  rating?: number;
  bestTimeToVisit?: string;
  recommendedDays?: string;
  estimatedBudget?: string;
  priceRange?: string;
  popularAttractions?: string[];
  attractions?: string[];
  flightDuration?: string;
  activities?: string[];
  thingsToDo?: string[];
  localFood?: string[];
  currency?: string;
  visaInfo?: string;
  visaFee?: string;
  travelTips?: string[];
  lat?: number;
  lng?: number;
  coordinates?: { lat: number; lng: number };
  badge?: string;
  weather?: string;
  matchScore?: number;
  highlights?: string[];
  isPopular?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  places?: Array<{
    title: string;
    uri: string;
    reviewSnippets?: string[];
  }>;
  isMapsGrounded?: boolean;
}

export interface TrendingHashtag {
  tag: string;
  postsCount: string;
  isRising?: boolean;
}

export interface User {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  nationality?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  travelStyle?: string;
  travelStyles?: string[];
  travelInterests?: string[];
  preferredDestinations?: string[];
  photoURL?: string;
  bio?: string;
  languages?: string[];
  emailVerified: boolean;
  phoneVerified?: boolean;
  isSuspended?: boolean;
  provider: 'email' | 'google' | 'apple' | 'facebook';
  createdAt: string;
  updatedAt?: string;
  homeLocation?: string;
  travelPreferences?: string[];
  savedDestinationIds?: string[];
  isProfileComplete?: boolean;
  isAdmin?: boolean;
  role?: 'admin' | 'user' | 'owner';
}

export function isWebsiteOwner(user: User | null): boolean {
  if (!user) return false;
  if (user.isAdmin || user.role === 'admin' || user.role === 'owner') return true;
  const ownerEmails = [
    'info@azraqtrips.com',
    'istihadahmed1163@gmail.com',
    'admin@globetrotter.ai',
    'owner@globetrotter.ai',
  ];
  const email = (user.email || '').toLowerCase();
  return ownerEmails.includes(email) || email.startsWith('admin') || email.startsWith('owner');
}

export type AuthModalView =
  | 'guest_prompt'
  | 'login'
  | 'register'
  | 'forgot_password'
  | 'email_verification'
  | 'otp_entry'
  | 'otp_verify'
  | 'profile_setup'
  | 'phone_otp'
  | 'onboarding'
  | 'google_prompt';

export interface PendingAction {
  type:
    | 'like_post'
    | 'bookmark_post'
    | 'comment_post'
    | 'follow_traveler'
    | 'save_destination'
    | 'create_post'
    | 'write_review'
    | 'send_message'
    | 'save_itinerary'
    | 'generate_itinerary'
    | 'submit_quote';
  label: string;
  payload?: any;
  onExecute?: () => void;
}

export interface ToastNotification {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

export type BlogCategory =
  | 'Destination Guide'
  | 'Visa Update'
  | 'Client Spotlight'
  | 'Travel Tips'
  | 'Photo Dump'
  | 'Reel'
  | 'Testimonial'
  | 'Travel Tip'
  | 'Poll'
  | 'Client Win';

export type PostMediaType =
  | 'photo_dump'
  | 'reel'
  | 'testimonial'
  | 'travel_tip'
  | 'poll'
  | 'client_win'
  | 'article';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PostComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timeAgo: string;
  likes?: number;
}

export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
  handle?: string;
  verified?: boolean;
  bio?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: BlogCategory;
  mediaType?: PostMediaType;
  excerpt: string;
  content: string;
  coverImage: string;
  images?: string[];
  videoUrl?: string;
  videoPoster?: string;
  headlineOverlay?: string;
  location?: string;
  author: BlogAuthor;
  publishedAt: string;
  readTime: string;
  tags: string[];
  seoDescription: string;
  viewsCount?: number;
  likesCount?: number;
  commentsCount?: number;
  commentsList?: PostComment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  featured?: boolean;
  pollData?: {
    question: string;
    options: PollOption[];
    totalVotes: number;
    userVotedOptionId?: string;
  };
  testimonialMeta?: {
    clientName: string;
    trip: string;
    rating: number;
    destination: string;
  };
  ctaText?: string;
  ctaType?: 'whatsapp' | 'quote_flight' | 'quote_visa' | 'inquire';
}

export interface StorySlide {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  headline: string;
  caption: string;
  location?: string;
  badge?: string;
  ctaText?: string;
  ctaType?: 'whatsapp' | 'quote_flight' | 'quote_visa' | 'explore';
  ctaDestination?: string;
  dateAgo?: string;
}

export interface StoryHighlight {
  id: string;
  title: string;
  emoji: string;
  coverImage: string;
  category: string;
  unread?: boolean;
  slides: StorySlide[];
}

export interface SocialProofActivity {
  id: string;
  type: 'flight_quote' | 'visa_quote' | 'package_booking' | 'visa_approval';
  actorAnonymized: string;
  actionText: string;
  destination: string;
  timeAgo: string;
  iconType: 'plane' | 'visa' | 'hotel' | 'check' | 'sparkles';
  timestamp: string;
}

export interface UserTripTimelineEvent {
  id: string;
  quoteId: string;
  status: QuoteStatus;
  stepTitle: string;
  description: string;
  timestamp: string;
  dotColor: 'yellow' | 'blue' | 'green' | 'purple' | 'gray';
  agentName?: string;
  actionType?: string;
}

export type BuddyContactPreference = 'WhatsApp' | 'Email' | 'In-app only';
export type BuddyVisibility = 'public' | 'matches';
export type BuddyRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface TravelBuddyProfile {
  id: string; // userId
  displayName: string;
  avatarUrl: string;
  homeLocation: string;
  bio: string;
  destinations: string[];
  travelStyles: string[];
  languages: string[];
  travelStart?: string;
  travelEnd?: string;
  groupSize: number;
  contactPreference: BuddyContactPreference;
  visibility: BuddyVisibility;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
  email?: string;
  phone?: string;
}

export interface TravelBuddyRequest {
  id: string; // `${senderUid}__${receiverUid}`
  senderId: string;
  receiverId: string;
  senderProfile?: Partial<TravelBuddyProfile>;
  receiverProfile?: Partial<TravelBuddyProfile>;
  message: string;
  status: BuddyRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MatchedTravelBuddy extends TravelBuddyProfile {
  matchScore: number;
  matchedOn: string[];
  requestStatus?: BuddyRequestStatus | 'connected';
  requestDirection?: 'incoming' | 'outgoing';
  activeRequestId?: string;
  existingRequest?: TravelBuddyRequest;
}

export interface TravelCommunity {
  id: string;
  name: string;
  destination: string;
  image: string;
  description: string;
  members: string[]; // user IDs
  memberCount: number;
  postsCount: number;
  createdAt?: string;
  created_at?: string;
  creatorId?: string;
  creator_id?: string;
  tags?: string[];
  isJoined?: boolean;
  is_member?: boolean;
}

export type GroupTripStatus = 'open' | 'filling_fast' | 'full' | 'completed';

export interface GroupTrip {
  id: string;
  title: string;
  destination: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  budgetBDT?: number; // budget in Bangladeshi Taka
  budget_bdt?: number;
  maxTravelers?: number;
  max_travelers?: number;
  currentTravelers?: string[]; // user IDs
  current_travelers?: string[];
  travelersCount?: number;
  travelers_count?: number;
  travelStyle?: string;
  travel_style?: string;
  status: GroupTripStatus;
  hostId?: string;
  host_id?: string;
  hostName?: string;
  host_name?: string;
  hostAvatar?: string;
  host_avatar?: string;
  hostLocation?: string;
  hostVerified?: boolean;
  description: string;
  itineraryHighlights?: string[];
  createdAt?: string;
  created_at?: string;
  isJoined?: boolean;
  is_joined?: boolean;
  isHost?: boolean;
}

export type SocialPostType =
  | 'Travel Story'
  | 'Buddy Request'
  | 'Trip Plan'
  | 'Travel Update'
  | 'story'
  | 'buddy_request'
  | 'trip_plan'
  | 'update';

export interface TripPlanDetails {
  destination?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  estimatedBudgetBDT?: number;
  estimated_budget?: string | number;
  travelStyle?: string;
  slotsAvailable?: number;
  spots_available?: number;
  preferredGroupSize?: number;
}

export interface SocialNotification {
  id: string;
  recipientId?: string;
  recipient_id?: string;
  senderId?: string;
  sender_id?: string;
  senderName?: string;
  senderAvatar?: string;
  actor_name?: string;
  actor_avatar?: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string;
  action_url?: string;
  isRead?: boolean;
  is_read?: boolean;
  createdAt?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

// --- Onboarding Agent Interfaces ---
export interface OnboardingStep {
  id?: string;
  title: string;
  description: string;
  why_it_matters: string;
  action_label: string;
  action_target: string;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

export interface OnboardingPrimaryCta {
  label: string;
  action: string;
}

export interface OnboardingPathResponse {
  welcome_message: string;
  summary: string;
  steps: OnboardingStep[];
  primary_cta: OnboardingPrimaryCta;
  fallback_message?: string;
}

// --- Smart Search Interfaces ---
export type SmartSearchResultType =
  | 'page'
  | 'feature'
  | 'product'
  | 'article'
  | 'template'
  | 'setting'
  | 'action'
  | 'other';

export interface SmartSearchResultItem {
  id?: string;
  title: string;
  description: string;
  type: SmartSearchResultType;
  url: string;
  reason: string;
  action_label: string;
  badge?: string;
  price?: string;
  category?: string;
}

export interface SmartSearchSuggestedAction {
  label: string;
  target: string;
}

export interface SmartSearchResponse {
  interpreted_intent: string;
  answer: string;
  results: SmartSearchResultItem[];
  suggested_actions: SmartSearchSuggestedAction[];
  related_searches: string[];
  confidence: 'high' | 'medium' | 'low';
}






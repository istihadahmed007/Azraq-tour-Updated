import React, { useState, useMemo } from 'react';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';
import { SITE_URL, getBreadcrumbSchema } from '../lib/seo';
import { hotelService, HotelQuoteRequest } from '../services/hotelService';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Filter,
  Grid,
  List,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  Sparkles,
  Wifi,
  Coffee,
  Utensils,
  Car,
  Tv,
  Waves,
  ShieldCheck,
  ArrowRight,
  Info,
  DollarSign,
  X,
  MessageCircle,
} from 'lucide-react';

export interface HotelItem {
  id: string;
  name: string;
  destination: string;
  city: string;
  country: string;
  stars: number;
  ratingScore: number;
  reviewCount: number;
  reviewLabel: string;
  pricePerNightBDT: number;
  originalPriceBDT: number;
  roomType: string;
  imageUrl: string;
  amenities: string[];
  propertyType: 'Luxury Resort' | 'City Hotel' | 'Boutique Hotel' | 'Family Suite' | 'Villa';
  featuredTag?: string;
  halalCertified?: boolean;
  breakfastIncluded?: boolean;
  freeCancellation?: boolean;
  distanceToCenter?: string;
}

export const CURATED_HOTELS: HotelItem[] = [
  {
    id: 'htl-bkk-landmark',
    name: 'The Landmark Bangkok Sukhumvit',
    destination: 'Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    stars: 5,
    ratingScore: 9.1,
    reviewCount: 2840,
    reviewLabel: 'Exceptional',
    pricePerNightBDT: 14500,
    originalPriceBDT: 18900,
    roomType: 'Premium King Room (City Skyline View)',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    amenities: ['Halal Breakfast', 'Swimming Pool', 'Free High-Speed WiFi', 'Airport Shuttle', 'Fitness Center', 'Spa'],
    propertyType: 'Luxury Resort',
    featuredTag: 'Bestseller for BD Travelers',
    halalCertified: true,
    breakfastIncluded: true,
    freeCancellation: true,
    distanceToCenter: '50m from Nana BTS Station',
  },
  {
    id: 'htl-bkk-amari-watergate',
    name: 'Amari Bangkok Pratunam',
    destination: 'Bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    stars: 5,
    ratingScore: 8.9,
    reviewCount: 3120,
    reviewLabel: 'Excellent',
    pricePerNightBDT: 12800,
    originalPriceBDT: 16500,
    roomType: 'Deluxe City View Twin/King',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    amenities: ['Halal Dining', 'Rooftop Pool', 'Free WiFi', 'Pratunam Market Walking Distance', 'Spa'],
    propertyType: 'City Hotel',
    featuredTag: 'Shopping Hub',
    halalCertified: true,
    breakfastIncluded: true,
    freeCancellation: true,
    distanceToCenter: 'Pratunam Market Opposite',
  },
  {
    id: 'htl-kl-traders',
    name: 'Traders Hotel by Shangri-La Kuala Lumpur',
    destination: 'Kuala Lumpur',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    stars: 5,
    ratingScore: 9.3,
    reviewCount: 4210,
    reviewLabel: 'Superb',
    pricePerNightBDT: 11900,
    originalPriceBDT: 15200,
    roomType: 'Deluxe Twin Room (Direct Petronas Towers View)',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
    amenities: ['Twin Towers View', 'Halal Certified Kitchen', 'SkyBar Pool', 'Free WiFi', 'KLCC Buggy Service'],
    propertyType: 'City Hotel',
    featuredTag: 'Iconic View',
    halalCertified: true,
    breakfastIncluded: true,
    freeCancellation: true,
    distanceToCenter: 'Direct access to KLCC Park',
  },
  {
    id: 'htl-kl-swiss-garden',
    name: 'Swiss-Garden Hotel & Residences Bukit Bintang',
    destination: 'Kuala Lumpur',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    stars: 4,
    ratingScore: 8.6,
    reviewCount: 2450,
    reviewLabel: 'Very Good',
    pricePerNightBDT: 6800,
    originalPriceBDT: 8900,
    roomType: 'Executive Deluxe Room',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    amenities: ['Outdoor Pool', 'Free WiFi', 'Breakfast Buffet', 'Jalan Alor Street Food Access'],
    propertyType: 'Family Suite',
    featuredTag: 'Best Value',
    halalCertified: true,
    breakfastIncluded: true,
    freeCancellation: true,
    distanceToCenter: '5 mins to Bukit Bintang MRT',
  },
  {
    id: 'htl-sg-mbs',
    name: 'Marina Bay Sands Singapore',
    destination: 'Singapore',
    city: 'Singapore',
    country: 'Singapore',
    stars: 5,
    ratingScore: 9.4,
    reviewCount: 6540,
    reviewLabel: 'World Icon',
    pricePerNightBDT: 68000,
    originalPriceBDT: 79000,
    roomType: 'Sands Premier Room (Gardens View)',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    amenities: ['World-Famous Infinity Pool', 'Banyan Tree Spa', 'Skypark Access', 'Free WiFi', 'Fine Dining'],
    propertyType: 'Luxury Resort',
    featuredTag: 'Ultra Luxury',
    halalCertified: false,
    breakfastIncluded: true,
    freeCancellation: true,
    distanceToCenter: 'Bayfront MRT Connected',
  },
  {
    id: 'htl-sg-v-hotel-lavender',
    name: 'V Hotel Lavender Singapore',
    destination: 'Singapore',
    city: 'Singapore',
    country: 'Singapore',
    stars: 4,
    ratingScore: 8.4,
    reviewCount: 5120,
    reviewLabel: 'Convenient Hub',
    pricePerNightBDT: 14200,
    originalPriceBDT: 17500,
    roomType: 'Superior Queen Room',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    amenities: ['Direct MRT Station Access', 'Outdoor Pool', 'Free WiFi', 'Halal Food Nearby'],
    propertyType: 'City Hotel',
    featuredTag: 'Top Pick for Transit',
    halalCertified: true,
    breakfastIncluded: false,
    freeCancellation: true,
    distanceToCenter: 'Directly Above Lavender MRT',
  },
  {
    id: 'htl-bali-ayana',
    name: 'AYANA Resort and Spa Jimbaran',
    destination: 'Bali',
    city: 'Bali',
    country: 'Indonesia',
    stars: 5,
    ratingScore: 9.5,
    reviewCount: 3890,
    reviewLabel: 'Paradise Luxury',
    pricePerNightBDT: 34000,
    originalPriceBDT: 42000,
    roomType: 'Resort View King Suite with Ocean Breeze',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    amenities: ['Private Beach', '12 Swimming Pools', 'Rock Bar Priority Access', 'Thalassotherapy Spa', 'Free WiFi'],
    propertyType: 'Luxury Resort',
    featuredTag: 'Honeymoon Favorite',
    halalCertified: true,
    breakfastIncluded: true,
    freeCancellation: true,
    distanceToCenter: 'Private Cliffside Jimbaran',
  },
  {
    id: 'htl-bali-anvaya',
    name: 'The Anvaya Beach Resort Kuta',
    destination: 'Bali',
    city: 'Bali',
    country: 'Indonesia',
    stars: 5,
    ratingScore: 9.0,
    reviewCount: 2950,
    reviewLabel: 'Beachfront Gem',
    pricePerNightBDT: 13500,
    originalPriceBDT: 17800,
    roomType: 'Deluxe Pool Access Room',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    amenities: ['Direct Beachfront', '5 Lagoon Pools', 'Halal Dining Options', 'Kids Club', 'Free Airport Shuttle'],
    propertyType: 'Luxury Resort',
    featuredTag: 'Direct Beach',
    halalCertified: true,
    breakfastIncluded: true,
    freeCancellation: true,
    distanceToCenter: '500m to Waterbom Bali',
  },
  {
    id: 'htl-dxb-atlantis',
    name: 'Atlantis, The Palm Dubai',
    destination: 'Dubai',
    city: 'Dubai',
    country: 'UAE',
    stars: 5,
    ratingScore: 9.3,
    reviewCount: 7890,
    reviewLabel: 'Iconic Resort',
    pricePerNightBDT: 52000,
    originalPriceBDT: 65000,
    roomType: 'Ocean King Room (Arabian Sea View)',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    amenities: ['Aquaventure Waterpark Included', 'Lost Chambers Aquarium', 'Private Beach', 'Halal Dining', 'Spa'],
    propertyType: 'Luxury Resort',
    featuredTag: 'Theme Park Included',
    halalCertified: true,
    breakfastIncluded: true,
    freeCancellation: true,
    distanceToCenter: 'Palm Jumeirah Crescent',
  },
  {
    id: 'htl-dxb-rovee-downtown',
    name: 'Rove Downtown Dubai',
    destination: 'Dubai',
    city: 'Dubai',
    country: 'UAE',
    stars: 4,
    ratingScore: 9.1,
    reviewCount: 4620,
    reviewLabel: 'Superb Value',
    pricePerNightBDT: 11500,
    originalPriceBDT: 14800,
    roomType: 'Rover Room (Burj Khalifa View)',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    amenities: ['Burj Khalifa View Pool', 'Free High-Speed WiFi', '24/7 Supermarket', 'Laundromat', 'Cinema'],
    propertyType: 'City Hotel',
    featuredTag: 'Burj Khalifa View',
    halalCertified: true,
    breakfastIncluded: false,
    freeCancellation: true,
    distanceToCenter: '5 mins to Dubai Mall',
  },
  {
    id: 'htl-cxb-sayeman',
    name: "Sayeman Beach Resort Cox's Bazar",
    destination: "Cox's Bazar",
    city: "Cox's Bazar",
    country: 'Bangladesh',
    stars: 5,
    ratingScore: 9.2,
    reviewCount: 3180,
    reviewLabel: 'Beachfront Premium',
    pricePerNightBDT: 10500,
    originalPriceBDT: 13500,
    roomType: 'Infinity Sea View Room with Private Balcony',
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    amenities: ['Direct Kolatoli Beach', 'Infinity Ocean Pool', 'Halal Buffet Breakfast', 'Gym', 'Free WiFi'],
    propertyType: 'Luxury Resort',
    featuredTag: 'Top Pick BD',
    halalCertified: true,
    breakfastIncluded: true,
    freeCancellation: true,
    distanceToCenter: 'Marine Drive Kolatoli',
  },
  {
    id: 'htl-sylhet-grand-sultan',
    name: 'Grand Sultan Tea Resort & Golf Sreemangal',
    destination: 'Sylhet',
    city: 'Sreemangal',
    country: 'Bangladesh',
    stars: 5,
    ratingScore: 9.4,
    reviewCount: 2190,
    reviewLabel: 'Nature Luxury',
    pricePerNightBDT: 13800,
    originalPriceBDT: 17200,
    roomType: 'King Deluxe Tea Garden View',
    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    amenities: ['9-Hole Golf Course', '3 Temperature-Controlled Pools', 'Halal Dining', 'Spa', 'Tea Garden Trails'],
    propertyType: 'Luxury Resort',
    featuredTag: 'Nature Retreat',
    halalCertified: true,
    breakfastIncluded: true,
    freeCancellation: true,
    distanceToCenter: 'Radhanagar, Sreemangal',
  },
];

interface HotelsViewProps {
  onNavigateToView?: (view: string) => void;
}

export const HotelsView: React.FC<HotelsViewProps> = ({ onNavigateToView }) => {
  const { user, showToast } = useAuth();

  // Search & Filter State
  const [searchDestination, setSearchDestination] = useState<string>('All');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [checkOutDate, setCheckOutDate] = useState<string>(
    new Date(Date.now() + 86400000 * 11).toISOString().split('T')[0]
  );
  const [guestCount, setGuestCount] = useState<number>(2);
  const [roomCount, setRoomCount] = useState<number>(1);
  const [selectedStar, setSelectedStar] = useState<number | 'All'>('All');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('All');
  const [halalOnly, setHalalOnly] = useState<boolean>(false);
  const [breakfastOnly, setBreakfastOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(75000);
  const [sortBy, setSortBy] = useState<'recommended' | 'priceAsc' | 'priceDesc' | 'rating'>('recommended');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Hotel Quotation Modal
  const [activeHotelQuote, setActiveHotelQuote] = useState<HotelItem | null>(null);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialNotes: '',
  });

  const destinationsList = useMemo(() => {
    return ['All', 'Bangkok', 'Kuala Lumpur', 'Singapore', 'Bali', 'Dubai', "Cox's Bazar", 'Sylhet'];
  }, []);

  const filteredHotels = useMemo(() => {
    return CURATED_HOTELS.filter((hotel) => {
      const matchDest =
        searchDestination === 'All' ||
        hotel.destination.toLowerCase().includes(searchDestination.toLowerCase()) ||
        hotel.country.toLowerCase().includes(searchDestination.toLowerCase());

      const matchKeyword =
        !searchKeyword.trim() ||
        hotel.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        hotel.destination.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        hotel.country.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        hotel.amenities.some((a) => a.toLowerCase().includes(searchKeyword.toLowerCase()));

      const matchStar = selectedStar === 'All' || hotel.stars === selectedStar;
      const matchType = selectedPropertyType === 'All' || hotel.propertyType === selectedPropertyType;
      const matchHalal = !halalOnly || hotel.halalCertified;
      const matchBreakfast = !breakfastOnly || hotel.breakfastIncluded;
      const matchPrice = hotel.pricePerNightBDT <= maxPrice;

      return matchDest && matchKeyword && matchStar && matchType && matchHalal && matchBreakfast && matchPrice;
    }).sort((a, b) => {
      if (sortBy === 'priceAsc') return a.pricePerNightBDT - b.pricePerNightBDT;
      if (sortBy === 'priceDesc') return b.pricePerNightBDT - a.pricePerNightBDT;
      if (sortBy === 'rating') return b.ratingScore - a.ratingScore;
      return 0; // Default recommended
    });
  }, [
    searchDestination,
    searchKeyword,
    selectedStar,
    selectedPropertyType,
    halalOnly,
    breakfastOnly,
    maxPrice,
    sortBy,
  ]);

  const handleOpenHotelQuote = (hotel: HotelItem) => {
    setActiveHotelQuote(hotel);
    setQuoteForm({
      name: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      specialNotes: '',
    });
  };

  const handleSubmitHotelQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHotelQuote) return;

    if (!quoteForm.name.trim() || !quoteForm.phone.trim()) {
      showToast('Please provide your name and contact phone number.', 'error');
      return;
    }

    setIsSubmittingQuote(true);
    try {
      await hotelService.requestHotelQuote({
        customerName: quoteForm.name,
        email: quoteForm.email || 'traveler@azraqtrips.com',
        phone: quoteForm.phone,
        destination: activeHotelQuote.destination,
        hotelName: activeHotelQuote.name,
        checkInDate,
        checkOutDate,
        roomType: activeHotelQuote.roomType,
        guestsCount: guestCount,
        budgetBDT: activeHotelQuote.pricePerNightBDT,
        specialRequests: quoteForm.specialNotes,
      });

      showToast(`Hotel quote request for ${activeHotelQuote.name} submitted! Our Dhaka desk will contact you via WhatsApp.`, 'success');
      setActiveHotelQuote(null);
    } catch {
      showToast('Could not submit quote. Please contact +880 1851-172032 directly.', 'error');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const canonicalUrl = `${SITE_URL}/hotels`;
  const structuredData = [
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Hotels & Resorts', url: '/hotels' },
    ]),
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-24 text-slate-900">
      <SEOHead
        title="Hotels & Resorts for Bangladeshi Travelers – AzraqTrips"
        description="Book verified 4-star and 5-star hotels in Bangkok, Kuala Lumpur, Singapore, Bali, Dubai, and Cox's Bazar. Transparent BDT pricing, halal dining options, and instant room hold."
        canonical={canonicalUrl}
        keywords={[
          'Bangkok hotels for Bangladeshi',
          'Kuala Lumpur hotels BDT',
          'Singapore hotels halal breakfast',
          'Bali luxury resorts Dhaka',
          'Dubai hotels Burj view',
          'Coxs Bazar 5 star hotel booking',
        ]}
        structuredData={structuredData}
      />

      {/* Hero Search Section */}
      <section className="bg-gradient-to-r from-[#002f6c] via-[#0759B8] to-[#003B80] text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto space-y-6">
          <Breadcrumbs
            items={[
              { name: 'Home', onClick: () => onNavigateToView && onNavigateToView('discover') },
              { name: 'Hotels & Resorts' },
            ]}
            className="text-white/80"
          />

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-[#5BC7F4]" />
              <span>Verified Hotel Booking & Offline Hold</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-poppins">
              Hotels & Resorts <span className="text-[#5BC7F4]">Curated for You</span>
            </h1>

            <p className="text-sm sm:text-base text-sky-100 max-w-2xl leading-relaxed">
              Compare 4★ & 5★ properties with guaranteed Halal dining, prime central locations, and seamless offline room reservations via our Dhaka Concierge Desk.
            </p>
          </div>

          {/* Unified Hotel Search Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/30 text-slate-900 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Destination Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#0759B8]" />
                  <span>Destination / City</span>
                </label>
                <select
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-[#0759B8]"
                >
                  {destinationsList.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Popular Destinations' : `${d}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Check-In / Check-Out */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#0759B8]" />
                  <span>Check-In & Check-Out</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
                  />
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Guests & Rooms */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#0759B8]" />
                  <span>Guests & Rooms</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                  <select
                    value={roomCount}
                    onChange={(e) => setRoomCount(Number(e.target.value))}
                    className="w-full px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900"
                  >
                    {[1, 2, 3, 4].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Room' : 'Rooms'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#0759B8]" />
                  <span>Hotel Name / Amenity</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="e.g. Sukhumvit, Pool..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => setSearchKeyword('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px]">Quick Filters:</span>

                <button
                  type="button"
                  onClick={() => setHalalOnly(!halalOnly)}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    halalOnly
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Utensils className="w-3 h-3" />
                  <span>Halal Certified</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBreakfastOnly(!breakfastOnly)}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    breakfastOnly
                      ? 'bg-[#0759B8] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Coffee className="w-3 h-3" />
                  <span>Breakfast Included</span>
                </button>

                <div className="flex items-center gap-1">
                  {[5, 4, 3].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStar(selectedStar === star ? 'All' : star)}
                      className={`px-2.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        selectedStar === star
                          ? 'bg-amber-400 text-slate-950 shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{star}</span>
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">
                  Showing <strong className="text-slate-900">{filteredHotels.length}</strong> verified properties
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Controls Bar: Sort and View Mode */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="recommended">Recommended by Azraq</option>
              <option value="priceAsc">Price: Low to High (৳)</option>
              <option value="priceDesc">Price: High to Low (৳)</option>
              <option value="rating">Highest Guest Rating</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-semibold text-slate-500 mr-1">View:</span>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#0759B8] text-white border-[#0759B8]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#0759B8] text-white border-[#0759B8]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredHotels.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#0759B8] flex items-center justify-center mx-auto">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-poppins">No hotels match your filters</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Try adjusting your destination, budget slider, or clearing the star rating filter to see more options.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchDestination('All');
                setSearchKeyword('');
                setSelectedStar('All');
                setSelectedPropertyType('All');
                setHalalOnly(false);
                setBreakfastOnly(false);
                setMaxPrice(75000);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#0759B8] text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Hotel Listings (Grid / List) */
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-6'
            }
          >
            {filteredHotels.map((hotel) => (
              <div
                key={hotel.id}
                className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#0759B8]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between group ${
                  viewMode === 'list' ? 'md:flex-row' : ''
                }`}
              >
                {/* Image Section */}
                <div
                  className={`relative overflow-hidden bg-slate-950 ${
                    viewMode === 'list' ? 'md:w-80 h-56 md:h-auto shrink-0' : 'h-52 w-full'
                  }`}
                >
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Destination Badge */}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-950/80 backdrop-blur-md text-sky-200 border border-white/20">
                    {hotel.city}, {hotel.country}
                  </span>

                  {/* Featured Tag */}
                  {hotel.featuredTag && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-md">
                      {hotel.featuredTag}
                    </span>
                  )}

                  {/* Rating Overlay */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
                    <span className="px-2 py-0.5 rounded-lg bg-[#0759B8] text-white text-xs font-black">
                      {hotel.ratingScore}
                    </span>
                    <span className="text-xs font-bold text-sky-100">{hotel.reviewLabel}</span>
                    <span className="text-[10px] text-slate-300">({hotel.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Stars and Property Type */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: hotel.stars }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-slate-500 ml-1 font-semibold">{hotel.propertyType}</span>
                      </div>

                      {hotel.distanceToCenter && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#0759B8]" />
                          <span>{hotel.distanceToCenter}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-poppins group-hover:text-[#0759B8] transition-colors leading-snug">
                      {hotel.name}
                    </h3>

                    <p className="text-xs text-slate-600 font-medium">{hotel.roomType}</p>

                    {/* Amenities Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hotel.halalCertified && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          <span>Halal Certified</span>
                        </span>
                      )}
                      {hotel.breakfastIncluded && (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-[#0759B8] border border-blue-200 flex items-center gap-1">
                          <Coffee className="w-3 h-3" />
                          <span>Free Breakfast</span>
                        </span>
                      )}
                      {hotel.amenities.slice(0, 2).map((amenity, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-100 text-slate-700"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action Area */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg sm:text-xl font-black text-[#0759B8] font-poppins">
                          ৳{hotel.pricePerNightBDT.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">/ night</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block line-through">
                        ৳{hotel.originalPriceBDT.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenHotelQuote(hotel)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:brightness-105 text-slate-950 font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Request Quote</span>
                      </button>

                      <a
                        href={hotelService.buildHotelPartnerUrl(hotel.name, checkInDate, checkOutDate)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="View on Booking Partner"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotel Quote Modal */}
      {activeHotelQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 relative">
            <button
              type="button"
              onClick={() => setActiveHotelQuote(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0759B8]">
                <Building2 className="w-3.5 h-3.5" />
                <span>Azraq Hotel Concierge</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-poppins">
                Request Room Hold: {activeHotelQuote.name}
              </h3>
              <p className="text-xs text-slate-500">
                {activeHotelQuote.city}, {activeHotelQuote.country} • {activeHotelQuote.roomType}
              </p>
            </div>

            {/* Price Preview Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Indicative Room Rate:</span>
                <span className="font-bold text-[#0759B8] text-base">
                  ৳{activeHotelQuote.pricePerNightBDT.toLocaleString()} / night
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Dates:</span>
                <span className="font-bold text-slate-800">
                  {checkInDate} → {checkOutDate}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitHotelQuote} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={quoteForm.name}
                  onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                  placeholder="e.g. Istihad Ahmed"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0759B8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">WhatsApp Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={quoteForm.phone}
                    onChange={(e) => setQuoteForm({ ...quoteForm, phone: e.target.value })}
                    placeholder="+880 1851-172032"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0759B8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={quoteForm.email}
                    onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0759B8]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Special Requests (e.g. Twin beds, Early check-in, Airport pickup)
                </label>
                <textarea
                  rows={2}
                  value={quoteForm.specialNotes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, specialNotes: e.target.value })}
                  placeholder="Mention any specific room or meal preferences..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0759B8]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveHotelQuote(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="px-6 py-2.5 rounded-xl bg-[#0759B8] hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{isSubmittingQuote ? 'Submitting...' : 'Submit Room Hold Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

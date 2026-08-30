import React, { useState, useMemo } from 'react';
import { SEOHead } from './SEOHead';
import { Breadcrumbs } from './Breadcrumbs';
import { SITE_URL, getBreadcrumbSchema } from '../lib/seo';
import { AZRAQ_AFFILIATE_LINKS, AZRAQ_AGENCY_CONFIG } from '../data/agencyConfig';
import {
  Compass,
  Ticket,
  Star,
  MapPin,
  Clock,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Search,
  CheckCircle2,
  PhoneCall,
  Flame,
  Camera,
  Trees,
  Landmark,
  Palmtree,
  Zap,
} from 'lucide-react';

export interface ActivityDetail {
  id: string;
  title: string;
  location: string;
  city: string;
  country: string;
  category: 'Theme Parks' | 'Island & Water' | 'Culture & Heritage' | 'Adventure' | 'City Landmarks';
  duration: string;
  rating: number;
  reviewsCount: number;
  priceBDT: number;
  originalPriceBDT: number;
  tag: string;
  image: string;
  highlights: string[];
  instantConfirmation: boolean;
  klookUrl: string;
}

export const ALL_ACTIVITIES: ActivityDetail[] = [
  {
    id: 'act-phi-phi-speedboat',
    title: 'Phi Phi, Maya Bay & Bamboo Island Speedboat Tour with Buffet Lunch',
    location: 'Phuket / Krabi Pier',
    city: 'Phuket',
    country: 'Thailand',
    category: 'Island & Water',
    duration: '8 Hours (Full Day)',
    rating: 4.9,
    reviewsCount: 1420,
    priceBDT: 4800,
    originalPriceBDT: 6200,
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80',
    highlights: ['Maya Bay Beach Entry', 'Snorkeling Gear & Life Jacket Included', 'Halal Buffet Lunch on Phi Phi Don', 'National Park Fee Guidance'],
    instantConfirmation: true,
    klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
  },
  {
    id: 'act-gardens-by-the-bay',
    title: 'Gardens by the Bay & Cloud Forest (Avatar Experience) Direct Entry Pass',
    location: 'Marina Bay Waterfront',
    city: 'Singapore',
    country: 'Singapore',
    category: 'City Landmarks',
    duration: 'Flexible (Open Dated)',
    rating: 4.9,
    reviewsCount: 3890,
    priceBDT: 3200,
    originalPriceBDT: 3900,
    tag: 'Instant Voucher',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    highlights: ['Flower Dome & Cloud Forest Access', 'Direct QR Code Entry at Gate', 'Supertree Grove Evening Light Show', 'Wheelchair & Stroller Accessible'],
    instantConfirmation: true,
    klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
  },
  {
    id: 'act-genting-skyworlds',
    title: 'Genting SkyWorlds Outdoor Theme Park + Awana SkyWay Cable Car Pass',
    location: 'Genting Highlands',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    category: 'Theme Parks',
    duration: 'Full Day Experience',
    rating: 4.8,
    reviewsCount: 980,
    priceBDT: 4500,
    originalPriceBDT: 5400,
    tag: 'Family Favorite',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
    highlights: ['26 World-Class Rides and Attractions', 'Roundtrip Awana Glass-Floor Gondola', 'Virtual Queue Photo Pass', 'Direct Bus Connection from KL Sentral'],
    instantConfirmation: true,
    klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
  },
  {
    id: 'act-bali-atv-waterfall',
    title: 'Ubud Jungle ATV Quad Bike & Ayung River White Water Rafting Combo',
    location: 'Ubud Tropical Rainforest',
    city: 'Bali',
    country: 'Indonesia',
    category: 'Adventure',
    duration: '7 Hours',
    rating: 4.9,
    reviewsCount: 1120,
    priceBDT: 3900,
    originalPriceBDT: 5100,
    tag: 'Top Adventure',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    highlights: ['250cc All-Terrain Jungle Track', '10km Ayung River Rapids with Safety Marshal', 'Indonesian Buffet Lunch Included', 'Hotel Pickup & Drop from Kuta/Seminyak'],
    instantConfirmation: true,
    klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
  },
  {
    id: 'act-burj-khalifa-top',
    title: 'Burj Khalifa 124th & 125th Floor Observation Deck Priority Tickets',
    location: 'Downtown Dubai',
    city: 'Dubai',
    country: 'UAE',
    category: 'City Landmarks',
    duration: '2 Hours',
    rating: 4.8,
    reviewsCount: 2450,
    priceBDT: 5900,
    originalPriceBDT: 7200,
    tag: 'Must Visit',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    highlights: ['World Fastest Double-Deck Elevators', '360° Arabian Gulf & Desert Views', 'Dubai Mall & Fountain Show Synchronized', 'High-Powered Telescopes Included'],
    instantConfirmation: true,
    klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
  },
  {
    id: 'act-uss-singapore',
    title: 'Universal Studios Singapore 1-Day Express Entry Pass',
    location: 'Resorts World Sentosa',
    city: 'Singapore',
    country: 'Singapore',
    category: 'Theme Parks',
    duration: 'Full Day',
    rating: 4.9,
    reviewsCount: 4600,
    priceBDT: 7800,
    originalPriceBDT: 9200,
    tag: 'Top Attraction',
    image: 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&q=80',
    highlights: ['Battlestar Galactica Rollercoasters', 'Transformers 3D Ultimate Battle Ride', 'Minion Land & Ancient Egypt Zones', 'Direct Sentosa Express Monorail Access'],
    instantConfirmation: true,
    klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
  },
  {
    id: 'act-sundarban-cruise',
    title: 'Sundarbans Mangrove Forest Wildlife 3D2N AC Vessel Expedition',
    location: 'Mongla Port / Kotka',
    city: 'Khulna',
    country: 'Bangladesh',
    category: 'Adventure',
    duration: '3 Days 2 Nights',
    rating: 4.9,
    reviewsCount: 340,
    priceBDT: 15500,
    originalPriceBDT: 18500,
    tag: 'UNESCO Heritage',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    highlights: ['Royal Bengal Tiger Habitat Navigation', 'Armed Forest Guard Escort', 'Fresh Seafood & Bengali Delicacies Onboard', 'Kotka Watchtower & Jamtola Beach Trek'],
    instantConfirmation: false,
    klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
  },
  {
    id: 'act-nong-nooch-pattaya',
    title: 'Nong Nooch Tropical Botanical Garden & Cultural Elephant Show',
    location: 'Pattaya',
    city: 'Pattaya',
    country: 'Thailand',
    category: 'Culture & Heritage',
    duration: '5 Hours',
    rating: 4.7,
    reviewsCount: 880,
    priceBDT: 2400,
    originalPriceBDT: 3100,
    tag: 'Family Favorite',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    highlights: ['500-Acre French & Dinosaur Valley Gardens', 'Thai Martial Arts & Traditional Dancing Show', 'Tram Sightseeing Tour Included', 'Halal Indian Buffet Options'],
    instantConfirmation: true,
    klookUrl: AZRAQ_AFFILIATE_LINKS.klook,
  },
];

interface ActivitiesViewProps {
  onNavigateToView?: (view: string) => void;
  onOpenQuote?: () => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  onNavigateToView,
  onOpenQuote,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const countries = ['All', 'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'UAE', 'Bangladesh'];
  const categories = [
    'All',
    'Theme Parks',
    'Island & Water',
    'Culture & Heritage',
    'Adventure',
    'City Landmarks',
  ];

  const filteredActivities = useMemo(() => {
    return ALL_ACTIVITIES.filter((act) => {
      const matchCountry = selectedCountry === 'All' || act.country === selectedCountry;
      const matchCat = selectedCategory === 'All' || act.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCountry && matchCat && matchSearch;
    });
  }, [selectedCountry, selectedCategory, searchQuery]);

  const canonicalUrl = `${SITE_URL}/activities`;
  const structuredData = [
    getBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Activities & Tickets', url: '/activities' },
    ]),
  ];

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen pb-24 text-slate-900">
      <SEOHead
        title="Tours, Activities & Theme Park Tickets – AzraqTrips"
        description="Book verified entry tickets, day tours, island speedboats, and theme park passes in Thailand, Singapore, Malaysia, Bali, and Dubai with instant vouchers."
        canonical={canonicalUrl}
        keywords={[
          'Universal Studios Singapore tickets Dhaka',
          'Phi Phi island tour price BDT',
          'Burj Khalifa tickets Bangladesh',
          'Genting SkyWorlds entry ticket',
          'Bali ATV tour booking',
        ]}
        structuredData={structuredData}
      />

      {/* Header Section */}
      <section className="bg-gradient-to-r from-[#002f6c] via-[#0759B8] to-[#003B80] text-white pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto space-y-6">
          <Breadcrumbs
            items={[
              { name: 'Home', onClick: () => onNavigateToView && onNavigateToView('discover') },
              { name: 'Activities & Day Tours' },
            ]}
            className="text-white/80"
          />

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white border border-white/20 text-xs font-bold uppercase tracking-wider">
              <Ticket className="w-3.5 h-3.5 text-[#5BC7F4]" />
              <span>Instant QR Passes & Guided Day Tours</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-poppins">
              Top Activities & <span className="text-[#5BC7F4]">Theme Park Passes</span>
            </h1>

            <p className="text-sm sm:text-base text-sky-100 max-w-2xl leading-relaxed">
              Skip the long ticket queues. Secure verified instant entry vouchers, island speedboats, and curated adventure tours at the best exchange rates in BDT.
            </p>
          </div>

          {/* Search & Country Filter */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/30 text-slate-900 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search activities (e.g. Phi Phi, Gardens by the Bay, Burj Khalifa)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-[#0759B8]"
                />
              </div>

              {/* Country Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {countries.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCountry(c)}
                    className={`px-3.5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                      selectedCountry === c
                        ? 'bg-[#0759B8] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Categories:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Activity Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-poppins flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Available Experiences ({filteredActivities.length})</span>
          </h2>

          <span className="text-xs text-slate-500 font-medium">
            All prices in Bangladeshi Taka (BDT ৳)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#0759B8]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Image & Tags */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-950">
                  <img
                    src={act.image}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-extrabold bg-slate-950/80 backdrop-blur-md text-sky-200 border border-white/20">
                    {act.city}, {act.country}
                  </span>

                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-md">
                    {act.tag}
                  </span>

                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
                    <span className="px-2 py-0.5 rounded-lg bg-[#0759B8] text-white text-xs font-black">
                      ★ {act.rating}
                    </span>
                    <span className="text-[11px] text-slate-300 font-medium">
                      ({act.reviewsCount} reviews)
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#0759B8]" />
                    <span>{act.duration}</span>
                    <span>•</span>
                    <span className="text-[#0759B8] font-bold">{act.category}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-poppins group-hover:text-[#0759B8] transition-colors line-clamp-2 leading-snug">
                    {act.title}
                  </h3>

                  {/* Highlights */}
                  <ul className="space-y-1.5 pt-1">
                    {act.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price & Booking Footer */}
              <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#0759B8] font-poppins">
                      ৳{act.priceBDT.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">/ person</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block line-through">
                    ৳{act.originalPriceBDT.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={act.klookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#0759B8] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Instant Pass</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Concierge Activity Assistance Banner */}
        <div className="mt-12 bg-gradient-to-r from-[#073B4C] to-[#12304A] rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold font-poppins">
              Looking for Custom Group Activities or Private Yacht Charters?
            </h3>
            <p className="text-xs sm:text-sm text-sky-200 max-w-xl">
              Our Dhaka travel desk arranges private van transfers, English/Bengali speaking tour guides, and customized group excursions across Asia.
            </p>
          </div>

          <a
            href={`https://wa.me/${AZRAQ_AGENCY_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

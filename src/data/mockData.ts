import { Destination, FeedPost, Itinerary, TrendingHashtag } from "../types";
import { ALL_DESTINATIONS } from "./destinationsData";

export const BRAND_LOGOS = {
  globetrotter: "https://lh3.googleusercontent.com/aida-public/AB6AXuDueO4XryGUl6a6WmWX0EvWIDKx_Zu5FHQ49JBhgL8k9NZOkMjJu3Xr9z0w7qgLX7p7ctXVHms1BPNX9LQbELXZWUjouvvWHc2aLlYloz94DqzNNnDH6Gmu1q-OwC_kMG5BS0sDUQnKohe-rq44IcpooNz4LDQtko6F0gporrLADTlW8mFgb9X8JOqQyZMw7whC2ykcHxoWLBM93q2IYw0yAWLt-VE9q3__DYK4hKxFuZnds12hDZCBeqCZg4vwi--DdQ",
  azraq: "/azraq-logo.svg",
  userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBT0Jpi4jcWzVICFjXaWc6S9_wz003aLtkBBHPk9HJSstTEBXkgpEklox53ddv26NHXkWFbdvFH0N6Hthfr0G1pYJYOCx8t3FBRFr4uxZ9jCMRajpdD530QlmBVs9WRU5J1RAqGpycee1OLBVnMnJUthyC5b9A0eOYh_TRPiN4knTC6SuM3nevoRTFEWaOIx1MHb5zPOPW602asXmNimVWCEXYqxxUZFzE3xyoA9A-JiA93cAPU_GeW"
};

export const INITIAL_DESTINATIONS: Destination[] = ALL_DESTINATIONS;

export const INITIAL_FEED_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    authorName: 'Sadia Rahman',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=70',
    location: 'Maafushi, Maldives',
    badgeLabel: 'Verified Traveler',
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=75',
    likes: 342,
    commentsCount: 28,
    caption: 'Crystal turquoise waters and private sandbank picnic on our 5D4N luxury Maldives package. Manta ray snorkeling was breathtaking! 🐬✨',
    hashtags: ['#AzraqDiaries', '#MaldivesTravel', '#LuxuryTravel', '#TravelBuddies'],
    timeAgo: '2h ago',
    isLiked: false,
    isBookmarked: true,
    aiVerified: true,
    commentsList: [
      { id: 'c1', author: 'Tanvir Ahmed', avatar: BRAND_LOGOS.userAvatar, text: 'The seaplane transfer views look unbelievable! Which resort did you stay at?', timeAgo: '1h ago' },
      { id: 'c2', author: 'Nusrat Jahan', avatar: BRAND_LOGOS.userAvatar, text: 'Added this exact Maldives package to my Azraq Trips planner!', timeAgo: '30m ago' }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Tanvir Ahmed',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=70',
    location: 'Kuala Lumpur, Malaysia',
    badgeLabel: 'Community Guide',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=75',
    likes: 512,
    commentsCount: 45,
    caption: 'Night view of the iconic Petronas Towers from the KLCC Park sky bridge. Street food at Jalan Alor right after was phenomenal 🍜🇲🇾',
    hashtags: ['#MalaysiaTrulyAsia', '#KualaLumpur', '#AzraqDiaries', '#TravelBuddies'],
    timeAgo: '5h ago',
    isLiked: true,
    isBookmarked: false,
    aiVerified: true,
    commentsList: [
      { id: 'c3', author: 'Rahim Chowdhury', avatar: BRAND_LOGOS.userAvatar, text: 'Jalan Alor grilled satay with peanut sauce is unbeatable!', timeAgo: '2h ago' }
    ]
  }
];

export const TRENDING_HASHTAGS: TrendingHashtag[] = [
  { tag: '#MalaysiaTrulyAsia', postsCount: '18.5k posts', isRising: true },
  { tag: '#MaldivesEscape', postsCount: '14.2k posts', isRising: true },
  { tag: '#ExploreBangladesh', postsCount: '32.1k posts', isRising: true },
  { tag: '#DubaiDesertSafari', postsCount: '21.8k posts', isRising: false },
  { tag: '#KashmirParadise', postsCount: '11.4k posts', isRising: true }
];

export const INITIAL_AZRAQ_ITINERARY: Itinerary = {
  id: 'malaysia-explorer-5d',
  title: '5-Day Malaysia & Genting Highlands Explorer',
  destination: 'Kuala Lumpur & Genting Highlands, Malaysia',
  durationDays: 5,
  weatherSummary: 'Nov - Apr • 27°C - 32°C Sunny & Tropical',
  aiSummary: 'A curated journey tailored for Bangladeshi travelers departing Dhaka, featuring the iconic Petronas Twin Towers, sacred Batu Caves, Genting SkyWorlds mountain cable car, shopping in Bukit Bintang, and authentic halal cuisine.',
  days: [
    {
      dayNumber: 1,
      title: 'Day 1: Arrival in Kuala Lumpur & Sunset at KLCC',
      summary: 'Arrive at KLIA from Dhaka, check in to your Bukit Bintang hotel, and witness sunset behind the illuminated Petronas Twin Towers.',
      spots: [
        {
          id: 'my-1',
          name: 'KLIA to City Hotel Check-In',
          description: 'Take the KLIA Ekspres train (28 mins) or pre-arranged private AC transfer directly to your central Kuala Lumpur hotel.',
          timeSlot: '14:00 - 15:30',
          category: 'Sightseeing',
          imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=75',
          aiTip: 'Keep your passport and Malaysia Digital Arrival Card (MDAC) QR code handy on your phone.',
          lat: 3.1390,
          lng: 101.6869
        },
        {
          id: 'my-2',
          name: 'Petronas Twin Towers & KLCC Park',
          description: 'Stroll around the fountain lake in KLCC Park and capture wide-angle photos under the world’s tallest twin towers.',
          timeSlot: '17:00 - 19:30',
          category: 'Culture',
          imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=75',
          aiTip: 'Position yourself near the fountain bridge for the widest angle shot of both towers without distortion.',
          lat: 3.1578,
          lng: 101.7119
        },
        {
          id: 'my-3',
          name: 'Jalan Alor Night Food Street',
          description: 'Experience bustling open-air street dining with fresh Nasi Lemak, chicken satay with peanut sauce, and tropical mango smoothies.',
          timeSlot: '20:00 - 22:00',
          category: 'Food',
          imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=75',
          aiTip: 'Look for halal-certified stalls with green signs along the pedestrian walkway.',
          lat: 3.1458,
          lng: 101.7088
        }
      ],
      aiInsight: 'Kuala Lumpur’s central Golden Triangle is easily walkable. Use the Grab app for quick rides when traveling with luggage.'
    },
    {
      dayNumber: 2,
      title: 'Day 2: Batu Caves & Genting Highlands Cable Car',
      summary: 'Climb the colorful 272 steps at Batu Caves followed by a scenic mountain drive and Awana SkyWay cable car to Genting SkyWorlds.',
      spots: [
        {
          id: 'my-4',
          name: 'Batu Caves Lord Murugan Statue',
          description: 'Iconic limestone caves and the 140-foot golden statue of Lord Murugan. Climb the rainbow stairs into Cathedral Cave.',
          timeSlot: '08:30 - 11:00',
          category: 'Culture',
          imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=75',
          aiTip: 'Arrive early before 9:00 AM to avoid midday heat. Modest dress covering shoulders and knees is required.',
          lat: 3.2379,
          lng: 101.6840
        },
        {
          id: 'my-5',
          name: 'Awana SkyWay Cable Car & Genting Highlands',
          description: 'Glide over 130-million-year-old tropical rainforest canopy with cool mountain air (18°C - 22°C).',
          timeSlot: '12:30 - 16:30',
          category: 'Adventure',
          imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=75',
          aiTip: 'Stop at Chin Swee Station midway at no extra cost to view the 9-story Pagoda and mountain clouds.',
          lat: 3.4243,
          lng: 101.7932
        }
      ],
      aiInsight: 'Genting Highlands is 10°C cooler than the city. Pack a light jacket or cardigan for the hilltop.'
    },
    {
      dayNumber: 3,
      title: 'Day 3: Historical Merdeka Square & Bukit Bintang Shopping',
      summary: 'Explore colonial architecture at Sultan Abdul Samad Building followed by duty-free shopping at Pavilion KL.',
      spots: [
        {
          id: 'my-6',
          name: 'Merdeka Square & Sultan Abdul Samad Building',
          description: 'Moorish-style historic landmark where Malaysian independence was declared, alongside the River of Life.',
          timeSlot: '09:00 - 11:30',
          category: 'Sightseeing',
          imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=75',
          aiTip: 'The River of Life misting system operates every 15 minutes for picturesque photos.',
          lat: 3.1492,
          lng: 101.6938
        },
        {
          id: 'my-7',
          name: 'Pavilion Kuala Lumpur & Bukit Bintang',
          description: 'Premier multi-level shopping district with high-street fashion, electronics, and Japanese Tokyo Street food hall.',
          timeSlot: '14:00 - 18:00',
          category: 'Shopping',
          imageUrl: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=75',
          aiTip: 'Visit the tourist concierge desk on Level 1 with your passport for an exclusive VIP Tourist Privilege shopping card.',
          lat: 3.1488,
          lng: 101.7132
        }
      ],
      aiInsight: 'Most major stores in Pavilion and Suria KLCC accept international Visa/Mastercard without currency surcharge.'
    }
  ],
  packingList: [
    {
      category: 'Clothing & Layering',
      items: ['Lightweight breathable cotton shirts', 'Modest clothing for Batu Caves (knees & shoulders covered)', 'Light jacket or hoodie for Genting Highlands (18°C)', 'Comfortable walking sneakers']
    },
    {
      category: 'Travel Documents & Essentials',
      items: ['Original passport (min 6 months validity)', 'Printed Malaysian eVisa & MDAC Arrival QR confirmation', 'Return air ticket and hotel vouchers', 'Universal travel adapter (UK 3-pin Type G)']
    },
    {
      category: 'Finances & Connectivity',
      items: ['Touch ‘n Go card or cash for LRT transit', 'Dual-currency debit/credit card or MYR cash', 'Local tourist 5G eSIM / SIM card']
    }
  ]
};

// Aliased for seamless backward compatibility across all views
export const INITIAL_KYOTO_ITINERARY: Itinerary = INITIAL_AZRAQ_ITINERARY;


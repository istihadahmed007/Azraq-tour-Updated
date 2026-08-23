export interface ItineraryDaySpot {
  time: string;
  name: string;
  description: string;
  category?: 'Sightseeing' | 'Culture' | 'Food' | 'Nature' | 'Shopping' | 'Adventure' | string;
  aiTip?: string;
  imageUrl?: string;
}

export interface CuratedItinerary {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  destination: string;
  country: string;
  durationDays: number;
  estimatedBudgetBDT: string;
  idealFor: string[];
  bestSeason: string;
  heroImage: string;
  overview: string;
  days: {
    dayNumber: number;
    title: string;
    summary: string;
    spots: ItineraryDaySpot[];
    mealsRecommendation: string;
  }[];
  includedHighlights: string[];
  transportationAdvice: string;
  visaRequirementSummary: string;
  relatedGuideSlug?: string;
  relatedDestinationId?: string;
}

export const CURATED_ITINERARIES: CuratedItinerary[] = [
  {
    slug: 'malaysia-5-day',
    title: '5-Day Malaysia Explorer: Kuala Lumpur & Genting Highlands',
    seoTitle: '5-Day Malaysia Itinerary for Bangladeshi Travelers – Kuala Lumpur & Genting Trip Plan',
    metaDescription: 'Detailed 5-day Malaysia itinerary designed for Bangladeshi travelers. Day-by-day plan covering Petronas Towers, Batu Caves, Genting SkyWorlds, shopping, BDT budget, and halal dining.',
    destination: 'Kuala Lumpur & Genting Highlands',
    country: 'Malaysia',
    durationDays: 5,
    estimatedBudgetBDT: '৳55,000 – ৳75,000 per person (including flights & 4-star hotel)',
    idealFor: ['Families', 'Couples', 'First-Time International Travelers', 'Friends'],
    bestSeason: 'Year-Round (Best: Nov - Apr)',
    heroImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=80',
    overview: 'This classic 5-day itinerary balances iconic modern city skylines, sacred cultural caves, cool mountain cable cars, and world-class shopping with authentic Malaysian cuisine for travelers departing from Dhaka.',
    days: [
      {
        dayNumber: 1,
        title: 'Arrival in Kuala Lumpur & Sunset at KLCC',
        summary: 'Arrive at KLIA from Dhaka, check in to your Bukit Bintang / KLCC hotel, and witness the golden sunset behind the Petronas Twin Towers.',
        spots: [
          { time: '14:00 - 15:30', name: 'KLIA to City Hotel Check-In', description: 'Take the KLIA Ekspres train (28 mins) or private transfer to your central Kuala Lumpur hotel.', category: 'Sightseeing' },
          { time: '17:00 - 19:30', name: 'KLCC Park & Petronas Towers', description: 'Stroll around the tranquil fountains in KLCC Park and take iconic photos under the illuminated Petronas Towers.', category: 'Culture', aiTip: 'Position yourself near the fountain bridge for the widest angle shot of both towers without distortions.' },
          { time: '20:00 - 22:00', name: 'Jalan Alor Night Food Street', description: 'Taste fresh Nasi Lemak, Chicken Satay with peanut sauce, and grilled seafood.', category: 'Food' }
        ],
        mealsRecommendation: 'Dinner: Halal Satay and fresh fruit smoothies at Jalan Alor.'
      },
      {
        dayNumber: 2,
        title: 'Batu Caves, National Mosque & Merdeka Square',
        summary: 'Explore the majestic 272 steps of Batu Caves in the morning followed by KL historic colonial district.',
        spots: [
          { time: '09:00 - 11:30', name: 'Batu Caves & Murugan Statue', description: 'Climb the colorful steps to the limestone cathedral caves with playful macaques.', category: 'Culture', aiTip: 'Wear clothes covering knees and shoulders to meet temple dress code.' },
          { time: '14:00 - 16:00', name: 'Merdeka Square & Sultan Abdul Samad Building', description: 'Walk through historic British-Mughal colonial architecture and the iconic 95-meter flagpole.', category: 'Culture' },
          { time: '16:30 - 18:30', name: 'KL Tower Sky Deck & Box', description: 'Step onto the glass-bottomed Sky Box for panoramic 360-degree views of the entire Klang Valley.', category: 'Sightseeing' }
        ],
        mealsRecommendation: 'Lunch: Traditional banana leaf rice or Nasi Kandar in Little India / Brickfields.'
      },
      {
        dayNumber: 3,
        title: 'Day Trip to Genting Highlands & Cable Car',
        summary: 'Escape to the breezy mountain peak via the glass-floor Awana SkyWay cable car and visit Genting SkyWorlds.',
        spots: [
          { time: '09:30 - 11:00', name: 'Awana SkyWay Cable Car Ride', description: 'Glide over 130-million-year-old rainforest canopies with a stop at Chin Swee Caves Temple.', category: 'Nature', aiTip: 'Stop at Chin Swee station for free to explore the 9-story pagoda and panoramic valley views.' },
          { time: '11:30 - 17:00', name: 'Genting SkyWorlds Outdoor Theme Park', description: 'Enjoy movie-themed roller coasters, 3D interactive rides, and cool 18°C mountain air.', category: 'Adventure' },
          { time: '17:30 - 19:30', name: 'Genting Premium Outlets (GPO)', description: 'Shop international designer fashion brands with discounts up to 70%.', category: 'Shopping' }
        ],
        mealsRecommendation: 'Lunch: Halal dining options at SkyAvenue Mall in Genting.'
      },
      {
        dayNumber: 4,
        title: 'Putrajaya Administrative Capital & Shopping Spree',
        summary: 'Visit the stunning pink dome of Putra Mosque and spend the evening shopping in Bukit Bintang.',
        spots: [
          { time: '09:30 - 12:30', name: 'Putra Mosque & Perdana Putra', description: 'Marvel at the rose-tinted granite mosque reflected on Putrajaya Lake and take a traditional cruise.', category: 'Culture' },
          { time: '14:30 - 18:30', name: 'Pavilion KL & Suria KLCC Shopping', description: 'Explore premier luxury fashion, cosmetics, electronics, and local souvenir boutiques.', category: 'Shopping' }
        ],
        mealsRecommendation: 'Dinner: Signature Malaysian Laksa and Teh Tarik at Madam Kwan\'s Pavilion.'
      },
      {
        dayNumber: 5,
        title: 'Local Souvenir Hunting & Flight back to Dhaka',
        summary: 'Grab local white coffee, Beryl\'s chocolates, and batik crafts before heading to KLIA for your return flight.',
        spots: [
          { time: '10:00 - 12:00', name: 'Central Market (Pasar Seni)', description: 'Art-deco heritage bazaar packed with Malaysian handicrafts, pewter, batik shirts, and artisanal gifts.', category: 'Shopping' },
          { time: '14:00', name: 'Departure to KLIA Airport', description: 'Proceed to KLIA Terminal 1 or 2 for your flight back to Hazrat Shahjalal International Airport, Dhaka.', category: 'Sightseeing' }
        ],
        mealsRecommendation: 'Breakfast: Kaya Toast with half-boiled eggs and local Kopi.'
      }
    ],
    includedHighlights: [
      'Round-trip airport logistics guidance',
      'Petronas Twin Towers & Skybridge visit',
      'Batu Caves half-day exploration',
      'Genting Highlands cable car and outlet shopping',
      'Putrajaya pink mosque and lake tour',
      'Comprehensive halal food spots curated for Bangladeshi tastes'
    ],
    transportationAdvice: 'Use Grab for car trips and the MRT/LRT network with a Touch \'n Go card for city center hops.',
    visaRequirementSummary: 'Malaysian Single Entry eVisa (3–5 working days, min bank balance ৳100,000).',
    relatedGuideSlug: 'malaysia-travel-guide',
    relatedDestinationId: 'kuala-lumpur',
  },
  {
    slug: 'thailand-7-day',
    title: '7-Day Thailand Classic: Bangkok & Phuket Paradise',
    seoTitle: '7-Day Thailand Itinerary for Bangladeshi Travelers – Bangkok & Phuket Holiday Plan',
    metaDescription: 'Step-by-step 7-day Thailand itinerary for Bangladeshi tourists. Bangkok temples, Pratunam shopping, Chao Phraya dinner cruise, Phuket beaches, Phi Phi Islands, and BDT budget.',
    destination: 'Bangkok & Phuket',
    country: 'Thailand',
    durationDays: 7,
    estimatedBudgetBDT: '৳75,000 – ৳110,000 per person (including flights & 4-star hotels)',
    idealFor: ['Couples', 'Honeymooners', 'Families', 'Friends Group'],
    bestSeason: 'Nov - Apr',
    heroImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=80',
    overview: 'Experience the ultimate Thai dual holiday: 3 days exploring buzzing Bangkok temples, markets, and river cruises, followed by 4 days soaking in crystal emerald seas and limestone cliffs in Phuket and Phi Phi Islands.',
    days: [
      {
        dayNumber: 1,
        title: 'Arrive in Bangkok & Chao Phraya Sunset Cruise',
        summary: 'Fly non-stop from Dhaka (DAC) to Bangkok Suvarnabhumi, transfer to Sukhumvit/Pratunam hotel, and board an illuminated dinner cruise.',
        spots: [
          { time: '13:00', name: 'Airport Arrival & Hotel Check-in', description: 'Arrive at BKK and take an airport limousine or Grab taxi to your hotel in central Bangkok.', category: 'Sightseeing' },
          { time: '18:30 - 21:00', name: 'Chao Phraya Luxury Dinner Cruise', description: 'Glide past Wat Arun and the Grand Palace while enjoying live acoustic jazz and a buffet dinner.', category: 'Sightseeing', aiTip: 'Request upper open-deck seating when booking for the clearest photography.' }
        ],
        mealsRecommendation: 'Dinner: International & seafood buffet on board Chao Phraya Princess.'
      },
      {
        dayNumber: 2,
        title: 'Grand Palace, Wat Arun & Pratunam Market',
        summary: 'Immerse yourself in Thai royal history and shop at Pratunam wholesale garment market.',
        spots: [
          { time: '09:00 - 11:30', name: 'Grand Palace & Emerald Buddha', description: 'Explore Thailand\'s most sacred royal complex with golden stupas and ornate fresco murals.', category: 'Culture' },
          { time: '12:00 - 13:30', name: 'Wat Arun (Temple of Dawn)', description: 'Cross the Chao Phraya river by local ferry to admire the porcelain mosaic temple spires.', category: 'Culture' },
          { time: '15:30 - 19:30', name: 'Pratunam Market & Platinum Fashion Mall', description: 'Air-conditioned multi-level wholesale fashion mall offering endless trendy clothes at unbeatable prices.', category: 'Shopping' }
        ],
        mealsRecommendation: 'Lunch: Halal Thai dishes near Sukhumvit Soi 3 or Baiyoke Tower.'
      },
      {
        dayNumber: 3,
        title: 'Chatuchak Weekend Market & ICONSIAM',
        summary: 'Explore world-famous weekend markets and the indoor floating market at ICONSIAM.',
        spots: [
          { time: '10:00 - 14:00', name: 'Chatuchak Weekend Market', description: 'Browse through thousands of stalls selling art, silk scarves, handmade crafts, and coconut ice cream.', category: 'Shopping' },
          { time: '16:00 - 20:00', name: 'ICONSIAM & SookSiam Cultural Hall', description: 'Luxury mega-complex featuring indoor river canals with food stalls from all 77 Thai provinces.', category: 'Food' }
        ],
        mealsRecommendation: 'Snacks: Mango sticky rice and Thai iced milk tea.'
      },
      {
        dayNumber: 4,
        title: 'Fly to Phuket & Sunset at Patong Beach',
        summary: 'Take a quick 1-hour domestic flight to Phuket, check into your beachside resort, and relax by the Andaman Sea.',
        spots: [
          { time: '11:00 - 12:20', name: 'Flight Bangkok (BKK/DMK) to Phuket (HKT)', description: 'Short flight over the Gulf of Thailand to Phuket island.', category: 'Sightseeing' },
          { time: '16:00 - 19:00', name: 'Patong Beach Sunset & Promenade', description: 'Feel the golden sand, watch parasailers in the orange sunset, and explore beachfront cafes.', category: 'Nature' }
        ],
        mealsRecommendation: 'Dinner: Fresh grilled tiger prawns and Tom Yum soup at a halal seafood restaurant in Patong.'
      },
      {
        dayNumber: 5,
        title: 'Full-Day Phi Phi Islands & Maya Bay Speedboat Tour',
        summary: 'Cruise to world-famous Maya Bay, snorkel in crystal clear emerald lagoons, and visit Monkey Beach.',
        spots: [
          { time: '08:00 - 16:30', name: 'Phi Phi Don, Phi Phi Leh & Maya Bay', description: 'Speedboat adventure with snorkeling gear, swimming among tropical coral reefs, and visiting Viking Cave.', category: 'Adventure', aiTip: 'Bring waterproof phone pouches and reef-safe sunscreen.' }
        ],
        mealsRecommendation: 'Lunch: Buffet lunch included on Phi Phi Don island.'
      },
      {
        dayNumber: 6,
        title: 'Big Buddha, Wat Chalong & Phuket Old Town',
        summary: 'Discover the 45-meter white marble Big Buddha perched atop Nakkerd Hill and Sino-Portuguese colonial streets.',
        spots: [
          { time: '09:30 - 12:00', name: 'Phuket Big Buddha & Viewpoint', description: 'Panoramic 360-degree views overlooking Chalong Bay and Kata Beach.', category: 'Culture' },
          { time: '14:00 - 17:00', name: 'Phuket Old Town Heritage Street', description: 'Vibrant pastel Sino-Portuguese shophouses, boutique coffee shops, and local handicraft stores.', category: 'Culture' }
        ],
        mealsRecommendation: 'Coffee & Cakes: Local artisan bakeries in Phuket Old Town.'
      },
      {
        dayNumber: 7,
        title: 'Morning Relaxation & Flight Back to Dhaka',
        summary: 'Enjoy your final beach stroll and resort breakfast before boarding your connecting flight back to Dhaka.',
        spots: [
          { time: '10:00 - 12:00', name: 'Resort Spa & Souvenir Shopping', description: 'Traditional Thai herbal massage and purchase of Thai dried mangoes and silk products.', category: 'Shopping' },
          { time: '14:00', name: 'Transfer to Phuket Airport (HKT)', description: 'Fly back to Dhaka via Bangkok.' }
        ],
        mealsRecommendation: 'Breakfast: Full tropical resort buffet.'
      }
    ],
    includedHighlights: [
      'Bangkok and Phuket internal logistics',
      'Chao Phraya dinner cruise booking',
      'Grand Palace and Wat Arun temple tours',
      'Phi Phi Islands & Maya Bay speedboat tour with snorkeling',
      'Phuket Big Buddha viewpoint',
      'Pratunam and Platinum wholesale shopping guides'
    ],
    transportationAdvice: 'Use BTS and Grab in Bangkok; arrange private day drivers or speedboat excursions in Phuket.',
    visaRequirementSummary: 'Thailand Tourist Visa via VFS Dhaka (4–7 working days, min bank balance ৳60,000).',
    relatedGuideSlug: 'thailand-travel-guide',
    relatedDestinationId: 'bangkok',
  },
  {
    slug: 'bali-5-day',
    title: '5-Day Bali Tropical Retreat: Ubud Jungle & Seminyak Coast',
    seoTitle: '5-Day Bali Itinerary for Bangladeshi Travelers – Private Villa, Ubud & Nusa Penida',
    metaDescription: 'Complete 5-day Bali travel itinerary for Bangladeshi couples and families. Private pool villa, Ubud swing, Kintamani volcano, Nusa Penida island, and halal dining in Indonesia.',
    destination: 'Ubud, Nusa Penida & Seminyak',
    country: 'Indonesia',
    durationDays: 5,
    estimatedBudgetBDT: '৳70,000 – ৳95,000 per person (including flights & private pool villa)',
    idealFor: ['Honeymooners', 'Couples', 'Nature Lovers', 'Photography Enthusiasts'],
    bestSeason: 'Apr - Oct',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    overview: 'Escape into Bali\'s enchanting green serenity. Spend 2 nights in a private jungle pool villa in Ubud, take a speedboat to the dramatic cliffs of Nusa Penida, and enjoy breathtaking coastal sunsets in Seminyak.',
    days: [
      {
        dayNumber: 1,
        title: 'Arrival in Denpasar & Check-in to Ubud Jungle Villa',
        summary: 'Land at Ngurah Rai Airport (DPS), meet your private driver, and drive into the lush green hills of Ubud.',
        spots: [
          { time: '14:00', name: 'Airport Pick-up to Ubud', description: 'Scenic drive through Balinese stone artisan villages into the rainforest of Ubud.', category: 'Nature' },
          { time: '17:00 - 20:00', name: 'Private Pool Villa Relaxation', description: 'Unwind with a floating afternoon tea or relax in your private infinity pool overlooking rice fields.', category: 'Nature' }
        ],
        mealsRecommendation: 'Dinner: Authentic Indonesian Nasi Goreng and Chicken Satay with peanut sauce.'
      },
      {
        dayNumber: 2,
        title: 'Tegallalang Rice Terraces, Bali Swing & Kintamani Volcano',
        summary: 'Soar on the Bali Jungle Swing, walk through emerald rice terraces, and view Mount Batur volcano.',
        spots: [
          { time: '08:30 - 11:00', name: 'Tegallalang Rice Terraces & Aloha Swing', description: 'Iconic stepped green rice paddies with tandem swings and bird nests for breathtaking photos.', category: 'Nature' },
          { time: '12:30 - 14:30', name: 'Kintamani Mount Batur Viewpoint', description: 'Panoramic lunch overlooking the active volcanic cone and shimmering Lake Batur.', category: 'Sightseeing' },
          { time: '16:00 - 17:30', name: 'Tirta Empul Holy Water Temple', description: 'Ancient sacred spring water temple surrounded by tropical foliage.', category: 'Culture' }
        ],
        mealsRecommendation: 'Lunch: Scenic buffet overlooking Mount Batur caldera.'
      },
      {
        dayNumber: 3,
        title: 'Nusa Penida Island Tour (Kelingking Beach & Broken Beach)',
        summary: 'Board a morning speedboat from Sanur to Nusa Penida to witness the world-famous T-Rex cliff and turquoise lagoons.',
        spots: [
          { time: '07:30 - 08:30', name: 'Speedboat to Nusa Penida Island', description: 'Fast boat crossing from Sanur harbour across the Badung Strait.', category: 'Adventure' },
          { time: '09:30 - 12:00', name: 'Kelingking T-Rex Beach Viewpoint', description: 'Spectacular cliff formation shaped like a Tyrannosaurus Rex overlooking a hidden white beach.', category: 'Nature', aiTip: 'Stay on the upper fenced viewpoint for the safest and most dramatic photos.' },
          { time: '13:30 - 15:30', name: 'Broken Beach & Angel\'s Billabong', description: 'Natural circular archway in the cliff where turquoise ocean waves crash inside a giant cove.', category: 'Nature' }
        ],
        mealsRecommendation: 'Lunch: Indonesian grilled chicken and fresh coconut water on Nusa Penida.'
      },
      {
        dayNumber: 4,
        title: 'Seminyak Beach, Shopping & Tanah Lot Sunset',
        summary: 'Transfer to beachside Seminyak, browse chic boutique shops, and watch the sunset at Tanah Lot temple.',
        spots: [
          { time: '11:00 - 14:00', name: 'Seminyak Village & Boutique Shopping', description: 'Explore bohemian resort wear, handcrafted leather goods, and artisan jewelry.', category: 'Shopping' },
          { time: '16:30 - 18:30', name: 'Tanah Lot Sunset Temple', description: 'Ancient Hindu shrine perched on a dramatic offshore rock formation encircled by foaming waves.', category: 'Culture' }
        ],
        mealsRecommendation: 'Dinner: Beachfront candle-lit dinner with Indonesian Padang specialties.'
      },
      {
        dayNumber: 5,
        title: 'Balinese Spa Treatment & Flight Home to Dhaka',
        summary: 'Indulge in a 2-hour Balinese aromatic body massage before heading to DPS airport for your flight back to Dhaka.',
        spots: [
          { time: '10:00 - 12:30', name: 'Authentic Balinese Spa & Aromatherapy', description: 'Rejuvenating full-body massage with natural frangipani oils and floral bath.', category: 'Nature' },
          { time: '14:30', name: 'Transfer to Denpasar Airport (DPS)', description: 'Return flight to Dhaka via Kuala Lumpur or Singapore.' }
        ],
        mealsRecommendation: 'Breakfast: Floating breakfast in private villa pool.'
      }
    ],
    includedHighlights: [
      'Private car with English-speaking driver throughout Bali',
      'Ubud jungle private pool villa accommodation',
      'Bali swing and Tegallalang rice terraces entrance',
      'Speedboat and private day tour in Nusa Penida',
      'Tanah Lot sunset tour',
      'Halal dining guidance across Bali'
    ],
    transportationAdvice: 'Private air-conditioned car with driver is the most convenient and cost-effective method in Bali.',
    visaRequirementSummary: 'Indonesia Electronic Visa on Arrival (e-VOA, 30 days valid, applied online).',
    relatedGuideSlug: 'bali-travel-guide',
    relatedDestinationId: 'bali',
  },
  {
    slug: 'japan-7-day',
    title: '7-Day Japan Cultural Odyssey: Tokyo, Kyoto & Mount Fuji',
    seoTitle: '7-Day Japan Itinerary for Bangladeshi Travelers – Tokyo, Kyoto & Bullet Train Guide',
    metaDescription: 'Epic 7-day Japan itinerary from Dhaka, Bangladesh. Tokyo Shibuya crossing, Mt Fuji, Kyoto shrines, Shinkansen bullet train, BDT budget, and halal dining in Japan.',
    destination: 'Tokyo, Kyoto & Mount Fuji',
    country: 'Japan',
    durationDays: 7,
    estimatedBudgetBDT: '৳140,000 – ৳220,000 per person (including direct flights & bullet trains)',
    idealFor: ['Culture Enthusiasts', 'Couples', 'Solo Travelers', 'Photographers'],
    bestSeason: 'Mar - May (Cherry Blossom) & Oct - Nov (Autumn Foliage)',
    heroImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    overview: 'Journey across Japan\'s dazzling contrasts: from neon-lit skyscrapers and historic temples in Tokyo, to sacred snow-capped Mount Fuji, and the thousand red torii gates and serene bamboo forests of ancient Kyoto.',
    days: [
      {
        dayNumber: 1,
        title: 'Arrive in Tokyo & Shibuya Sky Golden Hour',
        summary: 'Land at Tokyo Narita from Dhaka, check into your Shinjuku hotel, and view Tokyo\'s endless skyline from Shibuya Sky.',
        spots: [
          { time: '15:00', name: 'Narita Express to Tokyo / Shinjuku', description: 'Direct high-speed train from NRT Airport to downtown Tokyo.', category: 'Sightseeing' },
          { time: '17:30 - 20:00', name: 'Shibuya Crossing & Shibuya Sky', description: 'Walk through the world\'s busiest pedestrian scramble and take open-air rooftop photos.', category: 'Sightseeing' }
        ],
        mealsRecommendation: 'Dinner: Halal Ramen at Ayam-YA or Honolu Shibuya.'
      },
      {
        dayNumber: 2,
        title: 'Asakusa Senso-ji Temple & Akihabara Electric Town',
        summary: 'Experience Tokyo\'s oldest Buddhist temple and explore the global capital of technology and anime culture.',
        spots: [
          { time: '09:00 - 12:00', name: 'Senso-ji Temple & Nakamise Dori', description: 'Historic 7th-century temple entrance with giant red lantern and traditional souvenir market.', category: 'Culture' },
          { time: '14:00 - 18:00', name: 'Akihabara & Ginza Luxury Boulevard', description: 'Browse cutting-edge consumer electronics and high-fashion department stores.', category: 'Shopping' }
        ],
        mealsRecommendation: 'Lunch: Halal Tempura or Bento in Asakusa.'
      },
      {
        dayNumber: 3,
        title: 'Mount Fuji & Lake Kawaguchiko Day Trip',
        summary: 'Take a scenic express train or tour coach to Lake Kawaguchiko for postcard-perfect views of Mount Fuji.',
        spots: [
          { time: '08:30 - 16:30', name: 'Lake Kawaguchiko & Chureito Pagoda', description: 'Iconic 5-story red pagoda framing snow-capped Mount Fuji over lush cherry blossoms / autumn trees.', category: 'Nature' }
        ],
        mealsRecommendation: 'Lunch: Local Hoto noodles made with vegetable broth at Kawaguchiko.'
      },
      {
        dayNumber: 4,
        title: 'Shinkansen Bullet Train to Ancient Kyoto',
        summary: 'Ride the 300 km/h Shinkansen bullet train past Mount Fuji into Japan\'s ancient imperial capital Kyoto.',
        spots: [
          { time: '09:00 - 11:15', name: 'Shinkansen Bullet Train to Kyoto Station', description: 'Smooth 2-hour 15-minute journey on the Tokaido Shinkansen.', category: 'Sightseeing' },
          { time: '14:00 - 17:30', name: 'Fushimi Inari Shrine (Torii Gates)', description: 'Walk through thousands of vibrant vermilion gates winding up the sacred forested mountain.', category: 'Culture' }
        ],
        mealsRecommendation: 'Dinner: Halal Yakiniku (Japanese BBQ) in Kyoto Gion district.'
      },
      {
        dayNumber: 5,
        title: 'Arashiyama Bamboo Grove & Kinkaku-ji (Golden Pavilion)',
        summary: 'Wander through towering bamboo stalks and admire the zen temple covered in pure gold leaf.',
        spots: [
          { time: '08:30 - 11:30', name: 'Arashiyama Bamboo Forest & Tenryu-ji Zen Garden', description: 'Tranquil emerald bamboo groves and 14th-century UNESCO World Heritage pond garden.', category: 'Nature' },
          { time: '13:30 - 16:00', name: 'Kinkaku-ji Golden Pavilion', description: 'Spectacular Zen Buddhist temple with top floors covered entirely in glistening gold leaf.', category: 'Culture' }
        ],
        mealsRecommendation: 'Lunch: Traditional Kyoto Matcha soba and tofu specialties.'
      },
      {
        dayNumber: 6,
        title: 'Day Trip to Nara Deer Park & Osaka Dotonbori',
        summary: 'Bow to sacred friendly sika deer in Nara Park and experience neon-lit street food in Osaka.',
        spots: [
          { time: '09:30 - 13:00', name: 'Nara Park & Todai-ji Great Buddha', description: 'Interact with hundreds of free-roaming sacred deer and see Japan\'s largest bronze Buddha statue.', category: 'Nature' },
          { time: '15:00 - 20:00', name: 'Osaka Dotonbori Canal & Glico Running Man', description: 'Lively culinary street lined with illuminated mechanical signs and Halal Takoyaki.', category: 'Food' }
        ],
        mealsRecommendation: 'Dinner: Halal Japanese Wagyu Beef in Osaka Namba.'
      },
      {
        dayNumber: 7,
        title: 'Kyoto Souvenirs & Return Flight to Dhaka',
        summary: 'Pick up Japanese matcha sweets, ceramics, and Tokyo Banana before heading to Narita/KIX for your flight home.',
        spots: [
          { time: '10:00 - 12:00', name: 'Kyoto Crafts & Green Tea Shopping', description: 'Browse Uji matcha, handmade fans, and ceramics around Kyoto Station.', category: 'Shopping' },
          { time: '14:00', name: 'Departure to Airport', description: 'Board your Dreamliner flight back to Dhaka Hazrat Shahjalal International Airport.' }
        ],
        mealsRecommendation: 'Breakfast: Japanese hotel breakfast with fresh salmon and tamagoyaki.'
      }
    ],
    includedHighlights: [
      'Tokyo, Kyoto, and Osaka route coordination',
      'Shinkansen bullet train seat reservation guide',
      'Fushimi Inari and Arashiyama bamboo grove explorations',
      'Mount Fuji panoramic day trip',
      'Nara sacred deer park visit',
      'Comprehensive Halal Japanese food directory'
    ],
    transportationAdvice: 'Use JR pass / Shinkansen for intercity travel and Suica/Pasmo cards on the subway network.',
    visaRequirementSummary: 'Japan Tourist Visa via Embassy of Japan in Dhaka (5–7 business days).',
    relatedGuideSlug: 'japan-travel-guide',
    relatedDestinationId: 'kyoto',
  },
  {
    slug: 'dubai-4-day',
    title: '4-Day Dubai Desert & Futuristic Wonder',
    seoTitle: '4-Day Dubai Itinerary for Bangladeshi Travelers – Burj Khalifa, Desert Safari & Shopping Plan',
    metaDescription: 'Detailed 4-day Dubai travel itinerary for travelers from Bangladesh. Burj Khalifa At The Top, 4x4 desert safari with BBQ, Dubai Mall, Deira Gold Souk, and BDT budget.',
    destination: 'Dubai & Sharjah',
    country: 'United Arab Emirates',
    durationDays: 4,
    estimatedBudgetBDT: '৳70,000 – ৳110,000 per person (including direct flights & 4-star hotel)',
    idealFor: ['Families', 'Couples', 'Luxury Shoppers', 'Adventure Seekers'],
    bestSeason: 'Nov - Mar',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    overview: 'Experience the magic of Arabia in 4 action-packed days: gaze from the 124th floor of Burj Khalifa, race across golden desert sand dunes on a 4x4 safari, shop in ultra-modern malls and historic spice souks.',
    days: [
      {
        dayNumber: 1,
        title: 'Arrive in Dubai & Burj Khalifa At The Top',
        summary: 'Fly direct from Dhaka to DXB Airport, check into your hotel, and marvel at the world\'s tallest building and Dubai Fountain show.',
        spots: [
          { time: '13:00', name: 'DXB Airport Arrival & Hotel Transfer', description: 'Arrive via Emirates, Biman, or flydubai and take the Dubai Metro or taxi to your hotel.', category: 'Sightseeing' },
          { time: '16:30 - 18:30', name: 'Burj Khalifa Observation Deck (Level 124/125)', description: 'Ascend in high-speed elevators for panoramic sunset views over the Persian Gulf and desert skyline.', category: 'Sightseeing' },
          { time: '19:00 - 21:00', name: 'Dubai Fountain & Dubai Mall', description: 'Watch the choreographed dancing fountain water show set against the illuminated Burj Khalifa.', category: 'Culture' }
        ],
        mealsRecommendation: 'Dinner: Arabic mezze and grilled shish tawook overlooking the Dubai Fountain.'
      },
      {
        dayNumber: 2,
        title: '4x4 Desert Safari, Dune Bashing & Starlit BBQ Camp',
        summary: 'Experience the golden Arabian desert with thrilling dune bashing, camel rides, falconry, and a starlit barbecue buffet.',
        spots: [
          { time: '10:00 - 13:00', name: 'Museum of the Future', description: 'Visit the world\'s most beautiful architectural building exploring robotics, climate, and space technology.', category: 'Culture' },
          { time: '15:00 - 21:30', name: 'Red Dunes Safari, Sandboarding & Tanoura Show', description: '4x4 Land Cruiser dune bashing, camel riding, henna painting, fire dancers, and authentic BBQ buffet in a Bedouin camp.', category: 'Adventure' }
        ],
        mealsRecommendation: 'Dinner: Open-air starlit Arabic BBQ with grilled kebabs, hummus, and fresh pita bread.'
      },
      {
        dayNumber: 3,
        title: 'Old Dubai Creek, Gold Souk & Dubai Marina Cruise',
        summary: 'Take an Abra boat across historic Dubai Creek, shop for authentic spices and gold, and cruise Dubai Marina by night.',
        spots: [
          { time: '09:30 - 12:30', name: 'Al Fahidi Heritage District & Gold/Spice Souk', description: 'Historic wind-tower architecture, traditional 1-AED Abra wooden boat ride across Dubai Creek, and endless jewelry displays.', category: 'Culture' },
          { time: '15:30 - 18:00', name: 'Dubai Miracle Garden (Seasonal) / JBR Beach', description: 'World\'s largest natural flower garden featuring 150 million blooming flowers crafted into sculptures.', category: 'Nature' },
          { time: '19:30 - 21:30', name: 'Dubai Marina Yacht / Dhow Cruise', description: 'Glide past futuristic illuminated skyscrapers and Ain Dubai Ferris Wheel.', category: 'Sightseeing' }
        ],
        mealsRecommendation: 'Lunch: Traditional Mandi or Biryani in Deira.'
      },
      {
        dayNumber: 4,
        title: 'Last-Minute Luxury Shopping & Flight to Dhaka',
        summary: 'Shop perfumes, dates, and electronics at Mall of the Emirates before transferring to DXB for your flight back to Dhaka.',
        spots: [
          { time: '10:30 - 13:30', name: 'Mall of the Emirates & Ski Dubai View', description: 'Browse world-class brands and see penguins and indoor snow slopes in the middle of the desert.', category: 'Shopping' },
          { time: '15:00', name: 'Transfer to DXB Airport', description: 'Depart on your return flight to Hazrat Shahjalal International Airport, Dhaka.' }
        ],
        mealsRecommendation: 'Breakfast: Arabian Shakshuka and Turkish coffee.'
      }
    ],
    includedHighlights: [
      'Burj Khalifa Level 124 & 125 At The Top tickets guidance',
      'Premium 4x4 red dune desert safari with BBQ dinner and shows',
      'Dubai Marina night cruise',
      'Old Dubai Abra boat ride and souk walking route',
      'Museum of the Future visit',
      'Halal dining and prayer space locations throughout Dubai'
    ],
    transportationAdvice: 'The Dubai Metro is fast and clean; use Careem or Dubai Taxi for desert and marina trips.',
    visaRequirementSummary: 'UAE Tourist eVisa (2–4 working days, issued online).',
    relatedGuideSlug: 'dubai-travel-guide',
    relatedDestinationId: 'dubai',
  },
  {
    slug: 'singapore-4-day',
    title: '4-Day Modern Singapore Highlights & Marina Bay',
    seoTitle: '4-Day Singapore Itinerary for Bangladeshi Travelers – Gardens by the Bay & Sentosa Plan',
    metaDescription: 'Complete 4-day Singapore travel itinerary for Bangladeshi visitors. Marina Bay Sands, Universal Studios Sentosa, Gardens by the Bay, Jewel Changi, BDT budget, and halal food spots.',
    destination: 'Singapore City & Sentosa',
    country: 'Singapore',
    durationDays: 4,
    estimatedBudgetBDT: '৳70,000 – ৳110,000 per person (including direct flights & 4-star hotel)',
    idealFor: ['Families with Kids', 'Couples', 'City Lovers', 'Theme Park Fans'],
    bestSeason: 'Year-Round',
    heroImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
    overview: 'Discover the world\'s cleanest and greenest smart city: explore towering Supertrees at Gardens by the Bay, ride adrenaline-pumping coasters at Universal Studios, and gaze at the indoor waterfall at Jewel Changi.',
    days: [
      {
        dayNumber: 1,
        title: 'Arrival via Changi Airport, Jewel Waterfall & Marina Bay',
        summary: 'Land at award-winning Changi Airport, witness the HSBC Rain Vortex, check into your hotel, and stroll Marina Bay.',
        spots: [
          { time: '12:00', name: 'Jewel Changi Rain Vortex', description: 'See the world\'s tallest indoor waterfall surrounded by 4-story tropical forest gardens.', category: 'Nature' },
          { time: '17:00 - 20:30', name: 'Marina Bay Waterfront & Merlion Park', description: 'Snap photos with the iconic Merlion statue spitting water into the bay with Marina Bay Sands in the background.', category: 'Sightseeing' }
        ],
        mealsRecommendation: 'Dinner: Halal Satay and Roti Prata at Lau Pa Sat festival market.'
      },
      {
        dayNumber: 2,
        title: 'Gardens by the Bay, Flower Dome & Cloud Forest',
        summary: 'Spend the day inside climate-controlled futuristic conservatories and watch the Supertree light show.',
        spots: [
          { time: '09:30 - 13:00', name: 'Flower Dome & Cloud Forest (Avatar / Waterfall)', description: 'Walk around a 35-meter indoor mountain covered in lush exotic vegetation and mist-spraying waterfalls.', category: 'Nature' },
          { time: '15:00 - 18:00', name: 'Marina Bay Sands SkyPark Observation Deck', description: 'Gaze out across Singapore Strait and city skyscrapers from the 57th-floor cantilevered deck.', category: 'Sightseeing' },
          { time: '19:45 - 20:30', name: 'Garden Rhapsody Light & Sound Show', description: 'Watch the towering 50-meter Supertrees illuminate to classical music for free.', category: 'Culture' }
        ],
        mealsRecommendation: 'Lunch: Halal dining at Satay by the Bay or Arab Street.'
      },
      {
        dayNumber: 3,
        title: 'Sentosa Island & Universal Studios Singapore',
        summary: 'Take the scenic cable car to Sentosa Island and spend an exhilarating day on Hollywood movie rides.',
        spots: [
          { time: '09:30 - 10:30', name: 'Singapore Cable Car to Sentosa', description: 'Fly across Keppel Harbour into Sentosa with panoramic ocean views.', category: 'Sightseeing' },
          { time: '10:30 - 17:30', name: 'Universal Studios Singapore', description: 'Enjoy Battlestar Galactica dueling rollercoasters, Transformers 3D, and Jurassic Park river rapids.', category: 'Adventure' },
          { time: '18:30 - 20:00', name: 'Wings of Time Sunset Water Show', description: 'Award-winning multi-sensory laser, water, and fire show by the beach.', category: 'Culture' }
        ],
        mealsRecommendation: 'Lunch: Halal-certified Mel\'s Drive-In burgers or Goldilocks at USS.'
      },
      {
        dayNumber: 4,
        title: 'Kampong Glam (Arab Street), Orchard Road & Flight Home',
        summary: 'Visit the golden Sultan Mosque, shop on trendy Orchard Road, and board your flight back to Dhaka.',
        spots: [
          { time: '10:00 - 12:30', name: 'Kampong Glam, Sultan Mosque & Haji Lane', description: 'Historic Malay-Arab heritage quarter with colorful murals, perfume shops, and boutique cafes.', category: 'Culture' },
          { time: '13:30 - 15:30', name: 'Orchard Road Shopping Spree', description: 'Explore ION Orchard, Takashimaya, and Paragon for premier fashion and beauty.', category: 'Shopping' },
          { time: '16:30', name: 'Transfer to Changi Airport (SIN)', description: 'Return flight to Dhaka via Singapore Airlines or Biman.' }
        ],
        mealsRecommendation: 'Lunch: Authentic Murtabak and Briyani at legendary Zam Zam Singapore (opposite Sultan Mosque).'
      }
    ],
    includedHighlights: [
      'Gardens by the Bay Flower Dome and Cloud Forest tickets guidance',
      'Universal Studios Sentosa day pass planning',
      'Jewel Changi waterfall exploration',
      'Sultan Mosque and Haji Lane cultural walking tour',
      'Singapore MRT contactless payment tips',
      'Halal dining directory covering Arab Street, Geylang, and Lau Pa Sat'
    ],
    transportationAdvice: 'Tap any contactless Visa/Mastercard directly at Singapore MRT gates for instant subway travel.',
    visaRequirementSummary: 'Singapore Tourist eVisa via authorized agency in Dhaka (3–5 working days).',
    relatedGuideSlug: 'singapore-travel-guide',
    relatedDestinationId: 'singapore',
  }
];

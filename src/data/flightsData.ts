export interface Airport {
  code: string;
  city: string;
  country: string;
  name: string;
  flag?: string;
  isBangladesh?: boolean;
  popular?: boolean;
}

export interface DestinationCardItem {
  id: string;
  city: string;
  country: string;
  code: string;
  airportName: string;
  region: 'Asia' | 'Middle East' | 'Europe' | 'North America' | 'Australia & Oceania' | 'Africa';
  imageUrl: string;
  flightDurationFromDAC: string;
  visaRequirement: string;
  popularReason: string;
  featured?: boolean;
}

export interface RouteGuideItem {
  slug: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  destinationCountry: string;
  heroImage: string;
  averageFlightTime: string;
  popularAirlines: string[];
  visaSummary: string;
  bestTimeToFly: string;
  travelTips: string;
}

export interface Airline {
  code: string;
  name: string;
  logo: string;
  rating?: number;
}

export interface FlightSegment {
  flightNumber: string;
  airlineCode: string;
  airlineName: string;
  aircraft: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabinClass: string;
  baggage: string;
  meal: string;
}

export interface FlightOffer {
  id: string;
  offerId?: string;
  provider?: 'aviasales' | 'travelpayouts' | string;
  airlineCode: string;
  airlineName: string;
  airlineLogo: string;
  flightNumber: string;
  aircraft: string;
  tripType: 'oneway' | 'round' | 'multi';
  origin: Airport;
  destination: Airport;
  departureDate: string;
  returnDate?: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number; // 0 = nonstop, 1 = 1 stop, 2 = 2+ stops
  stopAirports?: string[];
  layoverDuration?: string;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  priceBDT: number;
  totalPrice?: number;
  originalPrice?: number;
  originalCurrency?: string;
  currency: string;
  refundable: boolean;
  baggageAllowance: {
    cabin: string;
    checked: string;
  };
  inFlightAmenities: string[];
  partnerName: string;
  partnerDeepLink: string;
  bookingUrl?: string;
  returnSegment?: {
    flightNumber: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
    stopAirports?: string[];
    departureDate: string;
  };
  isRecommended?: boolean;
  isBestValue?: boolean;
  isFastest?: boolean;
  isCheapest?: boolean;
  isIndicative?: boolean;
  isStale?: boolean;
  fetchedAt?: string;
  expiresAt?: string;
  source?: string;
  taxesIncluded?: boolean;
  seatsRemaining?: number;
}

// Bangladesh departure airports prioritized
export const BANGLADESH_AIRPORTS: Airport[] = [
  { code: 'DAC', city: 'Dhaka', country: 'Bangladesh', name: 'Hazrat Shahjalal International Airport', flag: '🇧🇩', isBangladesh: true, popular: true },
  { code: 'CGP', city: 'Chattogram', country: 'Bangladesh', name: 'Shah Amanat International Airport', flag: '🇧🇩', isBangladesh: true, popular: true },
  { code: 'ZYL', city: 'Sylhet', country: 'Bangladesh', name: 'Osmani International Airport', flag: '🇧🇩', isBangladesh: true, popular: true },
  { code: 'CXB', city: "Cox's Bazar", country: 'Bangladesh', name: "Cox's Bazar Airport", flag: '🇧🇩', isBangladesh: true, popular: true },
  { code: 'JSR', city: 'Jashore', country: 'Bangladesh', name: 'Jashore Airport', flag: '🇧🇩', isBangladesh: true, popular: true },
  { code: 'RJH', city: 'Rajshahi', country: 'Bangladesh', name: 'Shah Makhdum Airport', flag: '🇧🇩', isBangladesh: true, popular: true },
  { code: 'SPD', city: 'Saidpur', country: 'Bangladesh', name: 'Saidpur Airport', flag: '🇧🇩', isBangladesh: true },
  { code: 'BZL', city: 'Barishal', country: 'Bangladesh', name: 'Barishal Airport', flag: '🇧🇩', isBangladesh: true },
];

// Comprehensive Global & Regional Airports
export const INTERNATIONAL_AIRPORTS: Airport[] = [
  // Middle East & Gulf (Umrah, Expat & Transit Hubs)
  { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai International Airport', flag: '🇦🇪', popular: true },
  { code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', name: 'Zayed International Airport', flag: '🇦🇪', popular: true },
  { code: 'SHJ', city: 'Sharjah', country: 'United Arab Emirates', name: 'Sharjah International Airport', flag: '🇦🇪', popular: true },
  { code: 'DOH', city: 'Doha', country: 'Qatar', name: 'Hamad International Airport', flag: '🇶🇦', popular: true },
  { code: 'JED', city: 'Jeddah', country: 'Saudi Arabia', name: 'King Abdulaziz International Airport (Makkah Gateway)', flag: '🇸🇦', popular: true },
  { code: 'MED', city: 'Medina', country: 'Saudi Arabia', name: 'Prince Mohammad Bin Abdulaziz Airport', flag: '🇸🇦', popular: true },
  { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia', name: 'King Khalid International Airport', flag: '🇸🇦', popular: true },
  { code: 'DMM', city: 'Dammam', country: 'Saudi Arabia', name: 'King Fahd International Airport', flag: '🇸🇦', popular: true },
  { code: 'MCT', city: 'Muscat', country: 'Oman', name: 'Muscat International Airport', flag: '🇴🇲', popular: true },
  { code: 'KWI', city: 'Kuwait City', country: 'Kuwait', name: 'Kuwait International Airport', flag: '🇰🇼', popular: true },
  { code: 'BAH', city: 'Manama', country: 'Bahrain', name: 'Bahrain International Airport', flag: '🇧🇭', popular: true },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul Airport', flag: '🇹🇷', popular: true },
  { code: 'SAW', city: 'Istanbul (Sabiha)', country: 'Turkey', name: 'Sabiha Gökçen International Airport', flag: '🇹🇷' },
  { code: 'AYT', city: 'Antalya', country: 'Turkey', name: 'Antalya Airport', flag: '🇹🇷' },
  { code: 'AMM', city: 'Amman', country: 'Jordan', name: 'Queen Alia International Airport', flag: '🇯🇴' },
  { code: 'BEY', city: 'Beirut', country: 'Lebanon', name: 'Beirut-Rafic Hariri International Airport', flag: '🇱🇧' },

  // South Asia (Medical, Business & Tourism)
  { code: 'CCU', city: 'Kolkata', country: 'India', name: 'Netaji Subhash Chandra Bose International Airport', flag: '🇮🇳', popular: true },
  { code: 'DEL', city: 'Delhi', country: 'India', name: 'Indira Gandhi International Airport', flag: '🇮🇳', popular: true },
  { code: 'MAA', city: 'Chennai', country: 'India', name: 'Chennai International Airport (Medical Hub)', flag: '🇮🇳', popular: true },
  { code: 'BOM', city: 'Mumbai', country: 'India', name: 'Chhatrapati Shivaji Maharaj International Airport', flag: '🇮🇳', popular: true },
  { code: 'BLR', city: 'Bangalore', country: 'India', name: 'Kempegowda International Airport', flag: '🇮🇳', popular: true },
  { code: 'HYD', city: 'Hyderabad', country: 'India', name: 'Rajiv Gandhi International Airport', flag: '🇮🇳', popular: true },
  { code: 'COK', city: 'Kochi', country: 'India', name: 'Cochin International Airport', flag: '🇮🇳' },
  { code: 'GOI', city: 'Goa', country: 'India', name: 'Dabolim Airport', flag: '🇮🇳' },
  { code: 'AMD', city: 'Ahmedabad', country: 'India', name: 'Sardar Vallabhbhai Patel International Airport', flag: '🇮🇳' },
  { code: 'MLE', city: 'Malé', country: 'Maldives', name: 'Velana International Airport', flag: '🇲🇻', popular: true },
  { code: 'CMB', city: 'Colombo', country: 'Sri Lanka', name: 'Bandaranaike International Airport', flag: '🇱🇰', popular: true },
  { code: 'KTM', city: 'Kathmandu', country: 'Nepal', name: 'Tribhuvan International Airport', flag: '🇳🇵', popular: true },
  { code: 'PBH', city: 'Paro', country: 'Bhutan', name: 'Paro International Airport', flag: '🇧🇹' },
  { code: 'KHI', city: 'Karachi', country: 'Pakistan', name: 'Jinnah International Airport', flag: '🇵🇰' },
  { code: 'LHE', city: 'Lahore', country: 'Pakistan', name: 'Allama Iqbal International Airport', flag: '🇵🇰' },
  { code: 'ISB', city: 'Islamabad', country: 'Pakistan', name: 'Islamabad International Airport', flag: '🇵🇰' },

  // Southeast Asia (Top Vacation & Leisure Hubs)
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Suvarnabhumi Airport', flag: '🇹🇭', popular: true },
  { code: 'DMK', city: 'Bangkok (Don Mueang)', country: 'Thailand', name: 'Don Mueang International Airport', flag: '🇹🇭', popular: true },
  { code: 'HKT', city: 'Phuket', country: 'Thailand', name: 'Phuket International Airport', flag: '🇹🇭', popular: true },
  { code: 'KBV', city: 'Krabi', country: 'Thailand', name: 'Krabi International Airport', flag: '🇹🇭' },
  { code: 'CNX', city: 'Chiang Mai', country: 'Thailand', name: 'Chiang Mai International Airport', flag: '🇹🇭' },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur International Airport', flag: '🇲🇾', popular: true },
  { code: 'PEN', city: 'Penang', country: 'Malaysia', name: 'Penang International Airport', flag: '🇲🇾', popular: true },
  { code: 'BKI', city: 'Kota Kinabalu', country: 'Malaysia', name: 'Kota Kinabalu International Airport', flag: '🇲🇾' },
  { code: 'LGK', city: 'Langkawi', country: 'Malaysia', name: 'Langkawi International Airport', flag: '🇲🇾' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore Changi Airport', flag: '🇸🇬', popular: true },
  { code: 'DPS', city: 'Bali (Denpasar)', country: 'Indonesia', name: 'I Gusti Ngurah Rai International Airport', flag: '🇮🇩', popular: true },
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia', name: 'Soekarno-Hatta International Airport', flag: '🇮🇩', popular: true },
  { code: 'SUB', city: 'Surabaya', country: 'Indonesia', name: 'Juanda International Airport', flag: '🇮🇩' },
  { code: 'HAN', city: 'Hanoi', country: 'Vietnam', name: 'Noi Bai International Airport', flag: '🇻🇳', popular: true },
  { code: 'SGN', city: 'Ho Chi Minh City', country: 'Vietnam', name: 'Tan Son Nhat International Airport', flag: '🇻🇳', popular: true },
  { code: 'DAD', city: 'Da Nang', country: 'Vietnam', name: 'Da Nang International Airport', flag: '🇻🇳' },
  { code: 'MNL', city: 'Manila', country: 'Philippines', name: 'Ninoy Aquino International Airport', flag: '🇵🇭', popular: true },
  { code: 'CEB', city: 'Cebu', country: 'Philippines', name: 'Mactan-Cebu International Airport', flag: '🇵🇭' },
  { code: 'PNH', city: 'Phnom Penh', country: 'Cambodia', name: 'Phnom Penh International Airport', flag: '🇰🇭' },
  { code: 'RGN', city: 'Yangon', country: 'Myanmar', name: 'Yangon International Airport', flag: '🇲🇲' },

  // East & Central Asia
  { code: 'HND', city: 'Tokyo (Haneda)', country: 'Japan', name: 'Tokyo Haneda Airport', flag: '🇯🇵', popular: true },
  { code: 'NRT', city: 'Tokyo (Narita)', country: 'Japan', name: 'Narita International Airport', flag: '🇯🇵', popular: true },
  { code: 'KIX', city: 'Osaka', country: 'Japan', name: 'Kansai International Airport', flag: '🇯🇵', popular: true },
  { code: 'ICN', city: 'Seoul (Incheon)', country: 'South Korea', name: 'Incheon International Airport', flag: '🇰🇷', popular: true },
  { code: 'GMP', city: 'Seoul (Gimpo)', country: 'South Korea', name: 'Gimpo International Airport', flag: '🇰🇷' },
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong International Airport', flag: '🇭🇰', popular: true },
  { code: 'TPE', city: 'Taipei', country: 'Taiwan', name: 'Taiwan Taoyuan International Airport', flag: '🇹🇼', popular: true },
  { code: 'PEK', city: 'Beijing (Capital)', country: 'China', name: 'Beijing Capital International Airport', flag: '🇨🇳', popular: true },
  { code: 'PKX', city: 'Beijing (Daxing)', country: 'China', name: 'Beijing Daxing International Airport', flag: '🇨🇳' },
  { code: 'PVG', city: 'Shanghai (Pudong)', country: 'China', name: 'Shanghai Pudong International Airport', flag: '🇨🇳', popular: true },
  { code: 'CAN', city: 'Guangzhou', country: 'China', name: 'Guangzhou Baiyun International Airport', flag: '🇨🇳', popular: true },
  { code: 'SZX', city: 'Shenzhen', country: 'China', name: 'Shenzhen Baoan International Airport', flag: '🇨🇳' },
  { code: 'KMG', city: 'Kunming', country: 'China', name: 'Kunming Changshui International Airport', flag: '🇨🇳', popular: true },
  { code: 'TAS', city: 'Tashkent', country: 'Uzbekistan', name: 'Islam Karimov Tashkent International Airport', flag: '🇺🇿', popular: true },
  { code: 'SKD', city: 'Samarkand', country: 'Uzbekistan', name: 'Samarkand International Airport', flag: '🇺🇿' },
  { code: 'ALA', city: 'Almaty', country: 'Kazakhstan', name: 'Almaty International Airport', flag: '🇰🇿', popular: true },
  { code: 'NQZ', city: 'Astana', country: 'Kazakhstan', name: 'Nursultan Nazarbayev International Airport', flag: '🇰🇿' },
  { code: 'GYD', city: 'Baku', country: 'Azerbaijan', name: 'Heydar Aliyev International Airport', flag: '🇦🇿', popular: true },
  { code: 'TBS', city: 'Tbilisi', country: 'Georgia', name: 'Tbilisi International Airport', flag: '🇬🇪', popular: true },

  // Europe & United Kingdom
  { code: 'LHR', city: 'London (Heathrow)', country: 'United Kingdom', name: 'London Heathrow Airport', flag: '🇬🇧', popular: true },
  { code: 'LGW', city: 'London (Gatwick)', country: 'United Kingdom', name: 'London Gatwick Airport', flag: '🇬🇧', popular: true },
  { code: 'MAN', city: 'Manchester', country: 'United Kingdom', name: 'Manchester Airport', flag: '🇬🇧', popular: true },
  { code: 'BHX', city: 'Birmingham', country: 'United Kingdom', name: 'Birmingham Airport', flag: '🇬🇧', popular: true },
  { code: 'EDI', city: 'Edinburgh', country: 'United Kingdom', name: 'Edinburgh Airport', flag: '🇬🇧' },
  { code: 'CDG', city: 'Paris (CDG)', country: 'France', name: 'Paris Charles de Gaulle Airport', flag: '🇫🇷', popular: true },
  { code: 'ORY', city: 'Paris (Orly)', country: 'France', name: 'Paris Orly Airport', flag: '🇫🇷' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt Airport', flag: '🇩🇪', popular: true },
  { code: 'MUC', city: 'Munich', country: 'Germany', name: 'Munich Airport', flag: '🇩🇪', popular: true },
  { code: 'BER', city: 'Berlin', country: 'Germany', name: 'Berlin Brandenburg Airport', flag: '🇩🇪' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Amsterdam Airport Schiphol', flag: '🇳🇱', popular: true },
  { code: 'BRU', city: 'Brussels', country: 'Belgium', name: 'Brussels Airport', flag: '🇧🇪' },
  { code: 'ZRH', city: 'Zurich', country: 'Switzerland', name: 'Zurich Airport', flag: '🇨🇭', popular: true },
  { code: 'GVA', city: 'Geneva', country: 'Switzerland', name: 'Geneva Airport', flag: '🇨🇭' },
  { code: 'VIE', city: 'Vienna', country: 'Austria', name: 'Vienna International Airport', flag: '🇦🇹', popular: true },
  { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Leonardo da Vinci–Fiumicino Airport', flag: '🇮🇹', popular: true },
  { code: 'MXP', city: 'Milan (Malpensa)', country: 'Italy', name: 'Milan Malpensa Airport', flag: '🇮🇹', popular: true },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', name: 'Josep Tarradellas Barcelona-El Prat Airport', flag: '🇪🇸', popular: true },
  { code: 'MAD', city: 'Madrid', country: 'Spain', name: 'Adolfo Suárez Madrid–Barajas Airport', flag: '🇪🇸', popular: true },
  { code: 'LIS', city: 'Lisbon', country: 'Portugal', name: 'Humberto Delgado Airport', flag: '🇵🇹', popular: true },
  { code: 'OPO', city: 'Porto', country: 'Portugal', name: 'Francisco Sá Carneiro Airport', flag: '🇵🇹' },
  { code: 'ATH', city: 'Athens', country: 'Greece', name: 'Athens International Airport', flag: '🇬🇷', popular: true },
  { code: 'PRG', city: 'Prague', country: 'Czech Republic', name: 'Václav Havel Airport Prague', flag: '🇨🇿' },
  { code: 'BUD', city: 'Budapest', country: 'Hungary', name: 'Budapest Ferenc Liszt International Airport', flag: '🇭🇺' },
  { code: 'WAW', city: 'Warsaw', country: 'Poland', name: 'Warsaw Chopin Airport', flag: '🇵🇱' },
  { code: 'CPH', city: 'Copenhagen', country: 'Denmark', name: 'Copenhagen Airport', flag: '🇩🇰' },
  { code: 'ARN', city: 'Stockholm', country: 'Sweden', name: 'Stockholm Arlanda Airport', flag: '🇸🇪' },
  { code: 'OSL', city: 'Oslo', country: 'Norway', name: 'Oslo Gardermoen Airport', flag: '🇳🇴' },
  { code: 'HEL', city: 'Helsinki', country: 'Finland', name: 'Helsinki Airport', flag: '🇫🇮' },
  { code: 'DUB', city: 'Dublin', country: 'Ireland', name: 'Dublin Airport', flag: '🇮🇪', popular: true },

  // North America (US & Canada Expat / Student Hubs)
  { code: 'JFK', city: 'New York (JFK)', country: 'United States', name: 'John F. Kennedy International Airport', flag: '🇺🇸', popular: true },
  { code: 'EWR', city: 'New York / Newark', country: 'United States', name: 'Newark Liberty International Airport', flag: '🇺🇸', popular: true },
  { code: 'BOS', city: 'Boston', country: 'United States', name: 'Boston Logan International Airport', flag: '🇺🇸', popular: true },
  { code: 'IAD', city: 'Washington D.C.', country: 'United States', name: 'Washington Dulles International Airport', flag: '🇺🇸', popular: true },
  { code: 'ORD', city: 'Chicago', country: 'United States', name: 'O\'Hare International Airport', flag: '🇺🇸', popular: true },
  { code: 'ATL', city: 'Atlanta', country: 'United States', name: 'Hartsfield-Jackson Atlanta International Airport', flag: '🇺🇸', popular: true },
  { code: 'MIA', city: 'Miami', country: 'United States', name: 'Miami International Airport', flag: '🇺🇸', popular: true },
  { code: 'DFW', city: 'Dallas / Fort Worth', country: 'United States', name: 'Dallas/Fort Worth International Airport', flag: '🇺🇸', popular: true },
  { code: 'IAH', city: 'Houston', country: 'United States', name: 'George Bush Intercontinental Airport', flag: '🇺🇸', popular: true },
  { code: 'LAX', city: 'Los Angeles', country: 'United States', name: 'Los Angeles International Airport', flag: '🇺🇸', popular: true },
  { code: 'SFO', city: 'San Francisco', country: 'United States', name: 'San Francisco International Airport', flag: '🇺🇸', popular: true },
  { code: 'SEA', city: 'Seattle', country: 'United States', name: 'Seattle-Tacoma International Airport', flag: '🇺🇸' },
  { code: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto Pearson International Airport', flag: '🇨🇦', popular: true },
  { code: 'YVR', city: 'Vancouver', country: 'Canada', name: 'Vancouver International Airport', flag: '🇨🇦', popular: true },
  { code: 'YUL', city: 'Montreal', country: 'Canada', name: 'Montréal-Trudeau International Airport', flag: '🇨🇦', popular: true },
  { code: 'YYC', city: 'Calgary', country: 'Canada', name: 'Calgary International Airport', flag: '🇨🇦' },

  // Australia & New Zealand
  { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney Kingsford Smith Airport', flag: '🇦🇺', popular: true },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', name: 'Melbourne Airport', flag: '🇦🇺', popular: true },
  { code: 'BNE', city: 'Brisbane', country: 'Australia', name: 'Brisbane Airport', flag: '🇦🇺', popular: true },
  { code: 'PER', city: 'Perth', country: 'Australia', name: 'Perth Airport', flag: '🇦🇺', popular: true },
  { code: 'ADL', city: 'Adelaide', country: 'Australia', name: 'Adelaide Airport', flag: '🇦🇺' },
  { code: 'AKL', city: 'Auckland', country: 'New Zealand', name: 'Auckland Airport', flag: '🇳🇿', popular: true },
  { code: 'CHC', city: 'Christchurch', country: 'New Zealand', name: 'Christchurch Airport', flag: '🇳🇿' },

  // Africa & Indian Ocean Islands
  { code: 'CAI', city: 'Cairo', country: 'Egypt', name: 'Cairo International Airport', flag: '🇪🇬', popular: true },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', name: 'O. R. Tambo International Airport', flag: '🇿🇦', popular: true },
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', name: 'Cape Town International Airport', flag: '🇿🇦', popular: true },
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', name: 'Jomo Kenyatta International Airport', flag: '🇰🇪', popular: true },
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', name: 'Addis Ababa Bole International Airport', flag: '🇪🇹' },
  { code: 'CMN', city: 'Casablanca', country: 'Morocco', name: 'Mohammed V International Airport', flag: '🇲🇦', popular: true },
  { code: 'MRU', city: 'Mauritius', country: 'Mauritius', name: 'Sir Seewoosagur Ramgoolam International Airport', flag: '🇲🇺', popular: true },
  { code: 'SEZ', city: 'Seychelles (Mahé)', country: 'Seychelles', name: 'Seychelles International Airport', flag: '🇸🇨' },

  // South & Central America
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', name: 'São Paulo/Guarulhos International Airport', flag: '🇧🇷' },
  { code: 'EZE', city: 'Buenos Aires', country: 'Argentina', name: 'Ministro Pistarini International Airport', flag: '🇦🇷' },
  { code: 'BOG', city: 'Bogota', country: 'Colombia', name: 'El Dorado International Airport', flag: '🇨🇴' },
  { code: 'LIM', city: 'Lima', country: 'Peru', name: 'Jorge Chávez International Airport', flag: '🇵🇪' },
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', name: 'Mexico City International Airport', flag: '🇲🇽' },
];

export const POPULAR_AIRPORTS: Airport[] = [...BANGLADESH_AIRPORTS, ...INTERNATIONAL_AIRPORTS];

// 50+ Comprehensive Popular Destinations from Bangladesh Across All Continents
export const POPULAR_DESTINATIONS_FROM_BD: DestinationCardItem[] = [
  // Middle East & Pilgrimage
  {
    id: 'dest-dxb',
    city: 'Dubai',
    country: 'United Arab Emirates',
    code: 'DXB',
    airportName: 'Dubai International Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '4h 50m direct',
    visaRequirement: '30/60-Day UAE eVisa with Azraq support',
    popularReason: 'Burj Khalifa, desert safari, Gold Souk & world-class shopping',
    featured: true,
  },
  {
    id: 'dest-auh',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    code: 'AUH',
    airportName: 'Zayed International Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '5h 15m direct',
    visaRequirement: 'UAE Tourist eVisa',
    popularReason: 'Sheikh Zayed Grand Mosque, Louvre Abu Dhabi & Yas Island',
  },
  {
    id: 'dest-shj',
    city: 'Sharjah',
    country: 'United Arab Emirates',
    code: 'SHJ',
    airportName: 'Sharjah International Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '4h 40m direct',
    visaRequirement: 'UAE Tourist eVisa (Air Arabia Hub)',
    popularReason: 'Islamic Art Museum, Al Majaz Waterfront & cultural heritage',
  },
  {
    id: 'dest-doh',
    city: 'Doha',
    country: 'Qatar',
    code: 'DOH',
    airportName: 'Hamad International Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '5h 30m direct',
    visaRequirement: 'Hayya / Qatar Tourist Visa',
    popularReason: 'Souq Waqif, National Museum of Qatar & futuristic architecture',
    featured: true,
  },
  {
    id: 'dest-jed',
    city: 'Jeddah / Makkah',
    country: 'Saudi Arabia',
    code: 'JED',
    airportName: 'King Abdulaziz International Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '6h 30m direct',
    visaRequirement: 'Saudi Umrah / Tourist eVisa with Nusuk compliance',
    popularReason: 'Gateway to Holy Makkah, Al-Balad historic district & Red Sea Corniche',
    featured: true,
  },
  {
    id: 'dest-med',
    city: 'Medina',
    country: 'Saudi Arabia',
    code: 'MED',
    airportName: 'Prince Mohammad Bin Abdulaziz Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '6h 45m direct',
    visaRequirement: 'Saudi Umrah / Tourist Visa',
    popularReason: 'Al-Masjid an-Nabawi & holy Islamic heritage sites',
    featured: true,
  },
  {
    id: 'dest-ruh',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    code: 'RUH',
    airportName: 'King Khalid International Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '6h 00m direct',
    visaRequirement: 'Saudi eVisa / Business Visa',
    popularReason: 'Kingdom Centre, historical Diriyah & Riyadh Season festivals',
  },
  {
    id: 'dest-mct',
    city: 'Muscat',
    country: 'Oman',
    code: 'MCT',
    airportName: 'Muscat International Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '4h 45m direct',
    visaRequirement: 'Oman Tourist eVisa',
    popularReason: 'Sultan Qaboos Grand Mosque, Mutrah Souq & rugged mountain wadis',
  },
  {
    id: 'dest-kwi',
    city: 'Kuwait City',
    country: 'Kuwait',
    code: 'KWI',
    airportName: 'Kuwait International Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1578895101407-742968367980?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '5h 15m direct',
    visaRequirement: 'Kuwait Visit Visa / Expat Entry',
    popularReason: 'Kuwait Towers, Souq Al-Mubarakiya & Arabian Gulf Promenade',
  },
  {
    id: 'dest-bah',
    city: 'Manama',
    country: 'Bahrain',
    code: 'BAH',
    airportName: 'Bahrain International Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '5h 20m',
    visaRequirement: 'Bahrain eVisa',
    popularReason: 'Bahrain Fort, pearl diving traditions & Formula 1 Grand Prix',
  },
  {
    id: 'dest-ist',
    city: 'Istanbul',
    country: 'Turkey',
    code: 'IST',
    airportName: 'Istanbul Airport',
    region: 'Middle East',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '7h 50m direct',
    visaRequirement: 'Turkish Sticker Visa / eVisa with valid OECD',
    popularReason: 'Bosphorus cruise, Hagia Sophia, Grand Bazaar & Blue Mosque',
    featured: true,
  },

  // Asia (Southeast, South & East Asia)
  {
    id: 'dest-bkk',
    city: 'Bangkok',
    country: 'Thailand',
    code: 'BKK',
    airportName: 'Suvarnabhumi Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '2h 30m direct',
    visaRequirement: 'Thailand Sticker Visa / eVisa',
    popularReason: 'Grand Palace, shopping in Siam & culinary street delights',
    featured: true,
  },
  {
    id: 'dest-hkt',
    city: 'Phuket',
    country: 'Thailand',
    code: 'HKT',
    airportName: 'Phuket International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '3h 30m',
    visaRequirement: 'Thailand Tourist Visa',
    popularReason: 'Phi Phi Island day trips, Patong beach, luxury private pool villas',
    featured: true,
  },
  {
    id: 'dest-kul',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    code: 'KUL',
    airportName: 'Kuala Lumpur International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '3h 45m direct',
    visaRequirement: 'Malaysia eVisa (support available)',
    popularReason: 'Petronas Twin Towers, Batu Caves & Genting Highlands',
    featured: true,
  },
  {
    id: 'dest-pen',
    city: 'Penang',
    country: 'Malaysia',
    code: 'PEN',
    airportName: 'Penang International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '4h 15m',
    visaRequirement: 'Malaysia eVisa',
    popularReason: 'George Town UNESCO street art, food capital & medical hubs',
  },
  {
    id: 'dest-sin',
    city: 'Singapore',
    country: 'Singapore',
    code: 'SIN',
    airportName: 'Singapore Changi Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '3h 55m direct',
    visaRequirement: 'Singapore eVisa with Azraq submission',
    popularReason: 'Marina Bay Sands, Gardens by the Bay & Sentosa Island',
    featured: true,
  },
  {
    id: 'dest-dps',
    city: 'Bali',
    country: 'Indonesia',
    code: 'DPS',
    airportName: 'I Gusti Ngurah Rai International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '6h 15m with 1 stop',
    visaRequirement: 'Indonesia e-VoA / eVisa',
    popularReason: 'Ubud rice terraces, Uluwatu cliff temples & sunset beaches',
    featured: true,
  },
  {
    id: 'dest-mle',
    city: 'Malé',
    country: 'Maldives',
    code: 'MLE',
    airportName: 'Velana International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '4h 15m direct',
    visaRequirement: 'Free 30-day Visa on Arrival for BD citizens',
    popularReason: 'Crystal clear turquoise atolls, overwater villas & coral reefs',
    featured: true,
  },
  {
    id: 'dest-cmb',
    city: 'Colombo',
    country: 'Sri Lanka',
    code: 'CMB',
    airportName: 'Bandaranaike International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '3h 10m direct',
    visaRequirement: 'Sri Lanka ETA / Tourist Visa',
    popularReason: 'Sigiriya Rock Fortress, Ella tea plantations & coastal trains',
  },
  {
    id: 'dest-ktm',
    city: 'Kathmandu',
    country: 'Nepal',
    code: 'KTM',
    airportName: 'Tribhuvan International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '1h 20m direct',
    visaRequirement: 'Free Visa on Arrival for Bangladeshi citizens (first visit)',
    popularReason: 'Himalayan mountain flight, Pokhara lake & historic stupas',
    featured: true,
  },
  {
    id: 'dest-han',
    city: 'Hanoi',
    country: 'Vietnam',
    code: 'HAN',
    airportName: 'Noi Bai International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '3h 30m direct',
    visaRequirement: 'Vietnam eVisa with fast-track approval',
    popularReason: 'Ha Long Bay emerald waters, Old Quarter coffee & lantern town',
  },
  {
    id: 'dest-del',
    city: 'Delhi',
    country: 'India',
    code: 'DEL',
    airportName: 'Indira Gandhi International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '2h 40m direct',
    visaRequirement: 'Indian Tourist Visa / Medical Visa',
    popularReason: 'Red Fort, Qutub Minar, Chandni Chowk & Taj Mahal day trip',
  },
  {
    id: 'dest-ccu',
    city: 'Kolkata',
    country: 'India',
    code: 'CCU',
    airportName: 'Netaji Subhash Chandra Bose International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '45m direct',
    visaRequirement: 'Indian Tourist Visa',
    popularReason: 'Victoria Memorial, Park Street shopping & Bengali culture',
  },
  {
    id: 'dest-maa',
    city: 'Chennai',
    country: 'India',
    code: 'MAA',
    airportName: 'Chennai International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '2h 50m direct',
    visaRequirement: 'Indian Tourist / Medical Visa',
    popularReason: 'Apollo & medical healthcare centers, Marina Beach & temples',
  },
  {
    id: 'dest-hnd',
    city: 'Tokyo',
    country: 'Japan',
    code: 'HND',
    airportName: 'Tokyo Haneda Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '7h 10m direct',
    visaRequirement: 'Japan Tourist Visa with Azraq document checklist',
    popularReason: 'Shibuya Crossing, Mount Fuji views, cherry blossoms & tech hubs',
    featured: true,
  },
  {
    id: 'dest-icn',
    city: 'Seoul',
    country: 'South Korea',
    code: 'ICN',
    airportName: 'Incheon International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '6h 40m direct',
    visaRequirement: 'South Korea Tourist Visa',
    popularReason: 'Gyeongbokgung Palace, Myeongdong shopping & K-Culture',
  },
  {
    id: 'dest-hkg',
    city: 'Hong Kong',
    country: 'Hong Kong',
    code: 'HKG',
    airportName: 'Hong Kong International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1506970845246-18f21d533b20?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '3h 50m direct',
    visaRequirement: 'Pre-arrival Registration (PAR) / Visa',
    popularReason: 'Victoria Peak skyline, Disneyland & world trade expo',
  },
  {
    id: 'dest-can',
    city: 'Guangzhou',
    country: 'China',
    code: 'CAN',
    airportName: 'Guangzhou Baiyun International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '3h 55m direct',
    visaRequirement: 'China Business / Tourist Visa',
    popularReason: 'Canton Fair trade hub, Canton Tower & Pearl River cruises',
  },
  {
    id: 'dest-tas',
    city: 'Tashkent & Samarkand',
    country: 'Uzbekistan',
    code: 'TAS',
    airportName: 'Islam Karimov Tashkent International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '5h 30m',
    visaRequirement: 'Uzbekistan Tourist eVisa',
    popularReason: 'Silk Road architecture, Registan Square, blue mosaic domes & Islamic history',
  },
  {
    id: 'dest-gyd',
    city: 'Baku',
    country: 'Azerbaijan',
    code: 'GYD',
    airportName: 'Heydar Aliyev International Airport',
    region: 'Asia',
    imageUrl: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '6h 30m',
    visaRequirement: 'Azerbaijan ASAN eVisa (3-day delivery)',
    popularReason: 'Flame Towers, Caspian Sea Boulevard & Old City fortress',
  },

  // Europe & UK
  {
    id: 'dest-lhr',
    city: 'London',
    country: 'United Kingdom',
    code: 'LHR',
    airportName: 'London Heathrow Airport',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '11h 15m direct',
    visaRequirement: 'UK Standard Visitor Visa (Assistance available)',
    popularReason: 'Big Ben, London Eye, British Museum & student communities',
    featured: true,
  },
  {
    id: 'dest-man',
    city: 'Manchester',
    country: 'United Kingdom',
    code: 'MAN',
    airportName: 'Manchester Airport',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1579275542618-a1dfed5f54ba?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '12h 30m with 1 stop',
    visaRequirement: 'UK Standard Visitor Visa',
    popularReason: 'Old Trafford stadium, universities & northern UK connection',
  },
  {
    id: 'dest-cdg',
    city: 'Paris',
    country: 'France',
    code: 'CDG',
    airportName: 'Paris Charles de Gaulle Airport',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '11h 45m',
    visaRequirement: 'Schengen Visa (France)',
    popularReason: 'Eiffel Tower, Louvre Museum & Seine River romantic cruises',
    featured: true,
  },
  {
    id: 'dest-ams',
    city: 'Amsterdam',
    country: 'Netherlands',
    code: 'AMS',
    airportName: 'Amsterdam Airport Schiphol',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '11h 50m with 1 stop',
    visaRequirement: 'Schengen Visa (Netherlands)',
    popularReason: 'Canal cruises, Van Gogh Museum, tulips & cycling capital',
  },
  {
    id: 'dest-fra',
    city: 'Frankfurt',
    country: 'Germany',
    code: 'FRA',
    airportName: 'Frankfurt Airport',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '11h 20m with 1 stop',
    visaRequirement: 'Schengen Visa (Germany)',
    popularReason: 'European financial hub, historic Römerberg & trade fairs',
  },
  {
    id: 'dest-zrh',
    city: 'Zurich & Swiss Alps',
    country: 'Switzerland',
    code: 'ZRH',
    airportName: 'Zurich Airport',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '12h 00m with 1 stop',
    visaRequirement: 'Schengen Visa (Switzerland)',
    popularReason: 'Snow-capped Swiss Alps, Lake Zurich, Lucerne & chocolate tasting',
    featured: true,
  },
  {
    id: 'dest-fco',
    city: 'Rome',
    country: 'Italy',
    code: 'FCO',
    airportName: 'Leonardo da Vinci–Fiumicino Airport',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '11h 30m',
    visaRequirement: 'Schengen Visa (Italy)',
    popularReason: 'Colosseum, Vatican City, Trevi Fountain & Roman history',
  },
  {
    id: 'dest-bcn',
    city: 'Barcelona',
    country: 'Spain',
    code: 'BCN',
    airportName: 'Josep Tarradellas Barcelona-El Prat Airport',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '12h 10m',
    visaRequirement: 'Schengen Visa (Spain)',
    popularReason: 'Sagrada Família, Park Güell & Mediterranean coastline',
  },
  {
    id: 'dest-ath',
    city: 'Athens',
    country: 'Greece',
    code: 'ATH',
    airportName: 'Athens International Airport',
    region: 'Europe',
    imageUrl: 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '10h 40m with 1 stop',
    visaRequirement: 'Schengen Visa (Greece)',
    popularReason: 'Acropolis, Parthenon & gateway to Santorini & Mykonos islands',
  },

  // North America
  {
    id: 'dest-jfk',
    city: 'New York',
    country: 'United States',
    code: 'JFK',
    airportName: 'John F. Kennedy International Airport',
    region: 'North America',
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '17h 30m with 1 stop',
    visaRequirement: 'US B1/B2 Tourist Visa / F1 Student Visa',
    popularReason: 'Times Square, Statue of Liberty, Central Park & Empire State',
    featured: true,
  },
  {
    id: 'dest-lax',
    city: 'Los Angeles',
    country: 'United States',
    code: 'LAX',
    airportName: 'Los Angeles International Airport',
    region: 'North America',
    imageUrl: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '19h 30m with 1 stop',
    visaRequirement: 'US B1/B2 Visa',
    popularReason: 'Hollywood Walk of Fame, Santa Monica beach & Universal Studios',
  },
  {
    id: 'dest-sfo',
    city: 'San Francisco',
    country: 'United States',
    code: 'SFO',
    airportName: 'San Francisco International Airport',
    region: 'North America',
    imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '19h 15m with 1 stop',
    visaRequirement: 'US Visa',
    popularReason: 'Golden Gate Bridge, Silicon Valley tech headquarters & cable cars',
  },
  {
    id: 'dest-yyz',
    city: 'Toronto',
    country: 'Canada',
    code: 'YYZ',
    airportName: 'Toronto Pearson International Airport',
    region: 'North America',
    imageUrl: 'https://images.unsplash.com/photo-1507992781348-310259076fe0?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '18h 00m with 1 stop',
    visaRequirement: 'Canada Visitor Visa (V-1) / Study Permit',
    popularReason: 'CN Tower, Niagara Falls day trip & large Bangladeshi diaspora community',
    featured: true,
  },
  {
    id: 'dest-yvr',
    city: 'Vancouver',
    country: 'Canada',
    code: 'YVR',
    airportName: 'Vancouver International Airport',
    region: 'North America',
    imageUrl: 'https://images.unsplash.com/photo-1559511260-66a65e09b2ee?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '18h 45m with 1 stop',
    visaRequirement: 'Canada Visa',
    popularReason: 'Stanley Park, scenic Rocky Mountains, coastal fjords & universities',
  },

  // Australia & Oceania
  {
    id: 'dest-syd',
    city: 'Sydney',
    country: 'Australia',
    code: 'SYD',
    airportName: 'Sydney Kingsford Smith Airport',
    region: 'Australia & Oceania',
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '13h 20m with 1 stop',
    visaRequirement: 'Australia Visitor Visa (Subclass 600) / Student (500)',
    popularReason: 'Sydney Opera House, Harbour Bridge & Bondi Beach',
    featured: true,
  },
  {
    id: 'dest-mel',
    city: 'Melbourne',
    country: 'Australia',
    code: 'MEL',
    airportName: 'Melbourne Airport',
    region: 'Australia & Oceania',
    imageUrl: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '13h 45m with 1 stop',
    visaRequirement: 'Australia Visitor Visa (Subclass 600)',
    popularReason: 'Great Ocean Road, Melbourne laneway coffee & arts culture',
    featured: true,
  },
  {
    id: 'dest-per',
    city: 'Perth',
    country: 'Australia',
    code: 'PER',
    airportName: 'Perth Airport',
    region: 'Australia & Oceania',
    imageUrl: 'https://images.unsplash.com/photo-1574974671999-24b7dfba0d53?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '10h 30m with 1 stop',
    visaRequirement: 'Australia Visa',
    popularReason: 'Closest Australian hub to Bangladesh, Cottesloe beach & Rottnest Island quokkas',
  },
  {
    id: 'dest-akl',
    city: 'Auckland',
    country: 'New Zealand',
    code: 'AKL',
    airportName: 'Auckland Airport',
    region: 'Australia & Oceania',
    imageUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '16h 30m with 1 stop',
    visaRequirement: 'New Zealand Visitor Visa',
    popularReason: 'Hobbiton movie set, geothermal Rotorua & panoramic harbor sails',
  },

  // Africa & Indian Ocean
  {
    id: 'dest-cai',
    city: 'Cairo',
    country: 'Egypt',
    code: 'CAI',
    airportName: 'Cairo International Airport',
    region: 'Africa',
    imageUrl: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '8h 30m with 1 stop',
    visaRequirement: 'Egypt Tourist Visa',
    popularReason: 'Pyramids of Giza, Sphinx & Nile River cruises',
    featured: true,
  },
  {
    id: 'dest-jnb',
    city: 'Johannesburg',
    country: 'South Africa',
    code: 'JNB',
    airportName: 'O. R. Tambo International Airport',
    region: 'Africa',
    imageUrl: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '14h 00m with 1 stop',
    visaRequirement: 'South Africa Tourist Visa',
    popularReason: 'Kruger Safari gateway, Gold Reef City & Nelson Mandela Square',
  },
  {
    id: 'dest-cpt',
    city: 'Cape Town',
    country: 'South Africa',
    code: 'CPT',
    airportName: 'Cape Town International Airport',
    region: 'Africa',
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '15h 30m with 1 stop',
    visaRequirement: 'South Africa Tourist Visa',
    popularReason: 'Table Mountain cableway, Cape of Good Hope & Boulders penguin colony',
    featured: true,
  },
  {
    id: 'dest-nbo',
    city: 'Nairobi',
    country: 'Kenya',
    code: 'NBO',
    airportName: 'Jomo Kenyatta International Airport',
    region: 'Africa',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '11h 15m with 1 stop',
    visaRequirement: 'Kenya Electronic Travel Authorisation (eTA)',
    popularReason: 'Maasai Mara Great Migration, Giraffe Centre & safari expeditions',
  },
  {
    id: 'dest-mru',
    city: 'Mauritius',
    country: 'Mauritius',
    code: 'MRU',
    airportName: 'Sir Seewoosagur Ramgoolam International Airport',
    region: 'Africa',
    imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '9h 30m with 1 stop',
    visaRequirement: 'Visa on Arrival (free 60 days)',
    popularReason: 'Le Morne Brabant mountain, underwater waterfall illusion & tropical lagoons',
    featured: true,
  },
  {
    id: 'dest-cmn',
    city: 'Casablanca & Marrakesh',
    country: 'Morocco',
    code: 'CMN',
    airportName: 'Mohammed V International Airport',
    region: 'Africa',
    imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80',
    flightDurationFromDAC: '13h 00m with 1 stop',
    visaRequirement: 'Morocco Tourist eVisa',
    popularReason: 'Hassan II Mosque over the Atlantic, Jemaa el-Fnaa souks & Sahara desert',
  },
];

// Popular Route Guides with helpful facts for Bangladeshi travelers
export const POPULAR_ROUTE_GUIDES: RouteGuideItem[] = [
  {
    slug: 'dhaka-to-kuala-lumpur',
    originCode: 'DAC',
    originCity: 'Dhaka',
    destinationCode: 'KUL',
    destinationCity: 'Kuala Lumpur',
    destinationCountry: 'Malaysia',
    heroImage: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=1200&q=85',
    averageFlightTime: '3h 45m (Non-stop)',
    popularAirlines: ['Biman Bangladesh', 'Malaysia Airlines', 'AirAsia', 'US-Bangla'],
    visaSummary: 'Malaysia eVisa required. Azraq desk provides verification in 2-3 working days.',
    bestTimeToFly: 'Year-round; November to February offers ideal weather for sightseeing.',
    travelTips: 'KLIA Express takes 28 mins to KL Sentral. Keep passport with at least 6 months validity.',
  },
  {
    slug: 'dhaka-to-dubai',
    originCode: 'DAC',
    originCity: 'Dhaka',
    destinationCode: 'DXB',
    destinationCity: 'Dubai',
    destinationCountry: 'United Arab Emirates',
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85',
    averageFlightTime: '4h 50m (Non-stop)',
    popularAirlines: ['Emirates', 'Flydubai', 'Biman Bangladesh', 'US-Bangla'],
    visaSummary: 'UAE 30/60-day tourist visa processed within 24-48 hours with hotel booking.',
    bestTimeToFly: 'October to April for outdoor desert safaris, beach clubs, and theme parks.',
    travelTips: 'Dubai Metro connects DXB Airport Terminal 1 & 3 directly to Downtown Dubai.',
  },
  {
    slug: 'dhaka-to-bangkok',
    originCode: 'DAC',
    originCity: 'Dhaka',
    destinationCode: 'BKK',
    destinationCity: 'Bangkok',
    destinationCountry: 'Thailand',
    heroImage: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1200&q=85',
    averageFlightTime: '2h 30m (Non-stop)',
    popularAirlines: ['Thai Airways', 'Biman Bangladesh', 'US-Bangla', 'Thai Lion Air'],
    visaSummary: 'Thailand tourist visa (60 days) or e-Visa applied through VFS Dhaka.',
    bestTimeToFly: 'November to February (cool & dry season for island hopping & city shopping).',
    travelTips: 'Airport Rail Link connects Suvarnabhumi Airport to Phaya Thai BTS in 26 minutes.',
  },
  {
    slug: 'dhaka-to-singapore',
    originCode: 'DAC',
    originCity: 'Dhaka',
    destinationCode: 'SIN',
    destinationCity: 'Singapore',
    destinationCountry: 'Singapore',
    heroImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=85',
    averageFlightTime: '3h 55m (Non-stop)',
    popularAirlines: ['Singapore Airlines', 'Biman Bangladesh', 'US-Bangla'],
    visaSummary: 'Singapore eVisa submitted through authorized agencies like Azraq Travel.',
    bestTimeToFly: 'Year-round destination with lively events, Great Singapore Sale & festivals.',
    travelTips: 'Changi MRT connects seamlessly to city center. Grab/EZ-Link cards widely accepted.',
  },
  {
    slug: 'dhaka-to-london',
    originCode: 'DAC',
    originCity: 'Dhaka',
    destinationCode: 'LHR',
    destinationCity: 'London',
    destinationCountry: 'United Kingdom',
    heroImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=85',
    averageFlightTime: '11h 15m (Direct) / 13h+ (1 stop via Gulf)',
    popularAirlines: ['Biman Bangladesh', 'Qatar Airways', 'Emirates', 'Saudia', 'Gulf Air'],
    visaSummary: 'UK Standard Visitor Visa (apply 2-3 months in advance via VFS Global).',
    bestTimeToFly: 'May to September for long daylight hours and pleasant warm weather.',
    travelTips: 'Elizabeth Line or Heathrow Express provides fastest transit into central London.',
  },
  {
    slug: 'dhaka-to-jeddah',
    originCode: 'DAC',
    originCity: 'Dhaka',
    destinationCode: 'JED',
    destinationCity: 'Jeddah',
    destinationCountry: 'Saudi Arabia',
    heroImage: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=1200&q=85',
    averageFlightTime: '6h 30m (Non-stop)',
    popularAirlines: ['Saudia', 'Biman Bangladesh', 'Flynas', 'Qatar Airways', 'Gulf Air'],
    visaSummary: 'Saudi Umrah Visa, Tourist eVisa, or Stopover Visa through Nusuk.',
    bestTimeToFly: 'November to March for mild temperatures and Umrah pilgrimages.',
    travelTips: 'Haramain High Speed Railway links JED Airport to Makkah in 54 minutes.',
  },
];

export interface AviasalesSearchParams {
  origin?: string;
  destination?: string;
  departDate?: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  tripType?: 'round' | 'oneway' | 'multi';
  source?: string;
}

/**
 * Computes the exact Aviasales live search query key (e.g. "DAC3108CGP1" for DAC to CGP on 31-Aug for 1 adult).
 */
export function getAviasalesSearchKey(params: AviasalesSearchParams = {}): string {
  const originCode = (params.origin || 'DAC').toUpperCase();
  const destCode = (params.destination || 'CGP').toUpperCase();
  const adults = params.adults && params.adults > 0 ? params.adults : 1;
  const children = params.children || 0;
  const infants = params.infants || 0;

  // Format date helper: YYYY-MM-DD -> DDMM (e.g. 2026-08-31 -> 3108)
  const formatDateForAviasales = (dateStr?: string): string => {
    if (!dateStr) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}${month}`;
    }
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}${parts[1]}`; // DDMM
      }
    } catch {
      // ignore
    }
    return '3108';
  };

  const cabinSuffix =
    params.cabin === 'Business' ? 'c' : params.cabin === 'First' ? 'f' : params.cabin === 'Premium Economy' ? 'w' : '';

  const depFormatted = formatDateForAviasales(params.departDate);
  const retFormatted = params.tripType === 'round' ? formatDateForAviasales(params.returnDate) : '';

  let paxSuffix = `${adults}`;
  if (children > 0 || infants > 0 || cabinSuffix) {
    paxSuffix = `${adults}${children || 0}${infants || 0}${cabinSuffix}`;
  }

  return `${originCode}${depFormatted}${destCode}${retFormatted}${paxSuffix}`;
}

/**
 * Builds official Aviasales affiliate search deep links and direct search URLs.
 * Example result: https://www.aviasales.com/search/DAC3108CGP1?marker=760251
 */
export function buildAviasalesSearchUrl(params: AviasalesSearchParams = {}): string {
  const searchKey = getAviasalesSearchKey(params);
  const originCode = (params.origin || 'DAC').toUpperCase();
  // Standard Aviasales direct search page with affiliate marker and exact route params in BDT
  return `https://www.aviasales.com/search/${searchKey}?marker=765415&trs=565363&currency=bdt&locale=en&params=${originCode}1`;
}

/**
 * Anonymous event tracker for flight searches, autocomplete, and affiliate click attribution
 */
export function trackFlightSearchEvent(
  eventName:
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
    | 'affiliate_deal_clicked',
  payload: Record<string, any>
) {
  try {
    const logData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...payload,
    };
    // Log to console for development audit & dispatch custom DOM event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('azraq_flight_analytics', { detail: logData }));
      if ((import.meta as any).env?.DEV) {
        console.log(`%c[Flight Analytics] ${eventName}`, 'color: #006ce4; font-weight: bold;', payload);
      }
    }
  } catch {
    // ignore
  }
}

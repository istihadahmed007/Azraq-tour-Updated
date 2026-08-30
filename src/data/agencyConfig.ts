export const AZRAQ_AFFILIATE_LINKS = {
  klook: 'https://klook.tp.st/aXDQ3uLD',
  yesim: 'https://yesim.tp.st/Y1ph3dlm',
  kiwitaxi: 'https://kiwitaxi.tp.st/hffw13VN',
  gettransfer: 'https://gettransfer.tp.st/L24TtJvV',
  airalo: 'https://airalo.tp.st/tsOiboPM',
} as const;

export interface AgencyConfig {
  agencyName: string;
  tagline: string;
  subTagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  phone: string;
  phoneDisplay: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  officeAddress: string;
  officeCity: string;
  officeCountry: string;
  workingHours: string;
  operatingDays: string;
  travelpayoutsPartnerId?: string;
  travelpayoutsMarker?: string;
  travelpayoutsTrsId?: string;
  aviasalesAffiliateUrl: string;
  aviasalesBaseUrl: string;
  officialAffiliateDisclosure: string;
  currencies: { code: string; symbol: string; rateAgainstBDT: number }[];
  partnerDisclaimer: string;
  affiliateDisclosureText: string;
  affiliateLinks: typeof AZRAQ_AFFILIATE_LINKS;
}

export const AZRAQ_AGENCY_CONFIG: AgencyConfig = {
  agencyName: 'Azraq Trips',
  tagline: 'Travel farther. Experience more.',
  subTagline: 'Bangladesh’s Premier Online Travel Agency',
  heroHeadline: 'Travel farther. Experience more.',
  heroSubheadline: 'Compare flight options, book handpicked stays, unlock curated packages, and plan with AI.',
  phone: '+8801851172032',
  phoneDisplay: '+880 1851-172032',
  whatsappNumber: '8801851172032',
  whatsappDisplay: '+880 1851-172032',
  email: 'info@azraqtrips.com',
  officeAddress: 'Dhaka',
  officeCity: 'Dhaka',
  officeCountry: 'Bangladesh',
  workingHours: '10:00 AM – 8:00 PM',
  operatingDays: 'Saturday – Thursday (24/7 WhatsApp concierge)',
  travelpayoutsPartnerId: '565363',
  travelpayoutsMarker: '765415',
  travelpayoutsTrsId: '565363',
  // Compatibility fields retained for existing components; the White Label subdomain owns the user journey.
  aviasalesAffiliateUrl: 'https://flights.azraqtrips.com/',
  aviasalesBaseUrl: 'https://flights.azraqtrips.com/',
  officialAffiliateDisclosure:
    'Flight search and booking services are provided through our travel partners. We may earn a commission when you complete a booking through our affiliate links.',
  currencies: [
    { code: 'BDT', symbol: '৳', rateAgainstBDT: 1 },
    { code: 'USD', symbol: '$', rateAgainstBDT: 0.0083 },
    { code: 'AED', symbol: 'AED ', rateAgainstBDT: 0.0305 },
    { code: 'EUR', symbol: '€', rateAgainstBDT: 0.0078 },
    { code: 'GBP', symbol: '£', rateAgainstBDT: 0.0066 },
  ],
  partnerDisclaimer:
    'Flight search results, prices, availability, booking conditions, payment, ticket issuance, changes, and refunds may be handled by the selected travel partner. Azraq provides travel guidance and concierge assistance according to the applicable service terms.',
  affiliateDisclosureText:
    'Azraq collaborates with licensed global travel distribution partners and Travelpayouts to provide comprehensive flight and lodging rate comparisons. When you search or book through partner links, Azraq may earn an affiliate commission at no additional cost to you. Direct airline and visa concierge services are serviced by our Dhaka travel desk.',
  affiliateLinks: AZRAQ_AFFILIATE_LINKS,
};

export const AGENCY_CONFIG = AZRAQ_AGENCY_CONFIG;


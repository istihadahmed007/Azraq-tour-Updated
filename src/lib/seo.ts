export const SITE_URL = 'https://www.azraqtrips.com';
export const SITE_NAME = 'AzraqTrips';
export const BRAND_TAGLINE = 'AI-Powered Travel Planning & Services for Bangladesh';
export const DEFAULT_TITLE = 'AzraqTrips – AI Travel Planner & Travel Services for Bangladesh';
export const DEFAULT_DESCRIPTION =
  'Plan smarter with AzraqTrips, an AI-powered travel platform for Bangladeshi travelers. Discover destinations, create personalized itineraries, explore flights, travel guides, visa information and more.';
export const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=630&q=85';
export const TWITTER_HANDLE = '@azraqtrips';

export interface SEOConfig {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article' | 'place' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  structuredData?: any | any[];
}

export function buildCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Remove trailing slashes except for root
  const normalized = cleanPath.length > 1 && cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;
  return `${SITE_URL}${normalized === '/' ? '' : normalized}`;
}

export function buildPageTitle(pageTitle?: string): string {
  if (!pageTitle || pageTitle === DEFAULT_TITLE) {
    return DEFAULT_TITLE;
  }
  if (pageTitle.includes('AzraqTrips')) {
    return pageTitle;
  }
  return `${pageTitle} | AzraqTrips`;
}

// Structured Data / JSON-LD Builders
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE_URL}/#organization`,
    name: 'AzraqTrips',
    alternateName: 'Azraq Tours & Travels',
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512x512.png`,
    image: DEFAULT_OG_IMAGE,
    description:
      'AzraqTrips is an AI-powered travel platform and travel services agency based in Dhaka, Bangladesh, providing personalized itineraries, visa assistance, and flight solutions.',
    telephone: '+8801851172032',
    email: 'info@azraqtrips.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Road 11, Block D, Banani / Gulshan-2',
      addressLocality: 'Dhaka',
      postalCode: '1212',
      addressCountry: 'BD',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 23.7925,
      longitude: 90.4078,
    },
    areaServed: {
      '@type': 'Country',
      name: 'Bangladesh',
    },
    priceRange: '৳৳ - ৳৳৳৳',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
    ],
    sameAs: [
      'https://www.facebook.com/azraqtrips',
      'https://www.instagram.com/azraqtrips',
      'https://twitter.com/azraqtrips',
    ],
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'AzraqTrips',
    description: DEFAULT_DESCRIPTION,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  };
}

export function getTouristDestinationSchema(dest: {
  name: string;
  country: string;
  description: string;
  imageUrl?: string;
  bestTimeToVisit?: string;
  currency?: string;
  url: string;
  rating?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: dest.name,
    description: dest.description,
    image: dest.imageUrl || DEFAULT_OG_IMAGE,
    url: dest.url.startsWith('http') ? dest.url : `${SITE_URL}${dest.url}`,
    containedInPlace: {
      '@type': 'Country',
      name: dest.country,
    },
    touristType: ['International Travelers', 'Bangladeshi Travelers', 'Holidaymakers', 'Couples', 'Families'],
  };
}

export function getArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedDate: string;
  modifiedDate?: string;
  authorName?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url.startsWith('http') ? article.url : `${SITE_URL}${article.url}`,
    },
    headline: article.title,
    description: article.description,
    image: article.imageUrl || DEFAULT_OG_IMAGE,
    datePublished: article.publishedDate,
    dateModified: article.modifiedDate || article.publishedDate,
    author: {
      '@type': 'Person',
      name: article.authorName || 'AzraqTrips Editorial Team',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon-512x512.png`,
      },
    },
  };
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function getSoftwareApplicationSchema(app: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    description: app.description,
    url: app.url.startsWith('http') ? app.url : `${SITE_URL}${app.url}`,
    applicationCategory: app.applicationCategory || 'TravelApplication',
    operatingSystem: app.operatingSystem || 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

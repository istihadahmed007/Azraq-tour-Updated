import { ALL_DESTINATIONS, findDestinationBySlug } from '../data/destinationsData';
import { TRAVEL_GUIDES } from '../data/travelGuidesData';
import { CURATED_ITINERARIES } from '../data/itinerariesData';
import { OFFICIAL_VISA_REQUIREMENTS } from '../data/visaRequirementsData';
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  getOrganizationSchema,
  getWebSiteSchema,
  getBreadcrumbSchema,
  getTouristDestinationSchema,
  getArticleSchema,
  getFAQSchema,
  getSoftwareApplicationSchema,
} from './seo';

export interface SeoRenderResult {
  statusCode: number;
  html: string;
  isPrivate?: boolean;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderSeoPage(pathname: string, htmlTemplate: string): SeoRenderResult {
  const cleanPath = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

  // Check private paths
  const isPrivate =
    cleanPath.startsWith('/admin') ||
    cleanPath.startsWith('/dashboard') ||
    cleanPath.startsWith('/profile') ||
    cleanPath.startsWith('/settings') ||
    cleanPath.startsWith('/auth') ||
    cleanPath.startsWith('/api');

  if (isPrivate) {
    const metaHead = `
    <title>AzraqTrips – Portal</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="canonical" href="${SITE_URL}${cleanPath}" />
    `;
    const replaced = htmlTemplate
      .replace(/<title>.*?<\/title>/is, '')
      .replace(/<link rel="canonical".*?\/>/is, '')
      .replace('</head>', `${metaHead}\n</head>`);
    return { statusCode: 200, html: replaced, isPrivate: true };
  }

  // 1. Homepage
  if (cleanPath === '/') {
    const title = 'AzraqTrips – AI Travel Planner & Travel Services for Bangladesh';
    const description =
      'AzraqTrips is an AI-powered travel platform for travelers from Bangladesh. Discover destinations, create personalized day-by-day itineraries, explore flights from Dhaka, read in-depth travel guides, verify visa requirements, and optimize your travel budget in BDT.';
    const canonical = `${SITE_URL}/`;
    const schemas = [getOrganizationSchema(), getWebSiteSchema()];

    const bodySnippet = `
      <header class="sr-only">
        <h1>AI Travel Planner for Your Perfect Trip</h1>
        <p>${escapeHtml(description)}</p>
      </header>
      <main class="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 class="text-3xl sm:text-5xl font-black text-white mb-4">AI Travel Planner for Your Perfect Trip</h1>
        <p class="max-w-2xl text-slate-200 mb-6 text-base sm:text-lg">${escapeHtml(description)}</p>
        <div class="flex flex-wrap gap-4 justify-center">
          <a href="/destinations" class="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold">Explore Destinations</a>
          <a href="/ai-travel-planner" class="px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold">Plan with AI</a>
          <a href="/travel-guides" class="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold">Travel Guides</a>
          <a href="/visa" class="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold">Visa Requirements</a>
        </div>
      </main>
    `;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        schemas,
        bodySnippet,
      }),
    };
  }

  // 2. AI Travel Planner Landing Page
  if (cleanPath === '/ai-travel-planner' || cleanPath === '/ai-planner') {
    const title = 'AI Travel Planner for Bangladesh – Instant Itineraries & Budget in BDT';
    const description =
      'Plan your dream international vacation with AzraqTrips AI Travel Planner. Generate instant day-by-day itineraries from Dhaka, calculate costs in BDT, get Halal food suggestions, and check visa requirements.';
    const canonical = `${SITE_URL}/ai-travel-planner`;
    const faqs = [
      {
        question: 'How does the AzraqTrips AI Travel Planner work?',
        answer: 'Enter your destination, departure date from Dhaka, trip duration, travel style, and budget tier. Our AI instantly constructs an optimized day-by-day itinerary with verified timings, flight options, Halal food suggestions, and BDT budget breakdowns.',
      },
      {
        question: 'Is the AI Travel Planner free to use for Bangladeshi travelers?',
        answer: 'Yes, generating customized travel plans and itineraries on AzraqTrips is 100% free. You can also request personalized visa assistance and flight booking quotes directly.',
      },
      {
        question: 'Does the planner account for flights departing from Dhaka (DAC)?',
        answer: 'Yes, all itineraries and budgets factor in direct and 1-stop flights departing from Hazrat Shahjalal International Airport in Dhaka to popular Asian destinations.',
      },
    ];

    const schemas = [
      getSoftwareApplicationSchema({
        name: 'AzraqTrips AI Travel Planner',
        description,
        url: canonical,
        applicationCategory: 'TravelApplication',
      }),
      getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'AI Travel Planner', url: '/ai-travel-planner' },
      ]),
      getFAQSchema(faqs),
    ];

    const bodySnippet = `
      <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-5xl mx-auto">
        <h1 class="text-3xl sm:text-5xl font-black text-white mb-4">AI Travel Planner for Bangladesh Travelers</h1>
        <p class="text-slate-200 text-lg mb-8 leading-relaxed">${escapeHtml(description)}</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div class="p-6 rounded-2xl bg-slate-800 border border-slate-700">
            <h2 class="text-xl font-bold mb-2">⚡ Instant Day-by-Day Plans</h2>
            <p class="text-slate-300 text-sm">Detailed schedules with morning, afternoon, and evening activities optimized for hassle-free travel.</p>
          </div>
          <div class="p-6 rounded-2xl bg-slate-800 border border-slate-700">
            <h2 class="text-xl font-bold mb-2">৳ BDT Budget Estimator</h2>
            <p class="text-slate-300 text-sm">Real-world cost projections for flights from Dhaka, hotels, local transport, meals, and tickets.</p>
          </div>
          <div class="p-6 rounded-2xl bg-slate-800 border border-slate-700">
            <h2 class="text-xl font-bold mb-2">🛂 Visa & Halal Dining</h2>
            <p class="text-slate-300 text-sm">Bangladeshi passport visa requirements, bank statement rules, and verified Halal food locations.</p>
          </div>
        </div>
      </main>
    `;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        schemas,
        bodySnippet,
      }),
    };
  }

  // 3. Destinations Directory
  if (cleanPath === '/destinations') {
    const title = 'Popular Travel Destinations for Bangladeshi Tourists – AzraqTrips';
    const description =
      'Explore top travel destinations for Bangladeshi travelers including Malaysia, Thailand, Bali Indonesia, Singapore, Dubai UAE, Maldives, and Japan with visa details and flight routes from Dhaka.';
    const canonical = `${SITE_URL}/destinations`;

    const schemas = [
      getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Destinations', url: '/destinations' },
      ]),
    ];

    const destListHtml = ALL_DESTINATIONS.slice(0, 12)
      .map(
        (d) => `
        <article class="p-4 rounded-xl bg-slate-800 border border-slate-700">
          <h2 class="text-lg font-bold text-white"><a href="/destinations/${d.id}" class="hover:text-blue-400">${escapeHtml(d.name)}, ${escapeHtml(d.country)}</a></h2>
          <p class="text-slate-300 text-sm mt-1">${escapeHtml(d.description)}</p>
          <div class="mt-2 text-xs text-amber-400">Budget: ${escapeHtml(d.priceRange || d.estimatedBudget || 'BDT 60,000 - 90,000')}</div>
        </article>
      `
      )
      .join('');

    const bodySnippet = `
      <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-6xl mx-auto">
        <h1 class="text-3xl sm:text-4xl font-black text-white mb-4">Popular Travel Destinations for Bangladeshi Tourists</h1>
        <p class="text-slate-200 text-base mb-8">${escapeHtml(description)}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${destListHtml}</div>
      </main>
    `;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        schemas,
        bodySnippet,
      }),
    };
  }

  // 4. Destination Detail Page (/destinations/:slug or /destination/:slug)
  if (cleanPath.startsWith('/destinations/') || cleanPath.startsWith('/destination/')) {
    const rawSlug = cleanPath.startsWith('/destinations/')
      ? cleanPath.replace('/destinations/', '')
      : cleanPath.replace('/destination/', '');
    
    const dest = findDestinationBySlug(rawSlug, ALL_DESTINATIONS);

    if (!dest) {
      return render404Page(cleanPath, htmlTemplate);
    }

    const title = `${dest.name}, ${dest.country} Travel Guide for Bangladeshi Tourists – AzraqTrips`;
    const description = `Complete travel guide for ${dest.name}, ${dest.country}. Flight options from Dhaka, estimated BDT budget (${dest.priceRange || dest.estimatedBudget}), best time to visit (${dest.bestTimeToVisit}), visa guidance, and top sights.`;
    const canonical = `${SITE_URL}/destinations/${dest.id}`;

    const destinationFaqs = [
      {
        question: `What is the best time to visit ${dest.name} from Bangladesh?`,
        answer: `The ideal season to visit ${dest.name} (${dest.country}) is during ${dest.bestTimeToVisit || 'the dry and pleasant winter/spring season'}, offering comfortable sightseeing conditions.`,
      },
      {
        question: `How much budget is needed for a trip to ${dest.name} from Dhaka?`,
        answer: `A comfortable trip to ${dest.name} typically costs around ${dest.priceRange || dest.estimatedBudget || 'BDT 55,000 - 85,000'} per person including round-trip flights from Dhaka, central hotels, local transport, and meals.`,
      },
      {
        question: `Do Bangladeshi citizens need a visa for ${dest.country}?`,
        answer: dest.visaInfo || `Bangladeshi passport holders require a tourist visa or eVisa before departure. Check passport validity of at least 6 months.`,
      },
    ];

    const schemas = [
      getTouristDestinationSchema({
        name: dest.name,
        country: dest.country,
        description: dest.description,
        imageUrl: dest.imageUrl,
        bestTimeToVisit: dest.bestTimeToVisit,
        currency: dest.currency,
        url: `/destinations/${dest.id}`,
        rating: dest.rating,
      }),
      getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Destinations', url: '/destinations' },
        { name: `${dest.name}, ${dest.country}`, url: `/destinations/${dest.id}` },
      ]),
      getFAQSchema(destinationFaqs),
    ];

    const bodySnippet = `
      <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-5xl mx-auto">
        <nav class="text-xs text-slate-400 mb-4 flex gap-2">
          <a href="/">Home</a> / <a href="/destinations">Destinations</a> / <span>${escapeHtml(dest.name)}</span>
        </nav>
        <h1 class="text-3xl sm:text-5xl font-black text-white mb-3">${escapeHtml(dest.name)}, ${escapeHtml(dest.country)} Travel Guide</h1>
        <p class="text-slate-200 text-lg mb-6 leading-relaxed">${escapeHtml(dest.description)}</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          <div class="p-6 rounded-2xl bg-slate-800 border border-slate-700">
            <h2 class="text-xl font-bold mb-2 text-sky-400">✈️ Dhaka Flight & Travel Info</h2>
            <p class="text-sm text-slate-300">Flights operate from Dhaka Hazrat Shahjalal International Airport (DAC). Best time to visit is ${escapeHtml(dest.bestTimeToVisit || 'year-round')}.</p>
          </div>
          <div class="p-6 rounded-2xl bg-slate-800 border border-slate-700">
            <h2 class="text-xl font-bold mb-2 text-amber-400">৳ BDT Budget & Visa</h2>
            <p class="text-sm text-slate-300">Estimated budget: <strong>${escapeHtml(dest.priceRange || dest.estimatedBudget || 'BDT 60,000 - 85,000')}</strong>. ${escapeHtml(dest.visaInfo || 'Visa assistance available via AzraqTrips.')}</p>
          </div>
        </div>

        <section class="mt-10">
          <h2 class="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div class="space-y-4">
            ${destinationFaqs
              .map(
                (f) => `
              <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <h3 class="font-bold text-white text-base">${escapeHtml(f.question)}</h3>
                <p class="text-slate-300 text-sm mt-1">${escapeHtml(f.answer)}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      </main>
    `;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: dest.imageUrl || DEFAULT_OG_IMAGE,
        ogType: 'place',
        schemas,
        bodySnippet,
      }),
    };
  }

  // 5. Travel Guides Directory
  if (cleanPath === '/travel-guides') {
    const title = 'Travel Guides for Bangladeshi Tourists (2026 Edition) – AzraqTrips';
    const description =
      'In-depth international travel guides for Bangladeshi passport holders. Featuring Kuala Lumpur, Bangkok, Phuket, Bali, Singapore, and Dubai with flight costs, visa rules, and Halal dining.';
    const canonical = `${SITE_URL}/travel-guides`;

    const schemas = [
      getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Travel Guides', url: '/travel-guides' },
      ]),
    ];

    const guidesListHtml = TRAVEL_GUIDES.map(
      (g) => `
      <article class="p-5 rounded-2xl bg-slate-800 border border-slate-700">
        <h2 class="text-xl font-bold text-white"><a href="/travel-guides/${g.slug}" class="hover:text-blue-400">${escapeHtml(g.title)}</a></h2>
        <p class="text-slate-300 text-sm mt-2">${escapeHtml(g.metaDescription)}</p>
        <div class="mt-3 text-xs text-sky-400 font-semibold">Duration: ${g.readingTimeMinutes} min read • Country: ${escapeHtml(g.country)}</div>
      </article>
    `
    ).join('');

    const bodySnippet = `
      <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-5xl mx-auto">
        <h1 class="text-3xl sm:text-4xl font-black text-white mb-4">Travel Guides for Bangladeshi Tourists</h1>
        <p class="text-slate-200 text-base mb-8">${escapeHtml(description)}</p>
        <div class="space-y-6">${guidesListHtml}</div>
      </main>
    `;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        schemas,
        bodySnippet,
      }),
    };
  }

  // 6. Travel Guide Detail Page (/travel-guides/:slug)
  if (cleanPath.startsWith('/travel-guides/')) {
    const slug = cleanPath.replace('/travel-guides/', '').toLowerCase();
    const guide = TRAVEL_GUIDES.find(
      (g) =>
        g.slug.toLowerCase() === slug ||
        g.country.toLowerCase() === slug ||
        g.slug.toLowerCase().replace('-travel-guide', '') === slug
    );

    if (!guide) {
      return render404Page(cleanPath, htmlTemplate);
    }

    const title = guide.seoTitle || guide.title;
    const description = guide.metaDescription;
    const canonical = `${SITE_URL}/travel-guides/${guide.slug}`;

    const schemas = [
      getArticleSchema({
        title: guide.title,
        description: guide.metaDescription,
        url: `/travel-guides/${guide.slug}`,
        imageUrl: guide.featuredImage,
        publishedDate: guide.publishedDate,
        modifiedDate: guide.modifiedDate,
        authorName: guide.author,
      }),
      getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Travel Guides', url: '/travel-guides' },
        { name: guide.country, url: `/travel-guides/${guide.slug}` },
      ]),
      getFAQSchema(guide.faqs),
    ];

    const bodySnippet = `
      <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-4xl mx-auto">
        <nav class="text-xs text-slate-400 mb-4 flex gap-2">
          <a href="/">Home</a> / <a href="/travel-guides">Travel Guides</a> / <span>${escapeHtml(guide.country)}</span>
        </nav>
        <h1 class="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">${escapeHtml(guide.title)}</h1>
        <div class="flex gap-4 text-xs text-slate-400 mb-6">
          <span>By ${escapeHtml(guide.author)}</span> • <span>Updated ${escapeHtml(guide.modifiedDate)}</span> • <span>${guide.readingTimeMinutes} min read</span>
        </div>
        <p class="text-slate-200 text-lg leading-relaxed mb-8">${escapeHtml(guide.intro)}</p>

        <section class="p-6 rounded-2xl bg-slate-800 border border-slate-700 mb-8 space-y-4">
          <h2 class="text-xl font-bold text-sky-400">🛫 Flights from Dhaka & Best Season</h2>
          <p class="text-sm text-slate-300">${escapeHtml(guide.dhakaFlightInfo)}</p>
          <p class="text-sm text-slate-300"><strong>Best Time to Visit:</strong> ${escapeHtml(guide.bestTimeToVisit)}</p>
        </section>

        <section class="p-6 rounded-2xl bg-slate-800 border border-slate-700 mb-8 space-y-4">
          <h2 class="text-xl font-bold text-amber-400">🛂 Visa & Budget Breakdown in BDT</h2>
          <p class="text-sm text-slate-300">${escapeHtml(guide.visaSummary)}</p>
          <p class="text-sm text-slate-300"><strong>Estimated Cost:</strong> ${escapeHtml(guide.budgetSummaryBDT)}</p>
          <p class="text-sm text-slate-300"><strong>Halal Dining & Prayers:</strong> ${escapeHtml(guide.halalFoodAndPrayerInfo)}</p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Top Attractions & Things to Do</h2>
          <div class="space-y-4">
            ${guide.topAttractions
              .map(
                (att) => `
              <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
                <h3 class="text-base font-bold text-white">${escapeHtml(att.name)}</h3>
                <p class="text-sm text-slate-300 mt-1">${escapeHtml(att.description)}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </section>

        <section class="mt-10">
          <h2 class="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div class="space-y-4">
            ${guide.faqs
              .map(
                (f) => `
              <div class="p-4 rounded-xl bg-slate-800 border border-slate-700">
                <h3 class="font-bold text-white text-base">${escapeHtml(f.question)}</h3>
                <p class="text-slate-300 text-sm mt-1">${escapeHtml(f.answer)}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </section>
      </main>
    `;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: guide.featuredImage || DEFAULT_OG_IMAGE,
        ogType: 'article',
        publishedTime: guide.publishedDate,
        modifiedTime: guide.modifiedDate,
        author: guide.author,
        schemas,
        bodySnippet,
      }),
    };
  }

  // 7. Curated Itineraries Hub
  if (cleanPath === '/itineraries') {
    const title = 'Curated Travel Itineraries for Bangladeshi Travelers – AzraqTrips';
    const description =
      'Explore handcrafted day-by-day travel itineraries for Malaysia, Thailand, Bali, Singapore, and Dubai. Includes budget in BDT, flight schedules from Dhaka, and sightseeing spots.';
    const canonical = `${SITE_URL}/itineraries`;

    const schemas = [
      getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Itineraries', url: '/itineraries' },
      ]),
    ];

    const itinListHtml = CURATED_ITINERARIES.map(
      (it) => `
      <article class="p-5 rounded-2xl bg-slate-800 border border-slate-700">
        <h2 class="text-xl font-bold text-white"><a href="/itineraries/${it.slug}" class="hover:text-blue-400">${escapeHtml(it.title)}</a></h2>
        <p class="text-slate-300 text-sm mt-2">${escapeHtml(it.metaDescription)}</p>
        <div class="mt-3 text-xs text-amber-400 font-semibold">Duration: ${it.durationDays} Days • Estimated Budget: ${escapeHtml(it.estimatedBudgetBDT)}</div>
      </article>
    `
    ).join('');

    const bodySnippet = `
      <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-5xl mx-auto">
        <h1 class="text-3xl sm:text-4xl font-black text-white mb-4">Curated Travel Itineraries for Bangladeshi Tourists</h1>
        <p class="text-slate-200 text-base mb-8">${escapeHtml(description)}</p>
        <div class="space-y-6">${itinListHtml}</div>
      </main>
    `;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        schemas,
        bodySnippet,
      }),
    };
  }

  // 8. Itinerary Detail Page (/itineraries/:slug)
  if (cleanPath.startsWith('/itineraries/')) {
    const slug = cleanPath.replace('/itineraries/', '').toLowerCase();
    const itinerary = CURATED_ITINERARIES.find(
      (it) =>
        it.slug.toLowerCase() === slug ||
        it.destination.toLowerCase().includes(slug) ||
        it.country.toLowerCase() === slug ||
        (slug.includes('malaysia') && it.slug.includes('malaysia')) ||
        (slug.includes('thailand') && it.slug.includes('thailand')) ||
        (slug.includes('bali') && it.slug.includes('bali')) ||
        (slug.includes('singapore') && it.slug.includes('singapore')) ||
        (slug.includes('dubai') && it.slug.includes('dubai'))
    );

    if (!itinerary) {
      return render404Page(cleanPath, htmlTemplate);
    }

    const title = itinerary.seoTitle || itinerary.title;
    const description = itinerary.metaDescription;
    const canonical = `${SITE_URL}/itineraries/${itinerary.slug}`;

    const tripSchema = {
      '@context': 'https://schema.org',
      '@type': 'Trip',
      name: itinerary.title,
      description: itinerary.metaDescription,
      image: itinerary.heroImage,
      url: canonical,
      itinerary: {
        '@type': 'ItemList',
        itemListElement: itinerary.days.map((day, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: day.title,
          description: day.summary,
        })),
      },
    };

    const schemas = [
      tripSchema,
      getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Itineraries', url: '/itineraries' },
        { name: itinerary.title, url: `/itineraries/${itinerary.slug}` },
      ]),
    ];

    const daysHtml = itinerary.days
      .map(
        (d) => `
      <div class="p-6 rounded-2xl bg-slate-800 border border-slate-700">
        <h3 class="text-lg font-bold text-sky-400 mb-2">Day ${d.dayNumber}: ${escapeHtml(d.title)}</h3>
        <p class="text-slate-300 text-sm mb-3">${escapeHtml(d.summary)}</p>
        <div class="space-y-2 text-xs text-slate-400">
          ${d.spots.map((s) => `<div>• <strong>${escapeHtml(s.name)}</strong>: ${escapeHtml(s.description)}</div>`).join('')}
        </div>
      </div>
    `
      )
      .join('');

    const bodySnippet = `
      <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-4xl mx-auto">
        <nav class="text-xs text-slate-400 mb-4 flex gap-2">
          <a href="/">Home</a> / <a href="/itineraries">Itineraries</a> / <span>${escapeHtml(itinerary.destination)}</span>
        </nav>
        <h1 class="text-3xl sm:text-5xl font-black text-white mb-3">${escapeHtml(itinerary.title)}</h1>
        <p class="text-slate-200 text-lg mb-6">${escapeHtml(itinerary.overview)}</p>
        
        <div class="p-4 rounded-xl bg-blue-950/60 border border-blue-800 text-sm text-sky-200 mb-8">
          💰 Estimated Budget: <strong>${escapeHtml(itinerary.estimatedBudgetBDT)}</strong> • Season: <strong>${escapeHtml(itinerary.bestSeason)}</strong>
        </div>

        <h2 class="text-2xl font-bold mb-4">Day-by-Day Schedule</h2>
        <div class="space-y-6">${daysHtml}</div>
      </main>
    `;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: itinerary.heroImage || DEFAULT_OG_IMAGE,
        ogType: 'article',
        schemas,
        bodySnippet,
      }),
    };
  }

  // 9. Visa Requirements Hub
  if (cleanPath === '/visa') {
    const title = 'Tourist Visa Requirements for Bangladeshi Citizens (2026) – AzraqTrips';
    const description =
      'Official tourist visa guidance for Bangladeshi passport holders. Check documents, bank statement criteria, visa processing time, embassy fees in BDT, and eVisa links for Malaysia, Thailand, Singapore, Dubai, and Indonesia.';
    const canonical = `${SITE_URL}/visa`;

    const schemas = [
      getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Visa Requirements', url: '/visa' },
      ]),
    ];

    const visaListHtml = OFFICIAL_VISA_REQUIREMENTS.map(
      (v) => `
      <article class="p-5 rounded-2xl bg-slate-800 border border-slate-700">
        <h2 class="text-xl font-bold text-white"><a href="/visa/${v.country.toLowerCase().replace(/\s+/g, '-')}" class="hover:text-blue-400">${escapeHtml(v.country)} Tourist Visa</a></h2>
        <p class="text-slate-300 text-sm mt-2">Processing Time: ${escapeHtml(v.processingTime || '3-5 Working Days')} • Estimated Fee: ${escapeHtml(v.totalEstimatedBDT || v.embassyFeeBDT || 'BDT 5,000')}</p>
      </article>
    `
    ).join('');

    const bodySnippet = `
      <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-5xl mx-auto">
        <h1 class="text-3xl sm:text-4xl font-black text-white mb-4">Tourist Visa Guidance for Bangladeshi Travelers</h1>
        <p class="text-slate-200 text-base mb-8">${escapeHtml(description)}</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">${visaListHtml}</div>
      </main>
    `;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        schemas,
        bodySnippet,
      }),
    };
  }

  // 10. Visa Detail Page (/visa/:country)
  if (cleanPath.startsWith('/visa/')) {
    const countryParam = cleanPath.replace('/visa/', '').toLowerCase();
    const visa = OFFICIAL_VISA_REQUIREMENTS.find(
      (v) =>
        v.country.toLowerCase().replace(/\s+/g, '-') === countryParam ||
        v.id.toLowerCase() === countryParam ||
        v.country.toLowerCase().includes(countryParam)
    );

    if (!visa) {
      return render404Page(cleanPath, htmlTemplate);
    }

    const title = `${visa.country} Visa for Bangladeshi Citizens – Requirements, Fees & Processing (2026)`;
    const description = `Complete ${visa.country} tourist visa guide for Bangladeshis. Learn mandatory documents, minimum bank balance (${visa.minBankBalance || 'BDT 100,000+'}), processing time (${visa.processingTime || '3–5 Working Days'}), and Embassy in Dhaka guidelines.`;
    const canonical = `${SITE_URL}/visa/${visa.country.toLowerCase().replace(/\s+/g, '-')}`;

    const schemas = [
      getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Visa', url: '/visa' },
        { name: `${visa.country} Visa`, url: canonical },
      ]),
      getFAQSchema([
        {
          question: `How long does it take to process a ${visa.country} visa from Bangladesh?`,
          answer: `Standard processing takes approximately ${visa.processingTime || '3–5 working days'}.`,
        },
        {
          question: `What is the required bank statement for a ${visa.country} visa?`,
          answer: `Applicants generally need a 6-month bank statement with a minimum balance of approximately ${visa.minBankBalance || 'BDT 100,000 – 150,000'} along with a Bank Solvency Certificate.`,
        },
      ]),
    ];

    const bodySnippet = `
      <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-4xl mx-auto">
        <nav class="text-xs text-slate-400 mb-4 flex gap-2">
          <a href="/">Home</a> / <a href="/visa">Visa</a> / <span>${escapeHtml(visa.country)}</span>
        </nav>
        <h1 class="text-3xl sm:text-5xl font-black text-white mb-4">${escapeHtml(visa.country)} Tourist Visa Guide</h1>
        <p class="text-slate-200 text-lg mb-8 leading-relaxed">${escapeHtml(description)}</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="p-6 rounded-2xl bg-slate-800 border border-slate-700">
            <h2 class="text-xl font-bold text-sky-400 mb-2">⏱️ Processing Time & Type</h2>
            <p class="text-sm text-slate-300">Processing Time: <strong>${escapeHtml(visa.processingTime || '3–5 Working Days')}</strong></p>
            <p class="text-sm text-slate-300 mt-1">Visa Type: <strong>${escapeHtml(visa.visaType)} (${escapeHtml(visa.entryType || 'Tourist')})</strong></p>
          </div>
          <div class="p-6 rounded-2xl bg-slate-800 border border-slate-700">
            <h2 class="text-xl font-bold text-amber-400 mb-2">৳ Fee & Bank Solvency</h2>
            <p class="text-sm text-slate-300">Estimated Cost: <strong>${escapeHtml(visa.totalEstimatedBDT || visa.embassyFeeBDT || 'BDT 5,000')}</strong></p>
            <p class="text-sm text-slate-300 mt-1">Min. Bank Balance: <strong>${escapeHtml(visa.minBankBalance || 'BDT 100,000+')}</strong></p>
          </div>
        </div>

        <section class="p-6 rounded-2xl bg-slate-800 border border-slate-700 mb-8">
          <h2 class="text-xl font-bold mb-3">Mandatory Documents Required</h2>
          <ul class="space-y-2 text-sm text-slate-300 list-disc list-inside">
            ${(visa.generalRequirements || []).map((doc: string) => `<li>${escapeHtml(doc)}</li>`).join('')}
          </ul>
        </section>
      </main>
    `;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'article',
        schemas,
        bodySnippet,
      }),
    };
  }

  // 11. Flights Landing Page
  if (cleanPath === '/flights') {
    const title = 'Flights from Dhaka (DAC) – Compare Airfares & Schedules | AzraqTrips';
    const description =
      'Compare flight routes and airfares from Dhaka Hazrat Shahjalal International Airport (DAC) to Bangkok, Kuala Lumpur, Singapore, Dubai, Bali, and Tokyo with AzraqTrips.';
    const canonical = `${SITE_URL}/flights`;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        schemas: [
          getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Flights', url: '/flights' },
          ]),
        ],
        bodySnippet: `
          <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-5xl mx-auto">
            <h1 class="text-3xl sm:text-5xl font-black text-white mb-4">Flight Deals & Routes from Dhaka (DAC)</h1>
            <p class="text-slate-200 text-lg mb-8">${escapeHtml(description)}</p>
          </main>
        `,
      }),
    };
  }

  // 12. Tour Packages Landing Page
  if (cleanPath === '/packages') {
    const title = 'International Tour Packages from Bangladesh – AzraqTrips';
    const description =
      'Handcrafted holiday packages from Dhaka with direct airline flights, central accommodations, private transfers, and verified tourist visas for families, couples, and friends.';
    const canonical = `${SITE_URL}/packages`;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        schemas: [
          getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Tour Packages', url: '/packages' },
          ]),
        ],
        bodySnippet: `
          <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-5xl mx-auto">
            <h1 class="text-3xl sm:text-5xl font-black text-white mb-4">Handcrafted Holiday Tour Packages</h1>
            <p class="text-slate-200 text-lg mb-8">${escapeHtml(description)}</p>
          </main>
        `,
      }),
    };
  }

  // 13. About Page
  if (cleanPath === '/about') {
    const title = 'About AzraqTrips – AI-Powered Travel Agency in Bangladesh';
    const description =
      'Learn about AzraqTrips (Azraq Tours & Travels), an AI-driven travel planning and services platform based in Dhaka, dedicated to providing seamless holiday planning for Bangladeshi tourists.';
    const canonical = `${SITE_URL}/about`;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        schemas: [
          getOrganizationSchema(),
          getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'About Us', url: '/about' },
          ]),
        ],
        bodySnippet: `
          <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-4xl mx-auto">
            <h1 class="text-3xl sm:text-5xl font-black text-white mb-4">About AzraqTrips</h1>
            <p class="text-slate-200 text-lg leading-relaxed mb-6">${escapeHtml(description)}</p>
          </main>
        `,
      }),
    };
  }

  // 14. Contact Page
  if (cleanPath === '/contact') {
    const title = 'Contact AzraqTrips – Dhaka Office & 24/7 WhatsApp Desk';
    const description =
      'Get in touch with AzraqTrips for custom flight quotes, visa processing assistance, or itinerary support. Office in Banani / Gulshan, Dhaka. WhatsApp: +8801851172032.';
    const canonical = `${SITE_URL}/contact`;

    return {
      statusCode: 200,
      html: injectSeo(htmlTemplate, {
        title,
        description,
        canonical,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        schemas: [
          getOrganizationSchema(),
          getBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Contact', url: '/contact' },
          ]),
        ],
        bodySnippet: `
          <main class="min-h-screen bg-slate-900 text-white p-6 md:p-12 max-w-4xl mx-auto">
            <h1 class="text-3xl sm:text-5xl font-black text-white mb-4">Contact AzraqTrips</h1>
            <p class="text-slate-200 text-lg leading-relaxed mb-6">Our travel advisors are available 24/7 via WhatsApp and at our Dhaka operations desk.</p>
            <div class="p-6 rounded-2xl bg-slate-800 border border-slate-700 space-y-3">
              <p>📍 <strong>Address:</strong> Road 11, Block D, Banani / Gulshan-2, Dhaka 1212, Bangladesh</p>
              <p>📞 <strong>Phone & WhatsApp:</strong> +8801851172032</p>
              <p>✉️ <strong>Email:</strong> info@azraqtrips.com</p>
            </div>
          </main>
        `,
      }),
    };
  }

  // Fallback 404 for unknown public URLs
  return render404Page(cleanPath, htmlTemplate);
}

function render404Page(pathname: string, htmlTemplate: string): SeoRenderResult {
  const title = 'Page Not Found (404) – AzraqTrips';
  const description =
    'The page you requested could not be found. Discover popular Asian travel destinations, visa requirements, flight schedules, and travel guides on AzraqTrips.';
  const canonical = `${SITE_URL}/404`;

  const bodySnippet = `
    <main class="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <span class="text-xs font-black text-blue-400 uppercase tracking-widest mb-2">404 Error</span>
      <h1 class="text-3xl sm:text-5xl font-black mb-4">Looks like you've wandered off the map!</h1>
      <p class="text-slate-300 max-w-md mb-8 text-sm sm:text-base">${escapeHtml(description)}</p>
      <div class="flex gap-4">
        <a href="/" class="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold">Return Home</a>
        <a href="/destinations" class="px-6 py-3 rounded-xl bg-slate-800 text-white font-bold">Explore Destinations</a>
      </div>
    </main>
  `;

  const html = injectSeo(htmlTemplate, {
    title,
    description,
    canonical,
    ogImage: DEFAULT_OG_IMAGE,
    ogType: 'website',
    noindex: true,
    schemas: [],
    bodySnippet,
  });

  return { statusCode: 404, html };
}

interface InjectSeoParams {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  ogType: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  schemas: any[];
  bodySnippet?: string;
}

function injectSeo(template: string, params: InjectSeoParams): string {
  const robotsDirective = params.noindex
    ? '<meta name="robots" content="noindex, nofollow" />'
    : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />';

  const jsonLdScripts = params.schemas
    .filter(Boolean)
    .map((s) => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`)
    .join('\n');

  const metaHead = `
    <title>${escapeHtml(params.title)}</title>
    <meta name="description" content="${escapeHtml(params.description)}" />
    <link rel="canonical" href="${params.canonical}" />
    ${robotsDirective}
    
    <!-- Open Graph -->
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${escapeHtml(params.title)}" />
    <meta property="og:description" content="${escapeHtml(params.description)}" />
    <meta property="og:url" content="${params.canonical}" />
    <meta property="og:type" content="${params.ogType}" />
    <meta property="og:image" content="${params.ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale" content="en_US" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(params.title)}" />
    <meta name="twitter:description" content="${escapeHtml(params.description)}" />
    <meta name="twitter:image" content="${params.ogImage}" />

    ${params.publishedTime ? `<meta property="article:published_time" content="${params.publishedTime}" />` : ''}
    ${params.modifiedTime ? `<meta property="article:modified_time" content="${params.modifiedTime}" />` : ''}
    ${params.author ? `<meta name="author" content="${escapeHtml(params.author)}" />` : ''}

    ${jsonLdScripts}
  `;

  let result = template;

  // Clean out default title and canonical from template
  result = result.replace(/<title>.*?<\/title>/is, '');
  result = result.replace(/<link rel="canonical".*?\/>/is, '');
  result = result.replace(/<meta name="description".*?\/>/is, '');
  result = result.replace(/<meta property="og:.*?".*?\/>/gis, '');
  result = result.replace(/<meta name="twitter:.*?".*?\/>/gis, '');
  result = result.replace(/<script type="application\/ld\+json">.*?<\/script>/gis, '');

  result = result.replace('</head>', `${metaHead}\n</head>`);

  // Optionally pre-populate <div id="root">
  if (params.bodySnippet) {
    result = result.replace(
      /<div id="root">\s*<\/div>/is,
      `<div id="root">${params.bodySnippet}</div>`
    );
  }

  return result;
}

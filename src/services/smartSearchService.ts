import { SmartSearchResponse, SmartSearchResultItem } from '../types';
import {
  SEARCHABLE_PRODUCT_CATALOG,
  ProductCatalogEntry,
} from '../data/searchCatalogData';

/**
 * Executes a smart natural language search via the backend AI endpoint
 */
export async function executeSmartSearch(
  query: string,
  userContext?: {
    userName?: string;
    isGuest?: boolean;
    currentView?: string;
    savedTripsCount?: number;
  }
): Promise<SmartSearchResponse> {
  const trimmedQuery = (query || '').trim();
  if (!trimmedQuery) {
    throw new Error('Search query cannot be empty');
  }

  try {
    const response = await fetch('/api/ai/smart-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: trimmedQuery,
        userContext: userContext || { isGuest: true, currentView: 'discover' },
        searchableCatalog: SEARCHABLE_PRODUCT_CATALOG.map((item) => ({
          title: item.title,
          description: item.description,
          type: item.type,
          url: item.url,
          category: item.category,
          price: item.price,
          keywords: item.keywords,
        })),
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Search failed with status ${response.status}`);
    }

    const data = await response.json();
    if (data.success && data.data) {
      return data.data as SmartSearchResponse;
    }
    throw new Error('Invalid response structure from search server');
  } catch (err: any) {
    console.warn('Backend smart search returned error, utilizing local semantic fallback:', err?.message || err);
    return getLocalSemanticFallbackResults(trimmedQuery, userContext);
  }
}

/**
 * Local fallback search that ranks real catalog entries based on query tokens & intent
 */
export function getLocalSemanticFallbackResults(
  query: string,
  userContext?: any
): SmartSearchResponse {
  const lower = query.toLowerCase();
  const tokens = lower.split(/\s+/).filter((t) => t.length > 2);

  // Score each catalog entry
  const scored = SEARCHABLE_PRODUCT_CATALOG.map((item) => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const catLower = item.category.toLowerCase();

    // Exact full query match
    if (titleLower.includes(lower)) score += 10;
    if (descLower.includes(lower)) score += 6;

    // Token matching
    tokens.forEach((t) => {
      if (titleLower.includes(t)) score += 4;
      if (descLower.includes(t)) score += 2;
      if (catLower.includes(t)) score += 3;
      if (item.keywords.some((k) => k.toLowerCase().includes(t))) score += 5;
    });

    // Intent boosts
    if (lower.includes('visa') || lower.includes('document') || lower.includes('embassy')) {
      if (item.type === 'article' || item.url === 'visa') score += 5;
    }
    if (lower.includes('flight') || lower.includes('ticket') || lower.includes('airfare')) {
      if (item.url === 'flights') score += 5;
    }
    if (lower.includes('package') || lower.includes('tour') || lower.includes('holiday') || lower.includes('hotel')) {
      if (item.type === 'product' || item.url === 'packages') score += 4;
    }
    if (lower.includes('profile') || lower.includes('passport') || lower.includes('setting') || lower.includes('billing')) {
      if (item.type === 'setting' || item.url === 'profile') score += 6;
    }
    if (lower.includes('plan') || lower.includes('template') || lower.includes('itinerary')) {
      if (item.type === 'template' || item.url === 'planner') score += 5;
    }

    return { item, score };
  });

  // Filter and sort
  const topMatches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const results: SmartSearchResultItem[] = (topMatches.length > 0 ? topMatches : scored.slice(0, 4)).map((s) => ({
    title: s.item.title,
    description: s.item.description,
    type: s.item.type,
    url: s.item.url,
    reason: `Matches your query related to ${s.item.category.toLowerCase()}`,
    action_label: s.item.actionLabel,
    price: s.item.price,
    category: s.item.category,
  }));

  // Build helpful answer
  let answer = `We found ${results.length} relevant options for "${query}".`;
  if (lower.includes('visa')) {
    answer = `Review verified visa checklists, required bank statements, and processing times for your destination.`;
  } else if (lower.includes('flight')) {
    answer = `Compare flight schedules and direct airfare options departing from Dhaka.`;
  } else if (lower.includes('package') || lower.includes('honeymoon') || lower.includes('tour')) {
    answer = `Explore all-inclusive tour packages with guaranteed hotel reservations, transfers, and transparent pricing in BDT.`;
  } else if (lower.includes('passport') || lower.includes('profile') || lower.includes('setting')) {
    answer = `You can manage your saved trips, personal passport details, and travel preferences in your profile settings.`;
  }

  const suggested_actions = [
    { label: 'Browse All Packages', target: 'packages' },
    { label: 'Check Visa Requirements', target: 'visa' },
    { label: 'Generate Custom Trip Plan', target: 'planner' },
  ];

  const related_searches = [
    'Bangkok & Phuket 6D5N Package',
    'Thailand tourist visa bank balance requirements',
    'Direct flights from Dhaka to Bangkok',
    'How to customize a family trip itinerary',
  ];

  return {
    interpreted_intent: `Search for travel resources and options related to "${query}"`,
    answer,
    results,
    suggested_actions,
    related_searches,
    confidence: topMatches.length > 0 ? 'high' : 'medium',
  };
}

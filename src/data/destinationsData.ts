import { Destination } from "../types";
import { POPULAR_BANGLADESHI_DESTINATIONS } from "./popularBangladeshiDestinations";
import { SOUTH_ASIA_DESTINATIONS } from "./destinations/southAsia";
import { SE_ASIA_DESTINATIONS } from "./destinations/seAsia";
import { EAST_ASIA_MIDDLE_EAST_DESTINATIONS } from "./destinations/eastAsiaAndMiddleEast";
import JSON_DESTINATIONS from "../../data/destinations.json";

const rawList: Destination[] = [
  ...POPULAR_BANGLADESHI_DESTINATIONS,
  ...(JSON_DESTINATIONS as Destination[]),
  ...SOUTH_ASIA_DESTINATIONS,
  ...SE_ASIA_DESTINATIONS,
  ...EAST_ASIA_MIDDLE_EAST_DESTINATIONS,
];

// Deduplicate by ID
const map = new Map<string, Destination>();
rawList.forEach((item) => {
  if (!map.has(item.id)) {
    map.set(item.id, {
      ...item,
      imageUrl: item.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=75",
      thumbnailUrl: item.thumbnailUrl || item.imageUrl,
      fallbackImage: item.fallbackImage || "/images/fallback.jpg",
      priceRange: item.priceRange || item.estimatedBudget || "$250 - $750",
      activities: item.activities || item.thingsToDo || ["Sightseeing", "Local Tour"],
    });
  }
});

export const ALL_DESTINATIONS: Destination[] = Array.from(map.values());

// Slug Normalizer utility
export function normalizeSlug(str: string | undefined | null): string {
  if (!str) return '';
  try {
    const decoded = decodeURIComponent(String(str));
    return decoded
      .toLowerCase()
      .trim()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  } catch {
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

// Alphanumeric string cleaner for flexible fuzzy matching (e.g. "coxsbazar" === "cox's bazar")
export function toAlphanumeric(str: string | undefined | null): string {
  if (!str) return '';
  try {
    return decodeURIComponent(String(str))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  } catch {
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }
}

/**
 * Universal dynamic destination finder by ID, name, city, country, or slug.
 * Supports exact IDs, slugified names, city names, country names, and common aliases.
 */
export function findDestinationBySlug(
  slugOrQuery: string | undefined | null,
  list: Destination[] = ALL_DESTINATIONS
): Destination | undefined {
  if (!slugOrQuery) return undefined;

  const raw = String(slugOrQuery).trim();
  if (!raw) return undefined;

  const normalized = normalizeSlug(raw);
  const alpha = toAlphanumeric(raw);

  if (!normalized && !alpha) return undefined;

  // 1. Direct ID match (e.g. "bali", "coxs-bazar", "kuala-lumpur", "maldives")
  const exactId = list.find(
    (d) => d.id.toLowerCase() === raw.toLowerCase() || normalizeSlug(d.id) === normalized
  );
  if (exactId) return exactId;

  // 2. Direct Name match (e.g. "Bali", "Cox's Bazar", "Kuala Lumpur")
  const exactName = list.find(
    (d) => d.name.toLowerCase() === raw.toLowerCase() || normalizeSlug(d.name) === normalized
  );
  if (exactName) return exactName;

  // 3. City name prefix match (e.g. "Kuala Lumpur, Malaysia" -> "kuala-lumpur")
  const cityMatch = list.find((d) => {
    const city = d.name.split(',')[0].trim();
    return normalizeSlug(city) === normalized || toAlphanumeric(city) === alpha;
  });
  if (cityMatch) return cityMatch;

  // 4. Strict Alphanumeric match (ignoring dashes, hyphens, spaces, apostrophes)
  const alphaMatch = list.find((d) => {
    const destIdAlpha = toAlphanumeric(d.id);
    const destNameAlpha = toAlphanumeric(d.name);
    const destCityAlpha = toAlphanumeric(d.name.split(',')[0]);
    return (
      destIdAlpha === alpha ||
      destNameAlpha === alpha ||
      destCityAlpha === alpha
    );
  });
  if (alphaMatch) return alphaMatch;

  // 5. Country name match (e.g. /destinations/thailand -> Bangkok or top Thailand destination)
  const countryMatches = list.filter((d) => {
    return (
      normalizeSlug(d.country) === normalized ||
      toAlphanumeric(d.country) === alpha ||
      (d.country.toLowerCase() === 'united arab emirates' && (normalized === 'uae' || normalized === 'emirates')) ||
      (d.country.toLowerCase() === 'turkey' && (normalized === 'turkiye' || normalized === 'turkey')) ||
      (d.country.toLowerCase() === 'south korea' && (normalized === 'korea' || normalized === 'south-korea'))
    );
  });
  if (countryMatches.length > 0) {
    // Prefer popular / top-rated destination in that country
    return countryMatches.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  }

  // 6. Substring / Prefix matching (for long slugs or multi-word cities)
  if (normalized.length >= 3) {
    const prefixMatch = list.find((d) => {
      const dSlug = normalizeSlug(d.id);
      const dNameSlug = normalizeSlug(d.name);
      return (
        dSlug.startsWith(normalized) ||
        dNameSlug.startsWith(normalized) ||
        normalized.startsWith(dSlug) ||
        (normalized.length >= 4 && (dSlug.includes(normalized) || dNameSlug.includes(normalized)))
      );
    });
    if (prefixMatch) return prefixMatch;
  }

  return undefined;
}

// Get all URL slugs for destinations
export function getAllDestinationSlugs(): string[] {
  return ALL_DESTINATIONS.map((d) => normalizeSlug(d.id));
}

// Helper to get unique countries
export const UNIQUE_COUNTRIES = Array.from(
  new Set(ALL_DESTINATIONS.map((d) => d.country))
).sort();

// Helper to get unique categories
export const UNIQUE_CATEGORIES = Array.from(
  new Set(ALL_DESTINATIONS.map((d) => d.category))
).sort();

console.log(`[Destinations Data] Total Loaded Destinations: ${ALL_DESTINATIONS.length}`);

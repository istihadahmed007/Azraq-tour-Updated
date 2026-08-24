/**
 * Azraq Trips - API-First Flight Service
 * Integrates real-time flight search proxy and Travelpayouts / Aviasales affiliate parameters.
 */

import { Airport, POPULAR_AIRPORTS, BANGLADESH_AIRPORTS, buildAviasalesSearchUrl, getAviasalesSearchKey } from '../data/flightsData';
import { NormalizedFlightSearch, FlightSearchApiResponse, CanonicalFlightOffer } from '../utils/flightSearchEngine';

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabin?: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  tripType?: 'round' | 'oneway';
  currency?: string;
  direct?: boolean;
}

export const flightService = {
  // Search flights via verified backend API proxy
  async searchFlights(params: FlightSearchParams): Promise<FlightSearchApiResponse> {
    const query = new URLSearchParams({
      origin: params.origin.toUpperCase(),
      destination: params.destination.toUpperCase(),
      departDate: params.departDate,
      adults: String(params.adults || 1),
      children: String(params.children || 0),
      infants: String(params.infants || 0),
      cabin: params.cabin || 'Economy',
      tripType: params.tripType || (params.returnDate ? 'round' : 'oneway'),
      currency: params.currency || 'BDT',
    });

    if (params.returnDate && params.tripType === 'round') {
      query.set('returnDate', params.returnDate);
    }
    if (params.direct) {
      query.set('direct', 'true');
    }

    const res = await fetch(`/api/flights/aviasales-prices?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to search flights (HTTP ${res.status})`);
    }

    return await res.json();
  },

  // Revalidate live flight fare
  async revalidatePrice(offer: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    adults?: number;
    children?: number;
    infants?: number;
    cabin?: string;
    currency?: string;
    cachedPrice: number;
    airlineCode?: string;
    bookingUrl?: string;
  }) {
    const res = await fetch('/api/flights/revalidate-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offer),
    });

    if (!res.ok) {
      throw new Error(`Revalidation failed (HTTP ${res.status})`);
    }

    return await res.json();
  },

  // Autocomplete airport search
  async searchAirports(term: string): Promise<Airport[]> {
    if (!term || term.trim().length < 2) return [];

    try {
      const res = await fetch(`/api/flights/autocomplete?term=${encodeURIComponent(term.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          return data.results;
        }
      }
    } catch {
      // fallback to local list
    }

    const lower = term.toLowerCase();
    return [...BANGLADESH_AIRPORTS, ...POPULAR_AIRPORTS].filter(
      (a) =>
        a.code.toLowerCase().includes(lower) ||
        a.city.toLowerCase().includes(lower) ||
        a.name.toLowerCase().includes(lower) ||
        a.country.toLowerCase().includes(lower)
    );
  },

  // Build direct affiliate link with guaranteed parameters
  getAviasalesDirectUrl(params: FlightSearchParams): string {
    return buildAviasalesSearchUrl({
      origin: params.origin,
      destination: params.destination,
      departDate: params.departDate,
      returnDate: params.returnDate,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      cabin: params.cabin,
      tripType: params.tripType,
      source: 'azraq_trips_service',
    });
  },
};

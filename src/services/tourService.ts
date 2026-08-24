/**
 * Azraq Trips - API-First Tour Package Service
 * Manages verified package catalog, pricing tier lookups, and quotation submissions.
 */

import { TourPackage } from '../types';
import { INITIAL_TOUR_PACKAGES } from '../data/initialPackagesData';

export interface PackageFilterParams {
  country?: string;
  destinationId?: string;
  duration?: string;
  maxPrice?: number;
  searchQuery?: string;
}

export const tourService = {
  // Fetch tour packages from server or local database
  async getPackages(): Promise<TourPackage[]> {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.packages) && data.packages.length > 0) {
          return data.packages;
        }
      }
    } catch {
      // Fallback
    }

    // Default to verified package source catalog
    return INITIAL_TOUR_PACKAGES;
  },

  // Submit quote inquiry for a tour package
  async requestPackageQuote(payload: {
    packageId: string;
    packageName: string;
    customerName: string;
    email: string;
    phone: string;
    travelDate: string;
    paxCount: number;
    notes?: string;
  }) {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'package',
        customerName: payload.customerName,
        email: payload.email,
        phone: payload.phone,
        packageId: payload.packageId,
        packageName: payload.packageName,
        departureDate: payload.travelDate,
        adults: payload.paxCount,
        additionalRequirements: payload.notes || '',
        preferredContactMethod: 'WhatsApp',
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to submit tour package inquiry.');
    }

    return await res.json();
  },
};

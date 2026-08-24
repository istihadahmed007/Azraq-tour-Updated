/**
 * Azraq Trips - API-First Visa Service
 * Provides visa requirements checklist, embassy fees, document guidance, and consultation booking.
 */

import { OFFICIAL_VISA_REQUIREMENTS, VisaRequirementItem } from '../data/visaRequirementsData';

export interface VisaApplicationPayload {
  customerName: string;
  email: string;
  phone: string;
  country: string;
  visaType: string;
  travelDate?: string;
  applicantCount: number;
  profession?: string;
  hasPreviousVisa?: boolean;
  notes?: string;
}

export const visaService = {
  // Get all official visa requirements
  getAllRequirements(): VisaRequirementItem[] {
    return OFFICIAL_VISA_REQUIREMENTS;
  },

  // Get requirement for specific country
  getRequirementByCountry(countryName: string): VisaRequirementItem | undefined {
    const norm = countryName.toLowerCase().trim();
    return OFFICIAL_VISA_REQUIREMENTS.find(
      (v) =>
        v.country.toLowerCase() === norm ||
        v.country.toLowerCase().includes(norm) ||
        norm.includes(v.country.toLowerCase())
    );
  },

  // Submit a visa assistance quotation/application
  async submitVisaApplication(payload: VisaApplicationPayload) {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'visa',
        customerName: payload.customerName,
        email: payload.email,
        phone: payload.phone,
        to: payload.country,
        visaCategory: payload.visaType,
        departureDate: payload.travelDate || '',
        adults: payload.applicantCount || 1,
        additionalRequirements: `Profession: ${payload.profession || 'General'}. Previous Visas: ${payload.hasPreviousVisa ? 'Yes' : 'No'}. Notes: ${payload.notes || ''}`,
        preferredContactMethod: 'WhatsApp',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit visa consultation request.');
    }

    return await res.json();
  },
};

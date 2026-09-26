/**
 * Azraq Trips - API-First Booking Service
 * Handles quote requests, booking creation, passenger detail management, and tracking history.
 */

import { QuoteRequest } from '../types';

export interface CreateBookingPayload {
  type: 'flight' | 'visa' | 'package' | 'hotel' | 'custom_trip';
  customerName: string;
  email: string;
  phone: string;
  preferredContactMethod?: 'WhatsApp' | 'Phone' | 'Email';
  from?: string;
  to?: string;
  departureDate?: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
  packageId?: string;
  packageName?: string;
  destination?: string;
  passengers?: Array<{
    title: string;
    firstName: string;
    lastName: string;
    passportNumber?: string;
    passportExpiry?: string;
    dateOfBirth?: string;
    nationality?: string;
  }>;
  totalPriceBDT?: number;
  paymentMethod?: string;
  additionalRequirements?: string;
}

export const bookingService = {
  // Create a verified booking / quote request
  async createBooking(payload: CreateBookingPayload): Promise<{ success: boolean; id: string; quote: QuoteRequest; message: string }> {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create booking.');
    }

    return await res.json();
  },

  // Get all bookings/quotes for a user
  async getUserBookings(email?: string): Promise<QuoteRequest[]> {
    try {
      const token = localStorage.getItem('azraq_auth_session_token') || sessionStorage.getItem('azraq_auth_session_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/users/me/quotes', { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.quotes) ? data.quotes : [];
    } catch {
      return [];
    }
  },

  // Track a single booking by reference ID
  async trackBookingById(bookingId: string): Promise<QuoteRequest | null> {
    try {
      const res = await fetch(`/api/quotes/${encodeURIComponent(bookingId.trim())}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.quote || null;
    } catch {
      return null;
    }
  },

  // Request status update on WhatsApp
  buildWhatsAppInquiryLink(bookingId: string, customerName: string, serviceTitle: string): string {
    const text = `Assalamu Alaikum Azraq Desk, I would like an update on my booking/quote: [${bookingId}] for ${serviceTitle}. Name: ${customerName}.`;
    return `https://wa.me/8801851172032?text=${encodeURIComponent(text)}`;
  },
};

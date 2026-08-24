/**
 * Azraq Trips - API-First Hotel & Stay Service
 * Manages hotel queries, room quote inquiries, and verified partner booking links.
 */

export interface HotelSearchParams {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  starRating?: number;
}

export interface HotelQuoteRequest {
  customerName: string;
  email: string;
  phone: string;
  destination: string;
  hotelName?: string;
  checkInDate: string;
  checkOutDate: string;
  roomType?: string;
  guestsCount: number;
  budgetBDT?: number;
  specialRequests?: string;
}

export const hotelService = {
  // Request a hotel quote from Dhaka Concierge Desk
  async requestHotelQuote(quote: HotelQuoteRequest) {
    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'hotel',
        customerName: quote.customerName,
        email: quote.email,
        phone: quote.phone,
        to: quote.destination,
        hotelName: quote.hotelName,
        departureDate: quote.checkInDate,
        returnDate: quote.checkOutDate,
        adults: quote.guestsCount,
        additionalRequirements: quote.specialRequests || `Budget: ৳${quote.budgetBDT || 'Standard'}`,
        preferredContactMethod: 'WhatsApp',
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to submit hotel quote request.');
    }

    return await res.json();
  },

  // Build verified booking partner search deep link (Agoda / Booking.com partner handoff)
  buildHotelPartnerUrl(destination: string, checkIn?: string, checkOut?: string): string {
    const query = encodeURIComponent(destination);
    return `https://www.booking.com/searchresults.html?ss=${query}&checkin=${checkIn || ''}&checkout=${checkOut || ''}&aid=765415`;
  },
};

/**
 * Azraq Trips - Payment & Checkout Gateway Service
 * Supports Bangladesh localized payment methods: bKash, Nagad, Rocket, Cards, Bank Transfer, and Dhaka Office Concierge Hold.
 */

export type PaymentMethod = 'bkash' | 'nagad' | 'card' | 'bank_transfer' | 'concierge_hold';

export interface PaymentDetails {
  bookingId: string;
  amountBDT: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceDescription: string;
  transactionRef?: string;
}

export const paymentService = {
  // Available payment methods for Bangladeshi & International travelers
  getAvailablePaymentMethods() {
    return [
      {
        id: 'bkash',
        name: 'bKash Online / Merchant',
        desc: 'Instant payment via bKash Personal or Merchant wallet',
        badge: 'Popular in BD',
        fee: '0% fee',
        accountNumber: '01851-172032',
      },
      {
        id: 'nagad',
        name: 'Nagad',
        desc: 'Instant mobile payment via Nagad',
        badge: 'Fast',
        fee: '0% fee',
        accountNumber: '01851-172032',
      },
      {
        id: 'card',
        name: 'Visa / Mastercard / Amex',
        desc: 'Secure credit / debit card payment via SSLCommerz / gateway',
        badge: 'Instant Confirmation',
        fee: 'Standard gateway charge',
      },
      {
        id: 'bank_transfer',
        name: 'Bank Wire / EFTN',
        desc: 'Direct transfer to Azraq corporate bank account (City Bank / BRAC Bank)',
        badge: 'Corporate & Group',
        fee: 'No extra fee',
      },
      {
        id: 'concierge_hold',
        name: 'Concierge Pay on Hold',
        desc: 'Lock fare for 24h & complete payment via Dhaka office or WhatsApp invoice',
        badge: 'Flexible',
        fee: 'Free 24h hold',
      },
    ];
  },

  // Submit manual payment inquiry or transaction reference for desk verification
  async submitPaymentRecord(payment: PaymentDetails): Promise<{
    success: boolean;
    verified: boolean;
    status: string;
    message: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/payments/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          verified: false,
          status: 'FAILED',
          message: data.error || 'Failed to record payment verification request.',
          error: data.error,
        };
      }

      return {
        success: true,
        verified: Boolean(data.verified),
        status: data.status || 'PENDING_OFFICE_VERIFICATION',
        message: data.message || `Manual payment inquiry logged for Booking #${payment.bookingId}. Status: Pending Verification.`,
      };
    } catch (err: any) {
      return {
        success: false,
        verified: false,
        status: 'NETWORK_ERROR',
        message: err.message || 'Network error connecting to payment inquiry service.',
        error: err.message,
      };
    }
  },
};

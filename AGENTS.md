# Azraq Trips Platform Guidelines & Architecture

## Project Context
- **Main Travel Platform**: `https://www.azraqtrips.com/` (Content, SEO, AI Planning, Destinations, Visa, Packages, Travel Buddies, Concierge)
- **Flight Engine**: `https://flights.azraqtrips.com/` (Travelpayouts White Label Engine & Aviasales)
- **Travelpayouts Configuration**:
  - Affiliate Marker: `765415`
  - TRS / Tracking ID: `565363`
  - Flight Engine Subdomain: `https://flights.azraqtrips.com/`
  - Direct Booking Gateway: `https://www.aviasales.com/`

---

## Critical Engineering Rules

### 1. Travelpayouts Integration - IMMUTABLE
- **Never break or bypass** the Travelpayouts White Label and Aviasales affiliate parameters (`marker=765415`, `trs=565363`, `currency=bdt`).
- Maintain seamless flight user journey:
  `azraqtrips.com/flights` → `flights.azraqtrips.com` / `aviasales.com` → Verified Partner Booking.
- Keep fault-tolerant error boundaries for external third-party script integrations.

### 2. Content & SEO Quality
- **No Thin Content**: Every destination, visa, flight route, and package guide must contain unique, practical, and comprehensive details (timings, costs in BDT, baggage rules, visa types, embassy requirements, and day-by-day itineraries).
- **SEO & Schema**: Unique metadata (Title 50–60 chars, Meta Description 150–160 chars), OpenGraph tags, canonical links, and Schema.org structured data (`TouristDestination`, `TravelAgency`, `FlightReservation`, `BreadcrumbList`).
- **Meaningful Internal Linking**: Link between Flights, Visa Assistance, Holiday Packages, and AI Planner using descriptive anchor copy.

### 3. Mobile-First & Performance
- Zero horizontal scrolling on all viewport sizes.
- Minimum 44×44px touch targets for touch devices.
- High-contrast, clean visual design with accessible typography and fast client-side rendering.

### 4. AI Trip Planner & Services
- AI Trip Planner supports custom budget, duration, traveler style, and generates structured itineraries with realistic pricing in Bangladeshi Taka (BDT ৳).
- Offline Concierge Hold booking & direct partner handoffs work side-by-side with complete booking verification.

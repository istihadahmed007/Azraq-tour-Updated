# Main Domain Flight Engine Fix

## Scope

This patch is for the main `azraqtrips.com` application. The existing `flights.azraqtrips.com` White Label page remains unchanged and continues to own flight search, results, filtering, and provider booking handoff.

## What was fixed

The main site previously had several different flight paths: a custom `/flights` results page, homepage widget links, route-matrix links, itinerary links, and generic direct Aviasales fallbacks. The custom results page returned empty live offers in the public test while still displaying fallback/demo cards and generic provider links.

The main site now uses the existing White Label engine at `https://flights.azraqtrips.com/` for the complete user-facing flight journey. The `/flights` route forwards there and preserves incoming route, date, passenger, and cabin details in the White Label format. For example:

```text
https://flights.azraqtrips.com/?flightSearch=DAC0809BKK15091
```

The homepage Travelpayouts widget, featured deals, route schedules, route matrix, legacy result controls, hero gateway, partner fallback, and itinerary booking action now use the same White Label destination. The original subdomain file `public/white-label.html` is intentionally unchanged.

## Deployment

1. Deploy this package to the hosting project that serves `www.azraqtrips.com`.
2. Do not replace or modify the White Label custom HTML on `flights.azraqtrips.com` as part of this main-domain deployment.
3. Purge the main-domain CDN/browser cache after deployment.
4. Open `https://www.azraqtrips.com/flights` and confirm it redirects to `https://flights.azraqtrips.com/`.
5. Submit a test search from Dhaka (DAC) to Bangkok (BKK), choose dates, and verify that the subdomain displays the White Label search/results page.
6. Test the homepage flight widget, a featured deal, a route schedule, one destination card, and one route-guide flight link. Confirm each opens `flights.azraqtrips.com` rather than a separate direct Aviasales page.

## Files changed

- `src/App.tsx`: centralizes main-domain flight navigation on the White Label subdomain and preserves incoming search parameters.
- `src/data/flightsData.ts`: adds the White Label URL builder and keeps the old helper name as a compatibility alias so legacy components use the same engine.
- `src/components/TravelpayoutsWidget.tsx`: routes homepage searches, deals, schedules, and route-matrix links through White Label.
- `src/components/FlightSearchResults.tsx`: routes legacy result-page copy/open actions through White Label.
- `src/components/FlightItineraryTimeline.tsx`: ignores old hardcoded direct links and builds a White Label search URL for itinerary bookings.
- `src/components/HeroSection.tsx`, `src/components/PartnerRedirectModal.tsx`, and `src/components/flights/TravelpayoutsWrapper.tsx`: point generic gateway fallbacks to the White Label subdomain.
- `src/__tests__/flightAutocomplete.test.ts`: verifies the shared legacy link helper now returns the White Label URL.

The uploaded `public/white-label.html` file was preserved byte-for-byte from the original archive.

## Validation completed locally

- Flight utility tests: 21 passed.
- TypeScript check: passed.
- Vite production build: passed.
- Express server bundle: passed.
- Active source scan: no direct `www.aviasales.com` URL remains outside sample-data records.

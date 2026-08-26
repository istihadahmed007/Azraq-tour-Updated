# Main-Domain Project Cleanup

This cleaned package is for the main `azraqtrips.com` application. The existing `flights.azraqtrips.com` White Label page and its source template remain unchanged.

## Removed confirmed-unused custom flight chain

The following files were used only by the obsolete custom `/flights` results experience and were no longer reachable from the active main application after the White Label handoff:

- `src/components/FlightsView.tsx`
- `src/components/FlightSearchResults.tsx`
- `src/components/FlightTicketDetailModal.tsx`
- `src/components/FlightLoadingAnimation.tsx`
- `src/components/PriceIncreaseModal.tsx`
- `src/components/PartnerRedirectModal.tsx`
- `src/components/RecentSearches.tsx`
- `src/components/FlightItineraryTimeline.tsx`
- `src/components/flights/FlightSearchForm.tsx`
- `src/components/flights/TravelpayoutsWrapper.tsx`
- `src/services/flightService.ts`

The shared `src/components/FlightSearchForm.tsx`, `src/data/flightItinerariesData.ts`, `src/data/flightsData.ts`, `src/services/flightAutocompleteService.ts`, and `src/utils/flightSearchEngine.ts` were retained because the active homepage, autocomplete, and compatibility utilities still depend on them.

## Main-domain White Label behavior retained

The main site sends `/flights`, homepage searches, featured deals, schedules, route-matrix links, legacy result actions, and generic partner fallbacks to `https://flights.azraqtrips.com/`. The flight handoff now uses `window.location.replace`, so the obsolete main-domain `/flights` page is removed from browser history; pressing Back after returning from the subdomain can no longer reopen the old search engine. The subdomain’s `public/white-label.html` was restored byte-for-byte from the uploaded archive and was not edited by this cleanup.

## Validation

- Flight utility tests: 21 passed.
- TypeScript check: passed.
- Vite production build: passed.
- Express server bundle: passed.

Generated `node_modules`, `dist`, and local lockfile artifacts are excluded from the delivery ZIP.

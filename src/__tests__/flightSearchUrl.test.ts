import { describe, it, expect } from 'vitest';
import { getAviasalesSearchKey, buildWhiteLabelSearchUrl, buildAviasalesSearchUrl } from '../data/flightsData';

describe('Aviasales Search Key & White Label URL Generator', () => {
  describe('Cabin Letter Positioning & Passenger Counts', () => {
    it('places "c" before passenger digits for Business class (c321 for 3 adults, 2 children, 1 infant)', () => {
      const key = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'BKK',
        departDate: '2026-09-20',
        adults: 3,
        children: 2,
        infants: 1,
        cabin: 'Business',
        tripType: 'oneway',
      });
      expect(key).toBe('DAC2009BKKc321');
    });

    it('formats Business class for single adult (c100) and couples (c200)', () => {
      const single = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'DXB',
        departDate: '2026-10-15',
        adults: 1,
        cabin: 'Business',
      });
      expect(single).toBe('DAC1510DXBc100');

      const couple = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'DXB',
        departDate: '2026-10-15',
        adults: 2,
        cabin: 'Business',
      });
      expect(couple).toBe('DAC1510DXBc200');
    });

    it('places "w" before passenger digits for Comfort / Premium Economy', () => {
      const comfortKey = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'SIN',
        departDate: '2026-11-05',
        adults: 2,
        children: 1,
        infants: 0,
        cabin: 'Comfort',
      });
      expect(comfortKey).toBe('DAC0511SINw210');

      const premEconKey = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'SIN',
        departDate: '2026-11-05',
        adults: 1,
        cabin: 'Premium Economy',
      });
      expect(premEconKey).toBe('DAC0511SINw100');
    });

    it('places "f" before passenger digits for First class', () => {
      const firstSingle = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'LHR',
        departDate: '2026-12-01',
        adults: 1,
        cabin: 'First',
      });
      expect(firstSingle).toBe('DAC0112LHRf100');

      const firstFamily = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'LHR',
        departDate: '2026-12-01',
        adults: 2,
        children: 2,
        infants: 1,
        cabin: 'First',
      });
      expect(firstFamily).toBe('DAC0112LHRf221');
    });

    it('formats standard Economy correctly without extra letters for single adult', () => {
      const econSingle = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'KUL',
        departDate: '2026-08-10',
        adults: 1,
        cabin: 'Economy',
      });
      expect(econSingle).toBe('DAC1008KUL1');

      const econDefault = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'KUL',
        departDate: '2026-08-10',
        adults: 1,
      });
      expect(econDefault).toBe('DAC1008KUL1');
    });

    it('formats multi-passenger Economy with passenger counts (adults, children, infants)', () => {
      const econFamily = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'BKK',
        departDate: '2026-09-01',
        adults: 2,
        children: 1,
        infants: 1,
        cabin: 'Economy',
      });
      expect(econFamily).toBe('DAC0109BKK211');
    });
  });

  describe('Round-Trip & Date Formatting', () => {
    it('properly formats round-trip departure and return dates (DDMM)', () => {
      const roundTrip = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'JED',
        departDate: '2026-10-10',
        returnDate: '2026-10-25',
        tripType: 'round',
        adults: 2,
        children: 0,
        infants: 0,
        cabin: 'Economy',
      });
      expect(roundTrip).toBe('DAC1010JED25102');
    });

    it('formats round-trip Business class with cabin prefix before passengers', () => {
      const roundBusiness = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'JFK',
        departDate: '2026-11-12',
        returnDate: '2026-11-28',
        tripType: 'round',
        adults: 3,
        children: 2,
        infants: 1,
        cabin: 'Business',
      });
      expect(roundBusiness).toBe('DAC1211JFK2811c321');
    });
  });

  describe('White Label URL Structure & Hand-off', () => {
    it('routes searches directly to https://flights.azraqtrips.com/?flightSearch=... with affiliate marker', () => {
      const url = buildWhiteLabelSearchUrl({
        origin: 'DAC',
        destination: 'BKK',
        departDate: '2026-09-20',
        adults: 3,
        children: 2,
        infants: 1,
        cabin: 'Business',
      });

      expect(url).toBe('https://flights.azraqtrips.com/?flightSearch=DAC2009BKKc321&marker=765415&trs=565363&currency=bdt');
      expect(url).toContain('marker=765415');
      expect(url).toContain('trs=565363');
      expect(url).toContain('currency=bdt');
    });

    it('buildAviasalesSearchUrl acts as backward-compatible alias to White Label with affiliate parameters', () => {
      const url = buildAviasalesSearchUrl({
        origin: 'DAC',
        destination: 'CGP',
        departDate: '2026-08-15',
        adults: 1,
      });

      expect(url).toBe('https://flights.azraqtrips.com/?flightSearch=DAC1508CGP1&marker=765415&trs=565363&currency=bdt');
      expect(url).toContain('marker=765415');
    });
  });
});

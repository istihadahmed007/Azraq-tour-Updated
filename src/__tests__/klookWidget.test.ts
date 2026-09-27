import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  KLOOK_WIDGET_SCRIPT_SRC,
  KLOOK_FALLBACK_URL,
} from '../components/KlookActivitiesWidget';

describe('KlookActivitiesWidget Affiliate Invariants & Configuration', () => {
  it('strictly preserves all Travelpayouts script embed parameters without modification', () => {
    const url = new URL(KLOOK_WIDGET_SCRIPT_SRC);

    expect(url.origin).toBe('https://tpwidg.com');
    expect(url.pathname).toBe('/content');
    expect(url.searchParams.get('currency')).toBe('USD');
    expect(url.searchParams.get('trs')).toBe('566378');
    expect(url.searchParams.get('shmarker')).toBe('765415');
    expect(url.searchParams.get('locale')).toBe('en');
    expect(url.searchParams.get('city_id')).toBe('2');
    expect(url.searchParams.get('category')).toBe('4');
    expect(url.searchParams.get('amount')).toBe('3');
    expect(url.searchParams.get('powered_by')).toBe('true');
    expect(url.searchParams.get('campaign_id')).toBe('137');
    expect(url.searchParams.get('promo_id')).toBe('4497');
  });

  it('preserves trs=566378 and does NOT overwrite with main platform project ID 565363', () => {
    const url = new URL(KLOOK_WIDGET_SCRIPT_SRC);
    expect(url.searchParams.get('trs')).toBe('566378');
    expect(url.searchParams.get('trs')).not.toBe('565363');
  });

  it('preserves global affiliate shmarker=765415', () => {
    const url = new URL(KLOOK_WIDGET_SCRIPT_SRC);
    expect(url.searchParams.get('shmarker')).toBe('765415');
  });

  it('points fallback button to verified Klook affiliate link with appropriate rel attributes', () => {
    expect(KLOOK_FALLBACK_URL).toBe('https://klook.tp.st/aXDQ3uLD');
  });
});

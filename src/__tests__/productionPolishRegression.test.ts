import { describe, it, expect } from 'vitest';
import { getAviasalesSearchKey, buildWhiteLabelSearchUrl } from '../data/flightsData';
import { getInitials } from '../components/UserAvatar';

describe('Production Polish Regression Suite', () => {
  describe('Travel Buddies Feed & Post Media Normalization', () => {
    it('correctly normalizes media URLs from both snake_case and camelCase payloads', () => {
      const snakeCasePost = {
        id: 'post_1',
        media_urls: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      };
      const camelCasePost = {
        id: 'post_2',
        mediaUrls: ['https://example.com/img3.jpg'],
      };
      const legacyImagePost = {
        id: 'post_3',
        imageUrl: 'https://example.com/img4.jpg',
      };

      const resolveMedia = (post: any): string[] => {
        return Array.isArray(post.media_urls) && post.media_urls.length > 0
          ? post.media_urls
          : Array.isArray(post.mediaUrls) && post.mediaUrls.length > 0
          ? post.mediaUrls
          : post.imageUrl
          ? [post.imageUrl]
          : post.image_url
          ? [post.image_url]
          : [];
      };

      expect(resolveMedia(snakeCasePost)).toEqual(['https://example.com/img1.jpg', 'https://example.com/img2.jpg']);
      expect(resolveMedia(camelCasePost)).toEqual(['https://example.com/img3.jpg']);
      expect(resolveMedia(legacyImagePost)).toEqual(['https://example.com/img4.jpg']);
    });

    it('deduplicates incoming posts on infinite scroll without dropping existing items', () => {
      const prevPosts = [
        { id: 'p1', caption: 'First post' },
        { id: 'p2', caption: 'Second post' },
      ];
      const incomingPosts = [
        { id: 'p2', caption: 'Second post (duplicate)' },
        { id: 'p3', caption: 'Third post' },
      ];

      const existingIds = new Set(prevPosts.map((p) => p.id));
      const newItems = incomingPosts.filter((p) => !existingIds.has(p.id));
      const merged = [...prevPosts, ...newItems];

      expect(merged).toHaveLength(3);
      expect(merged.map((p) => p.id)).toEqual(['p1', 'p2', 'p3']);
    });
  });

  describe('Group Trips Deduplication Invariants', () => {
    it('deduplicates trips with identical IDs while preserving genuinely separate trips', () => {
      const rawApiResults = [
        { id: 'trip_101', title: 'Maldives Island Hop', destination: 'Maldives' },
        { id: 'trip_102', title: 'Bali Beach Exploration', destination: 'Bali' },
        { id: 'trip_101', title: 'Maldives Island Hop (repeated)', destination: 'Maldives' },
        { id: 'trip_103', title: 'Thailand Cultural Trip', destination: 'Thailand' },
      ];

      const uniqueTrips = Array.from(
        new Map(rawApiResults.filter((t) => Boolean(t && t.id)).map((t) => [t.id, t])).values()
      );

      expect(uniqueTrips).toHaveLength(3);
      expect(uniqueTrips.map((t) => t.id)).toEqual(['trip_101', 'trip_102', 'trip_103']);
      expect(uniqueTrips[0].title).toBe('Maldives Island Hop (repeated)'); // latest state preserved
    });
  });

  describe('User Avatar Initials & Fallback', () => {
    it('computes initials from two-word full names', () => {
      expect(getInitials('Istihad Ahmed')).toBe('IA');
      expect(getInitials('Tonmoy Islam')).toBe('TI');
    });

    it('computes initials from single name or email', () => {
      expect(getInitials('Tanvir')).toBe('TA');
      expect(getInitials(null, 'traveler@azraqtrips.com')).toBe('TR');
      expect(getInitials('', '')).toBe('TR');
    });
  });

  describe('Travelpayouts White Label Affiliate Parameters - IMMUTABLE', () => {
    it('always preserves marker 765415, trs 565363, and currency bdt in flight search URLs', () => {
      const url = buildWhiteLabelSearchUrl({
        origin: 'DAC',
        destination: 'BKK',
        departDate: '2026-10-10',
        adults: 2,
      });

      expect(url).toContain('https://flights.azraqtrips.com/');
      expect(url).toContain('marker=765415');
      expect(url).toContain('trs=565363');
      expect(url).toContain('currency=bdt');
      expect(url).toContain('flightSearch=');
    });

    it('computes accurate Aviasales search keys for one-way and round trips', () => {
      const keyOneWay = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'DXB',
        departDate: '2026-10-25',
        adults: 1,
        tripType: 'oneway',
      });
      expect(keyOneWay).toBe('DAC2510DXB1');

      const keyRoundTrip = getAviasalesSearchKey({
        origin: 'DAC',
        destination: 'BKK',
        departDate: '2026-11-01',
        returnDate: '2026-11-08',
        adults: 2,
        tripType: 'round',
      });
      expect(keyRoundTrip).toBe('DAC0111BKK08112');
    });
  });
});

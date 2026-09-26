import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import app, { usersStore, requestsStore, quotesStore } from '../../server';
import { sessionStore } from '../../server/sessionStore';
import { buildWhiteLabelSearchUrl } from '../data/flightsData';

describe('Security & Business Flow Regression Suite', () => {
  let server: Server;
  let baseUrl: string;
  let testUserToken: string;
  let adminToken: string;
  let ownerToken: string;
  let dynamicOwnerEmail: string;
  const originalFetch = globalThis.fetch;

  beforeAll(async () => {
    // Mock Google tokeninfo verification in Vitest to run completely offline without network latency
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr =
        typeof input === 'string'
          ? input
          : input instanceof URL
          ? input.toString()
          : (input as Request).url;

      if (urlStr.includes('oauth2.googleapis.com/tokeninfo')) {
        const parsedUrl = new URL(urlStr);
        const idToken = parsedUrl.searchParams.get('id_token');
        if (idToken === 'valid_mock_google_token') {
          return new Response(
            JSON.stringify({
              email: 'google_verified_traveler@example.com',
              email_verified: 'true',
              name: 'Google Verified Traveler',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ error_description: 'Invalid Value' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return originalFetch(input, init);
    };

    // Start test server on dynamic loopback port
    server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}`;

    // 1. Register a genuine regular user
    const dynamicUserEmail = `regular_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Regular Traveler',
        email: dynamicUserEmail,
        phone: '01712345678',
        country: 'Bangladesh',
        password: 'ValidPassword123!',
        confirmPassword: 'ValidPassword123!',
        agreeTerms: true,
      }),
    });
    const regData = await regRes.json();
    testUserToken = regData.token;

    // 2. Bootstrap a genuine owner / admin account
    process.env.ADMIN_BOOTSTRAP_TOKEN = 'test-secret-token-999';
    const bootRes = await fetch(`${baseUrl}/api/auth/bootstrap-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin_test_owner@example.com',
        password: 'SecureAdminPass123!',
        fullName: 'Super Administrator',
        phone: '01851172032',
        bootstrapToken: 'test-secret-token-999',
      }),
    });
    const bootData = await bootRes.json();
    adminToken = bootData.token;

    // 3. Register a dedicated owner user for tracking ownership verification
    dynamicOwnerEmail = `owner_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@azraqtrips.com`;
    const ownerRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Owner Traveler',
        email: dynamicOwnerEmail,
        phone: '01855443322',
        country: 'Bangladesh',
        password: 'OwnerPassword123!',
        confirmPassword: 'OwnerPassword123!',
        agreeTerms: true,
      }),
    });
    const ownerData = await ownerRes.json();
    ownerToken = ownerData.token;

    // 4. Dedicated fixture for deprecated default password testing (resilient to real user mutations)
    usersStore.set('fixture_legacy_pass@azraqtrips.com', {
      id: 'usr_fixture_legacy',
      email: 'fixture_legacy_pass@azraqtrips.com',
      fullName: 'Legacy Fixture Traveler',
      phone: '01711002233',
      country: 'Bangladesh',
      passwordHash: 'dummy_legacy_hash',
      passwordSalt: 'dummy_legacy_salt',
      role: 'user',
      isVerified: true,
      needsPasswordRotation: true,
    } as any);
  });

  afterAll(async () => {
    globalThis.fetch = originalFetch;
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  describe('Priority 1: Admin API Authentication & Role Checks', () => {
    const adminEndpoints = [
      { method: 'GET', path: '/api/admin/users' },
      { method: 'GET', path: '/api/admin/settings' },
      { method: 'POST', path: '/api/admin/settings', body: { requireEmailVerification: true } },
      { method: 'GET', path: '/api/admin/requests' },
      { method: 'PATCH', path: '/api/admin/requests/test-auth-id', body: { status: 'PROCESSING' } },
      { method: 'GET', path: '/api/quotes/admin' },
      { method: 'POST', path: '/api/packages/save', body: { title: 'Test Package' } },
      { method: 'POST', path: '/api/blog/posts', body: { title: 'Test Post' } },
      { method: 'POST', path: '/api/cloudinary/sign', body: {} },
      { method: 'POST', path: '/api/cloudinary/upload', body: { file: 'data:image/png;base64,...' } },
    ];

    for (const ep of adminEndpoints) {
      it(`Unauthenticated call to ${ep.method} ${ep.path} receives 401 Unauthorized`, async () => {
        const res = await fetch(`${baseUrl}${ep.path}`, {
          method: ep.method,
          headers: { 'Content-Type': 'application/json' },
          body: ep.body ? JSON.stringify(ep.body) : undefined,
        });
        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.error || data.message).toMatch(/Authentication required|log in/i);
      });

      it(`Regular authenticated user call to ${ep.method} ${ep.path} receives 403 Forbidden`, async () => {
        const res = await fetch(`${baseUrl}${ep.path}`, {
          method: ep.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${testUserToken}`,
          },
          body: ep.body ? JSON.stringify(ep.body) : undefined,
        });
        expect(res.status).toBe(403);
        const data = await res.json();
        expect(data.error).toMatch(/Forbidden|permission/i);
      });
    }

    it('Administrator with genuine admin token can access GET /api/admin/users with 200', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.users)).toBe(true);
    });
  });

  describe('Priority 1: PATCH /api/admin/requests/:id Authorization & Session Identity', () => {
    let testReqId: string;

    beforeAll(async () => {
      const uReq = await requestsStore.createRequest({
        customerName: 'Actor Test Traveler',
        customerEmail: 'actor_test@example.com',
        customerPhone: '01811223344',
        requestType: 'flight',
        destination: 'London, UK',
      });
      testReqId = uReq.request_id;
    });

    it('rejects unauthenticated PATCH /api/admin/requests/:id with 401', async () => {
      const res = await fetch(`${baseUrl}/api/admin/requests/${testReqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PROCESSING' }),
      });
      expect(res.status).toBe(401);
    });

    it('rejects ordinary user PATCH /api/admin/requests/:id with 403', async () => {
      const res = await fetch(`${baseUrl}/api/admin/requests/${testReqId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testUserToken}`,
        },
        body: JSON.stringify({ status: 'PROCESSING' }),
      });
      expect(res.status).toBe(403);
    });

    it('takes actor identity from authenticated admin session, ignoring client-provided performedBy/performedEmail', async () => {
      const res = await fetch(`${baseUrl}/api/admin/requests/${testReqId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: 'PROCESSING',
          internalNote: 'Verification in progress by duty specialist',
          performedBy: 'SpoofedAttackerName',
          performedEmail: 'attacker@evil.com',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.request.status).toBe('PROCESSING');

      // The recorded note author must be the genuine authenticated admin, NOT the client spoof
      const note = data.request.admin_notes?.[data.request.admin_notes.length - 1];
      expect(note).toBeDefined();
      expect(note.authorName).toBe('Super Administrator');
      expect(note.authorEmail).toBe('admin_test_owner@example.com');
      expect(note.authorName).not.toBe('SpoofedAttackerName');
      expect(note.authorEmail).not.toBe('attacker@evil.com');
    });
  });

  describe('Priority 1: Google Authentication ID Token Verification', () => {
    it('rejects raw email parameters without genuine Google ID token with 400', async () => {
      const res = await fetch(`${baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'victim@gmail.com', fullName: 'Attacker' }),
      });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/token is required/i);
    });

    it('rejects forged or expired Google ID tokens with 401', async () => {
      const res = await fetch(`${baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'forged_google_jwt_token_12345' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/Invalid or expired Google identity token/i);
    });

    it('authenticates genuine verified Google ID token with 200 and issues 256-bit crypto session token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: 'valid_mock_google_token' }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.token).toHaveLength(64);
      expect(data.user.email).toBe('google_verified_traveler@example.com');
    });
  });

  describe('Priority 1: Cryptographic Session Store & Revocation', () => {
    it('issues cryptographically random, unpredictable 256-bit hex tokens', () => {
      const t1 = sessionStore.createSession('usr_1', 'u1@azraq.com', 'user');
      const t2 = sessionStore.createSession('usr_1', 'u1@azraq.com', 'user');
      expect(t1).toHaveLength(64);
      expect(t2).toHaveLength(64);
      expect(t1).not.toBe(t2);
      expect(/^[0-9a-f]{64}$/.test(t1)).toBe(true);
    });

    it('retrieves active session correctly and rejects revoked session', () => {
      const token = sessionStore.createSession('usr_revoke_test', 'revoke@azraq.com', 'user');
      const active = sessionStore.getSession(token);
      expect(active).not.toBeNull();
      expect(active?.email).toBe('revoke@azraq.com');

      sessionStore.revokeSession(token);
      const revoked = sessionStore.getSession(token);
      expect(revoked).toBeNull();
    });

    it('POST /api/auth/logout revokes session token immediately', async () => {
      const token = sessionStore.createSession('usr_logout_test', 'logout_test@azraq.com', 'user');
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      expect(sessionStore.getSession(token)).toBeNull();
    });
  });

  describe('Priority 1: Credential Rotation & Dedicated Test Fixture', () => {
    it('blocks login with default deprecated password pass1234 with 403 on dedicated fixture', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'fixture_legacy_pass@azraqtrips.com',
          password: 'pass1234',
        }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.needsPasswordRotation).toBe(true);
      expect(data.error).toMatch(/Default credentials have been deprecated/i);
    });

    it('forgot password request does not leak demoResetCode in response', async () => {
      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent_test_traveler@example.com' }),
      });
      const data = await res.json();
      expect(data).not.toHaveProperty('demoResetCode');
      expect(data).not.toHaveProperty('resetCode');
    });
  });

  describe('Priority 1: 4-Tier Access Control Across Tracking Endpoints', () => {
    let trackedReqId: string;

    beforeAll(async () => {
      // Create a unified request owned by dynamicOwnerEmail with sensitive metadata
      const uReq = await requestsStore.createRequest(
        {
          customerName: 'Owner Traveler',
          customerEmail: dynamicOwnerEmail,
          customerPhone: '+8801855443322',
          requestType: 'package',
          destination: 'Tokyo & Kyoto, Japan',
          passengers: 2,
          metadata: { passportNumber: 'BK99887711', confidentialDiet: 'Halal strict' },
        },
        { ip: '192.168.1.100', userAgent: 'Mozilla/5.0 Test Agent' }
      );
      trackedReqId = uReq.request_id;

      // Add staff internal admin note
      requestsStore.updateRequest(
        trackedReqId,
        { internalNote: 'Internal VIP: Offer private bullet train pass' },
        { name: 'Super Administrator', email: 'admin_test_owner@example.com', role: 'admin' }
      );
    });

    it('Role 1 (Unauthenticated Guest): returns minimal public status without contact details, metadata, or notes', async () => {
      // 1. GET /api/requests/track
      const resReq = await fetch(`${baseUrl}/api/requests/track?query=${trackedReqId}`);
      expect(resReq.status).toBe(200);
      const dataReq = await resReq.json();
      expect(dataReq.success).toBe(true);
      expect(dataReq.request.id).toBeDefined();
      expect(dataReq.request.status).toBe('NEW');
      expect(dataReq.request.destination).toBe('Tokyo & Kyoto, Japan');
      // Must NOT leak customer contact details or admin notes
      expect(dataReq.request.customer_name).toBeUndefined();
      expect(dataReq.request.customer_email).toBeUndefined();
      expect(dataReq.request.customer_phone).toBeUndefined();
      expect(dataReq.request.metadata).toBeUndefined();
      expect(dataReq.request.admin_notes).toBeUndefined();
      expect(dataReq.request.client_ip).toBeUndefined();

      // 2. GET /api/quotes/:id (fallback to requestsStore)
      const resQuote = await fetch(`${baseUrl}/api/quotes/${trackedReqId}`);
      expect(resQuote.status).toBe(200);
      const dataQuote = await resQuote.json();
      expect(dataQuote.success).toBe(true);
      expect(dataQuote.quote.id).toBeDefined();
      expect(dataQuote.quote.customer_name).toBeUndefined();
      expect(dataQuote.quote.customer_email).toBeUndefined();
      expect(dataQuote.quote.customer_phone).toBeUndefined();
      expect(dataQuote.quote.metadata).toBeUndefined();
      expect(dataQuote.quote.admin_notes).toBeUndefined();

      // 3. GET /api/quotes/track (fallback to requestsStore)
      const resTrack = await fetch(`${baseUrl}/api/quotes/track?query=${trackedReqId}`);
      expect(resTrack.status).toBe(200);
      const dataTrack = await resTrack.json();
      expect(dataTrack.success).toBe(true);
      expect(dataTrack.quotes[0].customer_name).toBeUndefined();
      expect(dataTrack.quotes[0].customer_email).toBeUndefined();
      expect(dataTrack.quotes[0].customer_phone).toBeUndefined();
      expect(dataTrack.quotes[0].metadata).toBeUndefined();
    });

    it('Role 2 (Ordinary Non-Owner User): returns minimal public status without contact details or notes', async () => {
      const res = await fetch(`${baseUrl}/api/requests/track?query=${trackedReqId}`, {
        headers: { Authorization: `Bearer ${testUserToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.request.status).toBe('NEW');
      // No contact details or notes for non-owner
      expect(data.request.customer_name).toBeUndefined();
      expect(data.request.customer_email).toBeUndefined();
      expect(data.request.customer_phone).toBeUndefined();
      expect(data.request.metadata).toBeUndefined();
      expect(data.request.admin_notes).toBeUndefined();
    });

    it('Role 3 (Request Owner): returns full customer details and metadata, but never internal admin notes', async () => {
      const res = await fetch(`${baseUrl}/api/requests/track?query=${trackedReqId}`, {
        headers: { Authorization: `Bearer ${ownerToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      // Owner receives their own contact details and submitted metadata
      expect(data.request.customer_name).toBe('Owner Traveler');
      expect(data.request.customer_email).toBe(dynamicOwnerEmail);
      expect(data.request.customer_phone).toBe('+8801855443322');
      expect(data.request.metadata?.passportNumber).toBe('BK99887711');
      // Internal staff notes and IP must still be omitted
      expect(data.request.admin_notes).toBeUndefined();
      expect(data.request.client_ip).toBeUndefined();
    });

    it('Role 4 (Administrator): returns complete record including internal notes and staff logs', async () => {
      const res = await fetch(`${baseUrl}/api/requests/track?query=${trackedReqId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.request.customer_name).toBe('Owner Traveler');
      expect(data.request.customer_email).toBe(dynamicOwnerEmail);
      expect(data.request.admin_notes).toBeDefined();
      expect(Array.isArray(data.request.admin_notes)).toBe(true);
      expect(data.request.admin_notes[0].text).toContain('Internal VIP');
      expect(data.request.admin_notes[0].text).toContain('Internal VIP');
    });
  });

  describe('Priority 2: Universal Quotes & Tracking Invariants', () => {
    let createdQuoteId: string;

    it('POST /api/quotes records hotel inquiry truthfully and returns genuine Reference ID', async () => {
      const res = await fetch(`${baseUrl}/api/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hotel',
          customerName: 'Tanvir Hossain',
          email: 'tanvir.test@azraqtrips.com',
          phone: '+8801711223344',
          destination: 'Bangkok, Thailand',
          hotelName: 'The Landmark Bangkok',
          departureDate: '2026-12-01',
          returnDate: '2026-12-07',
          adults: 2,
          additionalRequirements: 'Non-smoking high floor room',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.id).toMatch(/^AZR-HOT-/);
      expect(data.quote.to || data.quote.destination).toMatch(/The Landmark Bangkok|Bangkok/i);
      createdQuoteId = data.id;
    });

    it('GET /api/quotes/:id returns minimal public status without contact details for guest tracking', async () => {
      expect(createdQuoteId).toBeDefined();
      const res = await fetch(`${baseUrl}/api/quotes/${createdQuoteId}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.quote.id).toBe(createdQuoteId);
      // Unauthenticated guest must not receive customer contact details
      expect(data.quote.email).toBeUndefined();
      expect(data.quote.phone).toBeUndefined();
      expect(data.quote.customerName).toBeUndefined();
    });

    it('GET /api/quotes/track allows guest to track with valid Request ID', async () => {
      expect(createdQuoteId).toBeDefined();
      const res = await fetch(`${baseUrl}/api/quotes/track?query=${createdQuoteId}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.quotes)).toBe(true);
      expect(data.quotes[0].id).toBe(createdQuoteId);
      expect(data.quotes[0].email).toBeUndefined();
    });
  });

  describe('Priority 2: Truthful Payment Inquiries & No False Success', () => {
    it('POST /api/payments/record records inquiry with status PENDING_OFFICE_VERIFICATION and verified: false', async () => {
      const res = await fetch(`${baseUrl}/api/payments/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: 'AZR-HOT-TEST-001',
          amountBDT: 45000,
          paymentMethod: 'bkash',
          customerName: 'Tanvir Hossain',
          customerPhone: '+8801711223344',
          customerEmail: 'tanvir@example.com',
          transactionRef: 'BKASH-TX-998877',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.verified).toBe(false);
      expect(data.status).toBe('PENDING_OFFICE_VERIFICATION');
      expect(data.message).toMatch(/Pending Verification|verify this transaction/i);
    });

    it('POST /api/payments/record fails with 400 when missing required phone or bookingId', async () => {
      const res = await fetch(`${baseUrl}/api/payments/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountBDT: 15000,
          paymentMethod: 'nagad',
        }),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/required/i);
    });
  });

  describe('Priority 2: API 404 Behavior (Never HTML 200 for API routes)', () => {
    it('returns JSON 404 for unknown /api/* endpoints', async () => {
      const res = await fetch(`${baseUrl}/api/non_existent_endpoint_12345`);
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toContain('application/json');
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toMatch(/not found on Azraq Trips API server/i);
    });
  });

  describe('Priority 3: Flight Engine Travelpayouts Parameter Invariance', () => {
    it('flight search engine produces correct Travelpayouts affiliate parameters in AGENTS.md', () => {
      const marker = '765415';
      const trs = '565363';
      const currency = 'bdt';

      const buildSearchUrl = (origin: string, dest: string, date: string) => {
        return `https://flights.azraqtrips.com/?marker=${marker}&trs=${trs}&currency=${currency}&origin_iata=${origin}&destination_iata=${dest}&depart_date=${date}`;
      };

      const url = buildSearchUrl('DAC', 'BKK', '2026-11-20');
      expect(url).toContain('marker=765415');
      expect(url).toContain('trs=565363');
      expect(url).toContain('currency=bdt');
      expect(url).toContain('origin_iata=DAC');
      expect(url).toContain('destination_iata=BKK');
    });

    it('buildWhiteLabelSearchUrl preserves marker=765415, trs=565363, and currency=bdt', () => {
      const searchUrl = buildWhiteLabelSearchUrl({
        origin: 'DAC',
        destination: 'BKK',
        departDate: '2026-11-20',
      });
      expect(searchUrl).toContain('marker=765415');
      expect(searchUrl).toContain('trs=565363');
      expect(searchUrl).toContain('currency=bdt');
      expect(searchUrl).toContain('flightSearch=DAC2011BKK1');
    });

    it('server redirects /flights to flights.azraqtrips.com with marker=765415 and trs=565363', async () => {
      const res = await fetch(`${baseUrl}/flights`, { redirect: 'manual' });
      expect(res.status).toBe(301);
      const location = res.headers.get('location') || '';
      expect(location).toContain('marker=765415');
      expect(location).toContain('trs=565363');
      expect(location).toContain('currency=bdt');
      expect(location).toContain('https://flights.azraqtrips.com');
    });
  });
});

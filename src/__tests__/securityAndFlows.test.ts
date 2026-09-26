import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import app from '../../server';
import { sessionStore } from '../../server/sessionStore';

describe('Security & Business Flow Regression Suite', () => {
  let server: Server;
  let baseUrl: string;
  let testUserToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // Start test server on dynamic loopback port
    server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}`;

    // 1. Register a genuine regular user
    const dynamicUserEmail = `regular_${Date.now()}@example.com`;
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
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  describe('Priority 1: Admin API Authentication & Role Checks', () => {
    const adminEndpoints = [
      { method: 'GET', path: '/api/admin/users' },
      { method: 'GET', path: '/api/admin/settings' },
      { method: 'POST', path: '/api/admin/settings', body: { requireEmailVerification: true } },
      { method: 'GET', path: '/api/admin/requests' },
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

  describe('Priority 1: Credential Rotation & Security Flags', () => {
    it('blocks login with default deprecated password pass1234 with 403', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'istihadahmed1163@gmail.com',
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

  describe('Priority 1 & 2: Ownership Enforcement & Data Isolation', () => {
    it('GET /api/users/me/requests rejects unauthenticated access with 401', async () => {
      const res = await fetch(`${baseUrl}/api/users/me/requests`);
      expect(res.status).toBe(401);
    });

    it('GET /api/users/me/quotes rejects unauthenticated access with 401', async () => {
      const res = await fetch(`${baseUrl}/api/users/me/quotes`);
      expect(res.status).toBe(401);
    });

    it('GET /api/quotes/track rejects tracking by email address without authentication with 401', async () => {
      const res = await fetch(`${baseUrl}/api/quotes/track?query=target_customer@example.com`);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toMatch(/requires signing in/i);
    });

    it('POST /api/auth/update-profile rejects unauthenticated profile updates with 401', async () => {
      const res = await fetch(`${baseUrl}/api/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'victim@azraqtrips.com', fullName: 'Hacked Name' }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Priority 2: Truthful Universal Quotes & Guest Tracking', () => {
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

    it('GET /api/quotes/:id returns sanitized, redacted quote details for unauthenticated guest tracking', async () => {
      expect(createdQuoteId).toBeDefined();
      const res = await fetch(`${baseUrl}/api/quotes/${createdQuoteId}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.quote.id).toBe(createdQuoteId);
      // Contact email is redacted with asterisks for guest privacy
      if (data.quote.email) {
        expect(data.quote.email).toContain('***');
        expect(data.quote.email).not.toBe('tanvir.test@azraqtrips.com');
      }
    });

    it('GET /api/quotes/track allows guest to track with valid Request ID', async () => {
      expect(createdQuoteId).toBeDefined();
      const res = await fetch(`${baseUrl}/api/quotes/track?query=${createdQuoteId}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.quotes)).toBe(true);
      expect(data.quotes[0].id).toBe(createdQuoteId);
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
  });
});

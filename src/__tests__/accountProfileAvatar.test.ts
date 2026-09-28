import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import express from 'express';

// Valid 10x10 PNG sample data URL
const SAMPLE_PNG_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';

describe('Azraq Account Profile Picture Upload & Persistence Suite', () => {
  let server: Server;
  let baseUrl: string;
  let testUserToken: string;
  let testUserEmail: string;

  beforeAll(async () => {
    // Dynamically import the real server app
    const serverModule = await import('../../server');
    const app: express.Express = (serverModule as any).app || serverModule.default;

    server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });

    const addr = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}`;

    // Register a test user
    testUserEmail = `avatar_tester_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Avatar Traveler',
        email: testUserEmail,
        phone: '01899998888',
        country: 'Bangladesh',
        password: 'ValidPassword123!',
        confirmPassword: 'ValidPassword123!',
        agreeTerms: true,
      }),
    });
    const regData = await regRes.json();
    testUserToken = regData.token;
  }, 30000);

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('rejects unauthenticated POST /api/upload/avatar with 401', async () => {
    const res = await fetch(`${baseUrl}/api/upload/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: SAMPLE_PNG_BASE64 }),
    });
    expect(res.status).toBe(401);
  });

  it('rejects avatar upload without image payload with 400', async () => {
    const res = await fetch(`${baseUrl}/api/upload/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('allows authenticated traveler to upload and crop profile picture', async () => {
    const res = await fetch(`${baseUrl}/api/upload/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({ file: SAMPLE_PNG_BASE64 }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(typeof data.url).toBe('string');
    expect(data.url.length).toBeGreaterThan(0);

    // Verify persistence via GET /api/auth/me
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${testUserToken}`,
      },
    });
    expect(meRes.status).toBe(200);
    const meData = await meRes.json();
    expect(meData.user.photoURL).toBe(data.url);
  });

  it('allows authenticated traveler to remove avatar picture and reset via DELETE', async () => {
    const delRes = await fetch(`${baseUrl}/api/upload/avatar`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${testUserToken}`,
      },
    });

    expect(delRes.status).toBe(200);
    const delData = await delRes.json();
    expect(delData.success).toBe(true);
    expect(delData.photoURL).toBe('');

    // Verify GET /api/auth/me reflects removal
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${testUserToken}`,
      },
    });
    const meData = await meRes.json();
    expect(meData.user.photoURL).toBe('');
  });

  it('supports removal via POST /api/upload/avatar with remove: true', async () => {
    // 1. Upload again
    const upRes = await fetch(`${baseUrl}/api/upload/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({ image: SAMPLE_PNG_BASE64 }),
    });
    expect(upRes.status).toBe(200);

    // 2. Remove with flag
    const removeRes = await fetch(`${baseUrl}/api/upload/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({ remove: true }),
    });

    expect(removeRes.status).toBe(200);
    const removeData = await removeRes.json();
    expect(removeData.success).toBe(true);
    expect(removeData.photoURL).toBe('');
  });

  it('persists photoURL via /api/auth/update-profile when authorized', async () => {
    const customUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde';
    const updateRes = await fetch(`${baseUrl}/api/auth/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testUserToken}`,
      },
      body: JSON.stringify({
        photoURL: customUrl,
        bio: 'Updated traveler bio.',
      }),
    });

    expect(updateRes.status).toBe(200);
    const updateData = await updateRes.json();
    expect(updateData.user.photoURL).toBe(customUrl);

    // Verify via GET /api/auth/me
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${testUserToken}`,
      },
    });
    const meData = await meRes.json();
    expect(meData.user.photoURL).toBe(customUrl);
    expect(meData.user.bio).toBe('Updated traveler bio.');
  });
});

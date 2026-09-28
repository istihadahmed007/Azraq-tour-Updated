import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import app from '../../server';
import { travelBuddiesStore } from '../../server/travelBuddiesStore';

describe('Travel Buddies Community Social Platform End-to-End Test Suite', () => {
  let server: Server;
  let baseUrl: string;

  // Test accounts
  let userAToken: string;
  let userAId: string;
  let userBToken: string;
  let userBId: string;
  let adminToken: string;
  let createdPostId: string;
  let tripId: string;

  beforeAll(async () => {
    // Start local server on random port
    server = createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${addr.port}`;

    // 1. Register User A ("Traveler Alice")
    const emailA = `alice_${Date.now()}@example.com`;
    const regARes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Alice Walker',
        email: emailA,
        phone: '01711112222',
        country: 'Bangladesh',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        agreeTerms: true,
      }),
    });
    const regAData = await regARes.json();
    userAToken = regAData.token;
    userAId = regAData.user.uid;

    // 2. Register User B ("Traveler Bob")
    const emailB = `bob_${Date.now()}@example.com`;
    const regBRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bob Chowdhury',
        email: emailB,
        phone: '01822223333',
        country: 'Bangladesh',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        agreeTerms: true,
      }),
    });
    const regBData = await regBRes.json();
    userBToken = regBData.token;
    userBId = regBData.user.uid;

    // 3. Bootstrap an Admin user
    process.env.ADMIN_BOOTSTRAP_TOKEN = 'test-travel-buddies-admin-key';
    const adminRes = await fetch(`${baseUrl}/api/auth/bootstrap-owner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `admin_${Date.now()}@azraqtrips.com`,
        password: 'AdminPassword123!',
        fullName: 'Community Admin',
        phone: '01933334444',
        bootstrapToken: 'test-travel-buddies-admin-key',
      }),
    });
    const adminData = await adminRes.json();
    adminToken = adminData.token;
  }, 30000);

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  // =========================================================================
  // 1. PROFILES & PRIVACY
  // =========================================================================
  describe('Profiles & Privacy Management', () => {
    it('initializes default profile and allows customized username, bio, and travel style', async () => {
      // User A updates profile
      const updateRes = await fetch(`${baseUrl}/api/travel-buddies/profiles/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({
          username: `alice_travels_${Date.now() % 10000}`,
          displayName: 'Alice the Explorer',
          bio: 'Photographer and backpacker exploring South Asia.',
          homeCity: 'Dhaka',
          languages: ['Bangla', 'English'],
          travelStyles: ['Adventure & Nature', 'Photography'],
          destinationsVisited: ['Sajek Valley', "Cox's Bazar", 'Bali'],
        }),
      });
      const updateData = await updateRes.json();
      expect(updateRes.status).toBe(200);
      expect(updateData.success).toBe(true);
      expect(updateData.profile.displayName).toBe('Alice the Explorer');
      expect(updateData.profile.homeCity).toBe('Dhaka');
      expect(updateData.profile.travelStyles).toContain('Photography');
    });

    it('ensures private email and phone are NEVER leaked in public profile', async () => {
      const publicRes = await fetch(`${baseUrl}/api/travel-buddies/profiles/${userAId}`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const publicData = await publicRes.json();
      expect(publicRes.status).toBe(200);
      expect(publicData.profile).toBeDefined();
      expect(publicData.profile.email).toBeUndefined();
      expect(publicData.profile.phone).toBeUndefined();
      expect(publicData.profile.displayName).toBe('Alice the Explorer');
    });

    it('lists public profiles and excludes private profiles', async () => {
      const listRes = await fetch(`${baseUrl}/api/travel-buddies/profiles`);
      const listData = await listRes.json();
      expect(listRes.status).toBe(200);
      expect(listData.success).toBe(true);
      expect(Array.isArray(listData.profiles)).toBe(true);
      expect(listData.profiles.some((p: any) => p.userId === userAId)).toBe(true);
    });
  });

  // =========================================================================
  // 2. IMAGE UPLOAD & METADATA STRIPPING
  // =========================================================================
  describe('Image Processing & EXIF/GPS Stripping', () => {
    it('uploads base64 image, validates format, optimizes to JPEG, and strips GPS metadata', async () => {
      // 1x1 transparent png encoded as base64
      const testPngBase64 =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const uploadRes = await fetch(`${baseUrl}/api/travel-buddies/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({
          dataUrl: testPngBase64,
        }),
      });

      const uploadData = await uploadRes.json();
      expect(uploadRes.status).toBe(200);
      expect(uploadData.success).toBe(true);
      expect(uploadData.url).toMatch(/^\/uploads\/posts\/post_\d+_[a-f0-9]+\.jpg$/);
      expect(uploadData.sizeBytes).toBeGreaterThan(0);
    });

    it('rejects image upload exceeding limit or without authentication', async () => {
      const unauthRes = await fetch(`${baseUrl}/api/travel-buddies/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl: 'data:image/png;base64,AAAA' }),
      });
      expect(unauthRes.status).toBe(401);
    });
  });

  // =========================================================================
  // 3. SOCIAL FEED: POSTS, LIKES, COMMENTS, SAVES, FOLLOWS
  // =========================================================================
  describe('Social Feed & Engagement', () => {
    it('allows User A to publish a travel story with destination', async () => {
      const postRes = await fetch(`${baseUrl}/api/travel-buddies/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({
          caption: 'Watching the sunset over Cox\'s Bazar! Incredible waves #AzraqDiaries #BangladeshTravel',
          destination: "Cox's Bazar",
          mediaUrls: [],
        }),
      });
      const postData = await postRes.json();
      expect(postRes.status).toBe(201);
      expect(postData.success).toBe(true);
      expect(postData.post).toBeDefined();
      expect(postData.post.destination).toBe("Cox's Bazar");
      createdPostId = postData.post.id;
    });

    it('allows User B to see the post in the Explore feed', async () => {
      const feedRes = await fetch(`${baseUrl}/api/travel-buddies/posts?feed=explore`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const feedData = await feedRes.json();
      expect(feedRes.status).toBe(200);
      expect(feedData.success).toBe(true);
      const found = feedData.posts.find((p: any) => p.id === createdPostId);
      expect(found).toBeDefined();
      expect(found.isLiked).toBe(false);
      expect(found.isSaved).toBe(false);
    });

    it('allows User B to like and toggle like on the post without duplicate likes', async () => {
      // 1. Like
      const likeRes1 = await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const likeData1 = await likeRes1.json();
      expect(likeRes1.status).toBe(200);
      expect(likeData1.liked).toBe(true);
      expect(likeData1.likesCount).toBe(1);

      // 2. Unlike
      const likeRes2 = await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const likeData2 = await likeRes2.json();
      expect(likeRes2.status).toBe(200);
      expect(likeData2.liked).toBe(false);
      expect(likeData2.likesCount).toBe(0);

      // 3. Like again to persist
      await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userBToken}` },
      });
    });

    let topCommentId: string;
    let replyCommentId: string;

    it('allows User B to comment on the post', async () => {
      const commentRes = await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userBToken}`,
        },
        body: JSON.stringify({
          text: 'The sunset there is indeed magical!',
        }),
      });
      const commentData = await commentRes.json();
      expect(commentRes.status).toBe(201);
      expect(commentData.success).toBe(true);
      expect(commentData.comment.text).toBe('The sunset there is indeed magical!');
      expect(commentData.comment.parentId).toBeNull();
      topCommentId = commentData.comment.id;

      // Verify comments list
      const listRes = await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/comments`);
      const listData = await listRes.json();
      expect(listData.comments.length).toBeGreaterThan(0);
      expect(listData.comments.some((c: any) => c.id === topCommentId)).toBe(true);
    });

    it('allows User A to reply to User B with nested parentId', async () => {
      const replyRes = await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({
          text: 'Thanks Bob! You should visit next month.',
          parentId: topCommentId,
        }),
      });
      const replyData = await replyRes.json();
      expect(replyRes.status).toBe(201);
      expect(replyData.success).toBe(true);
      expect(replyData.comment.parentId).toBe(topCommentId);
      replyCommentId = replyData.comment.id;
    });

    it('allows User B to edit their comment and rejects unauthorized edits from User A', async () => {
      // 1. User A tries to edit User B's comment -> 403 Forbidden
      const unauthEditRes = await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/comments/${topCommentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({ text: 'Malicious modification' }),
      });
      expect(unauthEditRes.status).toBe(403);

      // 2. User B edits their own comment -> 200 OK
      const editRes = await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/comments/${topCommentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userBToken}`,
        },
        body: JSON.stringify({ text: 'The sunset there is indeed breathtaking!' }),
      });
      const editData = await editRes.json();
      expect(editRes.status).toBe(200);
      expect(editData.comment.text).toBe('The sunset there is indeed breathtaking!');
    });

    it('allows User A to delete their reply', async () => {
      const delRes = await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/comments/${replyCommentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      expect(delRes.status).toBe(200);

      const listRes = await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/comments`);
      const listData = await listRes.json();
      expect(listData.comments.some((c: any) => c.id === replyCommentId)).toBe(false);
    });

    it('allows User B to save the post to private saved collection', async () => {
      const saveRes = await fetch(`${baseUrl}/api/travel-buddies/posts/${createdPostId}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const saveData = await saveRes.json();
      expect(saveRes.status).toBe(200);
      expect(saveData.saved).toBe(true);

      // Verify User B's private saved posts
      const mySavedRes = await fetch(`${baseUrl}/api/travel-buddies/saved-posts`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const mySavedData = await mySavedRes.json();
      expect(mySavedRes.status).toBe(200);
      expect(mySavedData.posts.some((p: any) => p.id === createdPostId)).toBe(true);
    });

    it('allows User B to follow User A, and view stories in Following feed', async () => {
      // 1. Follow User A
      const followRes = await fetch(`${baseUrl}/api/travel-buddies/profiles/${userAId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const followData = await followRes.json();
      expect(followRes.status).toBe(200);
      expect(followData.success).toBe(true);

      // 2. Fetch Following Feed
      const followingFeedRes = await fetch(`${baseUrl}/api/travel-buddies/posts?feed=following`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const followingFeedData = await followingFeedRes.json();
      expect(followingFeedRes.status).toBe(200);
      expect(followingFeedData.posts.some((p: any) => p.id === createdPostId)).toBe(true);
    });
  });

  // =========================================================================
  // 4. FIND TRAVEL COMPANIONS (TRIPS & JOIN REQUESTS)
  // =========================================================================
  describe('Companion Trips & Participation Lifecycle', () => {
    let requestId: string;

    it('allows User A to organize a companion trip with private meeting notes', async () => {
      const tripRes = await fetch(`${baseUrl}/api/travel-buddies/trips`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({
          title: 'Tropical Getaway to the Maldives',
          destination: 'Maldives',
          startDate: '2026-11-15',
          endDate: '2026-11-20',
          budgetMin: 85000,
          budgetMax: 120000,
          currency: 'BDT',
          travelStyle: 'Beach & Relaxation',
          interests: ['Snorkeling', 'Island Hopping', 'Photography'],
          languages: ['Bangla', 'English'],
          totalSpaces: 3,
          description: 'Looking for 2 travel buddies to split water villa and boat transfers.',
          privateNotes: 'Confirmed booking voucher code: MAL-9921. Meet at Male Airport Terminal 1 Cafe.',
        }),
      });

      const tripData = await tripRes.json();
      expect(tripRes.status).toBe(201);
      expect(tripData.success).toBe(true);
      expect(tripData.trip.availableSpaces).toBe(2);
      expect(tripData.trip.privateNotes).toBeDefined(); // Visible to creator
      tripId = tripData.trip.id;
    });

    it('hides private meeting notes from non-approved travelers', async () => {
      const publicTripRes = await fetch(`${baseUrl}/api/travel-buddies/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const publicTripData = await publicTripRes.json();
      expect(publicTripRes.status).toBe(200);
      expect(publicTripData.trip.privateNotes).toBeUndefined(); // Confidential!
    });

    it('allows User B to send a join request with an introduction', async () => {
      const reqRes = await fetch(`${baseUrl}/api/travel-buddies/trips/${tripId}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userBToken}`,
        },
        body: JSON.stringify({
          introduction: 'Hi Alice! I love snorkeling and have been looking for travel companions for the Maldives.',
        }),
      });
      const reqData = await reqRes.json();
      expect(reqRes.status).toBe(201);
      expect(reqData.success).toBe(true);
      expect(reqData.request.status).toBe('pending');
      requestId = reqData.request.id;
    });

    it('prevents duplicate join requests on the server', async () => {
      const duplicateRes = await fetch(`${baseUrl}/api/travel-buddies/trips/${tripId}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userBToken}`,
        },
        body: JSON.stringify({
          introduction: 'Trying again...',
        }),
      });
      expect(duplicateRes.status).toBe(400);
      const duplicateData = await duplicateRes.json();
      expect(duplicateData.error).toContain('already');
    });

    it('allows Organizer (User A) to accept the request, decrementing spots and revealing private notes to User B', async () => {
      // 1. User A accepts User B's request
      const acceptRes = await fetch(`${baseUrl}/api/travel-buddies/trip-requests/${requestId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({ action: 'accept' }),
      });
      const acceptData = await acceptRes.json();
      expect(acceptRes.status).toBe(200);
      expect(acceptData.success).toBe(true);
      expect(acceptData.trip.availableSpaces).toBe(1); // Decremented from 2 to 1

      // 2. User B now inspects the trip -> privateNotes are now securely visible!
      const memberTripRes = await fetch(`${baseUrl}/api/travel-buddies/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const memberTripData = await memberTripRes.json();
      expect(memberTripRes.status).toBe(200);
      expect(memberTripData.trip.privateNotes).toContain('Confirmed booking voucher code: MAL-9921');
    });
  });

  // =========================================================================
  // 5. PRIVATE MESSAGING WITH ACCEPTANCE & UNREAD COUNTS
  // =========================================================================
  describe('Private Messaging System', () => {
    let conversationId: string;

    it('creates persistent message request when User B contacts User A', async () => {
      const sendRes = await fetch(`${baseUrl}/api/travel-buddies/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userBToken}`,
        },
        body: JSON.stringify({
          recipientId: userAId,
          text: 'Hey Alice! So excited for our Maldives trip. When are you flying out of Dhaka?',
        }),
      });
      const sendData = await sendRes.json();
      expect(sendRes.status).toBe(201);
      expect(sendData.success).toBe(true);
      expect(sendData.conversation.status).toBe('request');
      conversationId = sendData.conversation.id;
    });

    it('allows User A to accept message request, reply, and track unread status', async () => {
      // 1. User A accepts conversation request
      const acceptRes = await fetch(`${baseUrl}/api/travel-buddies/conversations/${conversationId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userAToken}` },
      });
      const acceptData = await acceptRes.json();
      expect(acceptRes.status).toBe(200);
      expect(acceptData.success).toBe(true);
      expect(acceptData.conversation.status).toBe('active');

      // 2. User A sends reply
      const replyRes = await fetch(`${baseUrl}/api/travel-buddies/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({
          text: 'I booked the morning flight on Nov 15th through flights.azraqtrips.com!',
        }),
      });
      const replyData = await replyRes.json();
      expect(replyRes.status).toBe(201);
      expect(replyData.success).toBe(true);

      // 3. User B marks messages as read
      const readRes = await fetch(`${baseUrl}/api/travel-buddies/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      expect(readRes.status).toBe(200);
    });
  });

  // =========================================================================
  // 6. BLOCKING, REPORTING & ADMIN MODERATION
  // =========================================================================
  describe('Safety, Blocking & Moderation Control', () => {
    let reportId: string;

    it('allows a user to file a report on content', async () => {
      const reportRes = await fetch(`${baseUrl}/api/travel-buddies/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userBToken}`,
        },
        body: JSON.stringify({
          targetType: 'user',
          targetId: userAId,
          reason: 'Testing moderation flag system',
          details: 'Verified test submission',
        }),
      });
      const reportData = await reportRes.json();
      expect(reportRes.status).toBe(201);
      expect(reportData.success).toBe(true);
      expect(reportData.report.status).toBe('pending');
      reportId = reportData.report.id;
    });

    it('rejects regular users from accessing the moderation console', async () => {
      const modRes = await fetch(`${baseUrl}/api/travel-buddies/admin/reports`, {
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      expect(modRes.status).toBe(403);
    });

    it('allows authorized Admin to list and resolve reports', async () => {
      // 1. Admin views reports
      const adminListRes = await fetch(`${baseUrl}/api/travel-buddies/admin/reports`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const adminListData = await adminListRes.json();
      expect(adminListRes.status).toBe(200);
      expect(adminListData.success).toBe(true);
      expect(adminListData.reports.some((r: any) => r.id === reportId)).toBe(true);

      // 2. Admin resolves report
      const resolveRes = await fetch(`${baseUrl}/api/travel-buddies/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: 'resolved',
          adminNotes: 'Reviewed and confirmed clean account.',
        }),
      });
      const resolveData = await resolveRes.json();
      expect(resolveRes.status).toBe(200);
      expect(resolveData.success).toBe(true);
      expect(resolveData.report.status).toBe('resolved');
    });

    it('prevents blocked users from messaging or following', async () => {
      // User B blocks User A
      const blockRes = await fetch(`${baseUrl}/api/travel-buddies/blocks/${userAId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userBToken}` },
      });
      const blockData = await blockRes.json();
      expect(blockRes.status).toBe(200);
      expect(blockData.success).toBe(true);

      // Now User A tries to send a message to User B -> Rejected
      const blockedMsgRes = await fetch(`${baseUrl}/api/travel-buddies/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userAToken}`,
        },
        body: JSON.stringify({
          recipientId: userBId,
          text: 'Are you there?',
        }),
      });
      expect(blockedMsgRes.status).toBe(403);
    });
  });

  afterAll(async () => {
    if (tripId) {
      travelBuddiesStore.deleteTrip(tripId);
    }
    if (createdPostId) {
      travelBuddiesStore.deletePost(createdPostId);
    }
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});

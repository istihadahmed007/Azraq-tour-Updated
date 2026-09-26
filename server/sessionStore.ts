import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserSession {
  token: string;
  userId: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: number; // Unix timestamp in ms
  revoked: boolean;
}

// Resolve data directory: environment override or local fallback
const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp' : process.cwd());
const SESSIONS_FILE = path.join(DATA_DIR, '.sessions_db.json');

class SessionStore {
  private sessions = new Map<string, UserSession>();

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const now = Date.now();
          for (const s of parsed) {
            if (s && s.token && s.expiresAt > now && !s.revoked) {
              this.sessions.set(s.token, s);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[SessionStore] Could not load sessions from disk:', e);
    }
  }

  public saveToDisk() {
    try {
      const arr = Array.from(this.sessions.values()).filter((s) => s.expiresAt > Date.now());
      // Atomic write via temp file
      const tmpFile = `${SESSIONS_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(arr, null, 2), 'utf-8');
      fs.renameSync(tmpFile, SESSIONS_FILE);
    } catch (e) {
      try {
        const arr = Array.from(this.sessions.values()).filter((s) => s.expiresAt > Date.now());
        fs.writeFileSync(SESSIONS_FILE, JSON.stringify(arr, null, 2), 'utf-8');
      } catch (err) {
        console.warn('[SessionStore] Could not save sessions to disk:', err);
      }
    }
  }

  /**
   * Issues a cryptographically secure, unpredictable 256-bit random session token.
   */
  public createSession(
    userId: string,
    email: string,
    role: string,
    durationMs: number = 7 * 24 * 60 * 60 * 1000 // 7 days
  ): string {
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    const session: UserSession = {
      token,
      userId,
      email: email.toLowerCase().trim(),
      role,
      createdAt: new Date().toISOString(),
      expiresAt: now + durationMs,
      revoked: false,
    };
    this.sessions.set(token, session);
    this.saveToDisk();
    return token;
  }

  /**
   * Retrieves and verifies an active, unexpired, unrevoked session.
   */
  public getSession(token: string): UserSession | null {
    if (!token || typeof token !== 'string') return null;
    const session = this.sessions.get(token);
    if (!session) return null;

    if (session.revoked || Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      this.saveToDisk();
      return null;
    }
    return session;
  }

  /**
   * Explicitly revokes a single session token (logout).
   */
  public revokeSession(token: string): boolean {
    if (!token) return false;
    const session = this.sessions.get(token);
    if (session) {
      session.revoked = true;
      this.sessions.delete(token);
      this.saveToDisk();
      return true;
    }
    return false;
  }

  /**
   * Revokes all active sessions for a user (password change, suspension).
   */
  public revokeAllUserSessions(userIdOrEmail: string): void {
    if (!userIdOrEmail) return;
    const target = userIdOrEmail.toLowerCase().trim();
    let changed = false;
    for (const [token, s] of this.sessions.entries()) {
      if (s.userId.toLowerCase() === target || s.email === target) {
        s.revoked = true;
        this.sessions.delete(token);
        changed = true;
      }
    }
    if (changed) {
      this.saveToDisk();
    }
  }

  /**
   * Returns active sessions count for telemetry/admin diagnostics.
   */
  public getActiveCount(): number {
    return this.sessions.size;
  }
}

export const sessionStore = new SessionStore();

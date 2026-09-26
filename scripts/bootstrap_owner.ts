/**
 * Azraq Trips - Secure Owner Bootstrap & Recovery Utility
 * Initializes or rotates owner/admin credentials without hard-coded passwords.
 *
 * Usage:
 *   npx tsx scripts/bootstrap_owner.ts --email <admin_email> --password <new_password>
 * Or with environment variables:
 *   ADMIN_EMAIL=... ADMIN_INITIAL_PASSWORD=... npx tsx scripts/bootstrap_owner.ts
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp' : process.cwd());
const DB_FILE = path.join(DATA_DIR, '.users_db.json');

function hashPassword(password: string, existingSalt?: string): { hash: string; salt: string } {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function bootstrapOwner(emailArg?: string, passwordArg?: string) {
  const email = (
    emailArg ||
    process.env.ADMIN_EMAIL ||
    'info@azraqtrips.com'
  ).trim().toLowerCase();

  const password = (
    passwordArg ||
    process.env.ADMIN_INITIAL_PASSWORD
  );

  if (!password || password.length < 8) {
    console.error('[Bootstrap] Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  let users: Record<string, any> = {};
  if (fs.existsSync(DB_FILE)) {
    try {
      users = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (err) {
      console.error('[Bootstrap] Failed to parse users DB:', err);
    }
  }

  const { hash, salt } = hashPassword(password);
  const now = new Date().toISOString();

  let existing = users[email];
  if (existing) {
    existing.passwordHash = hash;
    existing.passwordSalt = salt;
    existing.isAdmin = true;
    existing.role = 'admin';
    existing.needsPasswordRotation = false;
    existing.updatedAt = now;
    console.log(`[Bootstrap] Updated existing administrator account: ${email}`);
  } else {
    existing = {
      uid: `admin_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      fullName: 'Azraq System Administrator',
      email,
      phone: '+880 1851-172032',
      country: 'Bangladesh',
      passwordHash: hash,
      passwordSalt: salt,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      bio: 'Managing Director & Platform Owner at Azraq Trips.',
      languages: ['Bengali', 'English', 'Arabic'],
      emailVerified: true,
      phoneVerified: true,
      provider: 'email',
      createdAt: now,
      updatedAt: now,
      homeLocation: 'Dhaka, Bangladesh',
      travelPreferences: ['Culture', 'Nature', 'Luxury'],
      isProfileComplete: true,
      isAdmin: true,
      role: 'admin',
      needsPasswordRotation: false,
    };
    users[email] = existing;
    console.log(`[Bootstrap] Created new verified administrator account: ${email}`);
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
  console.log('[Bootstrap] Credentials securely saved to database. Admin role activated.');
}

if (process.argv[1]?.includes('bootstrap_owner.ts')) {
  const args = process.argv.slice(2);
  let email = '';
  let password = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      email = args[i + 1];
    }
    if (args[i] === '--password' && args[i + 1]) {
      password = args[i + 1];
    }
  }

  bootstrapOwner(email, password);
}

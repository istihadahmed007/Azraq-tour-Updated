/**
 * Azraq Trips - Database Backup & Migration Utility
 * Dumps all JSON-backed tables into durable, timestamped backup archives.
 * Can be run via: `npx tsx scripts/backup_db.ts [--backup | --restore <path>]`
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = process.env.DATA_DIR || (process.env.VERCEL ? '/tmp' : process.cwd());
const BACKUPS_DIR = path.join(process.cwd(), 'data', 'backups');

const DB_FILES = [
  '.users_db.json',
  '.requests_db.json',
  '.quotes_db.json',
  '.notifications_db.json',
  '.user_activities_db.json',
  '.system_announcements_db.json',
  '.blog_posts_db.json',
  '.travel_buddies_db.json',
  '.sessions_db.json',
  '.payments_db.json',
];

export function createDatabaseBackup(): string {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `azraq_backup_${timestamp}.json`;
  const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

  const archive: Record<string, any> = {
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    tables: {},
  };

  for (const file of DB_FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        archive.tables[file] = JSON.parse(content);
      } catch (err) {
        console.warn(`[Backup] Warning reading ${file}:`, err);
      }
    } else {
      archive.tables[file] = null;
    }
  }

  fs.writeFileSync(backupFilePath, JSON.stringify(archive, null, 2), 'utf-8');
  console.log(`[Backup] Database archive created successfully at: ${backupFilePath}`);
  return backupFilePath;
}

export function restoreDatabaseBackup(backupFilePath: string): boolean {
  if (!fs.existsSync(backupFilePath)) {
    console.error(`[Restore] Error: Backup file not found at ${backupFilePath}`);
    return false;
  }

  try {
    const raw = fs.readFileSync(backupFilePath, 'utf-8');
    const archive = JSON.parse(raw);

    if (!archive || !archive.tables) {
      console.error('[Restore] Invalid backup archive structure.');
      return false;
    }

    for (const [filename, data] of Object.entries(archive.tables)) {
      if (data !== null) {
        const targetPath = path.join(DATA_DIR, filename);
        fs.writeFileSync(targetPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`[Restore] Restored ${filename}`);
      }
    }
    console.log('[Restore] Database restore completed successfully.');
    return true;
  } catch (err) {
    console.error('[Restore] Error restoring backup:', err);
    return false;
  }
}

// CLI Execution
if (process.argv[1]?.includes('backup_db.ts')) {
  const args = process.argv.slice(2);
  if (args.includes('--restore') && args[args.indexOf('--restore') + 1]) {
    const restorePath = args[args.indexOf('--restore') + 1];
    restoreDatabaseBackup(restorePath);
  } else {
    createDatabaseBackup();
  }
}

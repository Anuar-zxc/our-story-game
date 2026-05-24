import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

export type DbUser = {
  id: string;
  email: string;
  name: string;
  partner_name: string | null;
  zodiac: string | null;
  partner_zodiac: string | null;
  anniversary: string | null;
  love_language: string | null;
  relationship_note: string | null;
  image: string | null;
  provider: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
};

const dbDir = path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "after-us.sqlite");

type GlobalWithDb = typeof globalThis & {
  __afterUsDb?: Database.Database;
};

function createDb() {
  fs.mkdirSync(dbDir, { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      partner_name TEXT,
      zodiac TEXT,
      partner_zodiac TEXT,
      anniversary TEXT,
      love_language TEXT,
      relationship_note TEXT,
      image TEXT,
      provider TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS distance_rooms (
      code TEXT PRIMARY KEY,
      player1_name TEXT NOT NULL,
      player2_name TEXT NOT NULL,
      stage TEXT NOT NULL,
      language TEXT NOT NULL,
      questions TEXT NOT NULL,
      p1_answers TEXT,
      p2_answers TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
  const existing = new Set(columns.map((column) => column.name));
  for (const [name, type] of [
    ["partner_name", "TEXT"],
    ["zodiac", "TEXT"],
    ["partner_zodiac", "TEXT"],
    ["anniversary", "TEXT"],
    ["love_language", "TEXT"],
    ["relationship_note", "TEXT"],
  ] as const) {
    if (!existing.has(name)) {
      db.exec(`ALTER TABLE users ADD COLUMN ${name} ${type}`);
    }
  }
  return db;
}

export function getDb() {
  const globalForDb = globalThis as GlobalWithDb;
  if (!globalForDb.__afterUsDb) {
    globalForDb.__afterUsDb = createDb();
  }
  return globalForDb.__afterUsDb;
}

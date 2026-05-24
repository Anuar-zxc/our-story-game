import crypto from "node:crypto";
import { cookies } from "next/headers";
import { getDb, type DbUser } from "@/lib/db";

export const sessionCookieName = "after_us_session";
export const stateCookieName = "after_us_google_state";

type GoogleProfile = {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
};

export type EmailProfileInput = {
  email: string;
  name: string;
  partnerName: string;
  zodiac: string;
  partnerZodiac: string;
  anniversary?: string;
  loveLanguage?: string;
  relationshipNote?: string;
};

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createState() {
  return crypto.randomBytes(24).toString("base64url");
}

export function createSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function upsertGoogleUser(profile: GoogleProfile) {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(profile.email) as DbUser | undefined;

  if (existing) {
    db.prepare(`
      UPDATE users
      SET name = ?, image = ?, provider = 'google', provider_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(profile.name ?? existing.name, profile.picture ?? existing.image, profile.sub, existing.id);
    return db.prepare("SELECT * FROM users WHERE id = ?").get(existing.id) as DbUser;
  }

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO users (id, email, name, image, provider, provider_id)
    VALUES (?, ?, ?, ?, 'google', ?)
  `).run(id, profile.email, profile.name ?? profile.email.split("@")[0], profile.picture ?? null, profile.sub);

  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as DbUser;
}

export function upsertEmailUser(input: EmailProfileInput) {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as DbUser | undefined;

  if (existing) {
    db.prepare(`
      UPDATE users
      SET name = ?, partner_name = ?, zodiac = ?, partner_zodiac = ?, anniversary = ?,
          love_language = ?, relationship_note = ?, provider = 'email', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      input.name.trim(),
      input.partnerName.trim(),
      input.zodiac,
      input.partnerZodiac,
      input.anniversary || null,
      input.loveLanguage || null,
      input.relationshipNote || null,
      existing.id
    );
    return db.prepare("SELECT * FROM users WHERE id = ?").get(existing.id) as DbUser;
  }

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO users (
      id, email, name, partner_name, zodiac, partner_zodiac, anniversary,
      love_language, relationship_note, image, provider, provider_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'email', ?)
  `).run(
    id,
    email,
    input.name.trim(),
    input.partnerName.trim(),
    input.zodiac,
    input.partnerZodiac,
    input.anniversary || null,
    input.loveLanguage || null,
    input.relationshipNote || null,
    email
  );

  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as DbUser;
}

export function createDbSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  getDb()
    .prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)")
    .run(crypto.randomUUID(), userId, hashToken(token), expiresAt.toISOString());
  return { token, expiresAt };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) return null;

  const row = getDb()
    .prepare(`
      SELECT users.*
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?
      LIMIT 1
    `)
    .get(hashToken(token), new Date().toISOString()) as DbUser | undefined;

  return row ?? null;
}

export async function clearCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
  }
}

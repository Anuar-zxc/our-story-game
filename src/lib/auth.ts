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
  password?: string;
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

export function createVerificationCode() {
  return String(crypto.randomInt(100000, 1000000));
}

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("base64url")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("base64url");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("base64url");
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(hash));
}

export function saveVerificationCode(email: string, code: string) {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString();
  getDb()
    .prepare(`
      INSERT INTO email_verification_codes (email, code_hash, expires_at, attempts)
      VALUES (?, ?, ?, 0)
      ON CONFLICT(email) DO UPDATE SET
        code_hash = excluded.code_hash,
        expires_at = excluded.expires_at,
        attempts = 0,
        created_at = CURRENT_TIMESTAMP
    `)
    .run(email, hashToken(code), expiresAt);
}

export function verifyEmailCode(email: string, code: string) {
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM email_verification_codes WHERE email = ?")
    .get(email) as { code_hash: string; expires_at: string; attempts: number } | undefined;

  if (!row || row.expires_at < new Date().toISOString() || row.attempts >= 5) return false;

  const ok = row.code_hash === hashToken(code);
  if (!ok) {
    db.prepare("UPDATE email_verification_codes SET attempts = attempts + 1 WHERE email = ?").run(email);
    return false;
  }

  db.prepare("DELETE FROM email_verification_codes WHERE email = ?").run(email);
  return true;
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
  const passwordHash = input.password ? hashPassword(input.password) : existing?.password_hash ?? null;

  if (existing) {
    db.prepare(`
      UPDATE users
      SET name = ?, partner_name = ?, zodiac = ?, partner_zodiac = ?, anniversary = ?,
          love_language = ?, relationship_note = ?, password_hash = ?, email_verified = 1,
          provider = 'email', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      input.name.trim(),
      input.partnerName.trim(),
      input.zodiac,
      input.partnerZodiac,
      input.anniversary || null,
      input.loveLanguage || null,
      input.relationshipNote || null,
      passwordHash,
      existing.id
    );
    return db.prepare("SELECT * FROM users WHERE id = ?").get(existing.id) as DbUser;
  }

  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO users (
      id, email, name, partner_name, zodiac, partner_zodiac, anniversary,
      love_language, relationship_note, image, password_hash, email_verified, provider, provider_id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 1, 'email', ?)
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
    passwordHash,
    email
  );

  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as DbUser;
}

export function getUserByEmail(email: string) {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase()) as DbUser | undefined;
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

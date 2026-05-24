import { NextResponse } from "next/server";
import { createDbSession, sessionCookieName, upsertEmailUser } from "@/lib/auth";

const zodiacs = new Set([
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
]);

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim();
  const partnerName = String(body.partnerName ?? "").trim();
  const zodiac = String(body.zodiac ?? "").trim();
  const partnerZodiac = String(body.partnerZodiac ?? "").trim();

  if (!email.includes("@") || name.length < 2 || partnerName.length < 2 || !zodiacs.has(zodiac) || !zodiacs.has(partnerZodiac)) {
    return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
  }

  const user = upsertEmailUser({
    email,
    name,
    partnerName,
    zodiac,
    partnerZodiac,
    anniversary: String(body.anniversary ?? "").trim(),
    loveLanguage: String(body.loveLanguage ?? "").trim(),
    relationshipNote: String(body.relationshipNote ?? "").trim(),
  });

  const { token, expiresAt } = createDbSession(user.id);
  const response = NextResponse.json({ user });
  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });

  return response;
}

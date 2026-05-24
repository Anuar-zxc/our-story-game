import { NextResponse } from "next/server";
import {
  createDbSession,
  createVerificationCode,
  getCurrentUser,
  getUserByEmail,
  saveVerificationCode,
  sessionCookieName,
  upsertEmailUser,
  verifyEmailCode,
  verifyPassword,
} from "@/lib/auth";
import { sendVerificationCode } from "@/lib/email";

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
  const mode = String(body.mode ?? "register").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "").trim();
  const partnerName = String(body.partnerName ?? "").trim();
  const zodiac = String(body.zodiac ?? "").trim();
  const partnerZodiac = String(body.partnerZodiac ?? "").trim();
  const language = String(body.language ?? "ru");

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (mode === "login") {
    const user = getUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
    }
    return createSessionResponse(user);
  }

  if (mode === "request_code") {
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const code = createVerificationCode();
    saveVerificationCode(email, code);
    const result = await sendVerificationCode(email, code, language);
    return NextResponse.json({
      sent: result.sent,
      message: result.sent ? "Verification code sent" : "Email transport is not configured",
      devCode: !result.sent && process.env.NODE_ENV !== "production" ? code : undefined,
    });
  }

  const isUpdate = mode === "update";
  const code = String(body.code ?? "").trim();
  if (!isUpdate && !verifyEmailCode(email, code)) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  if (isUpdate && !(await getCurrentUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isUpdate && password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  if (name.length < 2 || partnerName.length < 2 || !zodiacs.has(zodiac) || !zodiacs.has(partnerZodiac)) {
    return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
  }

  const user = upsertEmailUser({
    email,
    name,
    password: isUpdate ? undefined : password,
    partnerName,
    zodiac,
    partnerZodiac,
    anniversary: String(body.anniversary ?? "").trim(),
    loveLanguage: String(body.loveLanguage ?? "").trim(),
    relationshipNote: String(body.relationshipNote ?? "").trim(),
  });

  return createSessionResponse(user);
}

function createSessionResponse(user: ReturnType<typeof upsertEmailUser>) {
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

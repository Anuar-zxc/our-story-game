import { NextResponse } from "next/server";
import { clearCurrentSession, sessionCookieName } from "@/lib/auth";

export async function POST() {
  await clearCurrentSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(sessionCookieName);
  return response;
}

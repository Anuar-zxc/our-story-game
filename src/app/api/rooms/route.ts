import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Answers = {
  q1: string;
  q2: string;
  q3: string;
};

function createRoomCode() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

function parseAnswers(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const answers = value as Partial<Answers>;
  if (!answers.q1 || !answers.q2 || !answers.q3) return null;
  return {
    q1: String(answers.q1),
    q2: String(answers.q2),
    q3: String(answers.q3),
  };
}

function publicRoom(row: Record<string, unknown>) {
  const bothDone = Boolean(row.p1_answers && row.p2_answers);
  return {
    code: row.code,
    player1Name: row.player1_name,
    player2Name: row.player2_name,
    stage: row.stage,
    language: row.language,
    questions: JSON.parse(String(row.questions)),
    p1Done: Boolean(row.p1_answers),
    p2Done: Boolean(row.p2_answers),
    p1Answers: bothDone ? JSON.parse(String(row.p1_answers)) : null,
    p2Answers: bothDone ? JSON.parse(String(row.p2_answers)) : null,
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const player1Name = String(body.player1Name ?? "").trim();
  const player2Name = String(body.player2Name ?? "").trim();
  const stage = String(body.stage ?? "long_distance");
  const language = String(body.language ?? "ru");
  const questions = Array.isArray(body.questions) ? body.questions.slice(0, 3).map(String) : [];

  if (!player1Name || !player2Name || questions.length !== 3) {
    return NextResponse.json({ error: "Missing room data" }, { status: 400 });
  }

  const db = getDb();
  let code = createRoomCode();
  while (db.prepare("SELECT code FROM distance_rooms WHERE code = ?").get(code)) {
    code = createRoomCode();
  }

  db.prepare(`
    INSERT INTO distance_rooms (code, player1_name, player2_name, stage, language, questions)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(code, player1Name, player2Name, stage, language, JSON.stringify(questions));

  const row = db.prepare("SELECT * FROM distance_rooms WHERE code = ?").get(code) as Record<string, unknown>;
  return NextResponse.json({ room: publicRoom(row) });
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code")?.toUpperCase();
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const row = getDb().prepare("SELECT * FROM distance_rooms WHERE code = ?").get(code) as Record<string, unknown> | undefined;
  if (!row) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  return NextResponse.json({ room: publicRoom(row) });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const code = String(body.code ?? "").trim().toUpperCase();
  const player = Number(body.player);
  const answers = parseAnswers(body.answers);

  if (!code || !answers || (player !== 1 && player !== 2)) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const column = player === 1 ? "p1_answers" : "p2_answers";
  const db = getDb();
  db.prepare(`
    UPDATE distance_rooms
    SET ${column} = ?, updated_at = CURRENT_TIMESTAMP
    WHERE code = ?
  `).run(JSON.stringify(answers), code);

  const row = db.prepare("SELECT * FROM distance_rooms WHERE code = ?").get(code) as Record<string, unknown> | undefined;
  if (!row) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  return NextResponse.json({ room: publicRoom(row) });
}

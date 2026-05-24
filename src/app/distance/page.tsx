"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Copy, RefreshCw, Send, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/Button";
import { useGameStore, useTranslation, type PlayerAnswers } from "@/store/gameStore";

type Room = {
  code: string;
  player1Name: string;
  player2Name: string;
  questions: string[];
  p1Done: boolean;
  p2Done: boolean;
  p1Answers: PlayerAnswers | null;
  p2Answers: PlayerAnswers | null;
};

type AccountUser = {
  id: string;
  email: string;
  name: string;
  partner_name: string | null;
};

function DistanceContent() {
  const params = useSearchParams();
  const roomCode = params.get("room")?.toUpperCase() ?? "";
  const playerParam = Number(params.get("player"));
  const player = playerParam === 2 ? 2 : 1;
  const { language } = useTranslation();
  const isRu = language === "ru";
  const {
    player1Name,
    player2Name,
    relationshipStage,
    questionTone,
    setP1Answers,
    setP2Answers,
    setPhase,
  } = useGameStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [answers, setAnswers] = useState<PlayerAnswers>({ q1: "", q2: "", q3: "" });
  const [loading, setLoading] = useState(Boolean(roomCode));
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountUser | null>(null);

  const baseUrl = typeof window === "undefined" ? "" : window.location.origin;
  const links = useMemo(() => {
    if (!room) return null;
    return {
      p1: `${baseUrl}/distance?room=${room.code}&player=1`,
      p2: `${baseUrl}/distance?room=${room.code}&player=2`,
    };
  }, [baseUrl, room]);

  const fetchRoom = async (code = roomCode) => {
    if (!code) return;
    setLoading(true);
    const res = await fetch(`/api/rooms?code=${code}`);
    const data = await res.json();
    setRoom(data.room ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setAccount(data.user);
          if (!player1Name && data.user.name && data.user.partner_name) {
            useGameStore.getState().setPlayers(data.user.name, data.user.partner_name);
          }
        }
      })
      .catch(() => {});
    const timer = window.setTimeout(() => {
      fetchRoom();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomCode]);

  const createRoom = async () => {
    if (!account) return;
    if (!player1Name || !player2Name) return;
    setCreating(true);
    const qRes = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "questions", stage: relationshipStage, language, tone: questionTone }),
    });
    const qData = await qRes.json();
    const questions = Array.isArray(qData.questions) ? qData.questions.slice(0, 3) : [];
    const roomRes = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        player1Name,
        player2Name,
        stage: relationshipStage,
        language,
        questions,
      }),
    });
    const data = await roomRes.json();
    setRoom(data.room ?? null);
    setCreating(false);
  };

  const copy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  };

  const submit = async () => {
    if (!room) return;
    const res = await fetch("/api/rooms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: room.code, player, answers }),
    });
    const data = await res.json();
    setRoom(data.room ?? room);
  };

  const openResult = () => {
    if (!room?.p1Answers || !room.p2Answers) return;
    setP1Answers(room.p1Answers);
    setP2Answers(room.p2Answers);
    setPhase("game");
    window.location.href = "/game";
  };

  const currentName = player === 1 ? room?.player1Name : room?.player2Name;
  const alreadyDone = player === 1 ? room?.p1Done : room?.p2Done;

  return (
    <PageShell denseStickers className="flex items-center">
      <section className="mx-auto grid w-full max-w-5xl gap-6">
        <div className="rounded-[32px] border border-white/55 bg-[#fff8e8]/82 p-6 shadow-[0_24px_80px_rgba(76,44,10,0.16)] backdrop-blur-xl md:p-9">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#9a5a42]">
            {isRu ? "режим на расстоянии" : "long-distance mode"}
          </p>
          <h1 className="font-serif text-5xl font-bold text-[#2c2010] md:text-7xl">
            {isRu ? "Играйте каждый со своего телефона." : "Play from two phones."}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5e412b]">
            {isRu
              ? "Создайте комнату, отправьте ссылку второй половинке и отвечайте отдельно. Когда оба закончат, откроется общий результат."
              : "Create a room, send the link to your person, and answer separately. When both finish, open the shared result."}
          </p>
          <p className="mt-3 max-w-2xl text-sm font-semibold text-[#8b5043]">
            {isRu
              ? "Ответы скрыты до тех пор, пока оба игрока не отправят свои."
              : "Answers stay hidden until both players submit."}
          </p>
        </div>

        {!roomCode && !room ? (
          <div className="rounded-[32px] border border-white/55 bg-white/72 p-6 text-center shadow-[0_24px_80px_rgba(76,44,10,0.14)] backdrop-blur-xl">
            {account ? (
              <Button onClick={createRoom} disabled={creating || !player1Name || !player2Name} className="min-w-72 disabled:opacity-50">
                {creating ? (isRu ? "Создаем..." : "Creating...") : isRu ? "Создать комнату" : "Create room"}
              </Button>
            ) : (
              <Link href="/auth" className="inline-flex min-w-72 items-center justify-center rounded-full bg-[#2c2010] px-6 py-4 font-handwriting text-2xl text-white shadow-lg">
                {isRu ? "Создать профиль для игры на расстоянии" : "Create profile for long-distance play"}
              </Link>
            )}
            {(!player1Name || !player2Name) && (
              <p className="mt-4 text-sm text-[#6f5136]">
                {isRu ? "Сначала заполните имена на странице пары." : "Add both names on the setup page first."}
              </p>
            )}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-[32px] bg-white/70 p-8 text-center font-handwriting text-3xl text-[#6f5136]">
            {isRu ? "Загружаем комнату..." : "Loading room..."}
          </div>
        ) : null}

        {room && links && !roomCode ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[
              [room.player1Name, links.p1, "p1"],
              [room.player2Name, links.p2, "p2"],
            ].map(([name, link, key]) => (
              <div key={key} className="rounded-[28px] border border-white/55 bg-white/72 p-5 shadow-sm backdrop-blur-xl">
                <div className="mb-3 flex items-center gap-2 font-serif text-2xl font-bold text-[#2c2010]">
                  <Share2 size={20} />
                  {name}
                </div>
                <p className="break-all rounded-2xl bg-[#fff8e8] p-3 text-sm text-[#6f5136]">{link}</p>
                <button
                  onClick={() => copy(String(link), String(key))}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2c2010] px-4 py-2 font-semibold text-white"
                >
                  <Copy size={16} />
                  {copied === key ? (isRu ? "Скопировано" : "Copied") : isRu ? "Скопировать" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {room && roomCode ? (
          <div className="rounded-[32px] border border-white/55 bg-[#fffdf6]/90 p-6 shadow-[0_24px_80px_rgba(76,44,10,0.16)] backdrop-blur-xl md:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a5a42]">{room.code}</p>
                <h2 className="font-serif text-4xl font-bold text-[#2c2010]">
                  {isRu ? `Отвечает ${currentName}` : `${currentName}'s answers`}
                </h2>
              </div>
              <button onClick={() => fetchRoom()} className="inline-flex items-center gap-2 rounded-full border border-[#2c2010]/15 px-4 py-2 font-semibold text-[#2c2010]">
                <RefreshCw size={16} />
                {isRu ? "Обновить" : "Refresh"}
              </button>
            </div>

            {alreadyDone ? (
              <div className="rounded-[24px] bg-[#f3d8cc] p-5 text-[#2c2010]">
                <Check className="mb-2" />
                {isRu ? "Твои ответы сохранены. Ждем второго игрока." : "Your answers are saved. Waiting for the other player."}
              </div>
            ) : (
              <div className="space-y-5">
                {room.questions.map((question, i) => (
                  <label key={question} className="block space-y-2">
                    <span className="font-serif text-lg italic text-[#2c2010]">{question}</span>
                    <textarea
                      value={answers[`q${i + 1}` as keyof PlayerAnswers]}
                      onChange={(e) => setAnswers({ ...answers, [`q${i + 1}`]: e.target.value })}
                      className="min-h-28 w-full resize-none rounded-2xl border border-[#2c2010]/10 bg-[#2c2010]/5 p-4 font-handwriting text-2xl outline-none focus:border-[#2c2010]/30"
                    />
                  </label>
                ))}
                <Button onClick={submit} disabled={!answers.q1 || !answers.q2 || !answers.q3} className="w-full disabled:opacity-50">
                  <span className="inline-flex items-center gap-2">
                    <Send size={18} />
                    {isRu ? "Отправить ответы" : "Send answers"}
                  </span>
                </Button>
              </div>
            )}

            <div className="mt-6 grid gap-3 rounded-[24px] bg-white/60 p-4 sm:grid-cols-3">
              <div>{room.player1Name}: {room.p1Done ? "✓" : "..."}</div>
              <div>{room.player2Name}: {room.p2Done ? "✓" : "..."}</div>
              <motion.button
                whileHover={room.p1Done && room.p2Done ? { scale: 1.02 } : {}}
                onClick={openResult}
                disabled={!room.p1Done || !room.p2Done}
                className="rounded-full bg-[#2c2010] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isRu ? "Открыть результат" : "Open result"}
              </motion.button>
            </div>
          </div>
        ) : null}

        <Link href="/setup" className="mx-auto text-sm font-semibold text-[#6f5136] hover:text-[#2c2010]">
          {isRu ? "Вернуться к настройке пары" : "Back to setup"}
        </Link>
      </section>
    </PageShell>
  );
}

export default function DistancePage() {
  return (
    <Suspense fallback={null}>
      <DistanceContent />
    </Suspense>
  );
}

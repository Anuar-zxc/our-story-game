"use client";

import { useTranslation, useGameStore, type RevealData } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { PaperCard } from "@/components/ui/PaperCard";
import { PageShell } from "@/components/PageShell";
import { useMounted } from "@/lib/useMounted";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, HeartHandshake, Sparkles, Split, Target } from "lucide-react";

export default function GamePage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const {
    p1Answers,
    p2Answers,
    relationshipStage,
    player1Name,
    player2Name,
    setPhase,
    setLastReveal,
    addChapter,
  } = useGameStore();

  const mounted = useMounted();
  const [loading, setLoading] = useState(true);
  const [revealStep, setRevealStep] = useState(0);
  const [revealData, setRevealData] = useState<RevealData | null>(null);
  const isRu = language === "ru";

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "insight",
            p1Answers,
            p2Answers,
            stage: relationshipStage,
            language,
            p1Name: player1Name,
            p2Name: player2Name,
          }),
        });
        const data = (await res.json()) as RevealData;
        setRevealData(data);
        setLastReveal(data);
        addChapter({
          stage: relationshipStage,
          player1Name,
          player2Name,
          reveal: data,
        });
      } catch (err) {
        console.error(err);
        const fallback = {
          similarity: 72,
          insight: isRu
            ? "Вы смотрите на одно и то же с разных сторон. Именно эта разница делает вас живыми."
            : "You look at the same thing from different sides. That difference is what makes you alive.",
          sharedTheme: isRu ? "Вы оба хотите быть услышанными без защиты." : "You both want to be heard without armor.",
          difference: isRu ? "Один отвечает через действие, другой через чувство." : "One answers through action, the other through feeling.",
          hiddenPattern: isRu ? "Между строк есть просьба: заметь меня." : "Between the lines is a request: notice me.",
          nextTask: isRu ? "Отправьте друг другу одно честное голосовое на 30 секунд." : "Send each other one honest 30-second voice note.",
        };
        setRevealData(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    setPhase("factory");
    router.push("/factory");
  };

  if (!mounted) return null;

  const cards = revealData
    ? [
        {
          icon: HeartHandshake,
          label: isRu ? "Что совпало" : "What matched",
          text: revealData.sharedTheme,
        },
        {
          icon: Split,
          label: isRu ? "Где вы разные" : "Where you differ",
          text: revealData.difference,
        },
        {
          icon: Eye,
          label: isRu ? "Между строк" : "Between the lines",
          text: revealData.hiddenPattern,
        },
      ]
    : [];

  return (
    <PageShell denseStickers className="flex items-center">
      <PaperCard withTape className="space-y-8 z-10 w-full max-w-5xl rounded-[34px] bg-[#fffdf6]/92 p-6 text-center shadow-[0_24px_80px_rgba(76,44,10,0.18)] md:p-10">
        {loading || !revealData ? (
          <div className="space-y-6 py-14">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-14 h-14 border-4 border-[var(--color-accent-pink)] border-t-[var(--color-accent-red)] rounded-full mx-auto"
            />
            <p className="font-handwriting text-2xl text-[var(--color-ink-light)] animate-pulse">
              {isRu ? "Сравниваем ответы..." : "Comparing your answers..."}
            </p>
            <p className="font-serif italic text-sm text-[var(--color-ink)]/40">
              {isRu ? "DeepSeek ищет совпадения, различия и скрытую тему." : "DeepSeek is finding matches, differences, and the hidden theme."}
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9a5a42]">
                {isRu ? "момент раскрытия" : "reveal moment"}
              </p>
              <h1 className="font-serif text-5xl font-bold text-[#2c2010] md:text-7xl">
                {isRu ? "Вот что между вами." : "Here is what lives between you."}
              </h1>
            </div>

            <div className="mx-auto max-w-xl rounded-[32px] bg-[#2c2010] p-7 text-white shadow-[0_20px_50px_rgba(44,32,16,0.25)]">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="font-serif text-8xl font-bold"
              >
                {revealData.similarity}%
              </motion.div>
              <p className="mt-2 font-handwriting text-3xl">{t.game.similarity}</p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mx-auto max-w-3xl px-4 py-3"
            >
              <p className="font-serif italic text-2xl leading-relaxed text-[var(--color-ink)]">
                {revealData.insight}
              </p>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-3">
              {cards.slice(0, revealStep + 1).map(({ icon: Icon, label, text }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[28px] border border-[#2c2010]/8 bg-white/72 p-5 text-left shadow-sm"
                >
                  <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-[#f3d8cc] text-[#8b5043]">
                    <Icon size={20} />
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#2c2010]">{label}</h2>
                  <p className="mt-2 leading-7 text-[#6f5136]">{text}</p>
                </motion.div>
              ))}
            </div>

            {revealStep < 2 ? (
              <Button onClick={() => setRevealStep((step) => step + 1)}>
                {isRu ? "Раскрыть дальше" : "Reveal more"}
              </Button>
            ) : (
              <div className="mx-auto max-w-3xl rounded-[30px] border border-[#c9605a]/20 bg-[#fff1e8] p-6 text-left">
                <div className="mb-3 flex items-center gap-3 text-[#8b5043]">
                  <Target size={22} />
                  <h2 className="font-serif text-3xl font-bold">{isRu ? "Задание на сегодня" : "Today's task"}</h2>
                </div>
                <p className="font-handwriting text-3xl leading-tight text-[#2c2010]">{revealData.nextTask}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={handleNext}>
                    <span className="inline-flex items-center gap-2">
                      <Sparkles size={18} />
                      {isRu ? "Перейти к общим вкусам" : "Go to shared flavors"}
                    </span>
                  </Button>
                  <button
                    onClick={() => router.push("/summary")}
                    className="rounded-full border-2 border-[#2c2010]/20 px-5 py-3 font-semibold text-[#2c2010] transition hover:bg-white"
                  >
                    {isRu ? "Посмотреть главу" : "View chapter"}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </PaperCard>
    </PageShell>
  );
}

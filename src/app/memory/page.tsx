"use client";

import { useTranslation, useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { PaperCard } from "@/components/ui/PaperCard";
import { PageShell } from "@/components/PageShell";
import { useMounted } from "@/lib/useMounted";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MemoryPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { player1Name, player2Name, relationshipStage, questionTone, setP1Answers, setP2Answers, setPhase } = useGameStore();

  const mounted = useMounted();
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [showPassScreen, setShowPassScreen] = useState(false);
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [questions, setQuestions] = useState<string[]>([]);
  const [loadingQ, setLoadingQ] = useState(true);

  useEffect(() => {
    // Fetch AI-generated questions
    const fetchQuestions = async () => {
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "questions", stage: relationshipStage, language, tone: questionTone }),
        });
        const data = await res.json();
        if (data.questions?.length === 3) setQuestions(data.questions);
      } catch {
        // fallback below
      } finally {
        setLoadingQ(false);
      }
    };
    fetchQuestions();
  }, [relationshipStage, language, questionTone]);

  const handleNext = () => {
    if (currentPlayer === 1) {
      setP1Answers(answers);
      setAnswers({ q1: "", q2: "", q3: "" });
      setShowPassScreen(true);
    } else {
      setP2Answers(answers);
      setPhase("game");
      router.push("/game");
    }
  };

  const handlePassConfirm = () => {
    setCurrentPlayer(2);
    setShowPassScreen(false);
  };

  if (!mounted) return null;

  const turnTitle = currentPlayer === 1
    ? t.memory.p1_turn.replace("{name}", player1Name)
    : t.memory.p2_turn.replace("{name}", player2Name);

  const q = questions.length === 3 ? questions : [t.memory.q1, t.memory.q2, t.memory.q3];

  return (
    <PageShell denseStickers className="flex items-center">
      <AnimatePresence mode="wait">
        {showPassScreen ? (
          <motion.div
            key="pass"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mx-auto max-w-2xl rounded-[32px] border border-white/55 bg-[#fff8e8]/82 p-8 text-center shadow-[0_24px_80px_rgba(76,44,10,0.16)] backdrop-blur-xl"
          >
            <h2 className="font-serif text-5xl font-bold text-[var(--color-ink)]">
              {t.memory.pass_device.replace("{name}", player2Name)}
            </h2>
            <Button onClick={handlePassConfirm}>{t.setup.continue}</Button>
          </motion.div>
        ) : (
          <PaperCard key={`player-${currentPlayer}`} withTape className="space-y-8 z-10 w-full max-w-2xl rounded-[30px] bg-[#fffdf6]/90 p-8 shadow-[0_24px_80px_rgba(76,44,10,0.18)]">
            <div className="text-center space-y-2">
              <h1 className="font-sans text-sm tracking-widest uppercase text-[var(--color-ink-light)] opacity-60">
                {t.memory.title}
              </h1>
              <h2 className="font-serif text-4xl font-bold text-[var(--color-ink)] md:text-5xl">{turnTitle}</h2>
            </div>

            {loadingQ ? (
              <div className="text-center py-8 space-y-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="w-8 h-8 border-4 border-[var(--color-accent-pink)] border-t-[var(--color-accent-red)] rounded-full mx-auto"
                />
                <p className="font-handwriting text-xl text-[var(--color-ink-light)] animate-pulse">
                  {language === "ru" ? "Готовим вопросы для вас..." : "Crafting your questions..."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {q.map((question, i) => (
                  <div key={i} className="space-y-2">
                    <label className="font-serif italic text-lg text-[var(--color-ink)] block">{question}</label>
                    <textarea
                      value={answers[`q${i + 1}` as "q1" | "q2" | "q3"]}
                      onChange={(e) => setAnswers({ ...answers, [`q${i + 1}`]: e.target.value })}
                      className="w-full bg-[var(--color-ink)]/5 border border-[var(--color-ink)]/10 rounded-sm p-3 font-handwriting text-2xl outline-none focus:border-[var(--color-ink)]/30 min-h-[90px] resize-none"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleNext}
                disabled={loadingQ || !answers.q1 || !answers.q2 || !answers.q3}
              >
                {currentPlayer === 1 ? t.memory.next : t.memory.finish}
              </Button>
            </div>
          </PaperCard>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

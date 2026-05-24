"use client";

import { useTranslation, useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { PaperCard } from "@/components/ui/PaperCard";
import { PageShell } from "@/components/PageShell";
import { useMounted } from "@/lib/useMounted";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const {
    player1Name,
    player2Name,
    relationshipStage,
    questionTone,
    setPlayers,
    setRelationshipStage,
    setQuestionTone,
    setPhase,
  } = useGameStore();
  const mounted = useMounted();
  const isRu = language === "ru";

  const handleContinue = () => {
    if (!player1Name || !player2Name) return;
    setPhase("memory");
    router.push("/memory");
  };

  const handleDistance = () => {
    if (!player1Name || !player2Name) return;
    router.push("/distance");
  };

  if (!mounted) return null;

  return (
    <PageShell denseStickers className="flex items-center">
      <section className="mx-auto grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[32px] border border-white/55 bg-[#fff8e8]/80 p-6 shadow-[0_24px_80px_rgba(76,44,10,0.16)] backdrop-blur-xl md:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9a5a42]">
            {isRu ? "первая глава" : "chapter one"}
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold leading-tight text-[#2c2010] md:text-7xl">
            {isRu ? "Начните вашу историю." : "Set the scene."}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#5e412b]">
            {isRu
              ? "Добавьте ваши имена и выберите этап отношений. Дальше вопросы подстроятся под вашу историю."
              : "Add both names and choose the relationship stage. The next page will tailor memory questions around it."}
          </p>
        </div>

      <PaperCard withTape className="space-y-8 relative z-10 max-w-xl rounded-[30px] bg-[#fffdf6]/90 p-8 shadow-[0_24px_80px_rgba(76,44,10,0.18)]">
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-center text-[var(--color-ink)]">
          {t.setup.title}
        </h2>

        <div className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t.setup.p1_placeholder}
              value={player1Name}
              onChange={(e) => setPlayers(e.target.value, player2Name)}
              className="w-full bg-transparent border-b-2 border-[var(--color-ink)]/20 focus:border-[var(--color-ink)] outline-none px-2 py-3 font-sans text-xl placeholder-[var(--color-ink)]/40 transition-colors"
            />
            <input
              type="text"
              placeholder={t.setup.p2_placeholder}
              value={player2Name}
              onChange={(e) => setPlayers(player1Name, e.target.value)}
              className="w-full bg-transparent border-b-2 border-[var(--color-ink)]/20 focus:border-[var(--color-ink)] outline-none px-2 py-3 font-sans text-xl placeholder-[var(--color-ink)]/40 transition-colors"
            />
          </div>

          <div className="space-y-3 pt-4">
            <label className="font-handwriting text-3xl text-[var(--color-ink-light)] block">
              {t.setup.relationship_stage}
            </label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(t.setup.stages).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRelationshipStage(key)}
                  className={`px-4 py-2 font-sans text-sm rounded-full border border-[var(--color-ink)]/20 transition-all ${
                    relationshipStage === key
                      ? "bg-[var(--color-ink)] text-white"
                      : "hover:bg-[var(--color-ink)]/5 text-[var(--color-ink)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="font-handwriting text-3xl text-[var(--color-ink-light)] block">
              {t.setup.question_tone}
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(t.setup.tones).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setQuestionTone(key)}
                  className={`rounded-full border px-4 py-3 font-sans text-sm font-semibold transition-all ${
                    questionTone === key
                      ? "bg-[#c9605a] text-white border-[#c9605a] shadow-md"
                      : "border-[var(--color-ink)]/20 text-[var(--color-ink)] hover:bg-white/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-center">
          <Button 
            onClick={handleContinue} 
            disabled={!player1Name || !player2Name}
            className="w-full disabled:opacity-50"
          >
            {t.setup.continue}
          </Button>
        </div>
        {relationshipStage === "long_distance" && (
          <button
            onClick={handleDistance}
            disabled={!player1Name || !player2Name}
            className="w-full rounded-full border-2 border-[#2c2010]/20 bg-[#fff8e8]/80 px-5 py-3 font-semibold text-[#2c2010] transition hover:bg-white disabled:opacity-50"
          >
            {isRu ? "Играть на расстоянии" : "Play long-distance"}
          </button>
        )}
      </PaperCard>
      </section>
    </PageShell>
  );
}

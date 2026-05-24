"use client";

import { useTranslation, useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { PaperCard } from "@/components/ui/PaperCard";
import { PageShell } from "@/components/PageShell";
import { useMounted } from "@/lib/useMounted";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ru from "@/locales/ru.json";

export default function SummaryPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { player1Name, player2Name, resetGame, loveFactoryProgress, loveListProgress, chapters } = useGameStore();
  const mounted = useMounted();
  const isRu = language === "ru";

  const handleReplay = () => {
    resetGame();
    router.push("/");
  };

  if (!mounted) return null;

  // Calculate some fun pseudo-metrics
  const loveListTotal = Object.keys(ru.list.items).length;
  const listScore = Math.floor((loveListProgress.length / loveListTotal) * 100);
  const factoryScore = Math.floor((loveFactoryProgress / 14) * 100);
  const totalScore = Math.floor((listScore + factoryScore + 85) / 3);

  const storyEn = `This is the story of ${player1Name} and ${player2Name}. You started as two separate paths, carrying different memories of the same moments. As you cooked together, shared silences, and navigated the space between words, you proved that love isn't about remembering everything perfectly—it's about choosing to build the next memory together.`;
  
  const storyRu = `Это история ${player1Name} и ${player2Name}. Вы начали как два разных пути, хранящих разные воспоминания об одних и тех же моментах. Готовя вместе, разделяя тишину и находя путь между несказанными словами, вы доказали: любовь — это не идеальная память. Это выбор создавать следующее воспоминание вместе.`;

  return (
    <PageShell denseStickers className="flex items-center">
      <PaperCard withTape className="w-full max-w-4xl z-10 space-y-8 rounded-[32px] bg-[#fffdf6]/90 p-8 shadow-[0_24px_80px_rgba(76,44,10,0.18)] md:p-12 relative overflow-hidden">
        {/* Decorative corner tapes */}
        <div className="absolute top-2 -left-8 w-24 h-6 tape -rotate-45" />
        <div className="absolute bottom-2 -right-8 w-24 h-6 tape -rotate-45" />

        <div className="text-center space-y-2">
          <h1 className="font-serif text-5xl font-bold md:text-6xl text-[var(--color-ink)]">
            {t.summary.title}
          </h1>
          <p className="font-sans text-sm tracking-widest uppercase text-[var(--color-ink-light)] opacity-60">
            {player1Name} & {player2Name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-[var(--color-ink)]/10">
          <div className="text-center space-y-2">
            <div className="text-6xl font-serif text-[var(--color-accent-red)]">
              {totalScore}%
            </div>
            <p className="font-handwriting text-2xl text-[var(--color-ink-light)]">
              {t.summary.score}
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-handwriting text-2xl text-[var(--color-ink)]">
              {t.summary.timeline}
            </h3>
            <div className="space-y-2 font-sans text-sm text-[var(--color-ink-light)]">
              <div className="flex justify-between">
                <span>{isRu ? "Фабрика любви" : "Love Factory"} ({loveFactoryProgress}/14)</span>
                <span>{factoryScore}%</span>
              </div>
              <div className="w-full bg-[var(--color-ink)]/10 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${factoryScore}%` }}
                  className="bg-[var(--color-accent-pink)] h-full"
                />
              </div>

              <div className="flex justify-between pt-2">
                <span>{isRu ? "Дела вместе" : "Things Together"} ({loveListProgress.length}/{loveListTotal})</span>
                <span>{listScore}%</span>
              </div>
              <div className="w-full bg-[var(--color-ink)]/10 h-1 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${listScore}%` }}
                  className="bg-[var(--color-accent-pink)] h-full"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative pt-4 pb-8">
          <p className="font-serif italic text-xl md:text-2xl leading-relaxed text-[var(--color-ink)] text-center">
            {language === 'en' ? storyEn : storyRu}
          </p>
        </div>

        {chapters.length > 0 && (
          <div className="space-y-4 border-t border-[var(--color-ink)]/10 pt-8 text-left">
            <h2 className="font-serif text-3xl font-bold text-[var(--color-ink)]">
              {isRu ? "Главы вашей истории" : "Chapters of your story"}
            </h2>
            <div className="grid gap-3">
              {chapters.slice(0, 4).map((chapter) => (
                <div key={chapter.id} className="rounded-[24px] border border-[#2c2010]/8 bg-white/65 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-semibold text-[#2c2010]">
                      {chapter.player1Name} & {chapter.player2Name}
                    </p>
                    <span className="rounded-full bg-[#f3d8cc] px-3 py-1 text-sm font-bold text-[#8b5043]">
                      {chapter.reveal.similarity}%
                    </span>
                  </div>
                  <p className="font-serif italic leading-7 text-[#5e412b]">{chapter.reveal.insight}</p>
                  <p className="mt-3 text-sm font-semibold text-[#8b5043]">
                    {isRu ? "Задание: " : "Task: "}
                    {chapter.reveal.nextTask}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center pt-4">
          <Button onClick={handleReplay} variant="outline">
            {t.summary.replay}
          </Button>
        </div>
      </PaperCard>
    </PageShell>
  );
}

"use client";

import { useTranslation, useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/PageShell";
import { useMounted } from "@/lib/useMounted";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function FactoryPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { loveFactoryProgress, setLoveFactoryProgress, setPhase } = useGameStore();
  const mounted = useMounted();
  const isRu = language === "ru";

  const handleNext = () => {
    setPhase("list");
    router.push("/list");
  };

  const completeLevel = (level: number) => {
    if (level === loveFactoryProgress + 1) {
      setLoveFactoryProgress(level);
    }
  };

  if (!mounted) return null;

  return (
    <PageShell denseStickers>
      <div className="mx-auto max-w-5xl space-y-10 pb-16">
        <div className="rounded-[32px] border border-white/55 bg-[#fff8e8]/78 p-6 text-center shadow-[0_24px_80px_rgba(76,44,10,0.16)] backdrop-blur-xl md:p-9">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#9a5a42]">
            {isRu ? "совместные блюда" : "shared dishes"}
          </p>
          <h1 className="font-serif text-5xl font-bold text-[var(--color-ink)] md:text-7xl">
            {t.factory.title}
          </h1>
          <p className="mt-3 font-serif italic text-xl text-[var(--color-ink-light)]">
            {t.factory.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(t.factory.levels).map(([key, label]) => {
            const level = parseInt(key);
            const isCompleted = level <= loveFactoryProgress;
            const isLocked = level > loveFactoryProgress + 1;

            return (
              <motion.div
                key={key}
                whileHover={!isLocked ? { scale: 1.02 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                onClick={() => completeLevel(level)}
                className={`relative min-h-32 overflow-hidden rounded-[26px] border border-white/60 bg-[#fffdf6]/82 p-6 shadow-[0_18px_45px_rgba(76,44,10,0.12)] backdrop-blur-md cursor-pointer transition-all ${
                  isLocked ? "opacity-50 grayscale cursor-not-allowed" : ""
                } ${isCompleted ? "border-[#e7a8ae] bg-[#fff7f4]/90 shadow-[0_18px_45px_rgba(180,85,92,0.16)]" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-handwriting text-2xl text-[var(--color-ink)] mt-1">
                      {label}
                    </h3>
                  </div>
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 transition-all ${
                    isCompleted 
                      ? "bg-[#e8a4aa] border-[#e8a4aa] text-white shadow-[0_10px_22px_rgba(201,96,90,0.22)]" 
                      : "border-[var(--color-ink)]/20"
                  }`}>
                    {isCompleted && <Check size={22} strokeWidth={2.5} />}
                  </div>
                </div>
                {isCompleted && <div className="absolute inset-x-0 bottom-0 h-1.5 bg-[#e8a4aa]" />}
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center mt-12">
          <Button onClick={handleNext} variant="outline" className="bg-white/50 backdrop-blur-sm">
            {t.setup.continue}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

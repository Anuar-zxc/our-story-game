"use client";

import { useTranslation, useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/PageShell";
import { useMounted } from "@/lib/useMounted";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ListPage() {
  const { t, language } = useTranslation();
  const router = useRouter();
  const { loveListProgress, toggleLoveListItem, setPhase } = useGameStore();
  const mounted = useMounted();
  const isRu = language === "ru";

  const handleNext = () => {
    setPhase("summary");
    router.push("/summary");
  };

  if (!mounted) return null;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-10 pb-16">
        <div className="rounded-[32px] border border-white/55 bg-[#fff8e8]/78 p-6 text-center shadow-[0_24px_80px_rgba(76,44,10,0.16)] backdrop-blur-xl md:p-9">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#9a5a42]">
            {isRu ? "дела вместе" : "things to do together"}
          </p>
          <h1 className="font-serif text-5xl font-bold text-[var(--color-ink)] md:text-7xl">
            {t.list.title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-serif italic text-2xl leading-relaxed text-[var(--color-ink-light)]">
            {t.list.subtitle}
          </p>
        </div>

        <div className="space-y-3 rounded-[32px] border border-white/55 bg-white/70 p-5 shadow-[0_24px_80px_rgba(76,44,10,0.14)] backdrop-blur-xl md:p-8">
          {Object.entries(t.list.items).map(([key, label]) => {
            const id = parseInt(key);
            const isChecked = loveListProgress.includes(id);

            return (
              <motion.div
                key={id}
                whileHover={{ x: 4 }}
                onClick={() => toggleLoveListItem(id)}
                className="group flex cursor-pointer items-start gap-4 rounded-[22px] border border-[#2c2010]/5 bg-[#fff9ec]/65 p-4 transition hover:bg-white"
              >
                <div className="mt-1 w-6 h-6 shrink-0 border-2 border-[var(--color-ink)] rounded-sm flex items-center justify-center transition-colors">
                  {isChecked && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 bg-[var(--color-ink)] rounded-sm"
                    />
                  )}
                </div>
                <span className={`font-handwriting text-3xl transition-all ${
                  isChecked ? "text-[var(--color-ink-light)] line-through decoration-2" : "text-[var(--color-ink)] group-hover:text-[var(--color-ink-light)]"
                }`}>
                  {label}
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center mt-16 pt-8 border-t border-[var(--color-ink)]/10">
          <Button onClick={handleNext}>
            {t.setup.continue}
          </Button>
        </div>
      </div>
    </PageShell>
  );
}

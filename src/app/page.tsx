"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Eye, Heart, LockKeyhole, Radio, Sparkles } from "lucide-react";
import { useTranslation, useGameStore } from "@/store/gameStore";
import { PageShell } from "@/components/PageShell";

export default function Home() {
  const { language } = useTranslation();
  const { setPhase } = useGameStore();
  const isRu = language === "ru";

  const steps = isRu
    ? [
        { title: "Выберите сценарий", text: "На расстоянии, после ссоры, идеальные отношения или другой этап.", icon: Heart },
        { title: "Ответьте отдельно", text: "Каждый пишет свои ответы. В режиме на расстоянии ответы скрыты до конца.", icon: LockKeyhole },
        { title: "Откройте reveal", text: "AI покажет совпадения, различия, скрытую тему и задание на сегодня.", icon: Eye },
      ]
    : [
        { title: "Choose a scenario", text: "Long-distance, after a fight, perfect relationship, or another stage.", icon: Heart },
        { title: "Answer separately", text: "Each person writes alone. In distance mode, answers stay hidden until the end.", icon: LockKeyhole },
        { title: "Open the reveal", text: "AI shows matches, differences, the hidden theme, and a task for today.", icon: Eye },
      ];

  return (
    <PageShell denseStickers className="flex items-center">
      <section className="mx-auto grid min-h-[calc(100vh-9rem)] w-full max-w-6xl items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[44px] border border-white/55 bg-[#fff8e8]/86 p-6 shadow-[0_30px_90px_rgba(80,45,0,0.2)] backdrop-blur-xl md:p-10 lg:p-12"
        >
          <div className="absolute right-6 top-6 hidden rotate-6 rounded-[28px] border border-white/70 bg-white/55 px-5 py-4 shadow-sm md:block">
            <div className="flex items-center gap-3 text-[#8b5043]">
              <Sparkles size={22} />
              <span className="text-sm font-bold uppercase tracking-[0.18em]">DeepSeek reveal</span>
            </div>
          </div>

          <div className="max-w-4xl">
            <p className="mb-5 inline-flex rounded-full border border-[#c9605a]/20 bg-white/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9b554b]">
              {isRu ? "AI-игра для пары" : "AI game for two"}
            </p>
            <h1 className="font-serif text-[clamp(4rem,11vw,9rem)] font-bold leading-[0.86] text-[#2c2010]">
              {isRu ? "Наша история" : "Our Story"}
            </h1>
            <p className="mt-7 max-w-3xl text-xl leading-9 text-[#5e412b] md:text-2xl">
              {isRu
                ? "Игра, где вы отвечаете отдельно, а потом узнаете, что у вас совпало, где вы разные и что стоит сделать друг для друга сегодня."
                : "A game where you answer separately, then discover what matched, where you differ, and what to do for each other today."}
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {steps.map(({ title, text, icon: Icon }, index) => (
              <div key={title} className="rounded-[28px] border border-white/65 bg-white/62 p-4 shadow-sm backdrop-blur-md">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f3d8cc] text-[#8b5043]">
                    <Icon size={20} />
                  </div>
                  <span className="font-serif text-3xl font-bold text-[#c9605a]">{index + 1}</span>
                </div>
                <h2 className="font-serif text-2xl font-bold leading-tight text-[#2c2010]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6f5136]">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/setup"
              onClick={() => setPhase("setup")}
              className="group inline-flex items-center gap-3 rounded-full bg-[#2c2010] px-7 py-4 text-lg font-bold text-white shadow-[0_18px_45px_rgba(44,32,16,0.24)] transition hover:-translate-y-1"
            >
              {isRu ? "Начать игру" : "Start game"}
              <ArrowRight className="transition group-hover:translate-x-1" size={20} />
            </Link>
            <Link
              href="/distance"
              className="inline-flex items-center gap-3 rounded-full border-2 border-[#2c2010]/15 bg-white/55 px-7 py-4 text-lg font-bold text-[#2c2010] transition hover:bg-white"
            >
              <Radio size={20} />
              {isRu ? "Играть на расстоянии" : "Long-distance mode"}
            </Link>
            <Link href="/auth" className="text-sm font-bold text-[#8b5043] underline-offset-4 hover:underline">
              {isRu ? "Сохранить прогресс через email" : "Save progress with email"}
            </Link>
          </div>
        </motion.div>
      </section>
    </PageShell>
  );
}

"use client";

import Link from "next/link";
import { CalendarHeart, Database, Sparkles, type LucideIcon } from "lucide-react";
import { GoogleAuthCard } from "@/components/GoogleAuthCard";
import { PageShell } from "@/components/PageShell";
import { useTranslation } from "@/store/gameStore";

type DashboardUser = {
  name: string;
};

export function DashboardContent({ user }: { user: DashboardUser }) {
  const { language } = useTranslation();
  const isRu = language === "ru";

  const cards: Array<{ title: string; text: string; Icon: LucideIcon }> = isRu
    ? [
        { title: "SQLite база", text: "Пользователи и сессии сохраняются в data/after-us.sqlite.", Icon: Database },
        { title: "Лента воспоминаний", text: "Все игровые страницы собраны в один аккуратный пользовательский путь.", Icon: CalendarHeart },
        { title: "Стикеры", text: "Прозрачные стикеры теперь работают как часть визуального стиля сайта.", Icon: Sparkles },
      ]
    : [
        { title: "SQLite database", text: "Users and sessions are written to data/after-us.sqlite.", Icon: Database },
        { title: "Memory timeline", text: "The existing game pages now sit inside one polished product shell.", Icon: CalendarHeart },
        { title: "Sticker system", text: "Transparent stickers are scattered through the interface as art direction.", Icon: Sparkles },
      ];

  return (
    <PageShell denseStickers>
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[32px] border border-white/55 bg-[#fff9ec]/80 p-6 shadow-[0_24px_80px_rgba(76,44,10,0.17)] backdrop-blur-xl md:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9a5a42]">
            {isRu ? "ваш архив" : "your archive"}
          </p>
          <h1 className="mt-3 font-serif text-5xl font-bold leading-tight text-[#2c2010] md:text-7xl">
            {isRu ? `${user.name}, ваш маленький мир готов.` : `${user.name}, your little world is ready.`}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#5e412b]">
            {isRu
              ? "Аккаунт хранится в SQLite, а сессия управляется на сервере. Можно начать новую историю или продолжить ваши совместные задания."
              : "The account is stored in SQLite and the session is server-managed. Next step: start a new story or continue shaping the relationship rituals."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/setup" className="rounded-full bg-[#2c2010] px-5 py-3 font-semibold text-white shadow-lg">
              {isRu ? "Начать историю" : "Start story"}
            </Link>
            <Link href="/summary" className="rounded-full border border-[#2c2010]/20 bg-white/55 px-5 py-3 font-semibold text-[#2c2010]">
              {isRu ? "Посмотреть итог" : "View summary"}
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <GoogleAuthCard />
          {cards.map(({ title, text, Icon }) => (
            <div key={title} className="rounded-[28px] border border-white/55 bg-white/68 p-5 shadow-sm backdrop-blur-xl">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-[#f3d8cc] text-[#8b5043]">
                <Icon size={20} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2c2010]">{title}</h2>
              <p className="mt-2 leading-7 text-[#6f5136]">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

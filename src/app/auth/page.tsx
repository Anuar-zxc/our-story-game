"use client";

import Link from "next/link";
import { HeartHandshake, LockKeyhole } from "lucide-react";
import { AccountProfileCard } from "@/components/AccountProfileCard";
import { PageShell } from "@/components/PageShell";
import { useTranslation } from "@/store/gameStore";

export default function AuthPage() {
  const { language } = useTranslation();
  const isRu = language === "ru";

  return (
    <PageShell denseStickers className="flex items-center">
      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[36px] border border-white/55 bg-[#fff9ec]/82 p-7 shadow-[0_24px_80px_rgba(76,44,10,0.18)] backdrop-blur-xl md:p-10">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-[#c9605a] text-white shadow-lg">
            <HeartHandshake size={26} />
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#9a5a42]">
            {isRu ? "аккаунт нужен не всем" : "account only when useful"}
          </p>
          <h1 className="font-serif text-5xl font-bold leading-tight text-[#2c2010] md:text-7xl">
            {isRu ? "Сохраняйте прогресс и играйте на расстоянии." : "Save progress and play long-distance."}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#5e412b]">
            {isRu
              ? "Обычную игру можно начать без регистрации. Email-профиль нужен, чтобы хранить главы вашей истории, данные пары и создавать комнаты на расстоянии."
              : "You can start the normal game without signup. Email profile is for saved chapters, couple data, and long-distance rooms."}
          </p>
          <div className="mt-6 rounded-[24px] bg-white/60 p-4 text-[#6f5136]">
            <LockKeyhole className="mb-2" size={20} />
            {isRu
              ? "Данные остаются локально в SQLite этого проекта. Пароль не нужен для демо-версии."
              : "Data stays in this project's local SQLite database. No password is needed for the demo version."}
          </div>
        </div>

        <div>
          <AccountProfileCard />
          <Link href="/setup" className="mt-5 block text-center text-sm font-semibold text-[#8b5043] hover:text-[#2c2010]">
            {isRu ? "Играть без сохранения" : "Play without saving"}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

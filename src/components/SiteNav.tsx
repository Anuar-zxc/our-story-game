"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ListChecks, Sparkles, UserRound } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useGameStore } from "@/store/gameStore";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", labelEn: "Home", labelRu: "Главная", icon: Heart },
  { href: "/setup", labelEn: "Setup", labelRu: "Пара", icon: UserRound },
  { href: "/factory", labelEn: "Factory", labelRu: "Фабрика", icon: Sparkles },
  { href: "/list", labelEn: "List", labelRu: "Дела", icon: ListChecks },
];

export function SiteNav() {
  const pathname = usePathname();
  const language = useGameStore((state) => state.language);
  const brand = language === "ru" ? "Наша история" : "Our Story";

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-[30px] border border-white/45 bg-[#fffaf0]/84 px-3 py-2 shadow-[0_18px_50px_rgba(83,48,10,0.14)] backdrop-blur-xl sm:gap-4 sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2b2118] text-white shadow-md">
            <Heart size={20} fill="currentColor" />
          </span>
          <span className="hidden font-serif text-xl font-bold text-[#2b2118] lg:block">{brand}</span>
        </Link>
        <nav className="grid flex-1 grid-cols-4 gap-2 sm:max-w-2xl">
          {links.map(({ href, labelEn, labelRu, icon: Icon }) => {
            const active = pathname === href;
            const label = language === "ru" ? labelRu : labelEn;
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "flex min-h-12 min-w-0 items-center justify-center gap-2 rounded-[24px] px-2 text-[#4d3423] transition hover:bg-white/85 sm:min-h-[56px] sm:gap-2.5 sm:px-4",
                  active && "bg-[#2b2118] text-white shadow-[0_14px_30px_rgba(44,32,16,0.26)]"
                )}
              >
                <Icon size={23} strokeWidth={2.2} />
                <span className="hidden text-base font-bold leading-none sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <LanguageSwitcher compact />
      </div>
    </header>
  );
}

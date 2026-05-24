"use client";

import { useGameStore } from "@/store/gameStore";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useGameStore();

  const toggleLang = () => {
    setLanguage(language === "en" ? "ru" : "en");
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleLang}
      className={`${compact ? "" : "fixed top-6 right-6 z-50"} flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-[var(--color-ink)]/10 text-[var(--color-ink)] shadow-sm hover:bg-white/80 transition-colors`}
    >
      <Globe size={18} />
      <span className="font-sans font-medium uppercase text-sm">
        {language}
      </span>
    </motion.button>
  );
}

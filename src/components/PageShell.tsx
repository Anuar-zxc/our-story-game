"use client";

import { StickerBackdrop } from "@/components/StickerBackdrop";
import { SiteNav } from "@/components/SiteNav";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  denseStickers,
  className,
}: {
  children: React.ReactNode;
  denseStickers?: boolean;
  className?: string;
}) {
  return (
    <main className={cn("relative min-h-screen overflow-hidden bg-crumpled-paper px-4 pb-14 pt-28", className)}>
      <StickerBackdrop dense={denseStickers} />
      <SiteNav />
      <div className="relative z-10 mx-auto max-w-6xl">{children}</div>
    </main>
  );
}

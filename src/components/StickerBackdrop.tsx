"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const baseStickers = [
  { src: "/stickers/cats-cutout.png", alt: "cats sticker", className: "-left-10 top-[18%] w-32 opacity-90 sm:left-6 sm:w-40 xl:w-48", rot: "-9deg", delay: 0 },
  { src: "/stickers/envelope-cutout.png", alt: "love letter sticker", className: "-right-10 top-[14%] w-36 opacity-90 sm:right-8 sm:w-44 xl:w-52", rot: "8deg", delay: 0.12 },
  { src: "/stickers/bear-hug.svg", alt: "bear hug sticker", className: "-right-8 bottom-[18%] w-32 opacity-90 sm:right-10 sm:w-40 xl:w-48", rot: "10deg", delay: 0.24 },
  { src: "/stickers/i-love-gf.svg", alt: "i love my gf sticker", className: "-left-8 bottom-[20%] hidden w-28 opacity-85 md:block xl:w-36", rot: "-8deg", delay: 0.34 },
  { src: "/stickers/pixel-heart-cutout.png", alt: "pixel heart sticker", className: "left-[18%] bottom-8 w-16 opacity-85 sm:w-20 xl:w-24", rot: "14deg", delay: 0.42 },
  { src: "/stickers/i-heart-bf.svg", alt: "i heart my bf sticker", className: "right-[12%] bottom-6 hidden w-36 opacity-70 2xl:block", rot: "-5deg", delay: 0.5 },
];

const denseStickers = [
  { src: "/stickers/hero-kitty.svg", alt: "hero kitty sticker", className: "left-[18%] top-[10%] hidden w-20 opacity-75 lg:block xl:w-28", rot: "12deg", delay: 0.58 },
  { src: "/stickers/pixel-heart-cutout.png", alt: "pixel heart sticker", className: "right-[24%] top-[18%] hidden w-14 opacity-75 lg:block xl:w-20", rot: "-13deg", delay: 0.66 },
  { src: "/stickers/envelope-cutout.png", alt: "love letter sticker", className: "left-[7%] bottom-[6%] hidden w-24 opacity-70 xl:block", rot: "15deg", delay: 0.74 },
  { src: "/stickers/bear-hug.svg", alt: "bear hug sticker", className: "right-[5%] top-[54%] hidden w-24 opacity-75 xl:block", rot: "-14deg", delay: 0.82 },
  { src: "/stickers/i-love-gf.svg", alt: "i love my gf sticker", className: "left-[5%] top-[52%] hidden w-20 opacity-70 2xl:block", rot: "11deg", delay: 0.9 },
  { src: "/stickers/i-heart-bf.svg", alt: "i heart my bf sticker", className: "right-[30%] bottom-[3%] hidden w-28 opacity-60 2xl:block", rot: "7deg", delay: 0.98 },
];

export function StickerBackdrop({ dense = false }: { dense?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 crumple-overlay opacity-70" />
      <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25 blur-3xl" />
      {[...baseStickers, ...(dense ? denseStickers : [])].map((sticker, index) => (
        <motion.div
          key={`${sticker.src}-${index}`}
          className={cn("absolute aspect-square", sticker.className)}
          initial={{ opacity: 0, scale: 0.72, rotate: "-22deg" }}
          animate={{ opacity: 1, scale: 1, rotate: sticker.rot }}
          transition={{ delay: sticker.delay, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Image
            src={sticker.src}
            alt={sticker.alt}
            fill
            sizes="(max-width: 768px) 160px, 220px"
            className="object-contain drop-shadow-[0_18px_28px_rgba(80,45,0,0.22)]"
            priority={index < 2}
          />
        </motion.div>
      ))}
    </div>
  );
}

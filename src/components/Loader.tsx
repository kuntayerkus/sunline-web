"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const playedLoaders = new Set<string>();

/**
 * Metni satırlara böler: "&" varsa ondan sonrası alt satıra iner ve kelimeler
 * satır ortasından bölünmez (mobilde "TRA / MPETLER" gibi kırılmalar önlenir).
 */
function buildLines(text: string): string[] {
  if (text.includes("&")) {
    const parts = text
      .split("&")
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.map((p, i) => (i < parts.length - 1 ? `${p} &` : p));
  }
  return [text];
}

export default function Loader({ text = "SUNLINE", duration = 2000 }: { text?: string; duration?: number }) {
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<"entering" | "holding" | "exiting">("entering");
  const [hasPlayed, setHasPlayed] = useState(false);

  const lines = buildLines(text.toUpperCase());
  const letterCount = lines.reduce((n, l) => n + l.length, 0);
  const staggerDuration = 0.045; // daha hızlı harf akışı
  const enterTime = letterCount * staggerDuration * 1000 + 300; // stagger + son harf
  const holdTime = Math.max(duration - enterTime - 350, 150); // çıkıştan önce kısa bekleme

  useIsomorphicLayoutEffect(() => {
    if (playedLoaders.has(text)) {
      setHasPlayed(true);
      setLoading(false);
      return;
    }

    playedLoaders.add(text);

    // Faz 1: harfler girer (stagger)
    const holdTimer = setTimeout(() => {
      setPhase("holding");
    }, enterTime);

    // Faz 2: kısa bekle, sonra içinden zoom
    const exitTimer = setTimeout(() => {
      setPhase("exiting");
    }, enterTime + holdTime);

    // Faz 3: tamamen bitti, unmount
    const doneTimer = setTimeout(() => {
      setLoading(false);
    }, enterTime + holdTime + 500);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [text, duration, enterTime, holdTime]);

  if (hasPlayed) return null;

  let globalIndex = 0;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[100] bg-[var(--color-ink)] flex items-center justify-center overflow-hidden"
          style={{ perspective: "600px" }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeInOut" } }}
        >
          <motion.div
            className="flex flex-col items-center justify-center text-[var(--color-paper)] font-display font-black tracking-tighter leading-none text-5xl sm:text-7xl md:text-[8rem] lg:text-[10rem] px-4 text-center"
            animate={
              phase === "exiting"
                ? { scale: 22, opacity: 0, z: 800 }
                : { scale: 1, opacity: 1, z: 0 }
            }
            transition={
              phase === "exiting"
                ? { duration: 0.5, ease: [0.76, 0, 0.24, 1] as const }
                : { duration: 0.3 }
            }
            style={{ transformStyle: "preserve-3d" }}
          >
            {lines.map((line, li) => (
              <span key={li} className="flex justify-center whitespace-nowrap">
                {line.split("").map((char) => {
                  const idx = globalIndex++;
                  return (
                    <motion.span
                      key={idx}
                      className="inline-block origin-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={
                        phase === "entering" || phase === "holding"
                          ? { scale: 1, opacity: 1 }
                          : {}
                      }
                      transition={{
                        delay: idx * staggerDuration,
                        duration: 0.3,
                        ease: [0.16, 1, 0.3, 1] as const,
                      }}
                    >
                      {char === " " ? " " : char}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

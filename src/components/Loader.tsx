"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const playedLoaders = new Set<string>();

export default function Loader({ text = "SUNLINE", duration = 2000 }: { text?: string; duration?: number }) {
  const [phase, setPhase] = useState<"entering" | "holding" | "exiting" | "done">("entering");
  const [hasPlayed, setHasPlayed] = useState(false);

  const letterCount = text.length;
  const staggerDuration = 0.09;
  const enterTime = letterCount * staggerDuration * 1000 + 400; // stagger + last letter anim
  const holdTime = Math.max(duration - enterTime - 600, 200); // remaining hold before exit

  useIsomorphicLayoutEffect(() => {
    if (playedLoaders.has(text)) {
      setHasPlayed(true);
      setPhase("done");
      return;
    }

    playedLoaders.add(text);

    // Phase 1: letters enter (stagger)
    const holdTimer = setTimeout(() => {
      setPhase("holding");
    }, enterTime);

    // Phase 2: hold briefly, then zoom through
    const exitTimer = setTimeout(() => {
      setPhase("exiting");
    }, enterTime + holdTime);

    // Phase 3: fully done, unmount
    const doneTimer = setTimeout(() => {
      setPhase("done");
    }, enterTime + holdTime + 800);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [text, duration, enterTime, holdTime]);

  if (hasPlayed || phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" style={{ perspective: "600px" }}>
      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            className="absolute inset-0 bg-[var(--color-ink)] flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3, delay: 0.2 } }}
          >
            <motion.div
              className="flex flex-wrap items-center justify-center text-[var(--color-paper)] font-display font-black tracking-tighter leading-none text-5xl sm:text-7xl md:text-[8rem] lg:text-[10rem] px-4"
              animate={
                phase === "exiting"
                  ? { scale: 30, opacity: 0, z: 800 }
                  : { scale: 1, opacity: 1, z: 0 }
              }
              transition={
                phase === "exiting"
                  ? { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const }
                  : { duration: 0.3 }
              }
              style={{ transformStyle: "preserve-3d" }}
            >
              {text.split("").map((char, index) => (
                <motion.span
                  key={index}
                  className="inline-block origin-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={
                    phase === "entering" || phase === "holding"
                      ? { scale: 1, opacity: 1 }
                      : {}
                  }
                  transition={{
                    delay: index * staggerDuration,
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1] as const,
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import Link from "next/link";
import { gearData } from "@/lib/gearData";

export default function GearDetailContent({ slug }: { slug: string }) {
  const data = gearData[slug] || { title: "Kategori Bulunamadı", items: [] };

  return (
    <main className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] pt-32 px-6 pb-32">
      <Loader text={data.title.toUpperCase()} duration={800} />
      <Navbar />

      <div className="max-w-6xl mx-auto">
        <Link
          href="/ekipmanlar"
          className="font-display font-bold tracking-widest text-sm hover:text-[var(--color-volt)] transition mb-8 inline-block"
        >
          ← GERİ DÖN
        </Link>

        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl md:text-8xl font-display font-black tracking-tighter mb-16"
        >
          {data.title.toUpperCase()}
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {data.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              className="border-b-2 border-[var(--color-ink)] pb-4 flex justify-between items-end group cursor-default"
            >
              <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight group-hover:text-[var(--color-flare)] transition">
                {item.toUpperCase()}
              </h2>
              <span className="text-xs font-medium opacity-50 tracking-widest ml-4 font-display">
                PREMIUM
              </span>
            </motion.div>
          ))}
        </div>

        {/* Video placeholder for this gear category */}
        <div className="mt-24 w-full aspect-video frame-volt bg-stone-900 flex items-center justify-center">
          <span className="text-[var(--color-paper)]/50 font-display uppercase tracking-widest text-sm text-center px-4">
            Kling 3.0 Video Placeholder
            <br />
            <br />
            {data.title} ekipmanlarımızla performans sergileyen müzisyenlerin
            efsanevi videosu.
          </span>
        </div>
      </div>
    </main>
  );
}

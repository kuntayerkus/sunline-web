"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Loader from "@/components/Loader";
import Link from "next/link";
import { gearCategories } from "@/lib/gearData";

export default function EquipmentContent() {
  return (
    <main className="min-h-screen bg-[var(--color-ink)] text-[var(--color-paper)] pt-32 px-6 pb-24">
      <Loader text="EKİPMANLAR" duration={1000} />
      <Navbar />

      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-display font-black tracking-tighter mb-4"
        >
          EKIPMAN <span className="text-[var(--color-volt)]">ARŞİVİ</span>
        </motion.h1>
        <p className="text-xl font-light opacity-80 mb-16 max-w-2xl">
          Dünya çapındaki festivallerden premium kayıt oturumlarına; kusursuz
          bakımlı, Ege&apos;nin en güçlü envanteri.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gearCategories.map((cat, i) => (
            <Link href={`/ekipmanlar/${cat.id}`} key={cat.id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  backgroundColor: cat.color,
                  color: cat.textColor || "var(--color-paper)",
                  border: cat.border
                    ? `4px solid ${cat.border}`
                    : "none",
                }}
                className="group relative aspect-video p-8 flex flex-col justify-end overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-stone-900/20 group-hover:scale-105 transition duration-700 ease-out z-0"></div>

                <div className="relative z-10 flex justify-between items-end">
                  <h2 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
                    {cat.name.toUpperCase()}
                  </h2>
                  <span className="opacity-0 group-hover:opacity-100 transition duration-300 font-display text-xl">
                    →
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

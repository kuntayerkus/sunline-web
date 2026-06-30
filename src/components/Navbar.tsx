"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./logo";

const navLinks = [
  { href: "/#backline", label: "BACKLINE" },
  { href: "/#kayit", label: "KAYIT" },
  { href: "/#mix", label: "MIX & MASTER" },
  { href: "/#prova", label: "PROVA" },
  { href: "/ekipmanlar", label: "EKİPMANLAR", accent: true },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-[var(--color-ink)]/80 backdrop-blur-lg text-[var(--color-paper)]"
      >
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <Logo className="text-3xl md:text-5xl" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium text-sm md:text-base tracking-widest">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:opacity-70 transition ${link.accent ? "text-[var(--color-flare)] font-bold" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden font-display text-sm tracking-widest relative z-10"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
        >
          {menuOpen ? "KAPAT" : "MENÜ"}
        </button>
      </motion.nav>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[45] bg-[var(--color-ink)] flex flex-col items-center justify-center gap-6 px-6"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  delay: i * 0.07,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-4xl sm:text-5xl font-display font-black tracking-tighter transition-colors ${
                    link.accent
                      ? "text-[var(--color-flare)]"
                      : "text-[var(--color-paper)] hover:text-[var(--color-flare)]"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            {/* Mobile Footer Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-12 text-center text-sm opacity-50 tracking-widest font-display"
            >
              İZMİR, ALSANCAK
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

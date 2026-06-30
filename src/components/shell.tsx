"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { BottomNav } from "@/components/bottom-nav";
import type { Rol } from "@/lib/types";

export function Shell({
  rol,
  adSoyad,
  email,
  children,
}: {
  rol: Rol;
  adSoyad: string;
  email: string | null;
  children: React.ReactNode;
}) {
  const [mobilAcik, setMobilAcik] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Masaüstü kenar menü */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-stone-200 bg-white lg:block">
        <Sidebar rol={rol} />
      </aside>

      {/* Mobil çekmece */}
      {mobilAcik && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-stone-900/40"
            onClick={() => setMobilAcik(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <Sidebar rol={rol} onNavigate={() => setMobilAcik(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <Topbar adSoyad={adSoyad} email={email} />
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
          {children}
        </main>
      </div>

      {/* Mobil alt navigasyon */}
      <BottomNav onMenu={() => setMobilAcik(true)} />
    </div>
  );
}

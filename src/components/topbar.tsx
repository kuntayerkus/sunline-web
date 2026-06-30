"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SunlineLogo } from "@/components/logo";

export function Topbar({
  adSoyad,
  email,
}: {
  adSoyad: string;
  email: string | null;
}) {
  const router = useRouter();
  const [cikisYapiliyor, setCikisYapiliyor] = useState(false);

  async function cikis() {
    setCikisYapiliyor(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/giris");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-stone-200 bg-white/80 px-4 backdrop-blur">
      {/* Mobilde marka (masaüstünde logo kenar menüde) */}
      <Link href="/panel" className="lg:hidden" aria-label="Sunline panel">
        <SunlineLogo />
      </Link>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-sm font-medium text-stone-800">{adSoyad}</div>
          {email && <div className="text-xs text-stone-400">{email}</div>}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <User size={18} />
        </div>
        <button
          onClick={cikis}
          disabled={cikisYapiliyor}
          className="btn-outline btn-sm"
          title="Çıkış yap"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Çıkış</span>
        </button>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Boxes,
  Wallet,
  Menu,
  type LucideIcon,
} from "lucide-react";
import type { Rol } from "@/lib/types";

type Item = { href: string; etiket: string; icon: LucideIcon };

// Mobilde en sık kullanılan 4 bölüm + tüm menü için "Menü".
// Patron'un en çok kontrol ettiği kalem mali durum olduğu için onun hızlı
// erişiminde Envanter yerine Mali gösterilir; ekip için Envanter kalır.
const ORTAK_ITEMS: Item[] = [
  { href: "/panel", etiket: "Özet", icon: LayoutDashboard },
  { href: "/panel/takvim", etiket: "Takvim", icon: CalendarDays },
  { href: "/panel/isler", etiket: "İşler", icon: ClipboardList },
];

function dorduncuOge(rol: Rol): Item {
  return rol === "patron"
    ? { href: "/panel/mali", etiket: "Mali", icon: Wallet }
    : { href: "/panel/envanter", etiket: "Envanter", icon: Boxes };
}

function aktifMi(pathname: string, href: string) {
  if (href === "/panel") return pathname === "/panel";
  return pathname === href || pathname.startsWith(href + "/");
}

export function BottomNav({ rol, onMenu }: { rol: Rol; onMenu: () => void }) {
  const pathname = usePathname();
  const ITEMS = [...ORTAK_ITEMS, dorduncuOge(rol)];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Alt menü"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {ITEMS.map((it) => {
          const aktif = aktifMi(pathname, it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={aktif ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition active:scale-95 ${
                aktif ? "text-brand-600" : "text-stone-500"
              }`}
            >
              <Icon size={23} className={aktif ? "text-brand-600" : "text-stone-400"} />
              {it.etiket}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMenu}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-stone-500 transition active:scale-95"
        >
          <Menu size={23} className="text-stone-400" />
          Menü
        </button>
      </div>
    </nav>
  );
}

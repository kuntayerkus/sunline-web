"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Boxes,
  Users,
  Wallet,
  StickyNote,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { Rol } from "@/lib/types";
import { SunlineLogo } from "@/components/logo";

type NavItem = {
  href: string;
  etiket: string;
  icon: LucideIcon;
  sadecePatron?: boolean;
};

const NAV: NavItem[] = [
  { href: "/panel", etiket: "Genel Bakış", icon: LayoutDashboard },
  { href: "/panel/takvim", etiket: "Takvim", icon: CalendarDays },
  { href: "/panel/isler", etiket: "İşler", icon: ClipboardList },
  { href: "/panel/envanter", etiket: "Envanter", icon: Boxes },
  { href: "/panel/kisiler", etiket: "Kişiler", icon: Users },
  { href: "/panel/mali", etiket: "Mali", icon: Wallet, sadecePatron: true },
  { href: "/panel/notlar", etiket: "Notlar", icon: StickyNote },
  { href: "/panel/ayarlar", etiket: "Ayarlar", icon: Settings, sadecePatron: true },
];

function aktifMi(pathname: string, href: string) {
  if (href === "/panel") return pathname === "/panel";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar({
  rol,
  onNavigate,
}: {
  rol: Rol;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV.filter((n) => !n.sadecePatron || rol === "patron");

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <SunlineLogo />
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((n) => {
          const aktif = aktifMi(pathname, n.href);
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={onNavigate}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                aktif
                  ? "bg-brand-50 text-brand-700"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
              ].join(" ")}
            >
              <Icon
                size={18}
                className={aktif ? "text-brand-500" : "text-stone-400"}
              />
              {n.etiket}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 text-xs text-stone-400">
        Sunline · {rol === "patron" ? "Patron" : "Ekip"}
      </div>
    </div>
  );
}

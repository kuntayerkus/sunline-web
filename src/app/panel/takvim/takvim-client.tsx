"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Is } from "@/lib/types";
import { saatStr } from "@/lib/format";

const AY_ISIMLERI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const GUN_ISIMLERI = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

type IsWithMusteri = Is & { musteriler?: { ad: string } | null };

const TIP_RENK: Record<string, string> = {
  backline: "bg-orange-100 text-orange-700 border-orange-200",
  prova: "bg-violet-100 text-violet-700 border-violet-200",
  kayit: "bg-sky-100 text-sky-700 border-sky-200",
  mix: "bg-emerald-100 text-emerald-700 border-emerald-200",
  mastering: "bg-pink-100 text-pink-700 border-pink-200",
  diger: "bg-stone-100 text-stone-600 border-stone-200",
};

const DURUM_RENK: Record<string, string> = {
  talep: "border-l-amber-400",
  teklif: "border-l-sky-400",
  onayli: "border-l-emerald-400",
  tamamlandi: "border-l-stone-400",
  iptal: "border-l-red-400",
};

function ayinGunleri(yil: number, ay: number) {
  const ilkGun = new Date(yil, ay, 1);
  const sonGun = new Date(yil, ay + 1, 0);
  // Pazartesi=0 olacak şekilde ayarla
  let baslangicGunu = ilkGun.getDay() - 1;
  if (baslangicGunu < 0) baslangicGunu = 6;

  const gunler: { tarih: Date; buAy: boolean }[] = [];

  // Önceki ayın günleri
  for (let i = baslangicGunu - 1; i >= 0; i--) {
    const d = new Date(yil, ay, -i);
    gunler.push({ tarih: d, buAy: false });
  }

  // Bu ayın günleri
  for (let i = 1; i <= sonGun.getDate(); i++) {
    gunler.push({ tarih: new Date(yil, ay, i), buAy: true });
  }

  // Sonraki ayın günleri (6 satır tamamla)
  const kalan = 42 - gunler.length;
  for (let i = 1; i <= kalan; i++) {
    gunler.push({ tarih: new Date(yil, ay + 1, i), buAy: false });
  }

  return gunler;
}

function ayniGun(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function gundeIs(is: IsWithMusteri, gun: Date): boolean {
  const bas = new Date(is.baslangic);
  const bit = new Date(is.bitis);
  const gunBas = new Date(gun.getFullYear(), gun.getMonth(), gun.getDate());
  const gunBit = new Date(gun.getFullYear(), gun.getMonth(), gun.getDate() + 1);
  return bas < gunBit && bit > gunBas;
}

export function TakvimClient({ isler }: { isler: IsWithMusteri[] }) {
  const bugun = new Date();
  const [yil, setYil] = useState(bugun.getFullYear());
  const [ay, setAy] = useState(bugun.getMonth());

  const gunler = ayinGunleri(yil, ay);

  function oncekiAy() {
    if (ay === 0) { setYil(yil - 1); setAy(11); }
    else setAy(ay - 1);
  }
  function sonrakiAy() {
    if (ay === 11) { setYil(yil + 1); setAy(0); }
    else setAy(ay + 1);
  }
  function bugune() {
    setYil(bugun.getFullYear());
    setAy(bugun.getMonth());
  }

  return (
    <div>
      {/* Navigasyon */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={oncekiAy} className="btn-ghost btn-sm" type="button">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-semibold text-stone-900 min-w-[180px] text-center">
            {AY_ISIMLERI[ay]} {yil}
          </h2>
          <button onClick={sonrakiAy} className="btn-ghost btn-sm" type="button">
            <ChevronRight size={18} />
          </button>
        </div>
        <button onClick={bugune} className="btn-outline btn-sm" type="button">
          Bugün
        </button>
      </div>

      {/* Takvim Grid */}
      <div className="card overflow-hidden">
        {/* Gün başlıkları */}
        <div className="grid grid-cols-7 border-b border-stone-200">
          {GUN_ISIMLERI.map((g) => (
            <div key={g} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-stone-500">
              {g}
            </div>
          ))}
        </div>

        {/* Günler */}
        <div className="grid grid-cols-7">
          {gunler.map(({ tarih, buAy }, idx) => {
            const bugunMu = ayniGun(tarih, bugun);
            const gununIsleri = isler.filter((is) => gundeIs(is, tarih));

            return (
              <div
                key={idx}
                className={[
                  "min-h-[100px] border-b border-r border-stone-100 p-1.5 transition",
                  buAy ? "bg-white" : "bg-stone-50/60",
                  idx % 7 === 0 ? "border-l-0" : "",
                ].join(" ")}
              >
                <div
                  className={[
                    "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    bugunMu
                      ? "bg-brand-500 text-white"
                      : buAy
                        ? "text-stone-700"
                        : "text-stone-300",
                  ].join(" ")}
                >
                  {tarih.getDate()}
                </div>

                <div className="space-y-0.5">
                  {gununIsleri.slice(0, 3).map((is) => (
                    <Link
                      key={is.id}
                      href={`/panel/isler/${is.id}`}
                      className={[
                        "block truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight border-l-2 transition hover:opacity-80",
                        TIP_RENK[is.tip] || TIP_RENK.diger,
                        DURUM_RENK[is.durum] || "",
                      ].join(" ")}
                      title={`${is.baslik} — ${is.musteriler?.ad ?? ""}`}
                    >
                      {saatStr(is.baslangic)} {is.baslik}
                    </Link>
                  ))}
                  {gununIsleri.length > 3 && (
                    <p className="px-1.5 text-[10px] text-stone-400">
                      +{gununIsleri.length - 3} daha
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Renk Açıklamaları */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-stone-500">
        {Object.entries(TIP_RENK).map(([tip, cls]) => (
          <span key={tip} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${cls}`}>
            {tip === "backline" ? "Backline" :
             tip === "prova" ? "Prova" :
             tip === "kayit" ? "Kayıt" :
             tip === "mix" ? "Mix" :
             tip === "mastering" ? "Mastering" : "Diğer"}
          </span>
        ))}
      </div>
    </div>
  );
}

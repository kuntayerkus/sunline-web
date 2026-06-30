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

const TIP_LABEL: Record<string, string> = {
  backline: "Backline", prova: "Prova", kayit: "Kayıt", mix: "Mix", mastering: "Mastering", diger: "Diğer",
};

export function TakvimClient({ isler }: { isler: IsWithMusteri[] }) {
  const bugun = new Date();
  const [yil, setYil] = useState(bugun.getFullYear());
  const [ay, setAy] = useState(bugun.getMonth());
  const [gorunum, setGorunum] = useState<"liste" | "ay">("liste");

  const gunler = ayinGunleri(yil, ay);

  // Ajanda (liste) görünümü: yalnız işi olan günler
  const agenda = gunler
    .filter((g) => g.buAy)
    .map((g) => ({ tarih: g.tarih, gunIsler: isler.filter((is) => gundeIs(is, g.tarih)) }))
    .filter((g) => g.gunIsler.length > 0);

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button onClick={oncekiAy} className="btn-ghost btn-sm px-2" type="button">
            <ChevronLeft size={18} />
          </button>
          <h2 className="min-w-[150px] text-center text-base font-semibold text-stone-900">
            {AY_ISIMLERI[ay]} {yil}
          </h2>
          <button onClick={sonrakiAy} className="btn-ghost btn-sm px-2" type="button">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-stone-100 p-0.5 text-sm font-medium">
            <button onClick={() => setGorunum("liste")} type="button" className={`rounded-md px-3 py-1 transition ${gorunum === "liste" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>Liste</button>
            <button onClick={() => setGorunum("ay")} type="button" className={`rounded-md px-3 py-1 transition ${gorunum === "ay" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>Ay</button>
          </div>
          <button onClick={bugune} className="btn-outline btn-sm" type="button">Bugün</button>
        </div>
      </div>

      {/* Ajanda (liste) görünümü */}
      {gorunum === "liste" && (
        agenda.length === 0 ? (
          <div className="card p-8 text-center text-sm text-stone-500">Bu ay planlanmış iş yok.</div>
        ) : (
          <div className="space-y-5">
            {agenda.map(({ tarih, gunIsler }) => {
              const bugunMu = ayniGun(tarih, bugun);
              return (
                <div key={tarih.toISOString()}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`flex h-9 w-9 flex-col items-center justify-center rounded-lg text-sm font-bold ${bugunMu ? "bg-brand-500 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}>
                      {tarih.getDate()}
                    </span>
                    <span className="text-sm font-medium text-stone-600">
                      {GUN_ISIMLERI[(tarih.getDay() + 6) % 7]} · {AY_ISIMLERI[tarih.getMonth()]}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {gunIsler.map((is) => (
                      <Link key={is.id} href={`/panel/isler/${is.id}`} className={`card flex items-center justify-between gap-3 border-l-4 p-3 transition hover:border-brand-200 ${DURUM_RENK[is.durum] || ""}`}>
                        <div className="min-w-0">
                          <div className="truncate font-semibold text-stone-900">{is.baslik}</div>
                          <div className="mt-0.5 text-xs text-stone-500">{saatStr(is.baslangic)}{is.musteriler?.ad ? ` · ${is.musteriler.ad}` : ""}</div>
                        </div>
                        <span className={`badge shrink-0 ${TIP_RENK[is.tip] || TIP_RENK.diger}`}>{TIP_LABEL[is.tip] || is.tip}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Takvim Grid (Ay görünümü) */}
      {gorunum === "ay" && (
      <div className="card overflow-x-auto">
        {/* Gün başlıkları */}
        <div className="grid min-w-[640px] grid-cols-7 border-b border-stone-200">
          {GUN_ISIMLERI.map((g) => (
            <div key={g} className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-stone-500">
              {g}
            </div>
          ))}
        </div>

        {/* Günler */}
        <div className="grid min-w-[640px] grid-cols-7">
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
      )}

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

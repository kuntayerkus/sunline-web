"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Boxes, DoorOpen } from "lucide-react";

export type Kaynak = { id: string; ad: string; alt: string | null };
export type Rezervasyon = {
  kaynakId: string;
  is: { id: string; baslik: string; baslangic: string; bitis: string; durum: string } | null;
};

const MESGUL_DURUMLAR = ["talep", "teklif", "onayli"];

function nowLocal(offsetGun = 0): string {
  const d = new Date(Date.now() + offsetGun * 86400000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function Bolum({
  baslik, icon: Icon, kaynaklar, rez, bas, bit,
}: {
  baslik: string;
  icon: typeof Boxes;
  kaynaklar: Kaynak[];
  rez: Rezervasyon[];
  bas: Date;
  bit: Date;
}) {
  // kaynakId -> çakışan iş (varsa)
  const durum = useMemo(() => {
    const harita = new Map<string, { id: string; baslik: string } | null>();
    for (const k of kaynaklar) harita.set(k.id, null);
    for (const r of rez) {
      if (!r.is || !MESGUL_DURUMLAR.includes(r.is.durum)) continue;
      const jb = new Date(r.is.baslangic);
      const je = new Date(r.is.bitis);
      if (jb < bit && je > bas) {
        if (harita.has(r.kaynakId) && !harita.get(r.kaynakId)) {
          harita.set(r.kaynakId, { id: r.is.id, baslik: r.is.baslik });
        }
      }
    }
    return harita;
  }, [kaynaklar, rez, bas, bit]);

  const sirali = [...kaynaklar].sort((a, b) => {
    const da = durum.get(a.id) ? 1 : 0;
    const db = durum.get(b.id) ? 1 : 0;
    return da - db || a.ad.localeCompare(b.ad, "tr");
  });

  const bosSayisi = kaynaklar.filter((k) => !durum.get(k.id)).length;

  if (kaynaklar.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={17} className="text-stone-400" />
        <h3 className="font-semibold text-stone-900">{baslik}</h3>
        <span className="text-sm text-stone-400">{bosSayisi}/{kaynaklar.length} boş</span>
      </div>
      <div className="space-y-2">
        {sirali.map((k) => {
          const mesgul = durum.get(k.id);
          return (
            <div key={k.id} className={`card flex items-center justify-between gap-3 p-3 ${mesgul ? "" : "ring-1 ring-emerald-100"}`}>
              <div className="min-w-0">
                <div className="truncate font-medium text-stone-900">{k.ad}</div>
                {k.alt && <div className="text-xs text-stone-400">{k.alt}</div>}
              </div>
              {mesgul ? (
                <Link href={`/panel/isler/${mesgul.id}`} className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-red-600">
                  <XCircle size={16} /> <span className="max-w-[120px] truncate">{mesgul.baslik}</span>
                </Link>
              ) : (
                <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-emerald-600">
                  <CheckCircle2 size={16} /> Boş
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MusaitlikClient({
  ekipman, oda, ekipmanRez, odaRez,
}: {
  ekipman: Kaynak[];
  oda: Kaynak[];
  ekipmanRez: Rezervasyon[];
  odaRez: Rezervasyon[];
}) {
  const [basStr, setBasStr] = useState(nowLocal(0));
  const [bitStr, setBitStr] = useState(nowLocal(1));

  const bas = new Date(basStr);
  const bit = new Date(bitStr);
  const gecerli = bit > bas;

  return (
    <div className="space-y-6">
      {/* Tarih aralığı */}
      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Başlangıç</label>
            <input type="datetime-local" value={basStr} onChange={(e) => setBasStr(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Bitiş</label>
            <input type="datetime-local" value={bitStr} onChange={(e) => setBitStr(e.target.value)} className="input" />
          </div>
        </div>
        {!gecerli && <p className="mt-2 text-sm text-red-600">Bitiş, başlangıçtan sonra olmalı.</p>}
      </div>

      {gecerli && (
        <>
          <Bolum baslik="Ekipman" icon={Boxes} kaynaklar={ekipman} rez={ekipmanRez} bas={bas} bit={bit} />
          <Bolum baslik="Stüdyo Odaları" icon={DoorOpen} kaynaklar={oda} rez={odaRez} bas={bas} bit={bit} />
        </>
      )}
    </div>
  );
}

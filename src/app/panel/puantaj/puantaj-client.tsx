"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Check, Plus, HardHat } from "lucide-react";
import { paraTL } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { puantajGiderEkle } from "./actions";

export type Atama = {
  id: string;
  ekip_id: string;
  rol: string | null;
  ekip: { ad: string; gunluk_ucret: number; aktif: boolean } | null;
  isler: { baslik: string; baslangic: string; bitis: string; durum: string } | null;
};

function buAy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function ayKaydir(ay: string, delta: number): string {
  const [y, m] = ay.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function ayEtiket(ay: string): string {
  const [y, m] = ay.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(new Date(y, m - 1, 1));
}
function gunSayisi(bas: string, bit: string): number {
  const d1 = new Date(bas.slice(0, 10));
  const d2 = new Date(bit.slice(0, 10));
  const gun = Math.floor((d2.getTime() - d1.getTime()) / 86400000) + 1;
  return Math.max(1, gun);
}

type Satir = { id: string; ad: string; isSayisi: number; gun: number; tutar: number };

function PersonSatiri({ s, ay }: { s: Satir; ay: string }) {
  const [pending, startTransition] = useTransition();
  const [eklendi, setEklendi] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  function maliyeEkle() {
    setHata(null);
    startTransition(async () => {
      const res = await puantajGiderEkle(s.ad, ay, s.tutar);
      if (res?.error) setHata(res.error);
      else setEklendi(true);
    });
  }

  return (
    <div className="card p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold text-stone-900">{s.ad}</div>
          <div className="mt-0.5 text-xs text-stone-500">{s.isSayisi} iş · {s.gun} gün</div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-bold text-stone-900">{paraTL(s.tutar)}</div>
          {eklendi ? (
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <Check size={13} /> Mali&apos;ye eklendi
            </span>
          ) : (
            <button
              onClick={maliyeEkle}
              disabled={pending || s.tutar <= 0}
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline disabled:opacity-50"
            >
              <Plus size={13} /> Mali&apos;ye gider ekle
            </button>
          )}
        </div>
      </div>
      {hata && <p className="mt-2 text-xs text-red-600">{hata}</p>}
    </div>
  );
}

export function PuantajClient({ atamalar }: { atamalar: Atama[] }) {
  const [ay, setAy] = useState<string>(buAy());

  const { satirlar, toplam } = useMemo(() => {
    const ayAtamalar = atamalar.filter(
      (a) => a.isler && a.isler.baslangic.slice(0, 7) === ay && a.isler.durum !== "iptal",
    );
    const map = new Map<string, Satir>();
    ayAtamalar.forEach((a) => {
      const gun = gunSayisi(a.isler!.baslangic, a.isler!.bitis);
      const ucret = a.ekip?.gunluk_ucret || 0;
      const cur = map.get(a.ekip_id) || { id: a.ekip_id, ad: a.ekip?.ad || "—", isSayisi: 0, gun: 0, tutar: 0 };
      cur.isSayisi += 1;
      cur.gun += gun;
      cur.tutar += gun * ucret;
      map.set(a.ekip_id, cur);
    });
    const satirlar = Array.from(map.values()).sort((a, b) => b.tutar - a.tutar);
    return { satirlar, toplam: satirlar.reduce((s, r) => s + r.tutar, 0) };
  }, [atamalar, ay]);

  return (
    <div className="space-y-5">
      {/* Ay seçici */}
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setAy(ayKaydir(ay, -1))} className="btn-outline btn-sm px-3" aria-label="Önceki ay">
          <ChevronLeft size={18} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-base font-semibold capitalize text-stone-900">{ayEtiket(ay)}</span>
          {ay !== buAy() && (
            <button onClick={() => setAy(buAy())} className="text-xs text-brand-600 hover:underline">Bu aya dön</button>
          )}
        </div>
        <button onClick={() => setAy(ayKaydir(ay, 1))} className="btn-outline btn-sm px-3" aria-label="Sonraki ay">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Toplam */}
      <div className="card p-4">
        <h3 className="text-sm font-medium text-stone-500">Bu ay toplam yevmiye</h3>
        <p className="mt-1 text-2xl font-bold text-stone-900">{paraTL(toplam)}</p>
      </div>

      {satirlar.length === 0 ? (
        <EmptyState
          icon={HardHat}
          baslik="Bu ay puantaj yok"
          aciklama="Bu ay işlere atanmış ekip üyesi bulunamadı. İş detayından ekip atayın."
        />
      ) : (
        <div className="space-y-2.5">
          {satirlar.map((s) => (
            <PersonSatiri key={s.id} s={s} ay={ay} />
          ))}
        </div>
      )}

      <p className="text-xs text-stone-400">
        Gün sayısı işin başlangıç–bitiş tarih aralığından hesaplanır (en az 1 gün). İptal edilen işler hariç tutulur.
      </p>
    </div>
  );
}

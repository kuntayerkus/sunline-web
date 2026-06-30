"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, CalendarDays } from "lucide-react";
import type { Is, Musteri } from "@/lib/types";
import { paraTL, tarihAralik } from "@/lib/format";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { isSil } from "./actions";
import { IsFormu } from "./is-form-client";

type IsWithMusteri = Is & { musteriler?: { ad: string } | null };

const DURUM_RENK: Record<string, string> = {
  talep: "bg-amber-100 text-amber-700",
  teklif: "bg-sky-100 text-sky-700",
  onayli: "bg-emerald-100 text-emerald-700",
  tamamlandi: "bg-stone-100 text-stone-600",
  iptal: "bg-red-100 text-red-700",
};

const TIP_RENK: Record<string, string> = {
  backline: "bg-orange-100 text-orange-700",
  prova: "bg-violet-100 text-violet-700",
  kayit: "bg-sky-100 text-sky-700",
  mix: "bg-emerald-100 text-emerald-700",
  mastering: "bg-pink-100 text-pink-700",
  diger: "bg-stone-100 text-stone-600",
};

export function IslerListesi({ isler, musteriler, envanterler }: { isler: IsWithMusteri[], musteriler: Musteri[], envanterler: any[] }) {
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<Is | null>(null);
  const [silinecekId, setSilinecekId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex gap-2">
          {/* Filitreler buraya eklenebilir */}
        </div>
        <button onClick={() => setFormAcik(true)} className="btn-primary">
          <Plus size={16} /> Yeni İş
        </button>
      </div>

      {isler.length === 0 ? (
        <EmptyState icon={CalendarDays} baslik="Henüz iş kaydı yok" aciklama="Yeni iş ekleyerek başlayın." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Başlık</th>
                <th>Müşteri</th>
                <th>Tarih</th>
                <th>Tip</th>
                <th>Durum</th>
                <th>Tutar</th>
                <th className="w-[100px]"></th>
              </tr>
            </thead>
            <tbody>
              {isler.map((is) => (
                <tr key={is.id}>
                  <td>
                    <Link href={`/panel/isler/${is.id}`} className="font-medium text-brand-600 hover:underline">
                      {is.baslik}
                    </Link>
                  </td>
                  <td>{is.musteriler?.ad || "—"}</td>
                  <td>{tarihAralik(is.baslangic, is.bitis)}</td>
                  <td>
                    <span className={`badge ${TIP_RENK[is.tip] || TIP_RENK.diger}`}>{is.tip}</span>
                  </td>
                  <td>
                    <span className={`badge ${DURUM_RENK[is.durum] || ""}`}>{is.durum}</span>
                  </td>
                  <td>{paraTL(is.tutar)}</td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setDuzenlenen(is); setFormAcik(true); }} className="btn-ghost btn-sm px-2">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setSilinecekId(is.id)} className="btn-ghost btn-sm px-2 text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(formAcik || duzenlenen) && (
        <IsFormu
          is={duzenlenen}
          musteriler={musteriler}
          envanterler={envanterler}
          onClose={() => { setFormAcik(false); setDuzenlenen(null); }}
        />
      )}

      <ConfirmDialog
        open={!!silinecekId}
        onClose={() => setSilinecekId(null)}
        onConfirm={() => silinecekId && isSil(silinecekId)}
      />
    </div>
  );
}

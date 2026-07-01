"use client";

import { useState, useTransition } from "react";
import { HardHat, Pencil, Trash2, Plus, Phone } from "lucide-react";
import type { Ekip } from "@/lib/types";
import { paraTL } from "@/lib/format";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ekipEkle, ekipGuncelle, ekipSil } from "./actions";

export function EkipListesi({ ekipUyeleri }: { ekipUyeleri: Ekip[] }) {
  const [formAcik, setFormAcik] = useState(false);
  const [duzenle, setDuzenle] = useState<Ekip | null>(null);
  const [silId, setSilId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function acDuzenle(e: Ekip) {
    setDuzenle(e);
    setFormAcik(true);
  }

  function kapat() {
    setFormAcik(false);
    setDuzenle(null);
  }

  function onaySil() {
    if (!silId) return;
    startTransition(async () => {
      const res = await ekipSil(silId);
      if (res?.error) alert(res.error);
      setSilId(null);
    });
  }

  if (ekipUyeleri.length === 0 && !formAcik) {
    return (
      <>
        <EmptyState
          icon={HardHat}
          baslik="Henüz ekip üyesi yok"
          aciklama="Teknisyen ve ekip üyelerini ekleyerek başlayın."
        >
          <button className="btn-primary btn-sm" onClick={() => setFormAcik(true)}>
            <Plus size={16} />
            Ekip Üyesi Ekle
          </button>
        </EmptyState>
        <EkipFormu open={formAcik} onClose={kapat} ekipUyesi={duzenle} />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button className="btn-primary btn-sm" onClick={() => setFormAcik(true)}>
          <Plus size={16} />
          Ekip Üyesi Ekle
        </button>
      </div>

      {/* Mobil: kartlar */}
      <div className="space-y-2.5 md:hidden">
        {ekipUyeleri.map((e) => (
          <div key={e.id} className="card p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold text-stone-900">{e.ad}</span>
                  <span className={`badge ${e.aktif ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-500"}`}>{e.aktif ? "Aktif" : "Pasif"}</span>
                </div>
                <div className="mt-0.5 text-xs text-stone-500">{e.uzmanlik || "—"} · {paraTL(e.gunluk_ucret)}/gün</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button className="btn-ghost btn-sm px-1.5" aria-label="Düzenle" onClick={() => acDuzenle(e)}><Pencil size={15} /></button>
                <button className="btn-ghost btn-sm px-1.5 text-red-500" aria-label="Sil" onClick={() => setSilId(e.id)}><Trash2 size={15} /></button>
              </div>
            </div>
            {e.telefon && (
              <a href={`tel:${e.telefon}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                <Phone size={14} /> {e.telefon}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Masaüstü: tablo */}
      <div className="card hidden overflow-hidden md:block">
        <table className="tbl">
          <thead>
            <tr>
              <th>Ad</th>
              <th>Uzmanlık</th>
              <th>Telefon</th>
              <th>Günlük Ücret</th>
              <th>Durum</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {ekipUyeleri.map((e) => (
              <tr key={e.id}>
                <td className="font-medium text-stone-900">{e.ad}</td>
                <td>
                  {e.uzmanlik ? (
                    <span className="text-stone-600">{e.uzmanlik}</span>
                  ) : (
                    <span className="text-stone-300">—</span>
                  )}
                </td>
                <td>
                  {e.telefon ? (
                    <span className="text-stone-600">{e.telefon}</span>
                  ) : (
                    <span className="text-stone-300">—</span>
                  )}
                </td>
                <td className="font-medium text-stone-700">
                  {paraTL(e.gunluk_ucret)}
                </td>
                <td>
                  <span
                    className={`badge ${
                      e.aktif
                        ? "bg-green-50 text-green-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {e.aktif ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="btn-ghost btn-sm"
                      title="Düzenle"
                      onClick={() => acDuzenle(e)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-ghost btn-sm text-red-500 hover:text-red-700"
                      title="Sil"
                      onClick={() => setSilId(e.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EkipFormu open={formAcik} onClose={kapat} ekipUyesi={duzenle} />

      <ConfirmDialog
        open={!!silId}
        onClose={() => setSilId(null)}
        onConfirm={onaySil}
        baslik="Ekip Üyesini Sil"
        mesaj="Bu ekip üyesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />
    </>
  );
}

// ── Form Modal ──────────────────────────────────────────

function EkipFormu({
  open,
  onClose,
  ekipUyesi,
}: {
  open: boolean;
  onClose: () => void;
  ekipUyesi: Ekip | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);
  const duzenleModu = !!ekipUyesi;

  function handleSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    setHata(null);
    const form = new FormData(ev.currentTarget);

    // Checkbox'lar FormData'ya sadece "on" gönderir; işaretli değilse hiç gönderilmez
    if (!form.has("aktif")) {
      form.set("aktif", "false");
    }

    startTransition(async () => {
      const res = duzenleModu
        ? await ekipGuncelle(ekipUyesi!.id, form)
        : await ekipEkle(form);

      if (res?.error) {
        setHata(res.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      baslik={duzenleModu ? "Ekip Üyesi Düzenle" : "Yeni Ekip Üyesi"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {hata && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {hata}
          </div>
        )}

        <div>
          <label className="label">
            Ad <span className="text-red-500">*</span>
          </label>
          <input
            name="ad"
            className="input"
            required
            defaultValue={ekipUyesi?.ad ?? ""}
            placeholder="Ad Soyad"
          />
        </div>

        <div>
          <label className="label">Uzmanlık</label>
          <input
            name="uzmanlik"
            className="input"
            defaultValue={ekipUyesi?.uzmanlik ?? ""}
            placeholder="ör. Ses Mühendisi, Teknisyen"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Telefon</label>
            <input
              name="telefon"
              className="input"
              defaultValue={ekipUyesi?.telefon ?? ""}
              placeholder="0555 123 4567"
            />
          </div>
          <div>
            <label className="label">
              Günlük Ücret (₺) <span className="text-red-500">*</span>
            </label>
            <input
              name="gunluk_ucret"
              type="number"
              min="0"
              step="1"
              className="input"
              required
              defaultValue={ekipUyesi?.gunluk_ucret ?? 0}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="aktif"
            id="aktif"
            defaultChecked={ekipUyesi?.aktif ?? true}
            className="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="aktif" className="text-sm text-stone-700">
            Aktif ekip üyesi
          </label>
        </div>

        <div>
          <label className="label">Notlar</label>
          <textarea
            name="notlar"
            className="textarea"
            rows={3}
            defaultValue={ekipUyesi?.notlar ?? ""}
            placeholder="Ek bilgiler..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-outline btn-sm" onClick={onClose}>
            İptal
          </button>
          <button type="submit" className="btn-primary btn-sm" disabled={isPending}>
            {isPending ? "Kaydediliyor..." : duzenleModu ? "Güncelle" : "Ekle"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

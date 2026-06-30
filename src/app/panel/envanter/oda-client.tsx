"use client";

import { useState, useTransition } from "react";
import { Plus, DoorOpen, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { paraTL } from "@/lib/format";
import type { StudyoOda, OdaTip } from "@/lib/types";
import { odaEkle, odaGuncelle, odaSil } from "./actions";

/* ── Tip badge ─────────────────────────────────────────────── */

const tipRenk: Record<OdaTip, string> = {
  prova: "bg-blue-50 text-blue-700 ring-blue-200",
  kayit: "bg-purple-50 text-purple-700 ring-purple-200",
  kontrol: "bg-teal-50 text-teal-700 ring-teal-200",
  diger: "bg-stone-100 text-stone-600 ring-stone-200",
};

const tipLabel: Record<OdaTip, string> = {
  prova: "Prova",
  kayit: "Kayıt",
  kontrol: "Kontrol",
  diger: "Diğer",
};

/* ── Form ──────────────────────────────────────────────────── */

function OdaFormu({
  open,
  onClose,
  oda,
}: {
  open: boolean;
  onClose: () => void;
  oda?: StudyoOda;
}) {
  const [pending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const duzenle = !!oda;

  function handleSubmit(formData: FormData) {
    // checkbox gönderilmezse "aktif" key'i FormData'da olmaz
    if (!formData.has("aktif")) formData.set("aktif", "false");

    setHata(null);
    startTransition(async () => {
      const result = duzenle
        ? await odaGuncelle(oda.id, formData)
        : await odaEkle(formData);
      if (result?.error) {
        setHata(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      baslik={duzenle ? "Oda Düzenle" : "Yeni Oda"}
      boyut="md"
    >
      <form action={handleSubmit} className="space-y-4">
        {hata && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {hata}
          </div>
        )}

        {/* Ad */}
        <div>
          <label className="label">Ad *</label>
          <input
            name="ad"
            defaultValue={oda?.ad}
            required
            className="input"
            placeholder="ör. A Stüdyosu"
          />
        </div>

        {/* Tip */}
        <div>
          <label className="label">Tip</label>
          <select name="tip" defaultValue={oda?.tip ?? "prova"} className="select">
            <option value="prova">Prova</option>
            <option value="kayit">Kayıt</option>
            <option value="kontrol">Kontrol</option>
            <option value="diger">Diğer</option>
          </select>
        </div>

        {/* Ücretler (2-col) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Saatlik Ücret (₺) *</label>
            <input
              name="saatlik_ucret"
              type="number"
              min={0}
              step="0.01"
              defaultValue={oda?.saatlik_ucret ?? ""}
              required
              className="input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">Günlük Ücret (₺) *</label>
            <input
              name="gunluk_ucret"
              type="number"
              min={0}
              step="0.01"
              defaultValue={oda?.gunluk_ucret ?? ""}
              required
              className="input"
              placeholder="0"
            />
          </div>
        </div>

        {/* Açıklama */}
        <div>
          <label className="label">Açıklama</label>
          <textarea
            name="aciklama"
            defaultValue={oda?.aciklama ?? ""}
            rows={3}
            className="textarea"
            placeholder="Oda hakkında notlar..."
          />
        </div>

        {/* Aktif */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            name="aktif"
            type="checkbox"
            defaultChecked={oda?.aktif ?? true}
            className="size-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
          />
          <span className="text-sm text-stone-700">Aktif</span>
        </label>

        {/* Butonlar */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-outline btn-sm">
            İptal
          </button>
          <button type="submit" disabled={pending} className="btn-primary btn-sm">
            {pending ? "Kaydediliyor..." : duzenle ? "Güncelle" : "Ekle"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Liste ─────────────────────────────────────────────────── */

export function OdaSayfasi({ odalar }: { odalar: StudyoOda[] }) {
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<StudyoOda | undefined>();
  const [silinecekId, setSilinecekId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function acDuzenle(o: StudyoOda) {
    setDuzenlenen(o);
    setFormAcik(true);
  }

  function acYeni() {
    setDuzenlenen(undefined);
    setFormAcik(true);
  }

  function kapatForm() {
    setFormAcik(false);
    setDuzenlenen(undefined);
  }

  function handleSil() {
    if (!silinecekId) return;
    startTransition(async () => {
      await odaSil(silinecekId);
      setSilinecekId(null);
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={acYeni} className="btn-primary btn-sm">
          <Plus size={16} />
          Oda Ekle
        </button>
      </div>

      {odalar.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          baslik="Henüz oda yok"
          aciklama="İlk stüdyo odanızı ekleyerek başlayın."
        >
          <button onClick={acYeni} className="btn-primary btn-sm">
            <Plus size={16} />
            Oda Ekle
          </button>
        </EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Ad</th>
                <th className="text-center">Tip</th>
                <th className="text-right">Saatlik</th>
                <th className="text-right">Günlük</th>
                <th className="text-center">Durum</th>
                <th className="text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {odalar.map((o) => (
                <tr key={o.id} className="group">
                  <td className="font-medium text-stone-900">{o.ad}</td>
                  <td className="text-center">
                    <span className={`badge ring-1 ${tipRenk[o.tip]}`}>
                      {tipLabel[o.tip]}
                    </span>
                  </td>
                  <td className="text-right font-medium tabular-nums">
                    {paraTL(o.saatlik_ucret)}
                  </td>
                  <td className="text-right font-medium tabular-nums">
                    {paraTL(o.gunluk_ucret)}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge ring-1 ${
                        o.aktif
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-stone-100 text-stone-500 ring-stone-200"
                      }`}
                    >
                      {o.aktif ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => acDuzenle(o)}
                        className="btn-ghost btn-sm"
                        title="Düzenle"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setSilinecekId(o.id)}
                        className="btn-ghost btn-sm text-red-500 hover:text-red-700"
                        title="Sil"
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
      )}

      <OdaFormu open={formAcik} onClose={kapatForm} oda={duzenlenen} />

      <ConfirmDialog
        open={!!silinecekId}
        onClose={() => setSilinecekId(null)}
        onConfirm={handleSil}
        baslik="Odayı Sil"
        mesaj="Bu odayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />
    </>
  );
}

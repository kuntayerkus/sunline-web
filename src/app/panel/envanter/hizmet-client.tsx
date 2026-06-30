"use client";

import { useState, useTransition } from "react";
import { Plus, Wrench, Pencil, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { paraTL } from "@/lib/format";
import type { Hizmet, HizmetKategori, HizmetBirim } from "@/lib/types";
import { hizmetEkle, hizmetGuncelle, hizmetSil } from "./actions";

/* ── Kategori badge ────────────────────────────────────────── */

const kategoriRenk: Record<HizmetKategori, string> = {
  studyo: "bg-purple-50 text-purple-700 ring-purple-200",
  backline: "bg-blue-50 text-blue-700 ring-blue-200",
  diger: "bg-stone-100 text-stone-600 ring-stone-200",
};

const kategoriLabel: Record<HizmetKategori, string> = {
  studyo: "Stüdyo",
  backline: "Backline",
  diger: "Diğer",
};

const birimLabel: Record<HizmetBirim, string> = {
  saat: "Saat",
  gun: "Gün",
  proje: "Proje",
  sarki: "Şarkı",
  adet: "Adet",
};

/* ── Form ──────────────────────────────────────────────────── */

function HizmetFormu({
  open,
  onClose,
  hizmet,
}: {
  open: boolean;
  onClose: () => void;
  hizmet?: Hizmet;
}) {
  const [pending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);

  const duzenle = !!hizmet;

  function handleSubmit(formData: FormData) {
    if (!formData.has("aktif")) formData.set("aktif", "false");

    setHata(null);
    startTransition(async () => {
      const result = duzenle
        ? await hizmetGuncelle(hizmet.id, formData)
        : await hizmetEkle(formData);
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
      baslik={duzenle ? "Hizmet Düzenle" : "Yeni Hizmet"}
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
            defaultValue={hizmet?.ad}
            required
            className="input"
            placeholder="ör. Kayıt Mühendisliği"
          />
        </div>

        {/* Kategori + Birim (2-col) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Kategori</label>
            <select
              name="kategori"
              defaultValue={hizmet?.kategori ?? "studyo"}
              className="select"
            >
              <option value="studyo">Stüdyo</option>
              <option value="backline">Backline</option>
              <option value="diger">Diğer</option>
            </select>
          </div>
          <div>
            <label className="label">Birim</label>
            <select
              name="birim"
              defaultValue={hizmet?.birim ?? "saat"}
              className="select"
            >
              <option value="saat">Saat</option>
              <option value="gun">Gün</option>
              <option value="proje">Proje</option>
              <option value="sarki">Şarkı</option>
              <option value="adet">Adet</option>
            </select>
          </div>
        </div>

        {/* Birim Ücret */}
        <div>
          <label className="label">Birim Ücret (₺) *</label>
          <input
            name="birim_ucret"
            type="number"
            min={0}
            step="0.01"
            defaultValue={hizmet?.birim_ucret ?? ""}
            required
            className="input"
            placeholder="0"
          />
        </div>

        {/* Aktif */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            name="aktif"
            type="checkbox"
            defaultChecked={hizmet?.aktif ?? true}
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

export function HizmetSayfasi({ hizmetler }: { hizmetler: Hizmet[] }) {
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<Hizmet | undefined>();
  const [silinecekId, setSilinecekId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function acDuzenle(h: Hizmet) {
    setDuzenlenen(h);
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
      await hizmetSil(silinecekId);
      setSilinecekId(null);
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={acYeni} className="btn-primary btn-sm">
          <Plus size={16} />
          Hizmet Ekle
        </button>
      </div>

      {hizmetler.length === 0 ? (
        <EmptyState
          icon={Wrench}
          baslik="Henüz hizmet yok"
          aciklama="İlk hizmetinizi ekleyerek başlayın."
        >
          <button onClick={acYeni} className="btn-primary btn-sm">
            <Plus size={16} />
            Hizmet Ekle
          </button>
        </EmptyState>
      ) : (
        <>
        {/* Mobil: kartlar */}
        <div className="space-y-2.5 md:hidden">
          {hizmetler.map((h) => (
            <div key={h.id} className="card flex items-start justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="truncate font-semibold text-stone-900">{h.ad}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className={`badge ring-1 ${kategoriRenk[h.kategori]}`}>{kategoriLabel[h.kategori]}</span>
                  <span className="badge bg-stone-100 text-stone-600">{birimLabel[h.birim]}</span>
                  {!h.aktif && <span className="badge bg-stone-100 text-stone-500">Pasif</span>}
                </div>
                <div className="mt-1 text-sm font-medium text-stone-700">{paraTL(h.birim_ucret)}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => acDuzenle(h)} className="btn-ghost btn-sm px-1.5" aria-label="Düzenle"><Pencil size={15} /></button>
                <button onClick={() => setSilinecekId(h.id)} className="btn-ghost btn-sm px-1.5 text-red-500" aria-label="Sil"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Masaüstü: tablo */}
        <div className="hidden overflow-x-auto md:block">
          <table className="tbl">
            <thead>
              <tr>
                <th>Ad</th>
                <th className="text-center">Kategori</th>
                <th className="text-center">Birim</th>
                <th className="text-right">Birim Ücret</th>
                <th className="text-center">Durum</th>
                <th className="text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {hizmetler.map((h) => (
                <tr key={h.id} className="group">
                  <td className="font-medium text-stone-900">{h.ad}</td>
                  <td className="text-center">
                    <span className={`badge ring-1 ${kategoriRenk[h.kategori]}`}>
                      {kategoriLabel[h.kategori]}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-stone-100 text-stone-600">
                      {birimLabel[h.birim]}
                    </span>
                  </td>
                  <td className="text-right font-medium tabular-nums">
                    {paraTL(h.birim_ucret)}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge ring-1 ${
                        h.aktif
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-stone-100 text-stone-500 ring-stone-200"
                      }`}
                    >
                      {h.aktif ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => acDuzenle(h)}
                        className="btn-ghost btn-sm"
                        title="Düzenle"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setSilinecekId(h.id)}
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
        </>
      )}

      <HizmetFormu open={formAcik} onClose={kapatForm} hizmet={duzenlenen} />

      <ConfirmDialog
        open={!!silinecekId}
        onClose={() => setSilinecekId(null)}
        onConfirm={handleSil}
        baslik="Hizmeti Sil"
        mesaj="Bu hizmeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />
    </>
  );
}

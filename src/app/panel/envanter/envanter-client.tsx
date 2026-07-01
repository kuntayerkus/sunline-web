"use client";

import { useState, useTransition } from "react";
import { Plus, Package, Pencil, Trash2, Wrench } from "lucide-react";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { paraTL } from "@/lib/format";
import type { Envanter, EnvanterDurum, EnvanterTakip } from "@/lib/types";
import { ekipmanEkle, ekipmanGuncelle, ekipmanSil } from "./actions";

/* ── Durum badge renkleri ──────────────────────────────────── */

const durumRenk: Record<EnvanterDurum, string> = {
  aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  bakimda: "bg-amber-50 text-amber-700 ring-amber-200",
  arizali: "bg-red-50 text-red-700 ring-red-200",
  elden_cikti: "bg-stone-100 text-stone-500 ring-stone-200",
};

const durumLabel: Record<EnvanterDurum, string> = {
  aktif: "Aktif",
  bakimda: "Bakımda",
  arizali: "Arızalı",
  elden_cikti: "Elden Çıktı",
};

/* ── Form Bileşeni ─────────────────────────────────────────── */

function EkipmanFormu({
  open,
  onClose,
  ekipman,
}: {
  open: boolean;
  onClose: () => void;
  ekipman?: Envanter;
}) {
  const [pending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);
  const [takip, setTakip] = useState<EnvanterTakip>(ekipman?.takip ?? "adet");

  const duzenle = !!ekipman;

  function handleSubmit(formData: FormData) {
    setHata(null);
    startTransition(async () => {
      const result = duzenle
        ? await ekipmanGuncelle(ekipman.id, formData)
        : await ekipmanEkle(formData);
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
      baslik={duzenle ? "Ekipman Düzenle" : "Yeni Ekipman"}
      boyut="lg"
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
            defaultValue={ekipman?.ad}
            required
            className="input"
            placeholder="ör. Shure SM58"
          />
        </div>

        {/* Kategori + Marka + Model (3-col) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Kategori</label>
            <input
              name="kategori"
              defaultValue={ekipman?.kategori ?? ""}
              className="input"
              placeholder="ör. Mikrofon"
            />
          </div>
          <div>
            <label className="label">Marka</label>
            <input
              name="marka"
              defaultValue={ekipman?.marka ?? ""}
              className="input"
              placeholder="ör. Shure"
            />
          </div>
          <div>
            <label className="label">Model</label>
            <input
              name="model"
              defaultValue={ekipman?.model ?? ""}
              className="input"
              placeholder="ör. SM58"
            />
          </div>
        </div>

        {/* Takip + Adet + Seri No (3-col) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Takip</label>
            <select
              name="takip"
              value={takip}
              onChange={(e) => setTakip(e.target.value as EnvanterTakip)}
              className="select"
            >
              <option value="adet">Adet</option>
              <option value="tekil">Tekil</option>
            </select>
          </div>
          <div>
            <label className="label">Adet</label>
            <input
              name="adet"
              type="number"
              min={1}
              defaultValue={ekipman?.adet ?? 1}
              disabled={takip === "tekil"}
              className="input"
            />
          </div>
          <div>
            <label className="label">Seri No</label>
            <input
              name="seri_no"
              defaultValue={ekipman?.seri_no ?? ""}
              className="input"
            />
          </div>
        </div>

        {/* Günlük Ücret + Durum (2-col) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Günlük Ücret (₺) *</label>
            <input
              name="gunluk_ucret"
              type="number"
              min={0}
              step="0.01"
              defaultValue={ekipman?.gunluk_ucret ?? ""}
              required
              className="input"
              placeholder="0"
            />
          </div>
          <div>
            <label className="label">Durum</label>
            <select
              name="durum"
              defaultValue={ekipman?.durum ?? "aktif"}
              className="select"
            >
              <option value="aktif">Aktif</option>
              <option value="bakimda">Bakımda</option>
              <option value="arizali">Arızalı</option>
              <option value="elden_cikti">Elden Çıktı</option>
            </select>
          </div>
        </div>

        {/* Açıklama */}
        <div>
          <label className="label">Açıklama</label>
          <textarea
            name="aciklama"
            defaultValue={ekipman?.aciklama ?? ""}
            rows={3}
            className="textarea"
            placeholder="Ekipman hakkında notlar..."
          />
        </div>

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

/* ── Liste Bileşeni ────────────────────────────────────────── */

const DURUM_FILTRELER: { key: "hepsi" | EnvanterDurum; label: string }[] = [
  { key: "hepsi", label: "Tümü" },
  { key: "aktif", label: "Aktif" },
  { key: "bakimda", label: "Bakımda" },
  { key: "arizali", label: "Arızalı" },
  { key: "elden_cikti", label: "Elden Çıktı" },
];

export function EnvanterSayfasi({ ekipmanlar }: { ekipmanlar: Envanter[] }) {
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<Envanter | undefined>();
  const [silinecekId, setSilinecekId] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<"hepsi" | EnvanterDurum>("hepsi");
  const [, startTransition] = useTransition();

  function acDuzenle(e: Envanter) {
    setDuzenlenen(e);
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
      const res = await ekipmanSil(silinecekId);
      if (res?.error) alert(res.error);
      setSilinecekId(null);
    });
  }

  const bakimSayisi = ekipmanlar.filter((e) => e.durum === "bakimda" || e.durum === "arizali").length;
  const liste = filtre === "hepsi" ? ekipmanlar : ekipmanlar.filter((e) => e.durum === filtre);

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        {/* Bakım takibi uyarısı */}
        {bakimSayisi > 0 ? (
          <button
            onClick={() => setFiltre("bakimda")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 ring-1 ring-amber-200"
          >
            <Wrench size={15} /> {bakimSayisi} ekipman bakımda/arızalı
          </button>
        ) : <span />}
        <button onClick={acYeni} className="btn-primary btn-sm shrink-0">
          <Plus size={16} />
          Ekipman Ekle
        </button>
      </div>

      {/* Durum filtreleri */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {DURUM_FILTRELER.map((f) => {
          const sayi = f.key === "hepsi" ? ekipmanlar.length : ekipmanlar.filter((e) => e.durum === f.key).length;
          const aktif = filtre === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                aktif ? "bg-brand-500 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
              }`}
            >
              {f.label} <span className={aktif ? "text-white/80" : "text-stone-400"}>{sayi}</span>
            </button>
          );
        })}
      </div>

      {ekipmanlar.length === 0 ? (
        <EmptyState
          icon={Package}
          baslik="Henüz ekipman yok"
          aciklama="İlk ekipmanınızı ekleyerek envanter yönetimine başlayın."
        >
          <button onClick={acYeni} className="btn-primary btn-sm">
            <Plus size={16} />
            Ekipman Ekle
          </button>
        </EmptyState>
      ) : liste.length === 0 ? (
        <EmptyState icon={Package} baslik="Bu durumda ekipman yok" aciklama="Farklı bir filtre seçin." />
      ) : (
        <>
          {/* Mobil: kartlar */}
          <div className="space-y-2.5 md:hidden">
            {liste.map((e) => (
              <div key={e.id} className="card flex items-start justify-between gap-3 p-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-stone-900">{e.ad}</div>
                  <div className="mt-0.5 truncate text-xs text-stone-500">
                    {[e.kategori, [e.marka, e.model].filter(Boolean).join(" ")].filter(Boolean).join(" · ") || "—"}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className={`badge ring-1 ${durumRenk[e.durum]}`}>{durumLabel[e.durum]}</span>
                    <span className="badge bg-stone-100 text-stone-600">
                      {e.takip === "tekil" ? "Tekil" : `${e.adet} adet`}
                    </span>
                    <span className="text-sm font-medium text-stone-700">{paraTL(e.gunluk_ucret)}<span className="text-xs font-normal text-stone-400">/gün</span></span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => acDuzenle(e)} className="btn-ghost btn-sm px-1.5" aria-label="Düzenle"><Pencil size={15} /></button>
                  <button onClick={() => setSilinecekId(e.id)} className="btn-ghost btn-sm px-1.5 text-red-500" aria-label="Sil"><Trash2 size={15} /></button>
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
                  <th>Kategori</th>
                  <th>Marka / Model</th>
                  <th>Takip</th>
                  <th className="text-center">Adet</th>
                  <th className="text-right">Günlük Ücret</th>
                  <th className="text-center">Durum</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {liste.map((e) => (
                  <tr key={e.id} className="group">
                    <td className="font-medium text-stone-900">{e.ad}</td>
                    <td className="text-stone-500">{e.kategori ?? "—"}</td>
                    <td className="text-stone-500">
                      {[e.marka, e.model].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td>
                      <span className="badge bg-stone-100 text-stone-600">
                        {e.takip === "tekil" ? "Tekil" : "Adet"}
                      </span>
                    </td>
                    <td className="text-center">{e.adet}</td>
                    <td className="text-right font-medium tabular-nums">
                      {paraTL(e.gunluk_ucret)}
                    </td>
                    <td className="text-center">
                      <span className={`badge ring-1 ${durumRenk[e.durum]}`}>
                        {durumLabel[e.durum]}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => acDuzenle(e)} className="btn-ghost btn-sm" title="Düzenle">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setSilinecekId(e.id)} className="btn-ghost btn-sm text-red-500 hover:text-red-700" title="Sil">
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

      {/* Form Modal */}
      <EkipmanFormu
        open={formAcik}
        onClose={kapatForm}
        ekipman={duzenlenen}
      />

      {/* Silme Onayı */}
      <ConfirmDialog
        open={!!silinecekId}
        onClose={() => setSilinecekId(null)}
        onConfirm={handleSil}
        baslik="Ekipmanı Sil"
        mesaj="Bu ekipmanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />
    </>
  );
}

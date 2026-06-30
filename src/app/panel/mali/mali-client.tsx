"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Wallet } from "lucide-react";
import type { MaliHareket, Is } from "@/lib/types";
import { paraTL, tarihKisa } from "@/lib/format";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import { hareketEkle, hareketGuncelle, hareketSil } from "./actions";

function HareketFormu({
  hareket,
  isler,
  onClose,
}: {
  hareket?: MaliHareket | null;
  isler: Is[];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = hareket ? await hareketGuncelle(hareket.id, formData) : await hareketEkle(formData);
    setLoading(false);
    if (res?.error) setError(res.error);
    else onClose();
  }

  return (
    <Modal open onClose={onClose} baslik={hareket ? "Hareketi Düzenle" : "Yeni Mali Hareket"} boyut="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tip *</label>
            <select name="tip" required defaultValue={hareket?.tip || "gelir"} className="select">
              <option value="gelir">Gelir</option>
              <option value="gider">Gider</option>
            </select>
          </div>
          <div>
            <label className="label">Kategori</label>
            <input name="kategori" defaultValue={hareket?.kategori || ""} className="input" placeholder="Örn: Kira, Stüdyo Kayıt..." />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tutar (₺) *</label>
            <input type="number" name="tutar" step="0.01" min="0.01" required defaultValue={hareket?.tutar || ""} className="input" />
          </div>
          <div>
            <label className="label">Tarih *</label>
            <input type="date" name="tarih" required defaultValue={hareket?.tarih || new Date().toISOString().slice(0, 10)} className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Ödeme Yöntemi</label>
            <select name="odeme_yontemi" defaultValue={hareket?.odeme_yontemi || ""} className="select">
              <option value="">-- Seçin --</option>
              <option value="nakit">Nakit</option>
              <option value="havale">Havale / EFT</option>
              <option value="kart">Kredi Kartı</option>
              <option value="diger">Diğer</option>
            </select>
          </div>
          <div>
            <label className="label">İlgili İş (Opsiyonel)</label>
            <select name="is_id" defaultValue={hareket?.is_id || ""} className="select">
              <option value="">-- Seçin --</option>
              {isler.map((is) => (
                <option key={is.id} value={is.id}>{is.baslik}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Açıklama</label>
          <textarea name="aciklama" defaultValue={hareket?.aciklama || ""} className="textarea" rows={3} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
          <button type="button" onClick={onClose} className="btn-ghost">İptal</button>
          <button type="submit" disabled={loading} className="btn-primary">Kaydet</button>
        </div>
      </form>
    </Modal>
  );
}

export function MaliClient({
  hareketler,
  isler,
  toplamGelir,
  toplamGider,
  net,
}: {
  hareketler: MaliHareket[];
  isler: Is[];
  toplamGelir: number;
  toplamGider: number;
  net: number;
}) {
  const [formAcik, setFormAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState<MaliHareket | null>(null);
  const [silinecekId, setSilinecekId] = useState<string | null>(null);

  const ODEME_YONTEMI_RENK: Record<string, string> = {
    nakit: "bg-emerald-100 text-emerald-700",
    havale: "bg-sky-100 text-sky-700",
    kart: "bg-violet-100 text-violet-700",
    diger: "bg-stone-100 text-stone-600",
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-stone-500 mb-1">Toplam Gelir</h3>
          <p className="text-2xl font-bold text-emerald-600">{paraTL(toplamGelir)}</p>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-medium text-stone-500 mb-1">Toplam Gider</h3>
          <p className="text-2xl font-bold text-red-600">{paraTL(toplamGider)}</p>
        </div>
        <div className="card p-5">
          <h3 className="text-sm font-medium text-stone-500 mb-1">Net</h3>
          <p className={`text-2xl font-bold ${net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {paraTL(net)}
          </p>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-stone-900">Hareketler</h2>
        <button onClick={() => setFormAcik(true)} className="btn-primary">
          <Plus size={16} /> Yeni Hareket
        </button>
      </div>

      {hareketler.length === 0 ? (
        <EmptyState icon={Wallet} baslik="Henüz mali hareket yok" aciklama="Gelir veya gider ekleyerek başlayın." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Tip</th>
                <th>Kategori</th>
                <th>Açıklama</th>
                <th>Ödeme</th>
                <th>Tutar</th>
                <th className="w-[100px]"></th>
              </tr>
            </thead>
            <tbody>
              {hareketler.map((h) => (
                <tr key={h.id}>
                  <td>{tarihKisa(h.tarih)}</td>
                  <td>
                    <span className={`badge ${h.tip === "gelir" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {h.tip}
                    </span>
                  </td>
                  <td>{h.kategori || "—"}</td>
                  <td>{h.aciklama || "—"}</td>
                  <td>
                    {h.odeme_yontemi ? (
                      <span className={`badge ${ODEME_YONTEMI_RENK[h.odeme_yontemi] || ""}`}>{h.odeme_yontemi}</span>
                    ) : "—"}
                  </td>
                  <td className={`font-medium ${h.tip === "gelir" ? "text-emerald-600" : "text-red-600"}`}>
                    {h.tip === "gelir" ? "+" : "-"}{paraTL(h.tutar)}
                  </td>
                  <td>
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setDuzenlenen(h); setFormAcik(true); }} className="btn-ghost btn-sm px-2">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setSilinecekId(h.id)} className="btn-ghost btn-sm px-2 text-red-600">
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
        <HareketFormu
          hareket={duzenlenen}
          isler={isler}
          onClose={() => { setFormAcik(false); setDuzenlenen(null); }}
        />
      )}

      <ConfirmDialog
        open={!!silinecekId}
        onClose={() => setSilinecekId(null)}
        onConfirm={() => silinecekId && hareketSil(silinecekId)}
      />
    </div>
  );
}

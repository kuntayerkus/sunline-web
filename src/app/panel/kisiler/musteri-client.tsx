"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users, Pencil, Trash2, Plus, Phone, Mail } from "lucide-react";
import type { Musteri, MusteriTip } from "@/lib/types";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { musteriEkle, musteriGuncelle, musteriSil } from "./actions";

const tipRenk: Record<MusteriTip, string> = {
  grup: "bg-violet-50 text-violet-700",
  bireysel: "bg-sky-50 text-sky-700",
  kurumsal: "bg-emerald-50 text-emerald-700",
};

const tipLabel: Record<MusteriTip, string> = {
  grup: "Grup",
  bireysel: "Bireysel",
  kurumsal: "Kurumsal",
};

export function MusteriListesi({ musteriler }: { musteriler: Musteri[] }) {
  const [formAcik, setFormAcik] = useState(false);
  const [duzenle, setDuzenle] = useState<Musteri | null>(null);
  const [silId, setSilId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function acDuzenle(m: Musteri) {
    setDuzenle(m);
    setFormAcik(true);
  }

  function kapat() {
    setFormAcik(false);
    setDuzenle(null);
  }

  function onaySil() {
    if (!silId) return;
    startTransition(async () => {
      const res = await musteriSil(silId);
      if (res?.error) alert(res.error);
      setSilId(null);
    });
  }

  if (musteriler.length === 0 && !formAcik) {
    return (
      <>
        <EmptyState
          icon={Users}
          baslik="Henüz müşteri yok"
          aciklama="Yeni müşteri, grup veya kurum ekleyerek başlayın."
        >
          <button className="btn-primary btn-sm" onClick={() => setFormAcik(true)}>
            <Plus size={16} />
            Müşteri Ekle
          </button>
        </EmptyState>
        <MusteriFormu
          open={formAcik}
          onClose={kapat}
          musteri={duzenle}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button className="btn-primary btn-sm" onClick={() => setFormAcik(true)}>
          <Plus size={16} />
          Müşteri Ekle
        </button>
      </div>

      {/* Mobil: kartlar (telefon/e-posta dokunulabilir) */}
      <div className="space-y-2.5 md:hidden">
        {musteriler.map((m) => (
          <div key={m.id} className="card p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/panel/kisiler/${m.id}`} className="truncate font-semibold text-brand-700 hover:underline">{m.ad}</Link>
                <div><span className={`badge ${tipRenk[m.tip]} mt-1`}>{tipLabel[m.tip]}</span></div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button className="btn-ghost btn-sm px-1.5" aria-label="Düzenle" onClick={() => acDuzenle(m)}><Pencil size={15} /></button>
                <button className="btn-ghost btn-sm px-1.5 text-red-500" aria-label="Sil" onClick={() => setSilId(m.id)}><Trash2 size={15} /></button>
              </div>
            </div>
            {(m.telefon || m.eposta) && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                {m.telefon && (
                  <a href={`tel:${m.telefon}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
                    <Phone size={14} /> {m.telefon}
                  </a>
                )}
                {m.eposta && (
                  <a href={`mailto:${m.eposta}`} className="inline-flex items-center gap-1.5 text-sm text-stone-600">
                    <Mail size={14} className="text-stone-400" /> {m.eposta}
                  </a>
                )}
              </div>
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
              <th>Tip</th>
              <th>Telefon</th>
              <th>E-posta</th>
              <th className="w-20" />
            </tr>
          </thead>
          <tbody>
            {musteriler.map((m) => (
              <tr key={m.id}>
                <td><Link href={`/panel/kisiler/${m.id}`} className="font-medium text-brand-700 hover:underline">{m.ad}</Link></td>
                <td>
                  <span className={`badge ${tipRenk[m.tip]}`}>
                    {tipLabel[m.tip]}
                  </span>
                </td>
                <td>
                  {m.telefon ? (
                    <span className="flex items-center gap-1.5 text-stone-600">
                      <Phone size={14} className="text-stone-400" />
                      {m.telefon}
                    </span>
                  ) : (
                    <span className="text-stone-300">—</span>
                  )}
                </td>
                <td>
                  {m.eposta ? (
                    <span className="flex items-center gap-1.5 text-stone-600">
                      <Mail size={14} className="text-stone-400" />
                      {m.eposta}
                    </span>
                  ) : (
                    <span className="text-stone-300">—</span>
                  )}
                </td>
                <td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="btn-ghost btn-sm"
                      title="Düzenle"
                      onClick={() => acDuzenle(m)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className="btn-ghost btn-sm text-red-500 hover:text-red-700"
                      title="Sil"
                      onClick={() => setSilId(m.id)}
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

      <MusteriFormu
        open={formAcik}
        onClose={kapat}
        musteri={duzenle}
      />

      <ConfirmDialog
        open={!!silId}
        onClose={() => setSilId(null)}
        onConfirm={onaySil}
        baslik="Müşteriyi Sil"
        mesaj="Bu müşteriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />
    </>
  );
}

// ── Form Modal ──────────────────────────────────────────

function MusteriFormu({
  open,
  onClose,
  musteri,
}: {
  open: boolean;
  onClose: () => void;
  musteri: Musteri | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [hata, setHata] = useState<string | null>(null);
  const duzenleModu = !!musteri;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata(null);
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = duzenleModu
        ? await musteriGuncelle(musteri!.id, form)
        : await musteriEkle(form);

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
      baslik={duzenleModu ? "Müşteri Düzenle" : "Yeni Müşteri"}
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
            defaultValue={musteri?.ad ?? ""}
            placeholder="Müşteri veya grup adı"
          />
        </div>

        <div>
          <label className="label">Tip</label>
          <select name="tip" className="select" defaultValue={musteri?.tip ?? "bireysel"}>
            <option value="bireysel">Bireysel</option>
            <option value="grup">Grup</option>
            <option value="kurumsal">Kurumsal</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Telefon</label>
            <input
              name="telefon"
              className="input"
              defaultValue={musteri?.telefon ?? ""}
              placeholder="0555 123 4567"
            />
          </div>
          <div>
            <label className="label">E-posta</label>
            <input
              name="eposta"
              type="email"
              className="input"
              defaultValue={musteri?.eposta ?? ""}
              placeholder="ornek@mail.com"
            />
          </div>
        </div>

        <div>
          <label className="label">Notlar</label>
          <textarea
            name="notlar"
            className="textarea"
            rows={3}
            defaultValue={musteri?.notlar ?? ""}
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

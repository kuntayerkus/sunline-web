"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Edit2, Bell, Check } from "lucide-react";
import type { Hatirlatma } from "@/lib/types";
import { tarihKisa } from "@/lib/format";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { hatirlatmaEkle, hatirlatmaGuncelle, hatirlatmaToggle, hatirlatmaSil } from "./actions";

function bugun(): string {
  return new Date().toISOString().slice(0, 10);
}
function tarihEtiket(t: string): { label: string; renk: string } {
  const b = bugun();
  if (t < b) return { label: "Gecikmiş · " + tarihKisa(t), renk: "text-red-600" };
  if (t === b) return { label: "Bugün", renk: "text-brand-600 font-medium" };
  const yarin = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  if (t === yarin) return { label: "Yarın", renk: "text-amber-600" };
  return { label: tarihKisa(t), renk: "text-stone-500" };
}

function Form({ kayit, onClose }: { kayit?: Hatirlatma | null; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = kayit ? await hatirlatmaGuncelle(kayit.id, fd) : await hatirlatmaEkle(fd);
    setLoading(false);
    if (res?.error) setError(res.error);
    else onClose();
  }

  return (
    <Modal open onClose={onClose} baslik={kayit ? "Hatırlatmayı Düzenle" : "Yeni Hatırlatma"} boyut="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</div>}
        <div>
          <label className="label">Başlık *</label>
          <input name="baslik" required defaultValue={kayit?.baslik || ""} className="input" placeholder="Örn: Gipsy Kings kaporası alınacak" />
        </div>
        <div>
          <label className="label">Tarih *</label>
          <input type="date" name="tarih" required defaultValue={kayit?.tarih || bugun()} className="input" />
        </div>
        <div>
          <label className="label">Açıklama</label>
          <textarea name="aciklama" defaultValue={kayit?.aciklama || ""} className="textarea" rows={2} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost btn-sm">İptal</button>
          <button type="submit" disabled={loading} className="btn-primary btn-sm">Kaydet</button>
        </div>
      </form>
    </Modal>
  );
}

function Satir({ h, onEdit, onDelete }: { h: Hatirlatma; onEdit: () => void; onDelete: () => void }) {
  const [pending, startTransition] = useTransition();
  const et = tarihEtiket(h.tarih);

  function toggle() {
    startTransition(async () => {
      await hatirlatmaToggle(h.id, !h.tamamlandi);
    });
  }

  return (
    <div className={`card flex items-start gap-3 p-3 ${h.tamamlandi ? "opacity-60" : ""}`}>
      <button
        onClick={toggle}
        disabled={pending}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
          h.tamamlandi ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300 text-transparent hover:border-brand-400"
        }`}
        aria-label={h.tamamlandi ? "Geri al" : "Tamamlandı"}
      >
        <Check size={15} />
      </button>
      <div className="min-w-0 flex-1">
        <div className={`font-medium text-stone-900 ${h.tamamlandi ? "line-through" : ""}`}>{h.baslik}</div>
        {h.aciklama && <div className="mt-0.5 text-sm text-stone-500">{h.aciklama}</div>}
        <div className={`mt-1 text-xs ${h.tamamlandi ? "text-stone-400" : et.renk}`}>{et.label}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button onClick={onEdit} className="btn-ghost btn-sm px-1.5" aria-label="Düzenle"><Edit2 size={15} /></button>
        <button onClick={onDelete} className="btn-ghost btn-sm px-1.5 text-red-500" aria-label="Sil"><Trash2 size={15} /></button>
      </div>
    </div>
  );
}

export function HatirlatmaClient({ hatirlatmalar }: { hatirlatmalar: Hatirlatma[] }) {
  const [form, setForm] = useState(false);
  const [duzen, setDuzen] = useState<Hatirlatma | null>(null);
  const [silId, setSilId] = useState<string | null>(null);

  const bekleyen = hatirlatmalar.filter((h) => !h.tamamlandi);
  const tamamlanan = hatirlatmalar.filter((h) => h.tamamlandi);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => { setDuzen(null); setForm(true); }} className="btn-primary btn-sm">
          <Plus size={16} /> Yeni Hatırlatma
        </button>
      </div>

      {hatirlatmalar.length === 0 ? (
        <EmptyState icon={Bell} baslik="Hatırlatma yok" aciklama="Kapora, iade tarihi veya takip için hatırlatma ekleyin." />
      ) : (
        <>
          <div className="space-y-2.5">
            {bekleyen.length === 0 ? (
              <p className="text-sm text-stone-400">Bekleyen hatırlatma yok. 🎉</p>
            ) : (
              bekleyen.map((h) => (
                <Satir key={h.id} h={h} onEdit={() => { setDuzen(h); setForm(true); }} onDelete={() => setSilId(h.id)} />
              ))
            )}
          </div>

          {tamamlanan.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-stone-500">Tamamlanan ({tamamlanan.length})</h3>
              <div className="space-y-2.5">
                {tamamlanan.map((h) => (
                  <Satir key={h.id} h={h} onEdit={() => { setDuzen(h); setForm(true); }} onDelete={() => setSilId(h.id)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {form && <Form kayit={duzen} onClose={() => { setForm(false); setDuzen(null); }} />}
      <ConfirmDialog open={!!silId} onClose={() => setSilId(null)} onConfirm={() => silId && hatirlatmaSil(silId)} />
    </div>
  );
}

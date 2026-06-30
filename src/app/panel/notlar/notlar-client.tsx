"use client";

import { useState, useTransition } from "react";
import { StickyNote, Plus, Trash2, Pencil } from "lucide-react";
import type { Not, NotIliskiTip } from "@/lib/types";
import { tarihKisa } from "@/lib/format";
import { Modal } from "@/components/modal";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { notEkle, notGuncelle, notSil } from "./actions";

/* ── Renk tanımları ── */

const RENKLER = [
  "stone",
  "red",
  "orange",
  "amber",
  "emerald",
  "sky",
  "violet",
  "pink",
] as const;

type Renk = (typeof RENKLER)[number];

const BORDER_RENK: Record<Renk, string> = {
  stone: "border-stone-300",
  red: "border-red-400",
  orange: "border-orange-400",
  amber: "border-amber-400",
  emerald: "border-emerald-400",
  sky: "border-sky-400",
  violet: "border-violet-400",
  pink: "border-pink-400",
};

const BG_RENK: Record<Renk, string> = {
  stone: "bg-stone-50",
  red: "bg-red-50",
  orange: "bg-orange-50",
  amber: "bg-amber-50",
  emerald: "bg-emerald-50",
  sky: "bg-sky-50",
  violet: "bg-violet-50",
  pink: "bg-pink-50",
};

const DOT_RENK: Record<Renk, string> = {
  stone: "bg-stone-400",
  red: "bg-red-400",
  orange: "bg-orange-400",
  amber: "bg-amber-400",
  emerald: "bg-emerald-400",
  sky: "bg-sky-400",
  violet: "bg-violet-400",
  pink: "bg-pink-400",
};

const ILISKI_ETIKET: Record<string, string> = {
  is: "İş",
  envanter: "Envanter",
  musteri: "Müşteri",
};

/* ── Renk seçici ── */

function RenkSecici({
  secili,
  onChange,
}: {
  secili: Renk;
  onChange: (r: Renk) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {RENKLER.map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          className={`size-7 rounded-full transition-all ${DOT_RENK[r]} ${
            secili === r
              ? "ring-2 ring-offset-2 ring-stone-400 scale-110"
              : "hover:scale-110 opacity-70 hover:opacity-100"
          }`}
          aria-label={r}
        />
      ))}
    </div>
  );
}

/* ── Not kartı ── */

function NotKarti({
  not,
  onEdit,
  onDelete,
}: {
  not: Not;
  onEdit: (not: Not) => void;
  onDelete: (not: Not) => void;
}) {
  const renk = (not.renk as Renk) || "stone";

  return (
    <div
      onClick={() => onEdit(not)}
      className={`group relative cursor-pointer rounded-xl border-l-4 ${BORDER_RENK[renk]} ${BG_RENK[renk]} bg-opacity-50 p-4 shadow-sm ring-1 ring-stone-200/60 transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      {/* Silme butonu */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(not);
        }}
        className="absolute right-2 top-2 rounded-lg p-1.5 text-stone-300 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/60 hover:text-red-500"
        aria-label="Sil"
      >
        <Trash2 size={14} />
      </button>

      {/* Başlık */}
      {not.baslik && (
        <h3 className="mb-1.5 pr-6 text-sm font-semibold text-stone-800 line-clamp-2">
          {not.baslik}
        </h3>
      )}

      {/* İçerik */}
      {not.icerik && (
        <p className="text-sm leading-relaxed text-stone-600 line-clamp-4 whitespace-pre-line">
          {not.icerik}
        </p>
      )}

      {/* Alt bilgi */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-stone-400">
          {tarihKisa(not.created_at)}
        </span>
        {not.iliskili_tip && ILISKI_ETIKET[not.iliskili_tip] && (
          <span className="badge text-xs">
            {ILISKI_ETIKET[not.iliskili_tip]}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Not formu (modal) ── */

function NotFormu({
  open,
  onClose,
  not,
}: {
  open: boolean;
  onClose: () => void;
  not: Not | null;
}) {
  const isEdit = !!not;
  const [renk, setRenk] = useState<Renk>((not?.renk as Renk) || "stone");
  const [hata, setHata] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("renk", renk);

    startTransition(async () => {
      setHata("");
      const result = isEdit
        ? await notGuncelle(not.id, fd)
        : await notEkle(fd);

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
      baslik={isEdit ? "Notu Düzenle" : "Yeni Not"}
      boyut="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Başlık */}
        <div>
          <label className="label">Başlık</label>
          <input
            name="baslik"
            defaultValue={not?.baslik ?? ""}
            className="input"
            placeholder="Not başlığı…"
            required
          />
        </div>

        {/* İçerik */}
        <div>
          <label className="label">İçerik</label>
          <textarea
            name="icerik"
            defaultValue={not?.icerik ?? ""}
            className="textarea"
            rows={4}
            placeholder="Not içeriği…"
          />
        </div>

        {/* Renk */}
        <div>
          <label className="label mb-2">Renk</label>
          <RenkSecici secili={renk} onChange={setRenk} />
        </div>

        {/* İlişki tipi */}
        <div>
          <label className="label">İlişki</label>
          <select
            name="iliskili_tip"
            defaultValue={not?.iliskili_tip ?? "genel"}
            className="select"
          >
            <option value="genel">Genel (bağımsız)</option>
            <option value="is">İş</option>
            <option value="envanter">Envanter</option>
            <option value="musteri">Müşteri</option>
          </select>
        </div>

        {/* Hata */}
        {hata && (
          <p className="text-sm text-red-600">{hata}</p>
        )}

        {/* Butonlar */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline btn-sm"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary btn-sm"
          >
            {isPending
              ? "Kaydediliyor…"
              : isEdit
                ? "Güncelle"
                : "Ekle"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ── Ana bileşen ── */

export function NotKartlari({ notlar }: { notlar: Not[] }) {
  const [formAcik, setFormAcik] = useState(false);
  const [seciliNot, setSeciliNot] = useState<Not | null>(null);
  const [silmeNot, setSilmeNot] = useState<Not | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleYeniNot() {
    setSeciliNot(null);
    setFormAcik(true);
  }

  function handleEdit(not: Not) {
    setSeciliNot(not);
    setFormAcik(true);
  }

  function handleKapat() {
    setFormAcik(false);
    setSeciliNot(null);
  }

  function handleSilOnayla() {
    if (!silmeNot) return;
    startTransition(async () => {
      await notSil(silmeNot.id);
      setSilmeNot(null);
    });
  }

  return (
    <>
      {/* Üst buton */}
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={handleYeniNot}
          className="btn-primary btn-sm flex items-center gap-1.5"
        >
          <Plus size={16} />
          Yeni Not
        </button>
      </div>

      {/* Kartlar veya boş durum */}
      {notlar.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          baslik="Henüz not yok"
          aciklama="Notlarınızı burada tutarak hiçbir detayı kaçırmayın."
        >
          <button
            type="button"
            onClick={handleYeniNot}
            className="btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus size={16} />
            İlk Notu Ekle
          </button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notlar.map((n) => (
            <NotKarti
              key={n.id}
              not={n}
              onEdit={handleEdit}
              onDelete={setSilmeNot}
            />
          ))}
        </div>
      )}

      {/* Form modal */}
      <NotFormu
        key={seciliNot?.id ?? "yeni"}
        open={formAcik}
        onClose={handleKapat}
        not={seciliNot}
      />

      {/* Silme onayı */}
      <ConfirmDialog
        open={!!silmeNot}
        onClose={() => setSilmeNot(null)}
        onConfirm={handleSilOnayla}
        baslik="Notu Sil"
        mesaj={`"${silmeNot?.baslik ?? "Bu not"}" silinecek. Bu işlem geri alınamaz.`}
      />
    </>
  );
}

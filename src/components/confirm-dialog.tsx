"use client";

import { Modal } from "@/components/modal";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  baslik = "Silme Onayı",
  mesaj = "Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
  onayLabel = "Sil",
  tehlikeli = true,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  baslik?: string;
  mesaj?: string;
  onayLabel?: string;
  tehlikeli?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} baslik={baslik} boyut="sm">
      <p className="text-sm text-stone-600 leading-relaxed">{mesaj}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-outline btn-sm">
          İptal
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`${tehlikeli ? "btn-danger" : "btn-primary"} btn-sm`}
        >
          {onayLabel}
        </button>
      </div>
    </Modal>
  );
}

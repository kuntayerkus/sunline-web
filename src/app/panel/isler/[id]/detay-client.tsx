"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "@/components/modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ekipmanAta, ekipmanCikar, odaAta, odaCikar, ekipAta, ekipCikar } from "../actions";

export function EkipmanAtamaFormu({ isId, envanterListesi, onClose }: { isId: string; envanterListesi: any[]; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const envanterId = formData.get("envanter_id") as string;
    const adet = Number(formData.get("adet"));
    
    const res = await ekipmanAta(isId, envanterId, adet);
    setLoading(false);
    if (res?.error) setError(res.error);
    else onClose();
  }

  return (
    <Modal open onClose={onClose} baslik="Ekipman Ekle" boyut="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        <div>
          <label className="label">Ekipman *</label>
          <select name="envanter_id" required className="select">
            <option value="">-- Seçin --</option>
            {envanterListesi.map((e) => (
              <option key={e.id} value={e.id}>{e.ad} (Stok: {e.adet})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Adet *</label>
          <input type="number" name="adet" min="1" defaultValue="1" required className="input" />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="btn-ghost">İptal</button>
          <button type="submit" disabled={loading} className="btn-primary">Ekle</button>
        </div>
      </form>
    </Modal>
  );
}

export function OdaAtamaFormu({ isId, odaListesi, onClose }: { isId: string; odaListesi: any[]; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await odaAta(isId, formData.get("oda_id") as string);
    setLoading(false);
    if (res?.error) setError(res.error);
    else onClose();
  }

  return (
    <Modal open onClose={onClose} baslik="Oda Ekle" boyut="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        <div>
          <label className="label">Oda *</label>
          <select name="oda_id" required className="select">
            <option value="">-- Seçin --</option>
            {odaListesi.map((o) => (
              <option key={o.id} value={o.id}>{o.ad}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="btn-ghost">İptal</button>
          <button type="submit" disabled={loading} className="btn-primary">Ekle</button>
        </div>
      </form>
    </Modal>
  );
}

export function EkipAtamaFormu({ isId, ekipListesi, onClose }: { isId: string; ekipListesi: any[]; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await ekipAta(isId, formData.get("ekip_id") as string, formData.get("rol") as string);
    setLoading(false);
    if (res?.error) setError(res.error);
    else onClose();
  }

  return (
    <Modal open onClose={onClose} baslik="Ekip Üyesi Ekle" boyut="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
        <div>
          <label className="label">Kişi *</label>
          <select name="ekip_id" required className="select">
            <option value="">-- Seçin --</option>
            {ekipListesi.map((e) => (
              <option key={e.id} value={e.id}>{e.ad} ({e.uzmanlik || "Genel"})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Rol (Görev)</label>
          <input name="rol" className="input" placeholder="Örn: Tonmayster, Şoför" />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <button type="button" onClick={onClose} className="btn-ghost">İptal</button>
          <button type="submit" disabled={loading} className="btn-primary">Ekle</button>
        </div>
      </form>
    </Modal>
  );
}

export function AtamaSilButonu({ id, tip }: { id: string, tip: "ekipman" | "oda" | "ekip" }) {
  const [silOnay, setSilOnay] = useState(false);
  
  return (
    <>
      <button onClick={() => setSilOnay(true)} className="btn-ghost btn-sm px-2 text-red-600">
        <Trash2 size={16} />
      </button>
      <ConfirmDialog
        open={silOnay}
        onClose={() => setSilOnay(false)}
        onConfirm={async () => {
          if (tip === "ekipman") await ekipmanCikar(id);
          else if (tip === "oda") await odaCikar(id);
          else if (tip === "ekip") await ekipCikar(id);
        }}
        baslik="Atamayı Kaldır"
        mesaj="Bu atamayı kaldırmak istediğinize emin misiniz?"
      />
    </>
  );
}

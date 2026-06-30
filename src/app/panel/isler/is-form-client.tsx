"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { isEkle, isGuncelle } from "./actions";
import type { Is, Musteri } from "@/lib/types";
import { saatStr } from "@/lib/format";

export function IsFormu({
  is,
  musteriler,
  envanterler,
  onClose,
}: {
  is?: any;
  musteriler: Musteri[];
  envanterler: any[];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [seciliEkipmanlar, setSeciliEkipmanlar] = useState<{envanter_id: string, adet: number}[]>(
    is?.is_ekipman || []
  );

  function handleEkipmanEkle(id: string) {
    if (!id) return;
    setSeciliEkipmanlar([...seciliEkipmanlar, { envanter_id: id, adet: 1 }]);
  }

  function handleEkipmanCikar(id: string) {
    setSeciliEkipmanlar(seciliEkipmanlar.filter(s => s.envanter_id !== id));
  }

  function handleEkipmanAdet(id: string, adet: number) {
    setSeciliEkipmanlar(seciliEkipmanlar.map(s => s.envanter_id === id ? { ...s, adet } : s));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = is ? await isGuncelle(is.id, formData) : await isEkle(formData);
    setLoading(false);
    if (res?.error) setError(res.error);
    else onClose();
  }

  // format for datetime-local
  const formatTarih = (iso?: string) => iso ? iso.slice(0, 16) : "";

  const eklenebilir = envanterler.filter(e => !seciliEkipmanlar.find(s => s.envanter_id === e.id));

  return (
    <Modal open onClose={onClose} baslik={is ? "İşi Düzenle" : "Yeni İş"} boyut="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded whitespace-pre-wrap">{error}</div>}
        <input type="hidden" name="secili_ekipmanlar" value={JSON.stringify(seciliEkipmanlar)} />

        <div>
          <label className="label">Başlık *</label>
          <input name="baslik" required defaultValue={is?.baslik} className="input" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tip *</label>
            <select name="tip" required defaultValue={is?.tip || "backline"} className="select">
              <option value="backline">Backline</option>
              <option value="prova">Prova</option>
              <option value="kayit">Kayıt</option>
              <option value="mix">Mix</option>
              <option value="mastering">Mastering</option>
              <option value="diger">Diğer</option>
            </select>
          </div>
          <div>
            <label className="label">Durum *</label>
            <select name="durum" required defaultValue={is?.durum || "onayli"} className="select">
              <option value="talep">Talep</option>
              <option value="teklif">Teklif</option>
              <option value="onayli">Onaylı</option>
              <option value="tamamlandi">Tamamlandı</option>
              <option value="iptal">İptal</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Müşteri</label>
          <select name="musteri_id" defaultValue={is?.musteri_id || ""} className="select">
            <option value="">-- Müşteri Seçin --</option>
            {musteriler.map(m => (
              <option key={m.id} value={m.id}>{m.ad}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Başlangıç *</label>
            <input type="datetime-local" name="baslangic" required defaultValue={formatTarih(is?.baslangic)} className="input" />
          </div>
          <div>
            <label className="label">Bitiş *</label>
            <input type="datetime-local" name="bitis" required defaultValue={formatTarih(is?.bitis)} className="input" />
          </div>
        </div>
        
        {/* EKİPMAN SEÇİMİ */}
        <div>
          <label className="label">Ekipmanlar</label>
          <div className="space-y-2 p-3 bg-stone-50 rounded-lg border border-stone-100">
            {seciliEkipmanlar.map(sec => {
              const e = envanterler.find(x => x.id === sec.envanter_id);
              return (
                <div key={sec.envanter_id} className="flex items-center gap-2 bg-white p-2 rounded border border-stone-200">
                  <span className="flex-1 text-sm truncate">{e?.ad || 'Bilinmeyen Ekipman'}</span>
                  <input 
                    type="number" 
                    min="1" 
                    value={sec.adet} 
                    onChange={ev => handleEkipmanAdet(sec.envanter_id, parseInt(ev.target.value) || 1)} 
                    className="input !py-1 !px-2 w-16 text-center"
                    title="Adet"
                  />
                  <button type="button" onClick={() => handleEkipmanCikar(sec.envanter_id)} className="text-stone-400 hover:text-red-600 transition p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              );
            })}

            {eklenebilir.length > 0 ? (
              <select 
                className="select text-sm mt-1" 
                value="" 
                onChange={(e) => handleEkipmanEkle(e.target.value)}
              >
                <option value="">+ Ekipman Ekle</option>
                {eklenebilir.map(e => (
                  <option key={e.id} value={e.id}>{e.ad}</option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-stone-500 italic mt-1 px-1">Eklenebilecek başka ekipman yok.</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tutar (₺)</label>
            <input type="number" name="tutar" step="0.01" defaultValue={is?.tutar || 0} className="input" />
          </div>
          <div>
            <label className="label">Kapora (₺)</label>
            <input type="number" name="kapora" step="0.01" defaultValue={is?.kapora || 0} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Lokasyon</label>
          <input name="lokasyon" defaultValue={is?.lokasyon || ""} className="input" />
        </div>

        <div>
          <label className="label">Notlar</label>
          <textarea name="notlar" defaultValue={is?.notlar || ""} className="textarea" rows={3} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
          <button type="button" onClick={onClose} className="btn-ghost">İptal</button>
          <button type="submit" disabled={loading} className="btn-primary">Kaydet</button>
        </div>
      </form>
    </Modal>
  );
}

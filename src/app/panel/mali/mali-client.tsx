"use client";

import { useMemo, useState } from "react";
import {
  Plus, Edit2, Trash2, Wallet, ChevronLeft, ChevronRight, Repeat,
} from "lucide-react";
import type { MaliHareket, Is, SabitGider } from "@/lib/types";
import { paraTL, tarihKisa } from "@/lib/format";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { Modal } from "@/components/modal";
import {
  hareketEkle, hareketGuncelle, hareketSil,
  sabitGiderEkle, sabitGiderGuncelle, sabitGiderSil,
} from "./actions";

/* ----------------------------- yardımcılar ----------------------------- */

function buAy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function ayKaydir(ay: string, delta: number): string {
  const [y, m] = ay.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function ayEtiket(ay: string, kisa = false): string {
  const [y, m] = ay.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { month: kisa ? "short" : "long", year: "numeric" }).format(new Date(y, m - 1, 1));
}
function sabitAyaUygun(s: SabitGider, ay: string): boolean {
  if (!s.aktif) return false;
  if (s.baslangic_ay.slice(0, 7) > ay) return false;
  if (s.bitis_ay && s.bitis_ay.slice(0, 7) < ay) return false;
  return true;
}

const ODEME_YONTEMI_RENK: Record<string, string> = {
  nakit: "bg-emerald-100 text-emerald-700",
  havale: "bg-sky-100 text-sky-700",
  kart: "bg-violet-100 text-violet-700",
  diger: "bg-stone-100 text-stone-600",
};

/* ----------------------------- mali hareket formu ----------------------------- */

function HareketFormu({ hareket, isler, onClose }: { hareket?: MaliHareket | null; isler: Is[]; onClose: () => void }) {
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
    <Modal open onClose={onClose} baslik={hareket ? "Hareketi Düzenle" : "Yeni Gelir / Gider"} boyut="md">
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
            <input type="number" name="tutar" step="0.01" min="0.01" required defaultValue={hareket?.tutar || ""} className="input" inputMode="decimal" />
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
              {isler.map((is) => (<option key={is.id} value={is.id}>{is.baslik}</option>))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Açıklama</label>
          <textarea name="aciklama" defaultValue={hareket?.aciklama || ""} className="textarea" rows={2} />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
          <button type="button" onClick={onClose} className="btn-ghost">İptal</button>
          <button type="submit" disabled={loading} className="btn-primary">Kaydet</button>
        </div>
      </form>
    </Modal>
  );
}

/* ----------------------------- sabit gider formu ----------------------------- */

function SabitGiderFormu({ kayit, onClose }: { kayit?: SabitGider | null; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = kayit ? await sabitGiderGuncelle(kayit.id, formData) : await sabitGiderEkle(formData);
    setLoading(false);
    if (res?.error) setError(res.error);
    else onClose();
  }

  return (
    <Modal open onClose={onClose} baslik={kayit ? "Sabit Gideri Düzenle" : "Yeni Sabit (Aylık) Gider"} boyut="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded whitespace-pre-wrap">{error}</div>}
        <div>
          <label className="label">Ad *</label>
          <input name="ad" required defaultValue={kayit?.ad || ""} className="input" placeholder="Örn: Dükkan kirası, Maaş — Ahmet" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Kategori</label>
            <input name="kategori" defaultValue={kayit?.kategori || ""} className="input" placeholder="Kira, Maaş, Abonelik..." list="sabit-kategori" />
            <datalist id="sabit-kategori">
              <option value="Kira" /><option value="Maaş" /><option value="Abonelik" />
              <option value="Sigorta" /><option value="Fatura" /><option value="Vergi" />
            </datalist>
          </div>
          <div>
            <label className="label">Aylık Tutar (₺) *</label>
            <input type="number" name="tutar" step="0.01" min="0.01" required defaultValue={kayit?.tutar || ""} className="input" inputMode="decimal" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Başlangıç Ayı *</label>
            <input type="month" name="baslangic_ay" required defaultValue={(kayit?.baslangic_ay || new Date().toISOString()).slice(0, 7)} className="input" />
          </div>
          <div>
            <label className="label">Bitiş Ayı (boş = süresiz)</label>
            <input type="month" name="bitis_ay" defaultValue={kayit?.bitis_ay ? kayit.bitis_ay.slice(0, 7) : ""} className="input" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" name="aktif" defaultChecked={kayit?.aktif ?? true} className="h-4 w-4 rounded border-stone-300" />
          Aktif (her ay gider toplamına dahil et)
        </label>
        <div>
          <label className="label">Not</label>
          <textarea name="notlar" defaultValue={kayit?.notlar || ""} className="textarea" rows={2} />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
          <button type="button" onClick={onClose} className="btn-ghost">İptal</button>
          <button type="submit" disabled={loading} className="btn-primary">Kaydet</button>
        </div>
      </form>
    </Modal>
  );
}

/* --------------------------------- ana --------------------------------- */

export function MaliClient({ hareketler, isler, sabitGiderler }: { hareketler: MaliHareket[]; isler: Is[]; sabitGiderler: SabitGider[] }) {
  const [ay, setAy] = useState<string>(buAy());

  const [hareketForm, setHareketForm] = useState(false);
  const [hareketDuzen, setHareketDuzen] = useState<MaliHareket | null>(null);
  const [hareketSilId, setHareketSilId] = useState<string | null>(null);

  const [sabitForm, setSabitForm] = useState(false);
  const [sabitDuzen, setSabitDuzen] = useState<SabitGider | null>(null);
  const [sabitSilId, setSabitSilId] = useState<string | null>(null);

  const hesap = useMemo(() => {
    const ayHareketler = hareketler.filter((h) => h.tarih.slice(0, 7) === ay);
    const gelir = ayHareketler.filter((h) => h.tip === "gelir").reduce((s, h) => s + h.tutar, 0);
    const giderHareket = ayHareketler.filter((h) => h.tip === "gider").reduce((s, h) => s + h.tutar, 0);
    const ayinSabitleri = sabitGiderler.filter((s) => sabitAyaUygun(s, ay));
    const sabitToplam = ayinSabitleri.reduce((s, x) => s + x.tutar, 0);
    const gider = giderHareket + sabitToplam;
    const net = gelir - gider;

    // gider kategori dağılımı (hareket + sabit)
    const katMap = new Map<string, number>();
    ayHareketler.filter((h) => h.tip === "gider").forEach((h) => {
      const k = h.kategori?.trim() || "Diğer";
      katMap.set(k, (katMap.get(k) || 0) + h.tutar);
    });
    ayinSabitleri.forEach((s) => {
      const k = s.kategori?.trim() || "Sabit gider";
      katMap.set(k, (katMap.get(k) || 0) + s.tutar);
    });
    const giderKategoriler = Array.from(katMap.entries())
      .map(([ad, tutar]) => ({ ad, tutar }))
      .sort((a, b) => b.tutar - a.tutar);

    // son 6 ay trendi (seçili aya kadar)
    const trend = Array.from({ length: 6 }, (_, i) => {
      const mAy = ayKaydir(ay, -(5 - i));
      const g = hareketler.filter((h) => h.tarih.slice(0, 7) === mAy && h.tip === "gelir").reduce((s, h) => s + h.tutar, 0);
      const gh = hareketler.filter((h) => h.tarih.slice(0, 7) === mAy && h.tip === "gider").reduce((s, h) => s + h.tutar, 0);
      const sb = sabitGiderler.filter((s) => sabitAyaUygun(s, mAy)).reduce((s, x) => s + x.tutar, 0);
      return { ay: mAy, gelir: g, gider: gh + sb, net: g - gh - sb };
    });
    const trendMax = Math.max(1, ...trend.map((t) => Math.max(t.gelir, t.gider)));

    return { ayHareketler, gelir, gider, giderHareket, sabitToplam, net, ayinSabitleri, giderKategoriler, trend, trendMax };
  }, [hareketler, sabitGiderler, ay]);

  const tumNet = useMemo(() => {
    const g = hareketler.filter((h) => h.tip === "gelir").reduce((s, h) => s + h.tutar, 0);
    const d = hareketler.filter((h) => h.tip === "gider").reduce((s, h) => s + h.tutar, 0);
    return g - d;
  }, [hareketler]);

  const sabitAylikToplam = sabitGiderler.filter((s) => s.aktif).reduce((s, x) => s + x.tutar, 0);

  return (
    <div className="space-y-6">
      {/* Ay seçici */}
      <div className="flex items-center justify-between gap-2">
        <button onClick={() => setAy(ayKaydir(ay, -1))} className="btn-outline btn-sm px-3" aria-label="Önceki ay">
          <ChevronLeft size={18} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-base font-semibold capitalize text-stone-900">{ayEtiket(ay)}</span>
          {ay !== buAy() && (
            <button onClick={() => setAy(buAy())} className="text-xs text-brand-600 hover:underline">Bu aya dön</button>
          )}
        </div>
        <button onClick={() => setAy(ayKaydir(ay, 1))} className="btn-outline btn-sm px-3" aria-label="Sonraki ay">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Özet kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-stone-500">Gelir</h3>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{paraTL(hesap.gelir)}</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-stone-500">Gider</h3>
          <p className="mt-1 text-2xl font-bold text-red-600">{paraTL(hesap.gider)}</p>
          {hesap.sabitToplam > 0 && (
            <p className="mt-0.5 text-xs text-stone-400">Sabit giderler dahil: {paraTL(hesap.sabitToplam)}</p>
          )}
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-stone-500">Net</h3>
          <p className={`mt-1 text-2xl font-bold ${hesap.net >= 0 ? "text-emerald-600" : "text-red-600"}`}>{paraTL(hesap.net)}</p>
          <p className="mt-0.5 text-xs text-stone-400">Tüm zamanlar net: {paraTL(tumNet)}</p>
        </div>
      </div>

      {/* Trend (son 6 ay) */}
      <div className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-stone-700">Son 6 ay (gelir / gider)</h3>
        <div className="flex items-end justify-between gap-2 sm:gap-4" style={{ height: 120 }}>
          {hesap.trend.map((t) => {
            const aktif = t.ay === ay;
            return (
              <button
                key={t.ay}
                onClick={() => setAy(t.ay)}
                className="flex flex-1 flex-col items-center gap-1"
                title={`${ayEtiket(t.ay)} • Net ${paraTL(t.net)}`}
              >
                <div className="flex h-[80px] w-full items-end justify-center gap-0.5">
                  <div className="w-1/2 rounded-t bg-emerald-400" style={{ height: `${Math.max(2, (t.gelir / hesap.trendMax) * 80)}px` }} />
                  <div className="w-1/2 rounded-t bg-red-300" style={{ height: `${Math.max(2, (t.gider / hesap.trendMax) * 80)}px` }} />
                </div>
                <span className={`text-[10px] ${aktif ? "font-bold text-brand-600" : "text-stone-400"}`}>{ayEtiket(t.ay, true).split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gider dağılımı */}
      {hesap.giderKategoriler.length > 0 && (
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-stone-700">Gider dağılımı — {ayEtiket(ay)}</h3>
          <div className="space-y-2.5">
            {hesap.giderKategoriler.map((k) => (
              <div key={k.ad}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-stone-700">{k.ad}</span>
                  <span className="font-medium text-stone-900">{paraTL(k.tutar)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full bg-brand-400" style={{ width: `${(k.tutar / hesap.gider) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hareketler */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900">Hareketler</h2>
          <button onClick={() => { setHareketDuzen(null); setHareketForm(true); }} className="btn-primary btn-sm">
            <Plus size={16} /> Gelir / Gider
          </button>
        </div>

        {hesap.ayHareketler.length === 0 ? (
          <EmptyState icon={Wallet} baslik="Bu ay hareket yok" aciklama="Bu ay için gelir veya gider ekleyin." />
        ) : (
          <>
            {/* Mobil kartlar */}
            <div className="space-y-2.5 md:hidden">
              {hesap.ayHareketler.map((h) => (
                <div key={h.id} className="card flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${h.tip === "gelir" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{h.tip}</span>
                      <span className="truncate text-sm font-medium text-stone-800">{h.kategori || "—"}</span>
                    </div>
                    <div className="mt-1 text-xs text-stone-500">
                      {tarihKisa(h.tarih)}{h.aciklama ? ` · ${h.aciklama}` : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`font-semibold ${h.tip === "gelir" ? "text-emerald-600" : "text-red-600"}`}>
                      {h.tip === "gelir" ? "+" : "−"}{paraTL(h.tutar)}
                    </span>
                    <button onClick={() => { setHareketDuzen(h); setHareketForm(true); }} className="btn-ghost btn-sm px-1.5" aria-label="Düzenle"><Edit2 size={15} /></button>
                    <button onClick={() => setHareketSilId(h.id)} className="btn-ghost btn-sm px-1.5 text-red-600" aria-label="Sil"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Masaüstü tablo */}
            <div className="card hidden overflow-x-auto md:block">
              <table className="tbl">
                <thead>
                  <tr><th>Tarih</th><th>Tip</th><th>Kategori</th><th>Açıklama</th><th>Ödeme</th><th>Tutar</th><th className="w-[100px]"></th></tr>
                </thead>
                <tbody>
                  {hesap.ayHareketler.map((h) => (
                    <tr key={h.id}>
                      <td>{tarihKisa(h.tarih)}</td>
                      <td><span className={`badge ${h.tip === "gelir" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{h.tip}</span></td>
                      <td>{h.kategori || "—"}</td>
                      <td>{h.aciklama || "—"}</td>
                      <td>{h.odeme_yontemi ? <span className={`badge ${ODEME_YONTEMI_RENK[h.odeme_yontemi] || ""}`}>{h.odeme_yontemi}</span> : "—"}</td>
                      <td className={`font-medium ${h.tip === "gelir" ? "text-emerald-600" : "text-red-600"}`}>{h.tip === "gelir" ? "+" : "−"}{paraTL(h.tutar)}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setHareketDuzen(h); setHareketForm(true); }} className="btn-ghost btn-sm px-2"><Edit2 size={16} /></button>
                          <button onClick={() => setHareketSilId(h.id)} className="btn-ghost btn-sm px-2 text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Sabit (aylık tekrarlayan) giderler */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900"><Repeat size={18} className="text-brand-500" /> Sabit Giderler</h2>
            <p className="text-xs text-stone-500">Aylık toplam: {paraTL(sabitAylikToplam)} · her ay otomatik gidere eklenir</p>
          </div>
          <button onClick={() => { setSabitDuzen(null); setSabitForm(true); }} className="btn-outline btn-sm">
            <Plus size={16} /> Ekle
          </button>
        </div>

        {sabitGiderler.length === 0 ? (
          <EmptyState icon={Repeat} baslik="Sabit gider yok" aciklama="Kira, maaş, abonelik gibi her ay tekrarlayan giderleri bir kez ekleyin." />
        ) : (
          <div className="space-y-2.5">
            {sabitGiderler.map((s) => {
              const buAyaDahil = sabitAyaUygun(s, ay);
              return (
                <div key={s.id} className={`card flex items-center justify-between gap-3 p-3 ${!s.aktif ? "opacity-60" : ""}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-stone-800">{s.ad}</span>
                      {s.kategori && <span className="badge bg-stone-100 text-stone-600">{s.kategori}</span>}
                      {!s.aktif && <span className="badge bg-stone-100 text-stone-500">pasif</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-stone-500">
                      {ayEtiket(s.baslangic_ay.slice(0, 7), true)}{s.bitis_ay ? ` → ${ayEtiket(s.bitis_ay.slice(0, 7), true)}` : " → süresiz"}
                      {!buAyaDahil && s.aktif && " · bu ay dışı"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="font-semibold text-stone-900">{paraTL(s.tutar)}<span className="text-xs font-normal text-stone-400">/ay</span></span>
                    <button onClick={() => { setSabitDuzen(s); setSabitForm(true); }} className="btn-ghost btn-sm px-1.5" aria-label="Düzenle"><Edit2 size={15} /></button>
                    <button onClick={() => setSabitSilId(s.id)} className="btn-ghost btn-sm px-1.5 text-red-600" aria-label="Sil"><Trash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modallar */}
      {hareketForm && (
        <HareketFormu hareket={hareketDuzen} isler={isler} onClose={() => { setHareketForm(false); setHareketDuzen(null); }} />
      )}
      {sabitForm && (
        <SabitGiderFormu kayit={sabitDuzen} onClose={() => { setSabitForm(false); setSabitDuzen(null); }} />
      )}

      <ConfirmDialog open={!!hareketSilId} onClose={() => setHareketSilId(null)} onConfirm={() => hareketSilId && hareketSil(hareketSilId)} />
      <ConfirmDialog open={!!sabitSilId} onClose={() => setSabitSilId(null)} onConfirm={() => sabitSilId && sabitGiderSil(sabitSilId)} />
    </div>
  );
}

import { paraTL, tarih, tarihAralik } from "@/lib/format";
import { SITE_NAME, TELEFON_GORUNUM, INSTAGRAM_HANDLE, SITE_URL } from "@/lib/site";

const TIP_LABEL: Record<string, string> = {
  backline: "Backline / Etkinlik",
  prova: "Prova",
  kayit: "Kayıt",
  mix: "Mix",
  mastering: "Mastering",
  diger: "Diğer",
};

export type BelgeTipi = "teklif" | "sozlesme";

export type EkipmanSatir = { adet: number; envanter: { ad: string; marka: string | null; model: string | null } | null };
export type OdaSatir = { studyo_oda: { ad: string; tip: string } | null };

export type TeklifIs = {
  baslik: string;
  tip: string;
  baslangic: string;
  bitis: string;
  lokasyon: string | null;
  tutar: number;
  kapora: number;
  notlar: string | null;
};

const TEKLIF_SARTLAR = [
  "Bu teklif düzenleme tarihinden itibaren 14 gün geçerlidir.",
  "Rezervasyon, kaporanın ödenmesiyle kesinleşir.",
  "Ekipman teslim, kurulum ve toplama Sunline ekibi tarafından yapılır.",
  "Ödeme koşulları ve diğer detaylar karşılıklı mutabakata göre belirlenir.",
];

const SOZLESME_SARTLAR = [
  "Rezervasyon, kaporanın ödenmesiyle kesinleşir; kapora toplam bedelden düşülür.",
  "Kiralanan ekipman müşteriye çalışır ve sağlam durumda teslim edilir; teslim sırasında taraflarca birlikte kontrol edilir.",
  "Kiralama süresince ekipmanda oluşabilecek hasar, arıza, kayıp veya çalınmadan müşteri sorumludur; bu durumda ekipmanın onarım bedeli ya da güncel yenileme/piyasa bedeli müşteri tarafından ödenir.",
  "Ekipman, teslim alındığı durumda ve kararlaştırılan sürede iade edilir; geç iadede günlük kira bedeli uygulanır.",
  "Müşteri kaynaklı iptallerde kapora iade edilmez.",
  "Doğal afet ve mücbir sebep gibi öngörülemeyen durumlar taraflarca karşılıklı değerlendirilir.",
  "İşbu sözleşme iki nüsha olarak düzenlenmiş ve taraflarca imzalanmıştır.",
];

export function TeklifBelge({
  is, teklifNo, musteri, ekipmanlar, odalar, belgeTipi = "teklif",
}: {
  is: TeklifIs;
  teklifNo: string;
  musteri: { ad: string; telefon: string | null; eposta: string | null } | null;
  ekipmanlar: EkipmanSatir[];
  odalar: OdaSatir[];
  belgeTipi?: BelgeTipi;
}) {
  const kalan = (is.tutar || 0) - (is.kapora || 0);
  const sozlesme = belgeTipi === "sozlesme";
  const baslik = sozlesme ? "SÖZLEŞME" : "TEKLİF";
  const sartlar = sozlesme ? SOZLESME_SARTLAR : TEKLIF_SARTLAR;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 print:px-0 print:py-0">
      {/* Başlık */}
      <div className="flex items-start justify-between gap-4 border-b-2 border-stone-900 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl font-black tracking-tighter">{SITE_NAME.toUpperCase()}</span>
            <span className="inline-block h-3 w-3" style={{ background: "#2733E6" }} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-stone-500">
            İzmir, Alsancak<br />
            {TELEFON_GORUNUM} · @{INSTAGRAM_HANDLE}<br />
            {SITE_URL.replace("https://", "")}
          </p>
        </div>
        <div className="text-right">
          <h1 className="font-display text-2xl font-bold tracking-tight">{baslik}</h1>
          <p className="mt-1 text-xs text-stone-500">No: {teklifNo}</p>
          <p className="text-xs text-stone-500">Tarih: {tarih(new Date())}</p>
        </div>
      </div>

      {/* Müşteri + iş */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">{sozlesme ? "Kiracı / Müşteri" : "Müşteri"}</h2>
          <p className="font-semibold">{musteri?.ad || "—"}</p>
          {musteri?.telefon && <p className="text-sm text-stone-600">{musteri.telefon}</p>}
          {musteri?.eposta && <p className="text-sm text-stone-600">{musteri.eposta}</p>}
        </div>
        <div className="sm:text-right">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">İş</h2>
          <p className="font-semibold">{is.baslik}</p>
          <p className="text-sm text-stone-600">{TIP_LABEL[is.tip] || is.tip}</p>
          <p className="text-sm text-stone-600">{tarihAralik(is.baslangic, is.bitis)}</p>
          {is.lokasyon && <p className="text-sm text-stone-600">{is.lokasyon}</p>}
        </div>
      </div>

      {/* Kapsam */}
      {(ekipmanlar.length > 0 || odalar.length > 0) && (
        <div className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Kapsam{sozlesme ? " — Teslim Edilen Ekipman" : ""}</h2>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-300 text-left text-xs uppercase text-stone-400">
                <th className="py-2">Kalem</th>
                <th className="py-2 text-right">Adet</th>
              </tr>
            </thead>
            <tbody>
              {ekipmanlar.map((e, i) => (
                <tr key={`e${i}`} className="border-b border-stone-100">
                  <td className="py-2">{[e.envanter?.ad, [e.envanter?.marka, e.envanter?.model].filter(Boolean).join(" ")].filter(Boolean).join(" — ") || "Ekipman"}</td>
                  <td className="py-2 text-right tabular-nums">{e.adet}</td>
                </tr>
              ))}
              {odalar.map((o, i) => (
                <tr key={`o${i}`} className="border-b border-stone-100">
                  <td className="py-2">{o.studyo_oda?.ad || "Oda"} <span className="text-stone-400">(stüdyo)</span></td>
                  <td className="py-2 text-right">1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tutar */}
      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-stone-500">Toplam Tutar</span><span className="font-semibold tabular-nums">{paraTL(is.tutar)}</span></div>
          <div className="flex justify-between"><span className="text-stone-500">Kapora</span><span className="tabular-nums">{paraTL(is.kapora)}</span></div>
          <div className="flex justify-between border-t border-stone-300 pt-1.5 text-base font-bold"><span>Kalan</span><span className="tabular-nums">{paraTL(kalan)}</span></div>
        </div>
      </div>

      {/* Notlar */}
      {is.notlar && (
        <div className="mt-6">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Notlar</h2>
          <p className="whitespace-pre-wrap text-sm text-stone-700">{is.notlar}</p>
        </div>
      )}

      {/* Şartlar */}
      <div className="mt-6 rounded-lg bg-stone-50 p-4 text-xs leading-relaxed text-stone-500 print:bg-transparent print:p-0">
        <p className="mb-1 font-semibold text-stone-600">{sozlesme ? "Sözleşme Şartları" : "Şartlar"}</p>
        <ul className="list-inside list-disc space-y-0.5">
          {sartlar.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      {/* İmza */}
      <div className="mt-12 grid grid-cols-2 gap-8 text-sm">
        <div>
          <div className="h-12 border-b border-stone-400" />
          <p className="mt-1 text-stone-500">{sozlesme ? "Sunline (Kiralayan)" : "Sunline"}</p>
        </div>
        <div>
          <div className="h-12 border-b border-stone-400" />
          <p className="mt-1 text-stone-500">{sozlesme ? "Müşteri (Kiracı)" : "Müşteri"}</p>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-stone-400">Bu belge {SITE_NAME} tarafından düzenlenmiştir · {tarih(new Date())}</p>
    </div>
  );
}

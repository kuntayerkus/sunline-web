import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { gerekliOturum } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { paraTL, tarihAralik } from "@/lib/format";
import { whatsappTo } from "@/lib/site";
import { YazdirButton } from "./yazdir-button";
import { TeklifBelge, type EkipmanSatir, type OdaSatir, type BelgeTipi } from "./teklif-belge";

export default async function TeklifPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tip?: string }>;
}) {
  await gerekliOturum(); // yalnız girişli kullanıcı
  const { id } = await params;
  const { tip } = await searchParams;
  const belgeTipi: BelgeTipi = tip === "sozlesme" ? "sozlesme" : "teklif";

  const supabase = await createClient();
  const { data: is } = await supabase
    .from("isler")
    .select("*, musteriler(ad, telefon, eposta), is_ekipman(adet, envanter(ad, marka, model)), is_oda(studyo_oda(ad, tip))")
    .eq("id", id)
    .single();

  if (!is) notFound();

  const musteri = is.musteriler as { ad: string; telefon: string | null; eposta: string | null } | null;

  const waMesaj = `Merhaba${musteri?.ad ? " " + musteri.ad : ""},\n${is.baslik} için ${belgeTipi === "sozlesme" ? "sözleşme" : "teklif"} özeti:\nTarih: ${tarihAralik(is.baslangic, is.bitis)}\nToplam: ${paraTL(is.tutar)} (Kapora: ${paraTL(is.kapora)})\n\nSunline`;

  const sekme = (hedef: BelgeTipi, etiket: string) => (
    <Link
      href={`/teklif/${id}${hedef === "sozlesme" ? "?tip=sozlesme" : ""}`}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
        belgeTipi === hedef ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
      }`}
    >
      {etiket}
    </Link>
  );

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <style>{`@page { size: A4; margin: 14mm; } @media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>

      {/* Araç çubuğu (yazdırmada gizli) */}
      <div className="no-print sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-white/90 px-4 py-3 backdrop-blur">
        <Link href={`/panel/isler/${id}`} className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-900">
          <ArrowLeft size={16} /> İşe dön
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {sekme("teklif", "Teklif")}
            {sekme("sozlesme", "Sözleşme")}
          </div>
          {musteri?.telefon && (
            <a href={whatsappTo(musteri.telefon, waMesaj)} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
          <YazdirButton />
        </div>
      </div>

      <TeklifBelge
        is={is}
        teklifNo={id.slice(0, 8).toUpperCase()}
        musteri={musteri}
        ekipmanlar={(is.is_ekipman as unknown as EkipmanSatir[]) || []}
        odalar={(is.is_oda as unknown as OdaSatir[]) || []}
        belgeTipi={belgeTipi}
      />
    </div>
  );
}

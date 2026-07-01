import { createClient } from "@/lib/supabase/server";
import { gerekliOturum } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { paraTL, tarihAralik } from "@/lib/format";
import { ArrowLeft, FileText, MessageCircle } from "lucide-react";
import { whatsappTo } from "@/lib/site";
// Basit Client Wrapper'lar ekleme modal'ını açmak için
import { DetayAtamaModallari } from "./modallar-wrapper";

export default async function IsDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { profile } = await gerekliOturum();
  const patron = profile.rol === "patron";
  const supabase = await createClient();
  const { id } = await params; // Next 16: params bir Promise, await edilmeli

  const { data: is } = await supabase
    .from("isler")
    .select("*, musteriler(ad, telefon)")
    .eq("id", id)
    .single();

  if (!is) notFound();

  const musteri = is.musteriler as { ad: string; telefon: string | null } | null;

  const [
    { data: isEkipman },
    { data: isOda },
    { data: isEkip },
    { data: tumEnvanter },
    { data: tumOdalar },
    { data: tumEkip },
  ] = await Promise.all([
    supabase.from("is_ekipman").select("*, envanter(ad, kategori)").eq("is_id", id),
    supabase.from("is_oda").select("*, studyo_oda(ad, tip)").eq("is_id", id),
    supabase.from("is_ekip").select("*, ekip(ad, uzmanlik)").eq("is_id", id),
    supabase.from("envanter").select("*").eq("durum", "aktif"),
    supabase.from("studyo_oda").select("*").eq("aktif", true),
    supabase.from("ekip").select("*").eq("aktif", true),
  ]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link href="/panel/isler" className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-900">
          <ArrowLeft size={16} /> İşlere Dön
        </Link>
        <div className="flex items-center gap-2">
          {musteri?.telefon && (
            <a
              href={whatsappTo(musteri.telefon, `Merhaba${musteri.ad ? " " + musteri.ad : ""}, ${is.baslik} hakkında yazıyorum. Sunline`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-sm"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
          <a href={`/teklif/${is.id}`} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
            <FileText size={15} /> Teklif / Sözleşme
          </a>
        </div>
      </div>

      <PageHeader baslik={is.baslik} aciklama={`${is.tip} · ${is.durum}`} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-5 md:col-span-2">
          <h3 className="text-base font-semibold mb-3">İş Bilgileri</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
            <div><dt className="text-stone-500">Müşteri</dt><dd className="font-medium">{is.musteriler?.ad || "—"}</dd></div>
            <div><dt className="text-stone-500">Tarih</dt><dd className="font-medium">{tarihAralik(is.baslangic, is.bitis)}</dd></div>
            {patron && (
              <div><dt className="text-stone-500">Tutar / Kapora</dt><dd className="font-medium">{paraTL(is.tutar)} / {paraTL(is.kapora)}</dd></div>
            )}
            <div><dt className="text-stone-500">Lokasyon</dt><dd className="font-medium">{is.lokasyon || "—"}</dd></div>
            <div className="col-span-2">
              <dt className="text-stone-500">Notlar</dt>
              <dd className="whitespace-pre-wrap mt-1">{is.notlar || "—"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <DetayAtamaModallari
        isId={is.id}
        isEkipman={isEkipman || []}
        isOda={isOda || []}
        isEkip={isEkip || []}
        envanterListesi={tumEnvanter || []}
        odaListesi={tumOdalar || []}
        ekipListesi={tumEkip || []}
      />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, ClipboardList, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { gerekliOturum } from "@/lib/auth";
import { whatsappTo } from "@/lib/site";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { paraTL, tarihAralik } from "@/lib/format";
import type { Is, Musteri, MusteriTip } from "@/lib/types";

const TIP_RENK: Record<MusteriTip, string> = {
  grup: "bg-violet-50 text-violet-700",
  bireysel: "bg-sky-50 text-sky-700",
  kurumsal: "bg-emerald-50 text-emerald-700",
};
const TIP_LABEL: Record<MusteriTip, string> = { grup: "Grup", bireysel: "Bireysel", kurumsal: "Kurumsal" };

const DURUM_RENK: Record<string, string> = {
  talep: "bg-amber-100 text-amber-700",
  teklif: "bg-sky-100 text-sky-700",
  onayli: "bg-emerald-100 text-emerald-700",
  tamamlandi: "bg-stone-100 text-stone-600",
  iptal: "bg-red-100 text-red-700",
};

export default async function MusteriDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await gerekliOturum();
  const patron = profile.rol === "patron";
  const supabase = await createClient();

  const [{ data: musteri }, { data: isler }] = await Promise.all([
    supabase.from("musteriler").select("*").eq("id", id).single(),
    supabase.from("isler").select("*").eq("musteri_id", id).order("baslangic", { ascending: false }),
  ]);

  if (!musteri) notFound();
  const m = musteri as Musteri;
  const tumIsler = (isler as Is[]) || [];
  const gecerli = tumIsler.filter((i) => i.durum !== "iptal");

  const toplamTutar = gecerli.reduce((s, i) => s + (i.tutar || 0), 0);
  const alinanKapora = gecerli.reduce((s, i) => s + (i.kapora || 0), 0);
  const kalan = toplamTutar - alinanKapora;

  return (
    <div>
      <div className="mb-4">
        <Link href="/panel/kisiler" className="inline-flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-900">
          <ArrowLeft size={16} /> Kişilere dön
        </Link>
      </div>

      <PageHeader baslik={m.ad} aciklama="Müşteri geçmişi ve bakiye." >
        <span className={`badge ${TIP_RENK[m.tip]}`}>{TIP_LABEL[m.tip]}</span>
      </PageHeader>

      {/* İletişim */}
      {(m.telefon || m.eposta) && (
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2">
          {m.telefon && (
            <a href={`tel:${m.telefon}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600">
              <Phone size={15} /> {m.telefon}
            </a>
          )}
          {m.telefon && (
            <a href={whatsappTo(m.telefon, `Merhaba${m.ad ? " " + m.ad : ""}, Sunline`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
          {m.eposta && (
            <a href={`mailto:${m.eposta}`} className="inline-flex items-center gap-1.5 text-sm text-stone-600">
              <Mail size={15} className="text-stone-400" /> {m.eposta}
            </a>
          )}
        </div>
      )}

      {/* Bakiye özeti */}
      <div className={`mb-6 grid grid-cols-2 gap-3 ${patron ? "lg:grid-cols-4" : ""}`}>
        <div className="card p-4">
          <h3 className="text-xs font-medium text-stone-500">Toplam İş</h3>
          <p className="mt-1 text-xl font-bold text-stone-900">{gecerli.length}</p>
        </div>
        {patron && (
          <>
            <div className="card p-4">
              <h3 className="text-xs font-medium text-stone-500">Toplam Tutar</h3>
              <p className="mt-1 text-xl font-bold text-stone-900">{paraTL(toplamTutar)}</p>
            </div>
            <div className="card p-4">
              <h3 className="text-xs font-medium text-stone-500">Alınan Kapora</h3>
              <p className="mt-1 text-xl font-bold text-emerald-600">{paraTL(alinanKapora)}</p>
            </div>
            <div className="card p-4">
              <h3 className="text-xs font-medium text-stone-500">Kalan (Bakiye)</h3>
              <p className={`mt-1 text-xl font-bold ${kalan > 0 ? "text-red-600" : "text-stone-900"}`}>{paraTL(kalan)}</p>
            </div>
          </>
        )}
      </div>

      {/* Notlar */}
      {m.notlar && (
        <div className="card mb-6 p-4">
          <h3 className="mb-1 text-sm font-semibold text-stone-700">Notlar</h3>
          <p className="whitespace-pre-wrap text-sm text-stone-600">{m.notlar}</p>
        </div>
      )}

      {/* İş geçmişi */}
      <h2 className="mb-3 text-lg font-semibold text-stone-900">İş Geçmişi</h2>
      {tumIsler.length === 0 ? (
        <EmptyState icon={ClipboardList} baslik="Henüz iş yok" aciklama="Bu müşteriye ait kayıtlı iş bulunmuyor." />
      ) : (
        <div className="space-y-2.5">
          {tumIsler.map((i) => (
            <Link key={i.id} href={`/panel/isler/${i.id}`} className="card flex items-center justify-between gap-3 p-3 transition hover:border-brand-200">
              <div className="min-w-0">
                <div className="truncate font-semibold text-brand-700">{i.baslik}</div>
                <div className="mt-0.5 text-xs text-stone-500">{tarihAralik(i.baslangic, i.bitis)}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`badge ${DURUM_RENK[i.durum] || ""}`}>{i.durum}</span>
                {patron && <span className="font-semibold text-stone-900">{paraTL(i.tutar)}</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

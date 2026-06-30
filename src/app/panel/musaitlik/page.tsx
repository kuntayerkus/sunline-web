import { gerekliOturum } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MusaitlikClient, type Kaynak, type Rezervasyon } from "./musaitlik-client";

export default async function MusaitlikPage() {
  await gerekliOturum();
  const supabase = await createClient();

  const [{ data: envanter }, { data: odalar }, { data: isEkipman }, { data: isOda }] = await Promise.all([
    supabase.from("envanter").select("id, ad, kategori").eq("durum", "aktif").order("ad", { ascending: true }),
    supabase.from("studyo_oda").select("id, ad, tip").eq("aktif", true).order("ad", { ascending: true }),
    supabase.from("is_ekipman").select("envanter_id, isler(id, baslik, baslangic, bitis, durum)"),
    supabase.from("is_oda").select("oda_id, isler(id, baslik, baslangic, bitis, durum)"),
  ]);

  const ekipman: Kaynak[] = (envanter || []).map((e) => ({ id: e.id, ad: e.ad, alt: e.kategori }));
  const oda: Kaynak[] = (odalar || []).map((o) => ({ id: o.id, ad: o.ad, alt: o.tip }));

  const rez: Rezervasyon[] = [];
  for (const r of (isEkipman as unknown as { envanter_id: string; isler: Rezervasyon["is"] }[]) || []) {
    if (r.isler) rez.push({ kaynakId: r.envanter_id, is: r.isler });
  }
  const odaRez: Rezervasyon[] = [];
  for (const r of (isOda as unknown as { oda_id: string; isler: Rezervasyon["is"] }[]) || []) {
    if (r.isler) odaRez.push({ kaynakId: r.oda_id, is: r.isler });
  }

  return (
    <div>
      <PageHeader baslik="Müsaitlik" aciklama="Seçtiğin tarihte hangi ekipman ve oda boş, anında gör." />
      <MusaitlikClient ekipman={ekipman} oda={oda} ekipmanRez={rez} odaRez={odaRez} />
    </div>
  );
}

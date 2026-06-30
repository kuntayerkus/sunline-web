import { redirect } from "next/navigation";
import { gerekliOturum } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { PuantajClient, type Atama } from "./puantaj-client";

export default async function PuantajPage() {
  const { profile } = await gerekliOturum();
  if (profile.rol !== "patron") redirect("/panel");

  const supabase = await createClient();
  const { data } = await supabase
    .from("is_ekip")
    .select("id, rol, ekip_id, ekip(ad, gunluk_ucret, aktif), isler(baslik, baslangic, bitis, durum)");

  return (
    <div>
      <PageHeader
        baslik="Puantaj & Yevmiye"
        aciklama="Ekip üyelerinin aylık çalışması ve hak edişleri."
      />
      <PuantajClient atamalar={(data as unknown as Atama[]) || []} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { IslerListesi } from "./isler-client";
import type { Is, Musteri, Envanter } from "@/lib/types";

type IsWithMusteri = Is & { 
  musteriler?: { ad: string } | null;
  is_ekipman?: { envanter_id: string, adet: number }[];
};

export default async function IslerPage() {
  const supabase = await createClient();

  const [
    { data: isler },
    { data: musteriler },
    { data: envanterler },
  ] = await Promise.all([
    supabase.from("isler").select("*, musteriler(ad), is_ekipman(envanter_id, adet)").order("baslangic", { ascending: false }),
    supabase.from("musteriler").select("*").order("ad", { ascending: true }),
    supabase.from("envanter").select("*").eq("durum", "aktif").order("ad", { ascending: true }),
  ]);

  return (
    <div>
      <PageHeader
        baslik="İşler"
        aciklama="Rezervasyonlar, ekipman/ekip ataması ve çakışma kontrolü."
      />
      <IslerListesi
        isler={(isler as IsWithMusteri[]) || []}
        musteriler={(musteriler as Musteri[]) || []}
        envanterler={(envanterler as Envanter[]) || []}
      />
    </div>
  );
}

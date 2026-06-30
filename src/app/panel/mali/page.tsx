import { redirect } from "next/navigation";
import { gerekliOturum } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MaliClient } from "./mali-client";
import type { MaliHareket, Is, SabitGider } from "@/lib/types";

export default async function MaliPage() {
  const { profile } = await gerekliOturum();
  if (profile.rol !== "patron") redirect("/panel");

  const supabase = await createClient();
  const [
    { data: hareketler },
    { data: isler },
    sabitRes,
  ] = await Promise.all([
    supabase.from("mali_hareket").select("*").order("tarih", { ascending: false }),
    supabase.from("isler").select("*").order("baslangic", { ascending: false }),
    // Sabit giderler tablosu (0002_mali.sql). Migration uygulanmadıysa hata
    // gelir; sayfayı kırmamak için defansif: boş listeye düş.
    supabase.from("sabit_gider").select("*").order("created_at", { ascending: false }),
  ]);

  const sabitGiderler = (sabitRes.error ? [] : (sabitRes.data as SabitGider[])) || [];

  return (
    <div>
      <PageHeader
        baslik="Mali"
        aciklama="Aylık gelir-gider, sabit giderler ve kategori analizi."
      />
      <MaliClient
        hareketler={(hareketler as MaliHareket[]) || []}
        isler={(isler as Is[]) || []}
        sabitGiderler={sabitGiderler}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import { gerekliOturum } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { MaliClient } from "./mali-client";
import type { MaliHareket, Is } from "@/lib/types";

export default async function MaliPage() {
  const { profile } = await gerekliOturum();
  if (profile.rol !== "patron") redirect("/panel");

  const supabase = await createClient();
  const [
    { data: hareketler },
    { data: isler },
  ] = await Promise.all([
    supabase.from("mali_hareket").select("*").order("tarih", { ascending: false }),
    supabase.from("isler").select("*").order("baslangic", { ascending: false }),
  ]);

  const tumHareketler = (hareketler as MaliHareket[]) || [];
  const toplamGelir = tumHareketler.filter(h => h.tip === "gelir").reduce((sum, h) => sum + h.tutar, 0);
  const toplamGider = tumHareketler.filter(h => h.tip === "gider").reduce((sum, h) => sum + h.tutar, 0);
  const net = toplamGelir - toplamGider;

  return (
    <div>
      <PageHeader
        baslik="Mali"
        aciklama="Gelir-gider, haftalık/aylık rapor ve sezon analizi."
      />
      <MaliClient
        hareketler={tumHareketler}
        isler={(isler as Is[]) || []}
        toplamGelir={toplamGelir}
        toplamGider={toplamGider}
        net={net}
      />
    </div>
  );
}

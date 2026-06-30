import { createClient } from "@/lib/supabase/server";
import { gerekliOturum } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { HatirlatmaClient } from "./hatirlatma-client";
import type { Hatirlatma } from "@/lib/types";

export default async function HatirlatmalarPage() {
  await gerekliOturum();
  const supabase = await createClient();

  // Tablo (0003) yoksa sayfa kırılmasın: hata -> boş liste.
  const res = await supabase
    .from("hatirlatma")
    .select("*")
    .order("tarih", { ascending: true });

  const hatirlatmalar = (res.error ? [] : (res.data as Hatirlatma[])) || [];

  return (
    <div>
      <PageHeader baslik="Hatırlatmalar" aciklama="Kapora, iade tarihi, takip aramaları — unutma." />
      <HatirlatmaClient hatirlatmalar={hatirlatmalar} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { TakvimClient } from "./takvim-client";
import type { Is } from "@/lib/types";

type IsWithMusteri = Is & { musteriler?: { ad: string } | null };

export default async function TakvimPage() {
  const supabase = await createClient();

  const { data: isler } = await supabase
    .from("isler")
    .select("*, musteriler(ad)");

  return (
    <div>
      <PageHeader
        baslik="Takvim"
        aciklama="İşler, ekipman ve oda doluluğu tek ekranda."
      />
      <TakvimClient isler={(isler as IsWithMusteri[]) || []} />
    </div>
  );
}

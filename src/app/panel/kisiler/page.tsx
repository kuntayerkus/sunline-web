import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { KisilerTabs } from "./kisiler-tabs";
import type { Musteri, Ekip } from "@/lib/types";

export default async function KisilerPage() {
  const supabase = await createClient();

  const [
    { data: musteriler },
    { data: ekip },
  ] = await Promise.all([
    supabase.from("musteriler").select("*").order("created_at", { ascending: false }),
    supabase.from("ekip").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader
        baslik="Kişiler"
        aciklama="Müşteriler/gruplar ve ekip/teknisyenler."
      />
      <KisilerTabs
        musteriler={(musteriler as Musteri[]) || []}
        ekip={(ekip as Ekip[]) || []}
      />
    </div>
  );
}

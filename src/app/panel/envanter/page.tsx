import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { EnvanterTabs } from "./envanter-tabs";
import type { Envanter, StudyoOda, Hizmet } from "@/lib/types";

export default async function EnvanterPage() {
  const supabase = await createClient();

  const [
    { data: ekipmanlar },
    { data: odalar },
    { data: hizmetler },
  ] = await Promise.all([
    supabase.from("envanter").select("*").order("created_at", { ascending: false }),
    supabase.from("studyo_oda").select("*").order("created_at", { ascending: false }),
    supabase.from("hizmet").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <div>
      <PageHeader
        baslik="Envanter"
        aciklama="Backline ekipman, stüdyo odaları ve hizmetler."
      />
      <EnvanterTabs
        ekipmanlar={(ekipmanlar as Envanter[]) || []}
        odalar={(odalar as StudyoOda[]) || []}
        hizmetler={(hizmetler as Hizmet[]) || []}
      />
    </div>
  );
}

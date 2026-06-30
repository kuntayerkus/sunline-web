import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { NotKartlari } from "./notlar-client";
import type { Not } from "@/lib/types";

export default async function NotlarPage() {
  const supabase = await createClient();

  const { data: notlar } = await supabase
    .from("notlar")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        baslik="Notlar"
        aciklama="Serbest notlar, müşteri veya işe özel hatırlatmalar."
      />
      <NotKartlari notlar={(notlar as Not[]) || []} />
    </div>
  );
}

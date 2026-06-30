import { redirect } from "next/navigation";
import { gerekliOturum } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { AyarlarClient } from "./ayarlar-client";
import type { Profile } from "@/lib/types";

export default async function AyarlarPage() {
  const { profile, userId } = await gerekliOturum();
  if (profile.rol !== "patron") redirect("/panel");

  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div>
      <PageHeader
        baslik="Ayarlar"
        aciklama="Kullanıcılar, roller ve sistem ayarları."
      />
      <AyarlarClient
        profiles={(profiles as Profile[]) || []}
        currentUserId={userId}
      />
    </div>
  );
}

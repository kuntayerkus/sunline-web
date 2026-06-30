import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Girişli kullanıcıyı ve profilini (rol dahil) döndürür.
 * Giriş yoksa /giris'e yönlendirir. Korumalı sayfalarda kullanın.
 *
 * cache(): aynı istek içinde (layout + sayfa birlikte) tekrar çağrılırsa
 * Supabase'e bir kez gidilir; gereksiz getUser/profil sorgusu tekrarı önlenir.
 */
export const gerekliOturum = cache(async function gerekliOturum(): Promise<{
  userId: string;
  email: string | null;
  profile: Profile;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/giris");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Profil henüz oluşmadıysa (nadiren) güvenli varsayılan.
  const guvenliProfil: Profile =
    profile ??
    ({
      id: user.id,
      ad_soyad: user.email?.split("@")[0] ?? null,
      rol: "ekip",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile);

  return { userId: user.id, email: user.email ?? null, profile: guvenliProfil };
});

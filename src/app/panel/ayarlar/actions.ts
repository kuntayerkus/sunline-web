"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function rolGuncelle(userId: string, yeniRol: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı" };

  if (userId === user.id) {
    return { error: "Kendi rolünüzü değiştiremezsiniz" };
  }

  if (yeniRol !== "patron" && yeniRol !== "ekip") {
    return { error: "Geçersiz rol" };
  }

  const { error } = await supabase.from("profiles").update({ rol: yeniRol }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/panel/ayarlar");
}

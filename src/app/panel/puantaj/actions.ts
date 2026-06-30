"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Bir ekip üyesinin aylık yevmiye toplamını Mali'ye gider olarak yazar.
 * (mali_hareket — yalnız patron RLS)
 */
export async function puantajGiderEkle(ad: string, ay: string, tutar: number) {
  if (!ad || !ay || !(tutar > 0)) return { error: "Geçersiz veri" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı" };

  // ayın son günü (YYYY-MM -> ay sonu)
  const [y, m] = ay.split("-").map(Number);
  const sonGun = new Date(y, m, 0);
  const tarih = `${sonGun.getFullYear()}-${String(sonGun.getMonth() + 1).padStart(2, "0")}-${String(sonGun.getDate()).padStart(2, "0")}`;

  const { error } = await supabase.from("mali_hareket").insert({
    tip: "gider",
    kategori: "Yevmiye",
    tutar,
    tarih,
    aciklama: `${ad} — ${ay} yevmiye`,
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/panel/mali");
  return { ok: true };
}

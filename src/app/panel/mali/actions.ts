"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const maliSchema = z.object({
  tip: z.enum(["gelir", "gider"]),
  kategori: z.string().nullable(),
  tutar: z.coerce.number().min(0.01, "Tutar 0'dan büyük olmalıdır"),
  tarih: z.string(),
  is_id: z.string().nullable(),
  odeme_yontemi: z.enum(["nakit", "havale", "kart", "diger"]).nullable(),
  aciklama: z.string().nullable(),
});

export async function hareketEkle(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı" };

  const rawData = Object.fromEntries(formData);
  const data = {
    ...rawData,
    kategori: rawData.kategori || null,
    is_id: rawData.is_id || null,
    odeme_yontemi: rawData.odeme_yontemi || null,
    aciklama: rawData.aciklama || null,
  };

  const validated = maliSchema.safeParse(data);
  if (!validated.success) return { error: "Doğrulama hatası" };

  const { error } = await supabase.from("mali_hareket").insert({
    ...validated.data,
    created_by: user.id,
  });
  if (error) return { error: error.message };

  revalidatePath("/panel/mali");
}

export async function hareketGuncelle(id: string, formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData);
  const data = {
    ...rawData,
    kategori: rawData.kategori || null,
    is_id: rawData.is_id || null,
    odeme_yontemi: rawData.odeme_yontemi || null,
    aciklama: rawData.aciklama || null,
  };

  const validated = maliSchema.safeParse(data);
  if (!validated.success) return { error: "Doğrulama hatası" };

  const { error } = await supabase.from("mali_hareket").update(validated.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/panel/mali");
}

export async function hareketSil(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("mali_hareket").delete().eq("id", id);
  if (error) return { error: "Silinirken hata oluştu" };
  revalidatePath("/panel/mali");
}

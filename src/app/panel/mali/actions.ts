"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { dbHata } from "@/lib/db-error";
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
  if (!validated.success) return { error: validated.error.issues[0]?.message || "Doğrulama hatası" };

  const { error } = await supabase.from("mali_hareket").insert({
    ...validated.data,
    created_by: user.id,
  });
  if (error) return { error: dbHata(error, "Hareket eklenirken") };

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
  if (!validated.success) return { error: validated.error.issues[0]?.message || "Doğrulama hatası" };

  const { error } = await supabase.from("mali_hareket").update(validated.data).eq("id", id);
  if (error) return { error: dbHata(error, "Hareket güncellenirken") };

  revalidatePath("/panel/mali");
}

export async function hareketSil(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("mali_hareket").delete().eq("id", id);
  if (error) return { error: "Silinirken hata oluştu" };
  revalidatePath("/panel/mali");
}

// ===================== Sabit (aylık tekrarlayan) giderler =====================

const sabitGiderSchema = z.object({
  ad: z.string().min(1, "Ad zorunludur"),
  kategori: z.string().nullable(),
  tutar: z.coerce.number().min(0.01, "Tutar 0'dan büyük olmalıdır"),
  baslangic_ay: z.string(),
  bitis_ay: z.string().nullable(),
  aktif: z.coerce.boolean(),
  notlar: z.string().nullable(),
});

function sabitGiderForm(formData: FormData) {
  const raw = Object.fromEntries(formData);
  return {
    ...raw,
    kategori: raw.kategori || null,
    // ay seçici "YYYY-MM" verir -> ayın ilk gününe çevir
    baslangic_ay: raw.baslangic_ay ? `${raw.baslangic_ay}-01` : "",
    bitis_ay: raw.bitis_ay ? `${raw.bitis_ay}-01` : null,
    aktif: raw.aktif === "on" || raw.aktif === "true",
    notlar: raw.notlar || null,
  };
}

export async function sabitGiderEkle(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı" };

  const validated = sabitGiderSchema.safeParse(sabitGiderForm(formData));
  if (!validated.success) return { error: validated.error.issues[0]?.message || "Doğrulama hatası" };

  const { error } = await supabase.from("sabit_gider").insert({
    ...validated.data,
    created_by: user.id,
  });
  if (error) return { error: dbHata(error, "Sabit gider eklenirken") };
  revalidatePath("/panel/mali");
}

export async function sabitGiderGuncelle(id: string, formData: FormData) {
  const supabase = await createClient();
  const validated = sabitGiderSchema.safeParse(sabitGiderForm(formData));
  if (!validated.success) return { error: validated.error.issues[0]?.message || "Doğrulama hatası" };

  const { error } = await supabase.from("sabit_gider").update(validated.data).eq("id", id);
  if (error) return { error: dbHata(error, "Sabit gider güncellenirken") };
  revalidatePath("/panel/mali");
}

export async function sabitGiderSil(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sabit_gider").delete().eq("id", id);
  if (error) return { error: "Silinirken hata oluştu" };
  revalidatePath("/panel/mali");
}

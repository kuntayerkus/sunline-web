"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { dbHata } from "@/lib/db-error";

// ── Müşteri ────────────────────────────────────────────

const musteriSchema = z.object({
  ad: z.string().min(1, "Ad alanı zorunludur"),
  tip: z.enum(["grup", "bireysel", "kurumsal"]),
  telefon: z.string().optional().default(""),
  eposta: z.string().email("Geçersiz e-posta").optional().or(z.literal("")),
  notlar: z.string().optional().default(""),
});

export async function musteriEkle(formData: FormData) {
  const parsed = musteriSchema.safeParse({
    ad: formData.get("ad"),
    tip: formData.get("tip"),
    telefon: formData.get("telefon"),
    eposta: formData.get("eposta"),
    notlar: formData.get("notlar"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("musteriler").insert({
    ad: parsed.data.ad,
    tip: parsed.data.tip,
    telefon: parsed.data.telefon || null,
    eposta: parsed.data.eposta || null,
    notlar: parsed.data.notlar || null,
  });

  if (error) return { error: dbHata(error, "Müşteri eklenirken") };
  revalidatePath("/panel/kisiler");
}

export async function musteriGuncelle(id: string, formData: FormData) {
  const parsed = musteriSchema.safeParse({
    ad: formData.get("ad"),
    tip: formData.get("tip"),
    telefon: formData.get("telefon"),
    eposta: formData.get("eposta"),
    notlar: formData.get("notlar"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("musteriler")
    .update({
      ad: parsed.data.ad,
      tip: parsed.data.tip,
      telefon: parsed.data.telefon || null,
      eposta: parsed.data.eposta || null,
      notlar: parsed.data.notlar || null,
    })
    .eq("id", id);

  if (error) return { error: dbHata(error, "Müşteri güncellenirken") };
  revalidatePath("/panel/kisiler");
}

export async function musteriSil(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("musteriler").delete().eq("id", id);

  if (error) return { error: dbHata(error, "Müşteri silinirken") };
  revalidatePath("/panel/kisiler");
}

// ── Ekip ───────────────────────────────────────────────

const ekipSchema = z.object({
  ad: z.string().min(1, "Ad alanı zorunludur"),
  uzmanlik: z.string().optional().default(""),
  telefon: z.string().optional().default(""),
  gunluk_ucret: z.coerce.number().min(0, "Ücret 0 veya üstü olmalıdır"),
  aktif: z.boolean().default(true),
  notlar: z.string().optional().default(""),
});

export async function ekipEkle(formData: FormData) {
  const parsed = ekipSchema.safeParse({
    ad: formData.get("ad"),
    uzmanlik: formData.get("uzmanlik"),
    telefon: formData.get("telefon"),
    gunluk_ucret: formData.get("gunluk_ucret"),
    aktif: formData.get("aktif") === "on" || formData.get("aktif") === "true",
    notlar: formData.get("notlar"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ekip").insert({
    ad: parsed.data.ad,
    uzmanlik: parsed.data.uzmanlik || null,
    telefon: parsed.data.telefon || null,
    gunluk_ucret: parsed.data.gunluk_ucret,
    aktif: parsed.data.aktif,
    notlar: parsed.data.notlar || null,
  });

  if (error) return { error: dbHata(error, "Ekip üyesi eklenirken") };
  revalidatePath("/panel/kisiler");
}

export async function ekipGuncelle(id: string, formData: FormData) {
  const parsed = ekipSchema.safeParse({
    ad: formData.get("ad"),
    uzmanlik: formData.get("uzmanlik"),
    telefon: formData.get("telefon"),
    gunluk_ucret: formData.get("gunluk_ucret"),
    aktif: formData.get("aktif") === "on" || formData.get("aktif") === "true",
    notlar: formData.get("notlar"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("ekip")
    .update({
      ad: parsed.data.ad,
      uzmanlik: parsed.data.uzmanlik || null,
      telefon: parsed.data.telefon || null,
      gunluk_ucret: parsed.data.gunluk_ucret,
      aktif: parsed.data.aktif,
      notlar: parsed.data.notlar || null,
    })
    .eq("id", id);

  if (error) return { error: dbHata(error, "Ekip üyesi güncellenirken") };
  revalidatePath("/panel/kisiler");
}

export async function ekipSil(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("is_ekip")
    .select("id", { count: "exact", head: true })
    .eq("ekip_id", id);
  if (count && count > 0) {
    return {
      error: `Bu kişi ${count} işe atanmış, silinemez. Geçmiş kayıtları korumak için "Pasif" duruma alın.`,
    };
  }

  const { error } = await supabase.from("ekip").delete().eq("id", id);

  if (error) return { error: dbHata(error, "Ekip üyesi silinirken") };
  revalidatePath("/panel/kisiler");
}

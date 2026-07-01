"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const PATH = "/panel/envanter";

// ─── Ekipman (envanter) ───────────────────────────────────────

const ekipmanSchema = z.object({
  ad: z.string().min(1, "Ad zorunludur"),
  kategori: z.string().optional(),
  marka: z.string().optional(),
  model: z.string().optional(),
  takip: z.enum(["adet", "tekil"]),
  adet: z.coerce.number().int().min(1).default(1),
  seri_no: z.string().optional(),
  gunluk_ucret: z.coerce.number().min(0, "Günlük ücret 0 veya daha fazla olmalı"),
  durum: z.enum(["aktif", "bakimda", "arizali", "elden_cikti"]).default("aktif"),
  aciklama: z.string().optional(),
});

export async function ekipmanEkle(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = ekipmanSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const data = parsed.data;
  if (data.takip === "tekil") data.adet = 1;

  const supabase = await createClient();
  const { error } = await supabase.from("envanter").insert({
    ad: data.ad,
    kategori: data.kategori || null,
    marka: data.marka || null,
    model: data.model || null,
    takip: data.takip,
    adet: data.adet,
    seri_no: data.seri_no || null,
    gunluk_ucret: data.gunluk_ucret,
    durum: data.durum,
    aciklama: data.aciklama || null,
  });

  if (error) return { error: error.message };
  revalidatePath(PATH);
}

export async function ekipmanGuncelle(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = ekipmanSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const data = parsed.data;
  if (data.takip === "tekil") data.adet = 1;

  const supabase = await createClient();
  const { error } = await supabase
    .from("envanter")
    .update({
      ad: data.ad,
      kategori: data.kategori || null,
      marka: data.marka || null,
      model: data.model || null,
      takip: data.takip,
      adet: data.adet,
      seri_no: data.seri_no || null,
      gunluk_ucret: data.gunluk_ucret,
      durum: data.durum,
      aciklama: data.aciklama || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(PATH);
}

export async function ekipmanSil(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("is_ekipman")
    .select("id", { count: "exact", head: true })
    .eq("envanter_id", id);
  if (count && count > 0) {
    return {
      error: `Bu ekipman ${count} işe atanmış, silinemez. Geçmiş kayıtları korumak için durumunu "Elden Çıktı" olarak güncelleyin.`,
    };
  }

  const { error } = await supabase.from("envanter").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(PATH);
}

// ─── Oda (studyo_oda) ─────────────────────────────────────────

const odaSchema = z.object({
  ad: z.string().min(1, "Ad zorunludur"),
  tip: z.enum(["prova", "kayit", "kontrol", "diger"]),
  saatlik_ucret: z.coerce.number().min(0, "Saatlik ücret 0 veya daha fazla olmalı"),
  gunluk_ucret: z.coerce.number().min(0, "Günlük ücret 0 veya daha fazla olmalı"),
  aciklama: z.string().optional(),
  aktif: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).default(true),
});

export async function odaEkle(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = odaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("studyo_oda").insert({
    ad: data.ad,
    tip: data.tip,
    saatlik_ucret: data.saatlik_ucret,
    gunluk_ucret: data.gunluk_ucret,
    aciklama: data.aciklama || null,
    aktif: data.aktif,
  });

  if (error) return { error: error.message };
  revalidatePath(PATH);
}

export async function odaGuncelle(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = odaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("studyo_oda")
    .update({
      ad: data.ad,
      tip: data.tip,
      saatlik_ucret: data.saatlik_ucret,
      gunluk_ucret: data.gunluk_ucret,
      aciklama: data.aciklama || null,
      aktif: data.aktif,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(PATH);
}

export async function odaSil(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from("is_oda")
    .select("id", { count: "exact", head: true })
    .eq("oda_id", id);
  if (count && count > 0) {
    return {
      error: `Bu oda ${count} işe atanmış, silinemez. Geçmiş kayıtları korumak için pasif duruma alın.`,
    };
  }

  const { error } = await supabase.from("studyo_oda").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(PATH);
}

// ─── Hizmet ───────────────────────────────────────────────────

const hizmetSchema = z.object({
  ad: z.string().min(1, "Ad zorunludur"),
  kategori: z.enum(["studyo", "backline", "diger"]),
  birim: z.enum(["saat", "gun", "proje", "sarki", "adet"]),
  birim_ucret: z.coerce.number().min(0, "Birim ücret 0 veya daha fazla olmalı"),
  aktif: z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean()).default(true),
});

export async function hizmetEkle(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = hizmetSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("hizmet").insert({
    ad: data.ad,
    kategori: data.kategori,
    birim: data.birim,
    birim_ucret: data.birim_ucret,
    aktif: data.aktif,
  });

  if (error) return { error: error.message };
  revalidatePath(PATH);
}

export async function hizmetGuncelle(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = hizmetSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((e) => e.message).join(", ") };
  }

  const data = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("hizmet")
    .update({
      ad: data.ad,
      kategori: data.kategori,
      birim: data.birim,
      birim_ucret: data.birim_ucret,
      aktif: data.aktif,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(PATH);
}

export async function hizmetSil(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("hizmet").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(PATH);
}

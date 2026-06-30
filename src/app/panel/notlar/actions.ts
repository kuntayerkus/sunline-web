"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const RENKLER = [
  "stone",
  "red",
  "orange",
  "amber",
  "emerald",
  "sky",
  "violet",
  "pink",
] as const;

const notSchema = z.object({
  baslik: z.string().min(1, "Başlık zorunludur").max(200, "Başlık çok uzun"),
  icerik: z.string().max(5000, "İçerik çok uzun").optional().default(""),
  renk: z.enum(RENKLER).optional().default("stone"),
  iliskili_tip: z.enum(["genel", "is", "envanter", "musteri"]).optional().default("genel"),
});

export async function notEkle(
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = notSchema.safeParse({
    baslik: formData.get("baslik"),
    icerik: formData.get("icerik"),
    renk: formData.get("renk") || "stone",
    iliskili_tip: formData.get("iliskili_tip") || "genel",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { baslik, icerik, renk, iliskili_tip } = parsed.data;

  const { error } = await supabase.from("notlar").insert({
    baslik,
    icerik: icerik || null,
    renk,
    iliskili_tip: iliskili_tip === "genel" ? null : iliskili_tip,
    created_by: user.id,
  });

  if (error) return { error: "Not eklenemedi: " + error.message };

  revalidatePath("/panel/notlar");
  return {};
}

export async function notGuncelle(
  id: string,
  formData: FormData,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const parsed = notSchema.safeParse({
    baslik: formData.get("baslik"),
    icerik: formData.get("icerik"),
    renk: formData.get("renk") || "stone",
    iliskili_tip: formData.get("iliskili_tip") || "genel",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { baslik, icerik, renk, iliskili_tip } = parsed.data;

  const { error } = await supabase
    .from("notlar")
    .update({
      baslik,
      icerik: icerik || null,
      renk,
      iliskili_tip: iliskili_tip === "genel" ? null : iliskili_tip,
    })
    .eq("id", id);

  if (error) return { error: "Not güncellenemedi: " + error.message };

  revalidatePath("/panel/notlar");
  return {};
}

export async function notSil(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı." };

  const { error } = await supabase.from("notlar").delete().eq("id", id);

  if (error) return { error: "Not silinemedi: " + error.message };

  revalidatePath("/panel/notlar");
  return {};
}

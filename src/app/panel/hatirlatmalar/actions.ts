"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { dbHata } from "@/lib/db-error";

const schema = z.object({
  baslik: z.string().min(1, "Başlık zorunludur"),
  aciklama: z.string().nullable(),
  tarih: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Geçerli bir tarih giriniz"),
});

function parse(formData: FormData) {
  const raw = Object.fromEntries(formData);
  return schema.safeParse({
    baslik: raw.baslik,
    aciklama: raw.aciklama || null,
    tarih: raw.tarih || new Date().toISOString().slice(0, 10),
  });
}

export async function hatirlatmaEkle(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı" };

  const v = parse(formData);
  if (!v.success) return { error: v.error.issues[0]?.message || "Doğrulama hatası" };

  const { error } = await supabase.from("hatirlatma").insert({ ...v.data, created_by: user.id });
  if (error) return { error: dbHata(error, "Hatırlatma eklenirken") };
  revalidatePath("/panel/hatirlatmalar");
  revalidatePath("/panel");
}

export async function hatirlatmaGuncelle(id: string, formData: FormData) {
  const supabase = await createClient();
  const v = parse(formData);
  if (!v.success) return { error: v.error.issues[0]?.message || "Doğrulama hatası" };

  const { error } = await supabase.from("hatirlatma").update(v.data).eq("id", id);
  if (error) return { error: dbHata(error, "Hatırlatma güncellenirken") };
  revalidatePath("/panel/hatirlatmalar");
  revalidatePath("/panel");
}

export async function hatirlatmaToggle(id: string, tamamlandi: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("hatirlatma").update({ tamamlandi }).eq("id", id);
  if (error) return { error: dbHata(error, "Hatırlatma güncellenirken") };
  revalidatePath("/panel/hatirlatmalar");
  revalidatePath("/panel");
}

export async function hatirlatmaSil(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("hatirlatma").delete().eq("id", id);
  if (error) return { error: "Silinirken hata oluştu" };
  revalidatePath("/panel/hatirlatmalar");
  revalidatePath("/panel");
}

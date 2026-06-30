"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const isSchema = z.object({
  baslik: z.string().min(1, "Başlık zorunludur"),
  tip: z.enum(["backline", "prova", "kayit", "mix", "mastering", "diger"]),
  musteri_id: z.string().nullable(),
  baslangic: z.string(),
  bitis: z.string(),
  durum: z.enum(["talep", "teklif", "onayli", "tamamlandi", "iptal"]),
  lokasyon: z.string().nullable(),
  tutar: z.coerce.number().min(0),
  kapora: z.coerce.number().min(0),
  notlar: z.string().nullable(),
});

async function checkEkipmanCakismasi(
  supabase: any,
  ekipmanIds: string[],
  baslangic: string,
  bitis: string,
  excludeIsId?: string
) {
  if (ekipmanIds.length === 0) return null;
  
  let query = supabase
    .from("is_ekipman")
    .select("envanter_id, isler!inner(id, baslik, durum, baslangic, bitis), envanter(ad)")
    .in("envanter_id", ekipmanIds)
    .in("isler.durum", ["talep", "teklif", "onayli"])
    .lt("isler.baslangic", bitis)
    .gt("isler.bitis", baslangic);

  if (excludeIsId) {
    query = query.neq("isler.id", excludeIsId);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (data && data.length > 0) {
    const msgs = data.map((d: any) => `${d.envanter?.ad || 'Ekipman'} -> ${d.isler?.baslik || 'Başka İş'}`);
    // Tekilleştirme
    const uniqueMsgs = Array.from(new Set(msgs));
    return `Çakışma var! Aşağıdaki ekipmanlar belirtilen tarihlerde başka işlere atanmış:\n${uniqueMsgs.join("\n")}`;
  }
  return null;
}

export async function isEkle(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum bulunamadı" };

  const rawData = Object.fromEntries(formData);
  const data = {
    ...rawData,
    musteri_id: rawData.musteri_id || null,
    lokasyon: rawData.lokasyon || null,
    notlar: rawData.notlar || null,
    tutar: rawData.tutar || 0,
    kapora: rawData.kapora || 0,
  };

  const validated = isSchema.safeParse(data);
  if (!validated.success) return { error: "Doğrulama hatası" };

  const seciliEkipmanlarStr = formData.get("secili_ekipmanlar") as string;
  let seciliEkipmanlar: { envanter_id: string, adet: number }[] = [];
  if (seciliEkipmanlarStr) {
    try {
      seciliEkipmanlar = JSON.parse(seciliEkipmanlarStr);
    } catch (e) {
      // ignore parse error
    }
  }

  // Çakışma kontrolü
  if (seciliEkipmanlar.length > 0 && ["talep", "teklif", "onayli"].includes(validated.data.durum)) {
    const ekipmanIds = seciliEkipmanlar.map(e => e.envanter_id);
    const cakisim = await checkEkipmanCakismasi(supabase, ekipmanIds, validated.data.baslangic, validated.data.bitis);
    if (cakisim) return { error: cakisim };
  }

  const { data: inserted, error } = await supabase.from("isler").insert({
    ...validated.data,
    created_by: user.id,
    kaynak: "admin",
  }).select("id").single();
  
  if (error) return { error: error.message };

  if (seciliEkipmanlar.length > 0 && inserted) {
    const insertData = seciliEkipmanlar.map(e => ({
      is_id: inserted.id,
      envanter_id: e.envanter_id,
      adet: e.adet,
    }));
    await supabase.from("is_ekipman").insert(insertData);
  }

  revalidatePath("/panel/isler");
}

export async function isGuncelle(id: string, formData: FormData) {
  const supabase = await createClient();
  const rawData = Object.fromEntries(formData);
  const data = {
    ...rawData,
    musteri_id: rawData.musteri_id || null,
    lokasyon: rawData.lokasyon || null,
    notlar: rawData.notlar || null,
    tutar: rawData.tutar || 0,
    kapora: rawData.kapora || 0,
  };

  const validated = isSchema.safeParse(data);
  if (!validated.success) return { error: "Doğrulama hatası" };

  const seciliEkipmanlarStr = formData.get("secili_ekipmanlar") as string;
  let seciliEkipmanlar: { envanter_id: string, adet: number }[] = [];
  if (seciliEkipmanlarStr) {
    try {
      seciliEkipmanlar = JSON.parse(seciliEkipmanlarStr);
    } catch (e) {}
  }

  // Çakışma kontrolü
  if (seciliEkipmanlar.length > 0 && ["talep", "teklif", "onayli"].includes(validated.data.durum)) {
    const ekipmanIds = seciliEkipmanlar.map(e => e.envanter_id);
    const cakisim = await checkEkipmanCakismasi(supabase, ekipmanIds, validated.data.baslangic, validated.data.bitis, id);
    if (cakisim) return { error: cakisim };
  }

  const { error } = await supabase.from("isler").update(validated.data).eq("id", id);
  if (error) return { error: error.message };

  if (seciliEkipmanlarStr !== null) {
    // Sadece formdan bu input geldiyse (Yani ana sayfadan düzenleme yapılıyorsa)
    await supabase.from("is_ekipman").delete().eq("is_id", id);
    if (seciliEkipmanlar.length > 0) {
      const insertData = seciliEkipmanlar.map(e => ({
        is_id: id,
        envanter_id: e.envanter_id,
        adet: e.adet,
      }));
      await supabase.from("is_ekipman").insert(insertData);
    }
  }

  revalidatePath("/panel/isler");
  revalidatePath(`/panel/isler/${id}`);
}

export async function isSil(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("isler").delete().eq("id", id);
  if (error) return { error: "Silinirken hata oluştu" };
  revalidatePath("/panel/isler");
}

// Atamalar
export async function ekipmanAta(isId: string, envanterId: string, adet: number) {
  const supabase = await createClient();
  
  // Çakışma kontrolü
  const { data: isData } = await supabase.from("isler").select("baslangic, bitis").eq("id", isId).single();
  if (!isData) return { error: "İş bulunamadı" };

  // TODO: Tam çakışma kontrolü eklenebilir, şimdilik basit ekleme yapıyoruz
  const { error } = await supabase.from("is_ekipman").insert({
    is_id: isId,
    envanter_id: envanterId,
    adet,
  });
  if (error) return { error: error.message };
  revalidatePath(`/panel/isler/${isId}`);
}

export async function ekipmanCikar(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("is_ekipman").delete().eq("id", id);
  if (error) return { error: error.message };
}

export async function odaAta(isId: string, odaId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("is_oda").insert({
    is_id: isId,
    oda_id: odaId,
  });
  if (error) return { error: error.message };
  revalidatePath(`/panel/isler/${isId}`);
}

export async function odaCikar(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("is_oda").delete().eq("id", id);
  if (error) return { error: error.message };
}

export async function ekipAta(isId: string, ekipId: string, rol?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("is_ekip").insert({
    is_id: isId,
    ekip_id: ekipId,
    rol: rol || null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/panel/isler/${isId}`);
}

export async function ekipCikar(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("is_ekip").delete().eq("id", id);
  if (error) return { error: error.message };
}

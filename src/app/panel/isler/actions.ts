"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { dbHata } from "@/lib/db-error";
import { z } from "zod";

const AKTIF_DURUMLAR = ["talep", "teklif", "onayli"] as const;

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
}).refine((d) => new Date(d.bitis) > new Date(d.baslangic), {
  message: "Bitiş tarihi başlangıçtan sonra olmalıdır",
  path: ["bitis"],
});

// Seçilen ekipmanlar için, çakışan tarih aralığındaki başka işlerde ne kadar
// adedin zaten rezerve edildiğini toplar ve stoğu aşan istekleri raporlar.
async function checkAtamaCakismasi(
  supabase: SupabaseClient,
  istekler: { envanter_id: string; adet: number }[],
  baslangic: string,
  bitis: string,
  excludeIsId?: string
) {
  if (istekler.length === 0) return null;
  const ids = istekler.map((i) => i.envanter_id);

  const { data: envanterData, error: envErr } = await supabase
    .from("envanter")
    .select("id, ad, adet")
    .in("id", ids);
  if (envErr) throw envErr;
  const envanterMap = new Map((envanterData || []).map((e) => [e.id as string, e as { ad: string; adet: number }]));

  let query = supabase
    .from("is_ekipman")
    .select("envanter_id, adet, isler!inner(id, durum, baslangic, bitis)")
    .in("envanter_id", ids)
    .in("isler.durum", AKTIF_DURUMLAR)
    .lt("isler.baslangic", bitis)
    .gt("isler.bitis", baslangic);

  if (excludeIsId) {
    query = query.neq("isler.id", excludeIsId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rezerveEdilen = new Map<string, number>();
  for (const row of (data as unknown as { envanter_id: string; adet: number }[]) || []) {
    rezerveEdilen.set(row.envanter_id, (rezerveEdilen.get(row.envanter_id) || 0) + row.adet);
  }

  const hatalar: string[] = [];
  for (const istek of istekler) {
    const env = envanterMap.get(istek.envanter_id);
    const stok = env?.adet ?? 0;
    const doluAdet = rezerveEdilen.get(istek.envanter_id) || 0;
    const musaitAdet = stok - doluAdet;
    if (istek.adet > musaitAdet) {
      hatalar.push(
        `${env?.ad || "Ekipman"}: bu tarihlerde ${Math.max(musaitAdet, 0)} adet müsait (toplam stok ${stok}), ${istek.adet} adet istendi.`
      );
    }
  }

  if (hatalar.length > 0) {
    return `Çakışma var! Seçilen tarihlerde yeterli ekipman yok:\n${hatalar.join("\n")}`;
  }
  return null;
}

// Oda/ekip gibi tekil (bölünemez) kaynaklar için basit çakışma kontrolü.
async function checkTekilKaynakCakismasi(
  supabase: SupabaseClient,
  tablo: "is_oda" | "is_ekip",
  kolon: "oda_id" | "ekip_id",
  kaynakId: string,
  baslangic: string,
  bitis: string,
  excludeIsId: string
) {
  const { data, error } = await supabase
    .from(tablo)
    .select("isler!inner(id, baslik, durum, baslangic, bitis)")
    .eq(kolon, kaynakId)
    .in("isler.durum", AKTIF_DURUMLAR)
    .lt("isler.baslangic", bitis)
    .gt("isler.bitis", baslangic)
    .neq("isler.id", excludeIsId);
  if (error) throw error;

  if (data && data.length > 0) {
    const baslik = (data[0] as unknown as { isler: { baslik: string } }).isler?.baslik;
    return `Seçilen tarihlerde dolu: ${baslik || "başka bir iş"}.`;
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
  if (!validated.success) return { error: validated.error.issues[0]?.message || "Doğrulama hatası" };

  const seciliEkipmanlarStr = formData.get("secili_ekipmanlar") as string;
  let seciliEkipmanlar: { envanter_id: string, adet: number }[] = [];
  if (seciliEkipmanlarStr) {
    try {
      seciliEkipmanlar = JSON.parse(seciliEkipmanlarStr);
    } catch {
      // ignore parse error
    }
  }

  // Çakışma kontrolü
  if (seciliEkipmanlar.length > 0 && AKTIF_DURUMLAR.includes(validated.data.durum as typeof AKTIF_DURUMLAR[number])) {
    const cakisim = await checkAtamaCakismasi(supabase, seciliEkipmanlar, validated.data.baslangic, validated.data.bitis);
    if (cakisim) return { error: cakisim };
  }

  const { data: inserted, error } = await supabase.from("isler").insert({
    ...validated.data,
    created_by: user.id,
    kaynak: "admin",
  }).select("id").single();

  if (error) return { error: dbHata(error, "İş kaydedilirken") };

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
  if (!validated.success) return { error: validated.error.issues[0]?.message || "Doğrulama hatası" };

  const seciliEkipmanlarStr = formData.get("secili_ekipmanlar") as string;
  let seciliEkipmanlar: { envanter_id: string, adet: number }[] = [];
  if (seciliEkipmanlarStr) {
    try {
      seciliEkipmanlar = JSON.parse(seciliEkipmanlarStr);
    } catch {}
  }

  // Çakışma kontrolü
  if (seciliEkipmanlar.length > 0 && AKTIF_DURUMLAR.includes(validated.data.durum as typeof AKTIF_DURUMLAR[number])) {
    const cakisim = await checkAtamaCakismasi(supabase, seciliEkipmanlar, validated.data.baslangic, validated.data.bitis, id);
    if (cakisim) return { error: cakisim };
  }

  const { error } = await supabase.from("isler").update(validated.data).eq("id", id);
  if (error) return { error: dbHata(error, "İş güncellenirken") };

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

  const { data: isData } = await supabase.from("isler").select("baslangic, bitis, durum").eq("id", isId).single();
  if (!isData) return { error: "İş bulunamadı" };

  if (AKTIF_DURUMLAR.includes(isData.durum as typeof AKTIF_DURUMLAR[number])) {
    const cakisma = await checkAtamaCakismasi(
      supabase,
      [{ envanter_id: envanterId, adet }],
      isData.baslangic,
      isData.bitis,
      isId
    );
    if (cakisma) return { error: cakisma };
  }

  const { error } = await supabase.from("is_ekipman").insert({
    is_id: isId,
    envanter_id: envanterId,
    adet,
  });
  if (error) return { error: dbHata(error, "Ekipman atanırken") };
  revalidatePath(`/panel/isler/${isId}`);
}

export async function ekipmanCikar(id: string, isId?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("is_ekipman").delete().eq("id", id);
  if (error) return { error: dbHata(error, "Ekipman kaldırılırken") };
  if (isId) revalidatePath(`/panel/isler/${isId}`);
}

export async function odaAta(isId: string, odaId: string) {
  const supabase = await createClient();

  const { data: isData } = await supabase.from("isler").select("baslangic, bitis, durum").eq("id", isId).single();
  if (!isData) return { error: "İş bulunamadı" };

  if (AKTIF_DURUMLAR.includes(isData.durum as typeof AKTIF_DURUMLAR[number])) {
    const cakisma = await checkTekilKaynakCakismasi(supabase, "is_oda", "oda_id", odaId, isData.baslangic, isData.bitis, isId);
    if (cakisma) return { error: cakisma };
  }

  const { error } = await supabase.from("is_oda").insert({
    is_id: isId,
    oda_id: odaId,
  });
  if (error) return { error: dbHata(error, "Oda atanırken") };
  revalidatePath(`/panel/isler/${isId}`);
}

export async function odaCikar(id: string, isId?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("is_oda").delete().eq("id", id);
  if (error) return { error: dbHata(error, "Oda kaldırılırken") };
  if (isId) revalidatePath(`/panel/isler/${isId}`);
}

export async function ekipAta(isId: string, ekipId: string, rol?: string) {
  const supabase = await createClient();

  const { data: isData } = await supabase.from("isler").select("baslangic, bitis, durum").eq("id", isId).single();
  if (!isData) return { error: "İş bulunamadı" };

  if (AKTIF_DURUMLAR.includes(isData.durum as typeof AKTIF_DURUMLAR[number])) {
    const cakisma = await checkTekilKaynakCakismasi(supabase, "is_ekip", "ekip_id", ekipId, isData.baslangic, isData.bitis, isId);
    if (cakisma) return { error: cakisma };
  }

  const { error } = await supabase.from("is_ekip").insert({
    is_id: isId,
    ekip_id: ekipId,
    rol: rol || null,
  });
  if (error) return { error: dbHata(error, "Ekip atanırken") };
  revalidatePath(`/panel/isler/${isId}`);
}

export async function ekipCikar(id: string, isId?: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("is_ekip").delete().eq("id", id);
  if (error) return { error: dbHata(error, "Ekip kaldırılırken") };
  if (isId) revalidatePath(`/panel/isler/${isId}`);
}

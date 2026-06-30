// Veritabanı satır tipleri (0001_init.sql ile birebir).

export type Rol = "patron" | "ekip";

export type Profile = {
  id: string;
  ad_soyad: string | null;
  rol: Rol;
  created_at: string;
  updated_at: string;
};

export type MusteriTip = "grup" | "bireysel" | "kurumsal";
export type Musteri = {
  id: string;
  ad: string;
  tip: MusteriTip;
  telefon: string | null;
  eposta: string | null;
  notlar: string | null;
  created_at: string;
  updated_at: string;
};

export type Ekip = {
  id: string;
  ad: string;
  uzmanlik: string | null;
  telefon: string | null;
  gunluk_ucret: number;
  aktif: boolean;
  notlar: string | null;
  created_at: string;
  updated_at: string;
};

export type EnvanterTakip = "adet" | "tekil";
export type EnvanterDurum = "aktif" | "bakimda" | "arizali" | "elden_cikti";
export type Envanter = {
  id: string;
  ad: string;
  kategori: string | null;
  marka: string | null;
  model: string | null;
  takip: EnvanterTakip;
  adet: number;
  seri_no: string | null;
  gunluk_ucret: number;
  durum: EnvanterDurum;
  foto_url: string | null;
  aciklama: string | null;
  arsiv: boolean;
  created_at: string;
  updated_at: string;
};

export type OdaTip = "prova" | "kayit" | "kontrol" | "diger";
export type StudyoOda = {
  id: string;
  ad: string;
  tip: OdaTip;
  saatlik_ucret: number;
  gunluk_ucret: number;
  aciklama: string | null;
  aktif: boolean;
  created_at: string;
  updated_at: string;
};

export type HizmetKategori = "studyo" | "backline" | "diger";
export type HizmetBirim = "saat" | "gun" | "proje" | "sarki" | "adet";
export type Hizmet = {
  id: string;
  ad: string;
  kategori: HizmetKategori;
  birim: HizmetBirim;
  birim_ucret: number;
  aktif: boolean;
  created_at: string;
  updated_at: string;
};

export type IsTip = "backline" | "prova" | "kayit" | "mix" | "mastering" | "diger";
export type IsDurum = "talep" | "teklif" | "onayli" | "tamamlandi" | "iptal";
export type IsKaynak = "admin" | "musteri";
export type Is = {
  id: string;
  baslik: string;
  tip: IsTip;
  musteri_id: string | null;
  baslangic: string;
  bitis: string;
  durum: IsDurum;
  lokasyon: string | null;
  tutar: number;
  kapora: number;
  kaynak: IsKaynak;
  notlar: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type IsEkipman = {
  id: string;
  is_id: string;
  envanter_id: string;
  adet: number;
};

export type IsOda = { id: string; is_id: string; oda_id: string };
export type IsEkipAtama = { id: string; is_id: string; ekip_id: string; rol: string | null };

export type MaliTip = "gelir" | "gider";
export type OdemeYontemi = "nakit" | "havale" | "kart" | "diger";
export type MaliHareket = {
  id: string;
  tip: MaliTip;
  kategori: string | null;
  tutar: number;
  tarih: string;
  is_id: string | null;
  odeme_yontemi: OdemeYontemi | null;
  aciklama: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SabitGider = {
  id: string;
  ad: string;
  kategori: string | null;
  tutar: number;
  baslangic_ay: string; // date (YYYY-MM-DD)
  bitis_ay: string | null;
  aktif: boolean;
  notlar: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type NotIliskiTip = "is" | "envanter" | "musteri" | "genel";
export type Not = {
  id: string;
  baslik: string | null;
  icerik: string | null;
  iliskili_tip: NotIliskiTip | null;
  iliskili_id: string | null;
  renk: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

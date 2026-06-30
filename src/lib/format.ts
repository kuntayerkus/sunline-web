// Türkçe biçimlendirme yardımcıları (₺ ve tarih).

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const tlKurus = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 12500 -> "₺12.500"  (kuruş istenirse kurus=true) */
export function paraTL(deger: number | null | undefined, kurus = false): string {
  const n = Number(deger ?? 0);
  return (kurus ? tlKurus : tl).format(n);
}

const gun = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const gunKisa = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const saat = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
});

const gunSaat = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

export function tarih(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return gun.format(new Date(d));
}

export function tarihKisa(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return gunKisa.format(new Date(d));
}

export function saatStr(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return saat.format(new Date(d));
}

export function tarihSaat(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return gunSaat.format(new Date(d));
}

/** Aynı gün mü diye bakıp tek/çift satırlık aralık üretir. */
export function tarihAralik(bas: string | Date, bit: string | Date): string {
  const b = new Date(bas);
  const e = new Date(bit);
  const ayniGun = b.toDateString() === e.toDateString();
  if (ayniGun) {
    return `${gunSaat.format(b)} – ${saat.format(e)}`;
  }
  return `${gunSaat.format(b)} → ${gunSaat.format(e)}`;
}

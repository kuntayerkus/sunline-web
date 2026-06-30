// Site geneli sabitler (iletişim, sosyal, kanonik URL).
// Tek kaynak: footer, JSON-LD, metadata ve CTA'lar buradan beslenir.

export const SITE_URL = "https://www.sunlinestudyo.com.tr";

export const SITE_NAME = "Sunline";

/** WhatsApp / telefon (E.164, baştaki + olmadan) */
export const WHATSAPP_NUMBER = "905052225541";

/** Görüntülenecek telefon biçimi */
export const TELEFON_GORUNUM = "+90 505 222 55 41";

export const INSTAGRAM_HANDLE = "sunlinestudyo";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;

/** Önceden doldurulmuş mesajla WhatsApp bağlantısı üretir (Sunline numarası). */
export function whatsappLink(mesaj?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return mesaj ? `${base}?text=${encodeURIComponent(mesaj)}` : base;
}

/** Türkçe telefonu wa.me formatına çevirir: "0555 111 22 33" -> "905551112233". */
export function telToWhatsapp(tel: string): string {
  const d = (tel || "").replace(/\D/g, "");
  if (d.startsWith("90")) return d;
  if (d.startsWith("0")) return "90" + d.slice(1);
  if (d.length === 10 && d.startsWith("5")) return "90" + d;
  return d;
}

/** Belirli bir müşteri numarasına önceden doldurulmuş WhatsApp bağlantısı. */
export function whatsappTo(tel: string, mesaj?: string): string {
  const base = `https://wa.me/${telToWhatsapp(tel)}`;
  return mesaj ? `${base}?text=${encodeURIComponent(mesaj)}` : base;
}

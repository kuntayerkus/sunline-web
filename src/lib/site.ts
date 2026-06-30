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

/** Önceden doldurulmuş mesajla WhatsApp bağlantısı üretir. */
export function whatsappLink(mesaj?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return mesaj ? `${base}?text=${encodeURIComponent(mesaj)}` : base;
}

// Supabase/Postgres hatalarını kullanıcıya gösterilecek anlaşılır Türkçe
// mesaja çevirir. Ham hata (kod + mesaj) sunucu konsoluna loglanır, böylece
// hata ayıklama kaybı olmaz ama son kullanıcı "duplicate key value violates
// unique constraint" gibi bir şey görmez.
export function dbHata(error: { message: string; code?: string }, baglam?: string): string {
  console.error(`[db-hata]${baglam ? ` ${baglam}:` : ""}`, error.code, error.message);

  switch (error.code) {
    case "23505":
      return "Bu kayıt zaten mevcut (aynı bilgiyle bir kayıt var).";
    case "23503":
      return "İlişkili bir kayıt bulunamadığı için işlem tamamlanamadı.";
    case "23502":
      return "Zorunlu bir alan boş bırakılmış.";
    case "23514":
      return "Girilen değerler kurallara uymuyor (örn. tarih veya miktar aralığı hatalı).";
    case "42501":
      return "Bu işlemi yapmaya yetkiniz yok.";
    default:
      return baglam ? `${baglam} sırasında bir hata oluştu.` : "İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.";
  }
}

# Sunline — Yönetim Paneli

Backline ekipman kiralama + müzik stüdyosu (prova/kayıt/mix-mastering) işletmesi için
yönetim paneli. İki taraf planlanıyor: **admin paneli** (önce bu) ve sonradan **müşteri tarafı**
(katalog + müsaitlik + rezervasyon talebi).

## Teknoloji
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Postgres + Auth + RLS + Storage)

## Kurulum

### 1) Supabase projesi
1. [supabase.com](https://supabase.com) → yeni proje (Region: **Frankfurt**, Plan: Free).
2. **SQL Editor** → [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) içeriğini
   yapıştırıp **Run**.
3. **Authentication → Sign In / Providers → Email**: kolay giriş için
   **"Confirm email"** seçeneğini kapatın (iç ekip aracı).
4. **Project Settings → API**: `Project URL` ve `anon public` anahtarını alın.

### 2) Ortam değişkenleri
`.env.local.example` dosyasını `.env.local` olarak kopyalayıp doldurun:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3) Çalıştırma
```bash
npm install
npm run dev      # http://localhost:3000
```

### 4) İlk kullanıcı = patron
Uygulamadan kayıt olun (varsayılan rol **ekip**), sonra Supabase SQL Editor'da kendinizi
patron yapın:
```sql
update public.profiles set rol = 'patron' where id = auth.uid();
-- veya: where id = (select id from auth.users where email = 'sizin@eposta.com');
```

## Roller
- **patron** — her şey + **Mali** modülü
- **ekip** — takvim, işler, envanter, kişiler, notlar (Mali gizli)

## Yapı
```
src/
  app/
    giris/            # giriş / kayıt
    panel/            # korumalı admin paneli (takvim, isler, envanter, kisiler, mali, notlar, ayarlar)
  components/         # shell, sidebar, topbar, logo, page-header
  lib/
    supabase/         # client.ts (tarayıcı), server.ts (sunucu), middleware.ts (oturum tazeleme)
    types.ts          # veritabanı satır tipleri
    format.ts         # ₺ ve tarih biçimlendirme
    auth.ts           # gerekliOturum() — oturum + rol
  proxy.ts            # Next 16 "proxy" (eski adı middleware) — rota koruması
supabase/migrations/  # SQL şema
```
"# sunline-web" 

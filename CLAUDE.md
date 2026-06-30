@AGENTS.md

# Sunline — proje notları (Claude için)

İki iş kolu olan bir işletmenin yönetim paneli: **(1) backline ekipman kiralama** (etkinliklere
ekipman + ekip gönderimi), **(2) müzik stüdyosu** (prova, kayıt, mix/mastering — ağırlıklı kış
sezonu). İki taraf hedefleniyor: **admin paneli** (şu an inşa ediliyor) ve sonra **müşteri tarafı**
(katalog + müsaitlik + rezervasyon talebi → admin takvimine "talep" olarak düşer).

## Mimari
- Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind v4.
- Supabase: Postgres + Auth + RLS + Storage. Şema: `supabase/migrations/0001_init.sql`.
- Oturum: `@supabase/ssr`. `src/proxy.ts` (Next 16'da `middleware` yerine **proxy**) `/panel`'i korur.
- Roller: **patron** (her şey + Mali) / **ekip** (Mali hariç). RLS'te `mali_hareket` yalnızca patron;
  diğer operasyonel tablolar tüm authenticated kullanıcılara açık.

## Veri modeli (özet)
Merkez tablo **`isler`** (işler/rezervasyonlar). Ara tablolar `is_ekipman`, `is_oda`, `is_ekip`
ekipman/oda/ekip bağlar → **çakışma motoru** tarih kesişimini bunlardan sorgular
("bu ekipman bu tarihte dolu"). `mali_hareket` işe (opsiyonel) bağlanır. Envanter çift modlu:
`takip='adet'` (miktar) veya `takip='tekil'` (seri no'lu birim).

## Kurallar
- Arayüz **Türkçe**, para **₺** (`src/lib/format.ts`).
- Tasarım: sıcak "güneş" teması, marka rengi amber/turuncu (`--color-brand-*`).
- Ortak sınıflar `globals.css` (`.card .btn-primary .input .tbl` ...). Tailwind v4'te özel bir
  bileşen sınıfını başka sınıfta **`@apply` etme** — utility'lerle tam tanımla.
- Değişiklik sonrası doğrulama: `npm run build` (temiz olmalı). Tip: yerel `node_modules/.bin/tsc --noEmit`.

## İlerleme
Bkz. görev listesi. Sıra: ✅ temel altyapı + şema → Envanter → Kişiler → Takvim+İşler(çakışma) →
Mali → Notlar/Dashboard → (sonra) müşteri tarafı.

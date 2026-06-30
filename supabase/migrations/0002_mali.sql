-- =====================================================================
-- Sunline — Mali modülü genişletme (v2)
-- Sabit (aylık tekrarlayan) giderler: kira, maaş, abonelik, sigorta...
-- Supabase → SQL Editor'a yapıştırıp "Run" deyin. Tekrar çalıştırmak güvenlidir.
-- 0001_init.sql'deki set_updated_at() ve is_patron() fonksiyonlarını kullanır.
-- =====================================================================

create table if not exists public.sabit_gider (
  id            uuid primary key default gen_random_uuid(),
  ad            text not null,                 -- "Dükkan kirası", "Maaş — Ahmet", "Spotify"
  kategori      text,                          -- Kira, Maaş, Abonelik, Sigorta, Fatura, Diğer
  tutar         numeric(12,2) not null default 0,
  baslangic_ay  date not null default (date_trunc('month', current_date))::date, -- bu aydan itibaren
  bitis_ay      date,                          -- null = süresiz devam eder
  aktif         boolean not null default true,
  notlar        text,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_sabit_gider_aktif on public.sabit_gider (aktif);

drop trigger if exists trg_sabit_gider_updated on public.sabit_gider;
create trigger trg_sabit_gider_updated
  before update on public.sabit_gider
  for each row execute function public.set_updated_at();

-- RLS: yalnızca patron (mali_hareket ile aynı mantık)
alter table public.sabit_gider enable row level security;

drop policy if exists sabit_gider_patron on public.sabit_gider;
create policy sabit_gider_patron on public.sabit_gider
  for all to authenticated
  using (public.is_patron())
  with check (public.is_patron());

-- =====================================================================
-- BİTTİ. Sabit giderler artık her ayın gider toplamına otomatik dahil olur.
-- =====================================================================

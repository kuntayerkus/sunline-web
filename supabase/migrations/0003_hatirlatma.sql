-- =====================================================================
-- Sunline — Hatırlatmalar (v3)
-- Kapora takibi, ekipman iade tarihi, müşteri araması gibi yapılacaklar.
-- Supabase → SQL Editor'a yapıştırıp "Run" deyin. Tekrar çalıştırmak güvenlidir.
-- 0001_init.sql'deki set_updated_at() fonksiyonunu kullanır.
-- =====================================================================

create table if not exists public.hatirlatma (
  id          uuid primary key default gen_random_uuid(),
  baslik      text not null,
  aciklama    text,
  tarih       date not null default current_date,
  tamamlandi  boolean not null default false,
  is_id       uuid references public.isler(id) on delete set null,
  musteri_id  uuid references public.musteriler(id) on delete set null,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_hatirlatma_tarih on public.hatirlatma (tarih);
create index if not exists idx_hatirlatma_tamamlandi on public.hatirlatma (tamamlandi);

drop trigger if exists trg_hatirlatma_updated on public.hatirlatma;
create trigger trg_hatirlatma_updated
  before update on public.hatirlatma
  for each row execute function public.set_updated_at();

-- RLS: operasyonel (giriş yapan herkes)
alter table public.hatirlatma enable row level security;

drop policy if exists hatirlatma_all on public.hatirlatma;
create policy hatirlatma_all on public.hatirlatma
  for all to authenticated using (true) with check (true);

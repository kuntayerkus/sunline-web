-- =====================================================================
-- Sunline — Admin paneli başlangıç şeması (v1)
-- Supabase → SQL Editor'a yapıştırıp "Run" deyin. Tekrar çalıştırmak güvenlidir.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Yardımcı: updated_at otomatik güncelle
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- =====================================================================
-- 1) PROFİLLER & ROLLER
-- =====================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  ad_soyad    text,
  rol         text not null default 'ekip' check (rol in ('patron','ekip')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Yeni kullanıcı kaydolunca otomatik profil oluştur (varsayılan rol: ekip)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, ad_soyad, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'ad_soyad', split_part(new.email, '@', 1)),
    'ekip'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Çağıran kullanıcı patron mu? (RLS politikalarında kullanılır)
create or replace function public.is_patron()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and rol = 'patron'
  );
$$;

-- Rol yükseltmesini engelle: sadece patron 'rol' alanını değiştirebilir
create or replace function public.guard_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.rol is distinct from old.rol) and not public.is_patron() then
    raise exception 'Rol değiştirme yetkiniz yok';
  end if;
  return new;
end; $$;

drop trigger if exists trg_guard_profile_role on public.profiles;
create trigger trg_guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- =====================================================================
-- 2) MÜŞTERİLER (gruplar / bireyler / kurumlar)
-- =====================================================================
create table if not exists public.musteriler (
  id          uuid primary key default gen_random_uuid(),
  ad          text not null,
  tip         text not null default 'grup' check (tip in ('grup','bireysel','kurumsal')),
  telefon     text,
  eposta      text,
  notlar      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =====================================================================
-- 3) EKİP / TEKNİSYENLER (işe gidenler — giriş yapan kullanıcı değil)
-- =====================================================================
create table if not exists public.ekip (
  id           uuid primary key default gen_random_uuid(),
  ad           text not null,
  uzmanlik     text,                       -- ses tekniğeri, backline tekniker, sürücü...
  telefon      text,
  gunluk_ucret numeric(12,2) not null default 0,
  aktif        boolean not null default true,
  notlar       text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- =====================================================================
-- 4) ENVANTER (backline ekipman — adet VEYA seri no, ikisi de desteklenir)
--    takip='adet'  -> 'adet' alanı kadar stok, çakışma toplam rezerve adede bakar
--    takip='tekil' -> benzersiz birim (adet=1, seri_no dolu)
-- =====================================================================
create table if not exists public.envanter (
  id           uuid primary key default gen_random_uuid(),
  ad           text not null,
  kategori     text,                        -- Amfi, Davul, Klavye, Mikrofon, DI, Kablo...
  marka        text,
  model        text,
  takip        text not null default 'adet' check (takip in ('adet','tekil')),
  adet         integer not null default 1 check (adet >= 0),
  seri_no      text,
  gunluk_ucret numeric(12,2) not null default 0,
  durum        text not null default 'aktif' check (durum in ('aktif','bakimda','arizali','elden_cikti')),
  foto_url     text,
  aciklama     text,
  arsiv        boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- =====================================================================
-- 5) STÜDYO ODALARI (prova / kayıt / kontrol odası — rezerve edilebilir alan)
-- =====================================================================
create table if not exists public.studyo_oda (
  id            uuid primary key default gen_random_uuid(),
  ad            text not null,
  tip           text not null default 'prova' check (tip in ('prova','kayit','kontrol','diger')),
  saatlik_ucret numeric(12,2) not null default 0,
  gunluk_ucret  numeric(12,2) not null default 0,
  aciklama      text,
  aktif         boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =====================================================================
-- 6) HİZMET KATALOĞU (Mix, Mastering, Kayıt günü, Prova saati — fiyat şablonu)
-- =====================================================================
create table if not exists public.hizmet (
  id          uuid primary key default gen_random_uuid(),
  ad          text not null,
  kategori    text not null default 'studyo' check (kategori in ('studyo','backline','diger')),
  birim       text not null default 'proje' check (birim in ('saat','gun','proje','sarki','adet')),
  birim_ucret numeric(12,2) not null default 0,
  aktif       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =====================================================================
-- 7) İŞLER / REZERVASYONLAR (merkezi tablo)
-- =====================================================================
create table if not exists public.isler (
  id          uuid primary key default gen_random_uuid(),
  baslik      text not null,
  tip         text not null default 'backline'
                check (tip in ('backline','prova','kayit','mix','mastering','diger')),
  musteri_id  uuid references public.musteriler(id) on delete set null,
  baslangic   timestamptz not null,
  bitis       timestamptz not null,
  durum       text not null default 'onayli'
                check (durum in ('talep','teklif','onayli','tamamlandi','iptal')),
  lokasyon    text,
  tutar       numeric(12,2) not null default 0,
  kapora      numeric(12,2) not null default 0,
  kaynak      text not null default 'admin' check (kaynak in ('admin','musteri')),
  notlar      text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint isler_zaman_dogru check (bitis >= baslangic)
);

-- İş ↔ Ekipman (çakışma motorunun kaynağı)
create table if not exists public.is_ekipman (
  id          uuid primary key default gen_random_uuid(),
  is_id       uuid not null references public.isler(id) on delete cascade,
  envanter_id uuid not null references public.envanter(id) on delete cascade,
  adet        integer not null default 1 check (adet > 0),
  unique (is_id, envanter_id)
);

-- İş ↔ Stüdyo odası
create table if not exists public.is_oda (
  id     uuid primary key default gen_random_uuid(),
  is_id  uuid not null references public.isler(id) on delete cascade,
  oda_id uuid not null references public.studyo_oda(id) on delete cascade,
  unique (is_id, oda_id)
);

-- İş ↔ Ekip (kim hangi işe gidiyor)
create table if not exists public.is_ekip (
  id      uuid primary key default gen_random_uuid(),
  is_id   uuid not null references public.isler(id) on delete cascade,
  ekip_id uuid not null references public.ekip(id) on delete cascade,
  rol     text,
  unique (is_id, ekip_id)
);

-- =====================================================================
-- 8) MALİ HAREKETLER (gelir / gider) — sadece PATRON erişir
-- =====================================================================
create table if not exists public.mali_hareket (
  id            uuid primary key default gen_random_uuid(),
  tip           text not null check (tip in ('gelir','gider')),
  kategori      text,
  tutar         numeric(12,2) not null default 0,
  tarih         date not null default current_date,
  is_id         uuid references public.isler(id) on delete set null,
  odeme_yontemi text check (odeme_yontemi in ('nakit','havale','kart','diger')),
  aciklama      text,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- =====================================================================
-- 9) NOTLAR (serbest veya bir kayda iliştirilmiş)
-- =====================================================================
create table if not exists public.notlar (
  id          uuid primary key default gen_random_uuid(),
  baslik      text,
  icerik      text,
  iliskili_tip text check (iliskili_tip in ('is','envanter','musteri','genel')),
  iliskili_id uuid,
  renk        text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- İndeksler (çakışma & rapor sorguları için)
-- ---------------------------------------------------------------------
create index if not exists idx_isler_zaman      on public.isler (baslangic, bitis);
create index if not exists idx_isler_durum       on public.isler (durum);
create index if not exists idx_is_ekipman_env    on public.is_ekipman (envanter_id);
create index if not exists idx_is_oda_oda        on public.is_oda (oda_id);
create index if not exists idx_is_ekip_ekip      on public.is_ekip (ekip_id);
create index if not exists idx_mali_tarih        on public.mali_hareket (tarih);
create index if not exists idx_mali_tip          on public.mali_hareket (tip);

-- ---------------------------------------------------------------------
-- updated_at trigger'larını tüm tablolara bağla
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','musteriler','ekip','envanter','studyo_oda',
    'hizmet','isler','mali_hareket','notlar'
  ] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format(
      'create trigger trg_%1$s_updated before update on public.%1$s
       for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- =====================================================================
-- 10) RLS (Row Level Security)
--   - Operasyonel tablolar: giriş yapan herkes (patron + ekip) okuyup yazar
--   - mali_hareket: yalnızca patron
--   - profiles: kişi kendini görür; patron herkesi görür/yönetir
-- =====================================================================

-- Hepsinde RLS aç
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','musteriler','ekip','envanter','studyo_oda','hizmet',
    'isler','is_ekipman','is_oda','is_ekip','mali_hareket','notlar'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_patron());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_patron())
  with check (id = auth.uid() or public.is_patron());

drop policy if exists profiles_patron_manage on public.profiles;
create policy profiles_patron_manage on public.profiles
  for delete to authenticated
  using (public.is_patron());

-- Operasyonel tablolar: authenticated tam erişim
do $$
declare t text;
begin
  foreach t in array array[
    'musteriler','ekip','envanter','studyo_oda','hizmet',
    'isler','is_ekipman','is_oda','is_ekip','notlar'
  ] loop
    execute format('drop policy if exists %1$s_all on public.%1$s', t);
    execute format(
      'create policy %1$s_all on public.%1$s
       for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- mali_hareket: yalnızca patron
drop policy if exists mali_patron on public.mali_hareket;
create policy mali_patron on public.mali_hareket
  for all to authenticated
  using (public.is_patron())
  with check (public.is_patron());

-- =====================================================================
-- 11) DEPOLAMA (ekipman fotoğrafları için public bucket)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('envanter', 'envanter', true)
on conflict (id) do nothing;

drop policy if exists envanter_read on storage.objects;
create policy envanter_read on storage.objects
  for select using (bucket_id = 'envanter');

drop policy if exists envanter_write on storage.objects;
create policy envanter_write on storage.objects
  for insert to authenticated with check (bucket_id = 'envanter');

drop policy if exists envanter_update on storage.objects;
create policy envanter_update on storage.objects
  for update to authenticated using (bucket_id = 'envanter');

drop policy if exists envanter_delete on storage.objects;
create policy envanter_delete on storage.objects
  for delete to authenticated using (bucket_id = 'envanter');

-- =====================================================================
-- BİTTİ. Sonraki adım: bir kullanıcı kaydolduktan sonra kendinizi patron yapın:
--   update public.profiles set rol = 'patron' where id = auth.uid();
-- =====================================================================

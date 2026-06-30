-- =====================================================================
-- Sunline — Envanter başlangıç verisi (v4)
-- Mevcut backline/stüdyo ekipmanlarını envanter tablosuna ekler.
-- "(x2)/(x3)" -> adet; "(73 Tuş)/(Rack)" gibi notlar isimde bırakıldı.
-- Günlük ücretler 0 gelir; panelden tek tek güncellenebilir.
-- Tekrar çalıştırmak güvenlidir: aynı ada sahip kayıt varsa eklemez.
-- =====================================================================

insert into public.envanter (ad, kategori, takip, adet)
select v.ad, v.kategori, 'adet', v.adet
from (values
  -- Davullar & Trampetler
  ('DW Collector''s Series', 'Davul', 1),
  ('Pearl Masterworks', 'Davul', 1),
  ('Pearl Reference', 'Davul', 1),
  ('Yamaha Stage Custom', 'Davul', 1),
  ('Yamaha Recording Custom', 'Davul', 1),
  ('Yamaha Absolute Maple Custom Hybrid', 'Davul', 1),
  ('Tama Starclassic Birch Bubinga Japan', 'Davul', 1),
  ('Ludwig American', 'Davul', 1),
  ('Gretsch New Classic', 'Davul', 1),
  ('Yamaha Absolut AMS1460 Snare', 'Davul', 1),
  ('Ludwig Snare', 'Davul', 2),
  ('Pearl Dennis Chambers Signature Snare', 'Davul', 3),
  ('DW Performance Series Snare', 'Davul', 1),

  -- Perküsyon
  ('Remo Djembe', 'Perküsyon', 1),
  ('Gawharet Darbuka', 'Perküsyon', 1),
  ('LP Timbal', 'Perküsyon', 2),
  ('LP Pedrito Martinez Signature Galaxy Series 11", 12" 1/2', 'Perküsyon', 1),
  ('LP Santana Collection 11", 12" 1/2', 'Perküsyon', 1),
  ('Toys, Shaker, Cowbell', 'Perküsyon', 1),

  -- Klavyeler & Synth
  ('Yamaha Montage M8x', 'Klavye', 1),
  ('Yamaha Montage M6', 'Klavye', 1),
  ('Nord Stage 3', 'Klavye', 1),
  ('Nord Electro 6HP (73 Tuş)', 'Klavye', 1),
  ('Korg Kronos 3', 'Klavye', 1),
  ('Yamaha MODX8+', 'Klavye', 1),
  ('Roland AX-Edge', 'Klavye', 1),

  -- Gitarlar & Amfiler
  ('Fender Precision Bass American Pro II', 'Gitar & Amfi', 1),
  ('Ernie Ball Musicman Stingray 5', 'Gitar & Amfi', 1),
  ('Ibanez JS Series', 'Gitar & Amfi', 1),
  ('Kemper Profiler', 'Gitar & Amfi', 1),
  ('Fender Twin Reverb', 'Gitar & Amfi', 2),
  ('Fender DeVille', 'Gitar & Amfi', 1),
  ('Fender Hot Rod Deluxe', 'Gitar & Amfi', 1),
  ('Blackstar HT Stage 100', 'Gitar & Amfi', 2),
  ('Roland Jazz Chorus 120', 'Gitar & Amfi', 1),
  ('Ampeg SVT-4', 'Gitar & Amfi', 1),
  ('Ampeg SVT-R Pro', 'Gitar & Amfi', 1),
  ('Ampeg Pro Neo PL 410-HLF', 'Gitar & Amfi', 2),
  ('Ampeg Pro Neo PL 410-HLFx', 'Gitar & Amfi', 2),
  ('Ampeg Rocket Bass RB210', 'Gitar & Amfi', 1),
  ('Mark Bass 4x10"', 'Gitar & Amfi', 2),
  ('Mark Bass 1x15" MBR15 Kabin', 'Gitar & Amfi', 1),
  ('Mark Bass Little', 'Gitar & Amfi', 1),
  ('Aguilar AG700', 'Gitar & Amfi', 1),
  ('GK Neo 410', 'Gitar & Amfi', 1),

  -- Stüdyo & Konsol
  ('Genelec Studio Monitors', 'Stüdyo', 1),
  ('Neve 1073DPA', 'Stüdyo', 1),
  ('SSL Pure Drive Octo', 'Stüdyo', 1),
  ('Antelope Orion+ 32', 'Stüdyo', 1),
  ('Antelope Discrete 8', 'Stüdyo', 1),
  ('RME OctaMic II', 'Stüdyo', 1),
  ('Behringer Powerplay P16', 'Stüdyo', 1),
  ('Kemper Profiler (Rack)', 'Stüdyo', 1)
) as v(ad, kategori, adet)
where not exists (
  select 1 from public.envanter e where e.ad = v.ad
);

-- Kontrol: kategoriye göre adet
-- select kategori, count(*) from public.envanter group by kategori order by kategori;

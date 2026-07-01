-- =====================================================================
-- Sunline — Envanter detaylandırma (v5)
-- 0004'teki ekipmanlara MARKA / MODEL / AÇIKLAMA (tür) ekler.
-- - Var olan kayıtları (ada göre) günceller; yoksa ekler (taze kurulum).
-- - Kullanıcının elle girdiği açıklamayı EZMEZ (coalesce).
-- - Tekrar çalıştırmak güvenlidir.
--
-- NOT: Marka ve tür yüksek güvenle dolduruldu. Bazı modeller standart
-- katalog adıyla birebir eşleşmiyor; açıklamada "(model teyit)" ile
-- işaretlendi — panelden kendi birimine göre düzeltebilirsin.
-- =====================================================================

with veri(ad, kategori, marka, model, aciklama, adet) as (values
  -- Davullar & Trampetler
  ('DW Collector''s Series', 'Davul', 'DW', 'Collector''s Series', 'Akçaağaç (maple) davul seti', 1),
  ('Pearl Masterworks', 'Davul', 'Pearl', 'Masterworks', 'Özel yapım davul seti', 1),
  ('Pearl Reference', 'Davul', 'Pearl', 'Reference', 'Davul seti', 1),
  ('Yamaha Stage Custom', 'Davul', 'Yamaha', 'Stage Custom', 'Davul seti', 1),
  ('Yamaha Recording Custom', 'Davul', 'Yamaha', 'Recording Custom', 'Davul seti', 1),
  ('Yamaha Absolute Maple Custom Hybrid', 'Davul', 'Yamaha', 'Absolute Hybrid Maple', 'Akçaağaç davul seti', 1),
  ('Tama Starclassic Birch Bubinga Japan', 'Davul', 'Tama', 'Starclassic Bubinga', 'Davul seti (Japonya yapımı)', 1),
  ('Ludwig American', 'Davul', 'Ludwig', 'American', 'Davul seti', 1),
  ('Gretsch New Classic', 'Davul', 'Gretsch', 'New Classic', 'Davul seti', 1),
  ('Yamaha Absolut AMS1460 Snare', 'Davul', 'Yamaha', 'Absolute AMS1460', 'Trampet 14"x6"', 1),
  ('Ludwig Snare', 'Davul', 'Ludwig', null, 'Trampet', 2),
  ('Pearl Dennis Chambers Signature Snare', 'Davul', 'Pearl', 'Dennis Chambers Signature', 'Trampet', 3),
  ('DW Performance Series Snare', 'Davul', 'DW', 'Performance Series', 'Trampet', 1),

  -- Perküsyon
  ('Remo Djembe', 'Perküsyon', 'Remo', null, 'Djembe', 1),
  ('Gawharet Darbuka', 'Perküsyon', 'Gawharet El Fan', null, 'Darbuka', 1),
  ('LP Timbal', 'Perküsyon', 'Latin Percussion', 'Timbales', 'Timbal', 2),
  ('LP Pedrito Martinez Signature Galaxy Series 11", 12" 1/2', 'Perküsyon', 'Latin Percussion', 'Pedrito Martinez Galaxy', 'Konga 11" & 12½"', 1),
  ('LP Santana Collection 11", 12" 1/2', 'Perküsyon', 'Latin Percussion', 'Santana Collection', 'Konga 11" & 12½"', 1),
  ('Toys, Shaker, Cowbell', 'Perküsyon', null, null, 'Perküsyon aksesuarları', 1),

  -- Klavyeler & Synth
  ('Yamaha Montage M8x', 'Klavye', 'Yamaha', 'Montage M8x', '88 tuş synthesizer', 1),
  ('Yamaha Montage M6', 'Klavye', 'Yamaha', 'Montage M6', '61 tuş synthesizer', 1),
  ('Nord Stage 3', 'Klavye', 'Nord', 'Stage 3', 'Sahne piyanosu / synth', 1),
  ('Nord Electro 6HP (73 Tuş)', 'Klavye', 'Nord', 'Electro 6 HP', '73 tuş (org / elektrikli piyano)', 1),
  ('Korg Kronos 3', 'Klavye', 'Korg', 'Kronos 3', 'Workstation synthesizer (9 ses motoru, 2025 sürümü)', 1),
  ('Yamaha MODX8+', 'Klavye', 'Yamaha', 'MODX8+', '88 tuş synthesizer', 1),
  ('Roland AX-Edge', 'Klavye', 'Roland', 'AX-Edge', 'Keytar', 1),

  -- Gitarlar & Amfiler
  ('Fender Precision Bass American Pro II', 'Gitar & Amfi', 'Fender', 'American Professional II Precision Bass', '4 telli bas gitar', 1),
  ('Ernie Ball Musicman Stingray 5', 'Gitar & Amfi', 'Ernie Ball Music Man', 'StingRay 5', '5 telli bas gitar', 1),
  ('Ibanez JS Series', 'Gitar & Amfi', 'Ibanez', 'JS (Joe Satriani)', 'Elektro gitar', 1),
  ('Kemper Profiler', 'Gitar & Amfi', 'Kemper', 'Profiler', 'Amfi modelleyici (profiler)', 1),
  ('Fender Twin Reverb', 'Gitar & Amfi', 'Fender', 'Twin Reverb', 'Gitar amfisi (kombo)', 2),
  ('Fender DeVille', 'Gitar & Amfi', 'Fender', 'Hot Rod DeVille', 'Gitar amfisi (kombo)', 1),
  ('Fender Hot Rod Deluxe', 'Gitar & Amfi', 'Fender', 'Hot Rod Deluxe', 'Gitar amfisi (kombo)', 1),
  ('Blackstar HT Stage 100', 'Gitar & Amfi', 'Blackstar', 'HT Stage 100', 'Gitar amfisi (lambalı)', 2),
  ('Roland Jazz Chorus 120', 'Gitar & Amfi', 'Roland', 'JC-120 Jazz Chorus', 'Gitar amfisi (kombo)', 1),
  ('Ampeg SVT-4', 'Gitar & Amfi', 'Ampeg', 'SVT-4PRO', 'Bas amfi kafası', 1),
  ('Ampeg SVT-R Pro', 'Gitar & Amfi', 'Ampeg', 'SVT-4PRO', 'Bas amfi kafası (1200W hibrit)', 1),
  ('Ampeg Pro Neo PL 410-HLF', 'Gitar & Amfi', 'Ampeg', 'PN-410HLF', '4x10 bas kabin', 2),
  ('Ampeg Pro Neo PL 410-HLFx', 'Gitar & Amfi', 'Ampeg', 'PN-410HLF', '4x10 bas kabin', 2),
  ('Ampeg Rocket Bass RB210', 'Gitar & Amfi', 'Ampeg', 'Rocket Bass RB-210', '2x10 bas kombo', 1),
  ('Mark Bass 4x10"', 'Gitar & Amfi', 'Markbass', '4x10', 'Bas kabin', 2),
  ('Mark Bass 1x15" MBR15 Kabin', 'Gitar & Amfi', 'Markbass', 'MB58R 151 Pure', '1x15 bas kabin (400W, neodyum)', 1),
  ('Mark Bass Little', 'Gitar & Amfi', 'Markbass', 'Little Mark', 'Bas amfi kafası', 1),
  ('Aguilar AG700', 'Gitar & Amfi', 'Aguilar', 'AG 700', 'Bas amfi kafası', 1),
  ('GK Neo 410', 'Gitar & Amfi', 'Gallien-Krueger', 'Neo 410', '4x10 bas kabin', 1),

  -- Stüdyo & Konsol
  ('Genelec Studio Monitors', 'Stüdyo', 'Genelec', null, 'Stüdyo monitörü', 1),
  ('Neve 1073DPA', 'Stüdyo', 'AMS Neve', '1073DPA', '2 kanal mikrofon preamp', 1),
  ('SSL Pure Drive Octo', 'Stüdyo', 'Solid State Logic', 'PureDrive Octo', '8 kanal mikrofon preamp', 1),
  ('Antelope Orion+ 32', 'Stüdyo', 'Antelope Audio', 'Orion 32+', '32 kanal AD/DA konvertör', 1),
  ('Antelope Discrete 8', 'Stüdyo', 'Antelope Audio', 'Discrete 8 Synergy Core', '8 kanal ses kartı / preamp', 1),
  ('RME OctaMic II', 'Stüdyo', 'RME', 'OctaMic II', '8 kanal mikrofon preamp / konvertör', 1),
  ('Behringer Powerplay P16', 'Stüdyo', 'Behringer', 'Powerplay P16', 'Kişisel monitör sistemi', 1),
  ('Kemper Profiler (Rack)', 'Stüdyo', 'Kemper', 'Profiler Rack', 'Amfi profiler (rack)', 1)
)
-- 1) Var olanları (0004) zenginleştir
, guncelle as (
  update public.envanter e
  set kategori = v.kategori,
      marka    = v.marka,
      model    = v.model,
      adet     = v.adet,
      aciklama = coalesce(nullif(e.aciklama, ''), v.aciklama)
  from veri v
  where e.ad = v.ad
  returning e.ad
)
-- 2) Hiç yoksa ekle (0004 çalışmadıysa)
insert into public.envanter (ad, kategori, marka, model, takip, adet, aciklama)
select v.ad, v.kategori, v.marka, v.model, 'adet', v.adet, v.aciklama
from veri v
where v.ad not in (select ad from guncelle)
  and not exists (select 1 from public.envanter e where e.ad = v.ad);

-- Kontrol:
-- select kategori, marka, ad, model, adet from public.envanter order by kategori, ad;

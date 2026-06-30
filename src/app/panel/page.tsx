import { gerekliOturum } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import {
  CalendarDays, ClipboardList, Boxes, Users, Wallet, StickyNote, Bell,
  Wrench, Clock, TrendingUp, CalendarCheck,
} from "lucide-react";
import Link from "next/link";
import { paraTL, tarihAralik, tarihKisa } from "@/lib/format";
import type { MaliHareket, SabitGider, Hatirlatma } from "@/lib/types";

const kisayollar = [
  { href: "/panel/takvim", etiket: "Takvim", icon: CalendarDays, renk: "text-sky-500" },
  { href: "/panel/isler", etiket: "İşler", icon: ClipboardList, renk: "text-violet-500" },
  { href: "/panel/envanter", etiket: "Envanter", icon: Boxes, renk: "text-brand-500" },
  { href: "/panel/kisiler", etiket: "Kişiler", icon: Users, renk: "text-emerald-500" },
  { href: "/panel/hatirlatmalar", etiket: "Hatırlatmalar", icon: Bell, renk: "text-amber-500" },
  { href: "/panel/notlar", etiket: "Notlar", icon: StickyNote, renk: "text-pink-500" },
];

function pad(n: number) { return String(n).padStart(2, "0"); }

export default async function DashboardPage() {
  const { profile, email } = await gerekliOturum();
  const ad = profile.ad_soyad ?? email?.split("@")[0] ?? "";
  const patron = profile.rol === "patron";

  const supabase = await createClient();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const buAy = todayStr.slice(0, 7);

  const [{ data: islerRaw }, { data: envRaw }, hatRes] = await Promise.all([
    supabase.from("isler").select("id, baslik, baslangic, bitis, durum, tip, tutar, musteriler(ad)").order("baslangic", { ascending: true }),
    supabase.from("envanter").select("durum"),
    supabase.from("hatirlatma").select("*").eq("tamamlandi", false).order("tarih", { ascending: true }),
  ]);

  const isler = islerRaw || [];
  const env = envRaw || [];
  const hatirlatmalar = (hatRes.error ? [] : (hatRes.data as Hatirlatma[])) || [];

  const buAyIsSayisi = isler.filter((i) => i.baslangic.slice(0, 7) === buAy && i.durum !== "iptal").length;
  const bekleyenSayisi = isler.filter((i) => i.durum === "talep" || i.durum === "teklif").length;
  const bakimSayisi = env.filter((e) => e.durum === "bakimda" || e.durum === "arizali").length;
  const yaklasanIsler = isler.filter((i) => new Date(i.bitis) >= now && i.durum !== "iptal").slice(0, 6);
  const yaklasanHat = hatirlatmalar.slice(0, 5);

  // Patron: bu ay net
  let buAyNet: number | null = null;
  if (patron) {
    const [{ data: mh }, sgRes] = await Promise.all([
      supabase.from("mali_hareket").select("tip, tutar, tarih"),
      supabase.from("sabit_gider").select("tutar, baslangic_ay, bitis_ay, aktif"),
    ]);
    const hareketler = (mh as Pick<MaliHareket, "tip" | "tutar" | "tarih">[]) || [];
    const sabit = (sgRes.error ? [] : (sgRes.data as SabitGider[])) || [];
    const gelir = hareketler.filter((h) => h.tip === "gelir" && h.tarih.slice(0, 7) === buAy).reduce((s, h) => s + h.tutar, 0);
    const giderH = hareketler.filter((h) => h.tip === "gider" && h.tarih.slice(0, 7) === buAy).reduce((s, h) => s + h.tutar, 0);
    const sabitT = sabit
      .filter((s) => s.aktif && s.baslangic_ay.slice(0, 7) <= buAy && (!s.bitis_ay || s.bitis_ay.slice(0, 7) >= buAy))
      .reduce((s, x) => s + x.tutar, 0);
    buAyNet = gelir - giderH - sabitT;
  }

  return (
    <div className="space-y-6">
      <PageHeader baslik={`Merhaba${ad ? ", " + ad : ""} 👋`} aciklama="Sunline yönetim paneline hoş geldiniz." />

      {/* İstatistikler */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link href="/panel/isler" className="card p-4 transition hover:border-brand-200">
          <div className="flex items-center gap-2 text-stone-500"><CalendarCheck size={16} /><span className="text-xs font-medium">Bu Ay İş</span></div>
          <p className="mt-1 text-2xl font-bold text-stone-900">{buAyIsSayisi}</p>
        </Link>
        <Link href="/panel/isler" className="card p-4 transition hover:border-brand-200">
          <div className="flex items-center gap-2 text-stone-500"><Clock size={16} /><span className="text-xs font-medium">Bekleyen</span></div>
          <p className="mt-1 text-2xl font-bold text-amber-600">{bekleyenSayisi}</p>
        </Link>
        <Link href="/panel/envanter" className="card p-4 transition hover:border-brand-200">
          <div className="flex items-center gap-2 text-stone-500"><Wrench size={16} /><span className="text-xs font-medium">Bakımda</span></div>
          <p className={`mt-1 text-2xl font-bold ${bakimSayisi > 0 ? "text-red-600" : "text-stone-900"}`}>{bakimSayisi}</p>
        </Link>
        {patron ? (
          <Link href="/panel/mali" className="card p-4 transition hover:border-brand-200">
            <div className="flex items-center gap-2 text-stone-500"><TrendingUp size={16} /><span className="text-xs font-medium">Bu Ay Net</span></div>
            <p className={`mt-1 text-2xl font-bold ${(buAyNet ?? 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>{paraTL(buAyNet ?? 0)}</p>
          </Link>
        ) : (
          <Link href="/panel/hatirlatmalar" className="card p-4 transition hover:border-brand-200">
            <div className="flex items-center gap-2 text-stone-500"><Bell size={16} /><span className="text-xs font-medium">Hatırlatma</span></div>
            <p className="mt-1 text-2xl font-bold text-stone-900">{hatirlatmalar.length}</p>
          </Link>
        )}
      </div>

      {/* Yaklaşan hatırlatmalar */}
      {yaklasanHat.length > 0 && (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-stone-900"><Bell size={17} className="text-amber-500" /> Hatırlatmalar</h3>
            <Link href="/panel/hatirlatmalar" className="text-sm text-brand-600 hover:underline">Tümü</Link>
          </div>
          <div className="space-y-2">
            {yaklasanHat.map((h) => {
              const gecikmis = h.tarih < todayStr;
              return (
                <div key={h.id} className="flex items-center justify-between gap-2 rounded-lg border border-stone-100 p-2.5">
                  <span className="truncate text-sm text-stone-700">{h.baslik}</span>
                  <span className={`shrink-0 text-xs font-medium ${gecikmis ? "text-red-600" : h.tarih === todayStr ? "text-brand-600" : "text-stone-400"}`}>
                    {gecikmis ? "Gecikmiş" : h.tarih === todayStr ? "Bugün" : tarihKisa(h.tarih)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Yaklaşan işler */}
      <div className="card p-5">
        <h3 className="mb-4 font-semibold text-stone-900">Yaklaşan İşler</h3>
        {yaklasanIsler.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50 p-4 text-center text-sm text-stone-500">
            Yaklaşan iş bulunmuyor.
          </div>
        ) : (
          <div className="space-y-3">
            {yaklasanIsler.map((is) => (
              <Link href={`/panel/isler/${is.id}`} key={is.id} className="flex items-center justify-between gap-3 rounded-lg border border-stone-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/20">
                <div className="min-w-0">
                  <h4 className="truncate font-medium text-brand-700">{is.baslik}</h4>
                  <p className="mt-0.5 text-xs text-stone-500">
                    {tarihAralik(is.baslangic, is.bitis)}
                    {(() => { const mu = is.musteriler as unknown as { ad: string } | null; return mu?.ad ? ` • ${mu.ad}` : ""; })()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="badge bg-stone-100 text-stone-600">{is.tip}</span>
                  <span className="badge border-l-2 border-brand-400 bg-white">{is.durum}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Kısayollar */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {kisayollar.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.href} href={k.href} className="card flex flex-col items-center gap-2 p-4 text-center transition hover:border-brand-200">
              <Icon size={22} className={k.renk} />
              <span className="text-xs font-medium text-stone-700">{k.etiket}</span>
            </Link>
          );
        })}
        {patron && (
          <Link href="/panel/mali" className="card flex flex-col items-center gap-2 p-4 text-center transition hover:border-brand-200">
            <Wallet size={22} className="text-rose-500" />
            <span className="text-xs font-medium text-stone-700">Mali</span>
          </Link>
        )}
      </div>
    </div>
  );
}

import { gerekliOturum } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import {
  CalendarDays,
  ClipboardList,
  Boxes,
  Users,
  Wallet,
  StickyNote,
} from "lucide-react";
import Link from "next/link";

const kisayollar = [
  { href: "/panel/takvim", etiket: "Takvim", icon: CalendarDays, renk: "text-sky-500" },
  { href: "/panel/isler", etiket: "İşler", icon: ClipboardList, renk: "text-violet-500" },
  { href: "/panel/envanter", etiket: "Envanter", icon: Boxes, renk: "text-brand-500" },
  { href: "/panel/kisiler", etiket: "Kişiler", icon: Users, renk: "text-emerald-500" },
  { href: "/panel/notlar", etiket: "Notlar", icon: StickyNote, renk: "text-amber-500" },
];

export default async function DashboardPage() {
  const { profile, email } = await gerekliOturum();
  const ad = profile.ad_soyad ?? email?.split("@")[0] ?? "";

  const supabase = await createClient();
  
  // Bugünkü işleri çek
  const bugunStr = new Date().toISOString().slice(0, 10);
  const { data: bugunkuIsler } = await supabase
    .from("isler")
    .select("id, baslik, baslangic, bitis, durum, tip, musteriler(ad)")
    .gte("bitis", bugunStr + "T00:00:00")
    .lte("baslangic", bugunStr + "T23:59:59")
    .order("baslangic", { ascending: true });

  return (
    <div className="space-y-6">
      <PageHeader
        baslik={`Merhaba${ad ? ", " + ad : ""} 👋`}
        aciklama="Sunline yönetim paneline hoş geldiniz."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kisayollar.map((k) => {
          const Icon = k.icon;
          return (
            <Link
              key={k.href}
              href={k.href}
              className="card flex flex-col gap-3 p-4 transition hover:border-brand-200 hover:shadow-sm"
            >
              <Icon size={22} className={k.renk} />
              <span className="text-sm font-medium text-stone-700">
                {k.etiket}
              </span>
            </Link>
          );
        })}
        {profile.rol === "patron" && (
          <Link
            href="/panel/mali"
            className="card flex flex-col gap-3 p-4 transition hover:border-brand-200 hover:shadow-sm"
          >
            <Wallet size={22} className="text-rose-500" />
            <span className="text-sm font-medium text-stone-700">Mali</span>
          </Link>
        )}
      </div>

      <div className="card p-5">
        <h3 className="font-semibold mb-4 text-stone-900">Bugünkü İşler</h3>
        {!bugunkuIsler || bugunkuIsler.length === 0 ? (
          <div className="text-sm text-stone-500 bg-stone-50 rounded-lg p-4 text-center border border-dashed border-stone-200">
            Bugün için planlanmış bir iş bulunmuyor.
          </div>
        ) : (
          <div className="space-y-3">
            {bugunkuIsler.map((is) => (
              <Link 
                href={`/panel/isler/${is.id}`} 
                key={is.id}
                className="flex items-center justify-between p-3 rounded-lg border border-stone-100 hover:border-brand-200 hover:bg-brand-50/20 transition"
              >
                <div>
                  <h4 className="font-medium text-brand-700">{is.baslik}</h4>
                  <p className="text-xs text-stone-500">
                    {new Date(is.baslangic).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})} - 
                    {new Date(is.bitis).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                    {((is.musteriler as any)?.ad) && ` • ${((is.musteriler as any).ad)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-stone-100 text-stone-600">{is.tip}</span>
                  <span className="badge border-l-2 border-brand-400 bg-white">{is.durum}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

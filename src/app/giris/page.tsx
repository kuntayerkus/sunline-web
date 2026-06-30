"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SunlineMark } from "@/components/logo";

const yapilandirildi =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function GirisPage() {
  const router = useRouter();
  const [mod, setMod] = useState<"giris" | "kayit">("giris");
  const [adSoyad, setAdSoyad] = useState("");
  const [eposta, setEposta] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState<string | null>(null);
  const [bilgi, setBilgi] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata(null);
    setBilgi(null);
    setYukleniyor(true);
    try {
      const supabase = createClient();
      if (mod === "giris") {
        const { error } = await supabase.auth.signInWithPassword({
          email: eposta.trim(),
          password: sifre,
        });
        if (error) throw error;
        router.push("/panel");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: eposta.trim(),
          password: sifre,
          options: { data: { ad_soyad: adSoyad.trim() } },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/panel");
          router.refresh();
        } else {
          setBilgi(
            "Hesap oluşturuldu. E-posta onayı açıksa gelen kutunuzu kontrol edin, ardından giriş yapın.",
          );
          setMod("giris");
        }
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : "Bir hata oluştu.";
      setHata(cevir(m));
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50 px-4 text-stone-900">
      {/* sıcak güneş ışıması */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(240,126,18,0.22), rgba(240,126,18,0) 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="text-brand-500">
            <SunlineMark size={44} />
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-stone-900">
            Sunline Yönetim
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Backline & stüdyo paneline giriş
          </p>
        </div>

        <div className="card p-6 shadow-sm">
          {!yapilandirildi && (
            <div className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Supabase henüz bağlanmadı. Bağlantı bilgileri girilince giriş
              aktifleşecek.
            </div>
          )}

          <form onSubmit={gonder} className="space-y-4">
            {mod === "kayit" && (
              <div>
                <label className="label" htmlFor="ad">
                  Ad soyad
                </label>
                <input
                  id="ad"
                  className="input"
                  value={adSoyad}
                  onChange={(e) => setAdSoyad(e.target.value)}
                  placeholder="Adınız"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label className="label" htmlFor="eposta">
                E-posta
              </label>
              <input
                id="eposta"
                type="email"
                required
                className="input"
                value={eposta}
                onChange={(e) => setEposta(e.target.value)}
                placeholder="ornek@sunline.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" htmlFor="sifre">
                Şifre
              </label>
              <input
                id="sifre"
                type="password"
                required
                minLength={6}
                className="input"
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder="••••••••"
                autoComplete={
                  mod === "giris" ? "current-password" : "new-password"
                }
              />
            </div>

            {hata && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {hata}
              </p>
            )}
            {bilgi && (
              <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                {bilgi}
              </p>
            )}

            <button
              type="submit"
              disabled={yukleniyor || !yapilandirildi}
              className="btn-primary w-full"
            >
              {yukleniyor
                ? "Lütfen bekleyin…"
                : mod === "giris"
                  ? "Giriş yap"
                  : "Hesap oluştur"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-stone-500">
            {mod === "giris" ? (
              <>
                Hesabınız yok mu?{" "}
                <button
                  className="font-medium text-brand-600 hover:underline"
                  onClick={() => {
                    setMod("kayit");
                    setHata(null);
                    setBilgi(null);
                  }}
                >
                  Kayıt olun
                </button>
              </>
            ) : (
              <>
                Zaten hesabınız var mı?{" "}
                <button
                  className="font-medium text-brand-600 hover:underline"
                  onClick={() => {
                    setMod("giris");
                    setHata(null);
                    setBilgi(null);
                  }}
                >
                  Giriş yapın
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function cevir(m: string): string {
  const s = m.toLowerCase();
  if (s.includes("invalid login")) return "E-posta veya şifre hatalı.";
  if (s.includes("already registered") || s.includes("already been registered"))
    return "Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.";
  if (s.includes("email not confirmed"))
    return "E-posta henüz onaylanmamış. Gelen kutunuzu kontrol edin.";
  if (s.includes("password should be"))
    return "Şifre en az 6 karakter olmalı.";
  return m;
}

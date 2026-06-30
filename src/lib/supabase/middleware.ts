import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Her istekte Supabase oturumunu tazeler ve /panel rotalarını korur.
 * - Girişsiz kullanıcı /panel'e gidemez -> /giris
 * - Girişli kullanıcı /giris görürse -> /panel
 *
 * Dayanıklılık: Supabase env değişkenleri yoksa ya da Supabase erişilemezse
 * public site ÇÖKMEZ (500 vermez); yalnız /panel korumaya alınır.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const girise = () => {
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    return NextResponse.redirect(url);
  };

  // Ortam değişkenleri yoksa Supabase istemcisini hiç kurma (aksi halde fırlatır).
  if (!supabaseUrl || !supabaseKey) {
    if (path.startsWith("/panel")) return girise();
    return response;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && path.startsWith("/panel")) {
      return girise();
    }

    // Girişli kullanıcı giriş ekranını görürse panele al. Anasayfa (/) herkese
    // açık pazarlama sayfasıdır; girişli kullanıcıyı oradan yönlendirme.
    if (user && path === "/giris") {
      const url = request.nextUrl.clone();
      url.pathname = "/panel";
      return NextResponse.redirect(url);
    }

    return response;
  } catch {
    // Supabase erişilemezse public site çökmesin; /panel'i login'e yönlendir.
    if (path.startsWith("/panel")) return girise();
    return response;
  }
}

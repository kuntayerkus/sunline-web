import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16: "middleware" yerine "proxy" konvansiyonu. /panel'i korur,
// Supabase oturumunu tazeler. (Vercel'de edge runtime varsayılan.)
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // _next ve statik dosyalar hariç tüm rotalar
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

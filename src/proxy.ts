import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16: kök "middleware" kuralı "proxy" olarak yeniden adlandırıldı.
export function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  runtime: "experimental-edge",
  matcher: [
    // _next ve statik dosyalar hariç tüm rotalar
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

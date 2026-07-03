import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Reîmprospătează sesiunea Supabase la fiecare request și sincronizează cookie-urile.
 * Dacă variabilele de mediu lipsesc (ex. build fără .env), devine no-op.
 * (Next.js 16: convenția „proxy" înlocuiește vechiul „middleware".)
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Necesar: revalidează tokenul și declanșează setAll dacă s-a reînnoit.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Toate rutele, mai puțin assets statice și fișiere cu extensie.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

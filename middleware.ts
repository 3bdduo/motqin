import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // نجيب الـ session فقط (أسرع من getUser) — getUser بيتصل بـ Supabase كل مرة
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user ?? null;
  const path = request.nextUrl.pathname;

  const isLoginRoute = path === "/login";
  const isProtectedRoute =
    path.startsWith("/admin") || path.startsWith("/student");

  // لو مش logged in وحاول يدخل صفحة محمية → روحه للـ login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // لو logged in وعلى صفحة login → نعمل redirect
  // الـ redirect الصح هيتم في الـ root page أو login page نفسها
  // مش هنعمل database query هنا عشان نتجنب الـ timeout
  if (user && isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/login"],
};

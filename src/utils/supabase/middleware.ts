import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "../env";
import { isAdmin } from "@/actions/admin";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/auth",
  "/api/auth/callback",
  "/api/auth/callback/admin",
];

// Admin paths (require authentication + admin role)
const ADMIN_PATHS = ["/admin"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Check if path is public (no authentication required)
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  
  // Check if path is admin (requires admin role)
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));

  // ============================================
  // HANYA ADMIN PATHS YANG BUTUH LOGIN
  // User biasa bisa nonton tanpa login!
  // ============================================
  // If user is NOT logged in and trying to access ADMIN area
  if (!user && isAdminPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);

    const redirectRes = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectRes;
  }

  // If user IS logged in and on auth page, redirect to home
  if (user && pathname === "/auth") {
    const url = request.nextUrl.clone();
    
    // Check if there's a next parameter
    const next = request.nextUrl.searchParams.get("next");
    url.pathname = next || "/";
    url.searchParams.delete("next");
    const redirectRes = NextResponse.redirect(url);

    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectRes;
  }

  // If user is trying to access admin area, check admin role
  if (user && isAdminPath) {
    // Use isAdmin() function which checks email whitelist
    const adminStatus = await isAdmin();
    
    if (!adminStatus) {
      // User is not admin, redirect to home
      const url = request.nextUrl.clone();
      url.pathname = "/";

      const redirectRes = NextResponse.redirect(url);

      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectRes.cookies.set(cookie.name, cookie.value, cookie);
      });

      return redirectRes;
    }
  }

  return supabaseResponse;
}

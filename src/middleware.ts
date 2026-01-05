import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Skip Supabase session update for admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/auth/admin")) {
    return;
  }
  // update user's auth session for non-admin routes
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/actions/admin";

export async function adminMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip if not admin route
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    
    // Check if user is admin using isAdmin() function
    const adminStatus = await isAdmin();
    
    if (!adminStatus) {
      // Redirect to home if not admin
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    
    // Redirect to home on error
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
}

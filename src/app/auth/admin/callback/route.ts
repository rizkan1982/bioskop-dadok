import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const GET = async (request: NextRequest) => {
  try {
    console.log("[ADMIN CALLBACK] Processing admin callback...");
    
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("[ADMIN CALLBACK] Auth error:", userError);
      return NextResponse.redirect(new URL("/auth/admin?error=auth_failed", request.url));
    }
    
    console.log("[ADMIN CALLBACK] User authenticated:", user.email);
    
    // Check admin status using service role (bypasses RLS)
    const supabaseServiceRole = await createClient(true);
    
    const { data: profile, error: profileError } = await supabaseServiceRole
      .from("profiles")
      .select("id, email, is_admin, username")
      .eq("id", user.id)
      .single();
    
    if (profileError) {
      console.error("[ADMIN CALLBACK] Profile fetch error:", profileError);
      return NextResponse.redirect(new URL("/auth/admin?error=unauthorized", request.url));
    }
    
    console.log("[ADMIN CALLBACK] Profile check - is_admin:", profile?.is_admin, "for email:", profile?.email);
    
    if (profile?.is_admin !== true) {
      console.warn("[ADMIN CALLBACK] User is not admin, denying access");
      return NextResponse.redirect(new URL("/auth/admin?error=unauthorized", request.url));
    }
    
    console.log("[ADMIN CALLBACK] Admin verified, setting session cookie and redirecting...");
    
    // Create admin session cookie
    const sessionData = {
      id: user.id,
      email: user.email,
      username: profile?.username || user.email?.split("@")[0] || "admin",
      role: "admin",
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
    
    const sessionCookie = Buffer.from(JSON.stringify(sessionData)).toString("base64");
    
    const response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
    response.cookies.set("admin_session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });
    
    return response;
    
  } catch (error) {
    console.error("[ADMIN CALLBACK] Error:", error);
    return NextResponse.redirect(new URL("/auth/admin?error=auth_failed", request.url));
  }
};

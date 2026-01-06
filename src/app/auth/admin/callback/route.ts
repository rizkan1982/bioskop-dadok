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
      .select("id, email, is_admin")
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
    
    console.log("[ADMIN CALLBACK] Admin verified, redirecting to dashboard...");
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    
  } catch (error) {
    console.error("[ADMIN CALLBACK] Error:", error);
    return NextResponse.redirect(new URL("/auth/admin?error=auth_failed", request.url));
  }
};

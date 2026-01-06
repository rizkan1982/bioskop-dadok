import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { IS_DEVELOPMENT } from "@/utils/constants";
import { cookies } from "next/headers";

// ============================================
// WHITELIST EMAIL ADMIN
// Hanya email ini yang bisa akses admin panel
// ============================================
const ADMIN_EMAILS = [
  "stressgue934@gmail.com",
];

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/admin?error=no_code`);
  }

  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !user) {
    console.error("Auth error:", error);
    return NextResponse.redirect(`${origin}/auth/admin?error=auth_failed`);
  }

  // Check if user email is in admin whitelist
  const userEmail = user.email || "";
  const isAdminEmail = ADMIN_EMAILS.includes(userEmail);
  
  console.log("Admin login attempt:", { email: userEmail, isAdmin: isAdminEmail });
  
  if (!isAdminEmail) {
    // User is not admin, redirect back to admin login with error
    return NextResponse.redirect(`${origin}/auth/admin?error=unauthorized`);
  }

  // Get username from email or user metadata
  const username = user.email?.split("@")[0] || user.user_metadata?.full_name || user.user_metadata?.name || "Admin";

  // Create admin session cookie
  const sessionData = {
    username,
    role: "admin",
    email: user.email || "",
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  const cookieStore = await cookies();
  const encodedSession = Buffer.from(JSON.stringify(sessionData)).toString("base64");
  
  cookieStore.set("admin_session", encodedSession, {
    httpOnly: true,
    secure: !IS_DEVELOPMENT,
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 hours
    path: "/",
  });

  const forwardedHost = request.headers.get("x-forwarded-host");

  if (IS_DEVELOPMENT) {
    return NextResponse.redirect(`${origin}/admin`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}/admin`);
  } else {
    return NextResponse.redirect(`${origin}/admin`);
  }
};

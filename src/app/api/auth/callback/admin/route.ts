import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/actions/admin";
import { IS_DEVELOPMENT } from "@/utils/constants";
import { cookies } from "next/headers";

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
    return NextResponse.redirect(`${origin}/auth/admin?error=auth_failed`);
  }

  // Check if user is admin using isAdmin() function
  const adminStatus = await isAdmin();
  
  if (!adminStatus) {
    // User is not admin, redirect back to admin login with error
    return NextResponse.redirect(`${origin}/auth/admin?error=unauthorized`);
  }

  // Get user profile for username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const username = profile?.username || user.email?.split("@")[0] || "Admin";

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

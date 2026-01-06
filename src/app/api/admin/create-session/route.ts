import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { IS_DEVELOPMENT } from "@/utils/constants";

// Super Admin email whitelist (always allowed)
const SUPER_ADMIN_EMAILS = [
  "stressgue934@gmail.com",
];

// Check if email is admin (from whitelist OR database)
async function isEmailAdmin(email: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<boolean> {
  // Super admin from whitelist - always allowed
  if (SUPER_ADMIN_EMAILS.includes(email)) {
    return true;
  }
  
  // Check database for is_admin flag
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("email", email)
      .single();
    
    return profile?.is_admin === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { email, username } = await request.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify email matches and check admin status
    const adminCheck = await isEmailAdmin(email, supabase);
    if (user.email !== email || !adminCheck) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create admin session cookie
    const sessionData = {
      username: username || email.split("@")[0],
      role: "admin",
      email: email,
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

    console.log("Admin session created for:", email);

    return NextResponse.json({ success: true, message: "Session created" });
  } catch (err) {
    console.error("Create session error:", err);
    return NextResponse.json(
      { success: false, message: "Internal error" },
      { status: 500 }
    );
  }
}

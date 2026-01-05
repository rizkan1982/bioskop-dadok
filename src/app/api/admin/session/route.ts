import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface AdminSession {
  username: string;
  role: string;
  email: string;
  exp: number;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    try {
      const session: AdminSession = JSON.parse(
        Buffer.from(sessionCookie.value, "base64").toString()
      );

      // Check if session expired
      if (Date.now() > session.exp) {
        cookieStore.delete("admin_session");
        return NextResponse.json(
          { success: false, authenticated: false, message: "Session expired" },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          username: session.username,
          role: session.role,
          email: session.email,
        },
      });
    } catch {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
// This endpoint is now disabled. Use Supabase Auth for admin session.
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ success: false, message: "Custom admin session is disabled. Please use Google login." }, { status: 403 });
}
}

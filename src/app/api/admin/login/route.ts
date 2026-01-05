import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Admin credentials - in production, use environment variables and proper hashing
const ADMIN_USERS = [
  { username: "admin", password: "admin123", role: "admin", email: "admin@dadocinema.com" },
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Find matching admin user
    const user = ADMIN_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Create session token (simple for demo - use proper JWT in production)
    const sessionToken = Buffer.from(
      JSON.stringify({
        username: user.username,
        role: user.role,
        email: user.email,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      })
    ).toString("base64");

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: { username: user.username, role: user.role, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}

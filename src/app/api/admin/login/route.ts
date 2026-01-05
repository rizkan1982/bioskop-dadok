import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ success: false, message: "Custom admin login is disabled. Please use Google login." }, { status: 403 });
}
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




  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred" },
      { status: 500 }
    );
  }
import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ success: false, message: "Custom admin login is disabled. Please use Google login." }, { status: 403 });
}
}

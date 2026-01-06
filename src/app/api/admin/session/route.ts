import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ success: false, message: "Custom admin session is disabled. Please use Google login." }, { status: 403 });
}

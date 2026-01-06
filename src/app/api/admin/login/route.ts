import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ success: false, message: "Custom admin login is disabled. Please use Google login." }, { status: 403 });
}

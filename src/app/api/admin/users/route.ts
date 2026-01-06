import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/actions/admin";

// GET - Fetch all admin users from database
export async function GET(request: NextRequest) {
  try {
    // Check if current user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const supabase = await createClient(true); // Use service role

    // Get all users with is_admin = true
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, is_admin, created_at")
      .eq("is_admin", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Format data for frontend
    const admins = profiles?.map((profile) => ({
      id: profile.id,
      username: profile.email?.split("@")[0] || "admin",
      email: profile.email || "",
      role: "admin",
      createdAt: profile.created_at,
    })) || [];

    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}

// POST - Add new admin user (by email only)
export async function POST(request: NextRequest) {
  try {
    // Check if current user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Email tidak valid" },
        { status: 400 }
      );
    }

    const supabase = await createClient(true); // Use service role

    // Check if user exists in profiles
    const { data: existingProfile, error: findError } = await supabase
      .from("profiles")
      .select("id, email, is_admin")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (findError && findError.code !== "PGRST116") {
      // PGRST116 = no rows found (that's okay, we'll create one)
      throw findError;
    }

    if (existingProfile) {
      // User exists, update is_admin flag
      if (existingProfile.is_admin) {
        return NextResponse.json(
          { success: false, message: "Email ini sudah terdaftar sebagai admin" },
          { status: 400 }
        );
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", existingProfile.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        success: true,
        data: {
          id: existingProfile.id,
          username: email.split("@")[0],
          email: email,
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        message: "Admin berhasil ditambahkan",
      });
    } else {
      // User doesn't exist yet in the database
      // We can't create a profile without the user's auth ID
      // Return success but note that they need to login first to create their profile
      return NextResponse.json({
        success: true,
        data: {
          id: `pending-${Date.now()}`,
          username: email.split("@")[0],
          email: email,
          role: "admin (pending)",
          createdAt: new Date().toISOString(),
        },
        message: "Email didaftarkan. User perlu login dengan Google terlebih dahulu, lalu ditambahkan ulang sebagai admin.",
      });
    }
  } catch (error) {
    console.error("Error adding admin user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan admin" },
      { status: 500 }
    );
  }
}

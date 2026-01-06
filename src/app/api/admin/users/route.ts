import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Admin email whitelist (must match ADMIN_EMAILS in actions/admin.ts)
const ADMIN_EMAILS = [
  "stressgue934@gmail.com",
];

// Helper to check if user is admin in API context
async function checkAdminAccess(request: NextRequest): Promise<{ isAdmin: boolean; userId?: string }> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("[ADMIN API] No authenticated user");
      return { isAdmin: false };
    }

    console.log("[ADMIN API] Checking admin for user:", user.email);

    // Check 1: Email whitelist (priority tertinggi)
    if (ADMIN_EMAILS.includes(user.email || "")) {
      console.log("[ADMIN API] User is in email whitelist");
      return { isAdmin: true, userId: user.id };
    }
    
    // Check 2: Database is_admin field (fallback)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (error) {
      console.warn("[ADMIN API] Error checking profile:", error);
      return { isAdmin: false };
    }

    const isAdmin = profile?.is_admin === true;
    console.log("[ADMIN API] Admin status from DB:", isAdmin);
    
    return { isAdmin, userId: user.id };
  } catch (error) {
    console.error("[ADMIN API] Error checking admin access:", error);
    return { isAdmin: false };
  }
}

// GET - Fetch all admin users from database
export async function GET(request: NextRequest) {
  try {
    console.log("[ADMIN API] GET /api/admin/users called");
    
    // Check if current user is admin
    const { isAdmin, userId } = await checkAdminAccess(request);
    if (!isAdmin) {
      console.log("[ADMIN API] Unauthorized access attempt");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    console.log("[ADMIN API] Admin user", userId, "fetching admin list");

    const supabase = await createClient(true); // Use service role

    console.log("[ADMIN API] Executing query: SELECT * FROM profiles WHERE is_admin = true");

    // Get all users with is_admin = true
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, email, is_admin, created_at")
      .eq("is_admin", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ADMIN API] Query error:", error);
      throw error;
    }

    console.log("[ADMIN API] Query result - profiles count:", profiles?.length, "profiles:", profiles);

    // Format data for frontend
    const admins = profiles?.map((profile) => ({
      id: profile.id,
      username: profile.email?.split("@")[0] || "admin",
      email: profile.email || "",
      role: "admin",
      createdAt: profile.created_at,
    })) || [];

    console.log("[ADMIN API] Returning", admins.length, "admins");
    return NextResponse.json({ success: true, data: admins });
  } catch (error) {
    console.error("[ADMIN API] Error fetching admin users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch admin users", error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Add new admin user (by email only)
export async function POST(request: NextRequest) {
  try {
    console.log("[ADMIN API] POST /api/admin/users called");
    
    // Check if current user is admin
    const { isAdmin } = await checkAdminAccess(request);
    if (!isAdmin) {
      console.log("[ADMIN API] Unauthorized POST attempt");
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

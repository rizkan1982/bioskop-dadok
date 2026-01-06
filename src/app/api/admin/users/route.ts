import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Admin email whitelist - DEPRECATED, use database is_admin as source of truth
const ADMIN_EMAILS = [
  "stressgue934@gmail.com",
];

// Helper to check if user is admin in API context
// Priority: Database is_admin = true > Email whitelist > is_admin = false (blocked)
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

    // Check database is_admin field FIRST (source of truth)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (error) {
      console.warn("[ADMIN API] Error checking profile:", error);
      return { isAdmin: false };
    }

    // If database says is_admin = true, they are admin
    if (profile?.is_admin === true) {
      console.log("[ADMIN API] User is admin (from DB)");
      return { isAdmin: true, userId: user.id };
    }

    // If database says is_admin = false, they are NOT admin (even if in whitelist)
    if (profile?.is_admin === false) {
      console.log("[ADMIN API] User is NOT admin (from DB - explicitly denied)");
      return { isAdmin: false };
    }

    // Check email whitelist as fallback if profile doesn't have is_admin value
    if (ADMIN_EMAILS.includes(user.email || "")) {
      console.log("[ADMIN API] User is in email whitelist (fallback)");
      return { isAdmin: true, userId: user.id };
    }
    
    console.log("[ADMIN API] User is not admin");
    return { isAdmin: false };
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

    // First, check how many rows exist with is_admin = true
    const { data: allAdmins, error: adminError } = await supabase
      .from("profiles")
      .select("id, email, is_admin, created_at")
      .eq("is_admin", true)
      .order("created_at", { ascending: false });

    if (adminError) {
      console.error("[ADMIN API] Error querying is_admin=true:", adminError);
    }

    console.log("[ADMIN API] Query is_admin=true returned:", allAdmins?.length, "rows");
    console.log("[ADMIN API] Profiles with is_admin=true:", allAdmins?.map(p => ({ email: p.email, is_admin: p.is_admin })));

    // Also check if there are any NULL is_admin values (might be old profiles)
    const { data: nullAdmins, error: nullError } = await supabase
      .from("profiles")
      .select("id, email, is_admin, created_at")
      .is("is_admin", null)
      .order("created_at", { ascending: false });

    if (nullError) {
      console.warn("[ADMIN API] Error checking null is_admin:", nullError);
    } else if (nullAdmins && nullAdmins.length > 0) {
      console.warn("[ADMIN API] Found", nullAdmins.length, "profiles with NULL is_admin:", nullAdmins.map(p => p.email));
    }

    const profiles = allAdmins || [];
    console.log("[ADMIN API] Final result - profiles count:", profiles.length);

    // Format data for frontend
    const admins = profiles.map((profile) => ({
      id: profile.id,
      username: profile.email?.split("@")[0] || "admin",
      email: profile.email || "",
      role: "admin",
      createdAt: profile.created_at,
    })) || [];

    console.log("[ADMIN API] Returning", admins.length, "admins:", admins.map(a => a.email));
    return NextResponse.json({ success: true, data: admins });
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
    console.log("[ADMIN API POST] Starting POST /api/admin/users");
    
    // Check if current user is admin
    console.log("[ADMIN API POST] Checking admin access...");
    const { isAdmin } = await checkAdminAccess(request);
    if (!isAdmin) {
      console.log("[ADMIN API POST] Unauthorized POST attempt");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    console.log("[ADMIN API POST] Admin verified, parsing request body");
    const { email } = await request.json();
    console.log("[ADMIN API POST] Received email:", email);

    // Validate email
    if (!email || !email.includes("@")) {
      console.warn("[ADMIN API POST] Invalid email format:", email);
      return NextResponse.json(
        { success: false, message: "Email tidak valid" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    console.log("[ADMIN API POST] Cleaned email:", cleanEmail);
    
    const supabase = await createClient(true); // Use service role

    // Check if user exists in profiles
    console.log("[ADMIN API POST] Checking if profile exists for email:", cleanEmail);
    const { data: existingProfile, error: findError } = await supabase
      .from("profiles")
      .select("id, email, is_admin")
      .eq("email", cleanEmail)
      .single();

    if (findError && findError.code !== "PGRST116") {
      // PGRST116 = no rows found (that's okay, we'll create one)
      console.error("[ADMIN API POST] Database error checking profile:", findError);
      throw findError;
    }

    if (findError?.code === "PGRST116") {
      console.log("[ADMIN API POST] Profile not found for email (PGRST116)");
    }

    if (existingProfile) {
      console.log("[ADMIN API POST] Profile found for email:", cleanEmail);
      // User exists, update is_admin flag
      if (existingProfile.is_admin) {
        console.warn("[ADMIN API POST] User already admin:", cleanEmail);
        return NextResponse.json(
          { success: false, message: "Email ini sudah terdaftar sebagai admin" },
          { status: 400 }
        );
      }

      console.log("[ADMIN API POST] Updating is_admin flag for user:", existingProfile.id);
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", existingProfile.id);

      if (updateError) {
        console.error("[ADMIN API POST] Update error:", updateError);
        throw updateError;
      }

      console.log("[ADMIN API POST] Successfully updated admin status for:", cleanEmail);
      return NextResponse.json({
        success: true,
        data: {
          id: existingProfile.id,
          username: cleanEmail.split("@")[0],
          email: cleanEmail,
          role: "admin",
          createdAt: new Date().toISOString(),
        },
        message: "Admin berhasil ditambahkan",
      });
    } else {
      // User doesn't exist yet in the database
      console.log("[ADMIN API POST] Profile not found, user needs to login first:", cleanEmail);
      // We can't create a profile without the user's auth ID
      // Return success but note that they need to login first to create their profile
      return NextResponse.json({
        success: true,
        data: {
          id: `pending-${Date.now()}`,
          username: cleanEmail.split("@")[0],
          email: cleanEmail,
          role: "admin (pending)",
          createdAt: new Date().toISOString(),
        },
        message: "Email didaftarkan. User perlu login dengan Google terlebih dahulu, lalu ditambahkan ulang sebagai admin.",
      });
    }
  } catch (error) {
    console.error("[ADMIN API POST] Error adding admin user:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan admin: " + String(error) },
      { status: 500 }
    );
  }
}

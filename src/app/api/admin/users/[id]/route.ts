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
      console.log("[ADMIN API DELETE] No authenticated user");
      return { isAdmin: false };
    }

    console.log("[ADMIN API DELETE] Checking admin for user:", user.email);

    // Check database is_admin field FIRST (source of truth)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (error) {
      console.warn("[ADMIN API DELETE] Error checking profile:", error);
      return { isAdmin: false };
    }

    // If database says is_admin = true, they are admin
    if (profile?.is_admin === true) {
      console.log("[ADMIN API DELETE] User is admin (from DB)");
      return { isAdmin: true, userId: user.id };
    }

    // If database says is_admin = false, they are NOT admin (even if in whitelist)
    if (profile?.is_admin === false) {
      console.log("[ADMIN API DELETE] User is NOT admin (from DB - explicitly denied)");
      return { isAdmin: false };
    }

    // Check email whitelist as fallback if profile doesn't have is_admin value
    if (ADMIN_EMAILS.includes(user.email || "")) {
      console.log("[ADMIN API DELETE] User is in email whitelist (fallback)");
      return { isAdmin: true, userId: user.id };
    }
    
    console.log("[ADMIN API DELETE] User is not admin");
    return { isAdmin: false };
  } catch (error) {
    console.error("[ADMIN API DELETE] Error checking admin access:", error);
    return { isAdmin: false };
  }
}

// DELETE - Remove admin status from user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[ADMIN API DELETE] DELETE request started");
    
    // Check if current user is admin
    const { isAdmin } = await checkAdminAccess(request);
    if (!isAdmin) {
      console.log("[ADMIN API DELETE] Unauthorized delete attempt");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    console.log("[ADMIN API DELETE] Deleting admin with ID:", id);

    const supabase = await createClient(true); // Use service role

    // Verify user exists first
    const { data: existingUser, error: findError } = await supabase
      .from("profiles")
      .select("id, email, is_admin")
      .eq("id", id)
      .single();

    if (findError || !existingUser) {
      console.log("[ADMIN API DELETE] User not found:", id);
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    console.log("[ADMIN API DELETE] Found user to delete:", existingUser.email);

    // Update is_admin to false (don't delete the profile)
    console.log("[ADMIN API DELETE] Executing update query...");
    const { data: updateData, error } = await supabase
      .from("profiles")
      .update({ is_admin: false })
      .eq("id", id);

    console.log("[ADMIN API DELETE] Update result - Data:", updateData, "Error:", error);

    if (error) {
      console.error("[ADMIN API DELETE] Update failed with error:", error);
      throw error;
    }
    
    // Verify the update was successful
    console.log("[ADMIN API DELETE] Verifying update...");
    const { data: verifyUser, error: verifyError } = await supabase
      .from("profiles")
      .select("id, email, is_admin")
      .eq("id", id)
      .single();

    console.log("[ADMIN API DELETE] Verification result - User:", verifyUser, "Error:", verifyError);
    
    console.log(`[ADMIN API DELETE] Admin ${existingUser.email} (${id}) removed successfully`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Admin berhasil dihapus" 
    });
  } catch (error) {
    console.error("[ADMIN API DELETE] Error removing admin:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus admin", error: String(error) },
      { status: 500 }
    );
  }
}

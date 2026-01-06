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

    // Use stored procedure to remove admin access (SECURITY DEFINER bypasses RLS)
    console.log("[ADMIN API DELETE] Calling remove_admin_access() stored procedure...");
    const { data: procResult, error: procError } = await (supabase.rpc as any)(
      "remove_admin_access",
      { user_id: id }
    );

    console.log("[ADMIN API DELETE] Procedure result:", procResult, "Error:", procError);

    if (procError) {
      console.error("[ADMIN API DELETE] Procedure failed:", procError);
      throw procError;
    }

    if (!procResult?.success) {
      console.warn("[ADMIN API DELETE] Procedure returned success=false:", procResult);
      throw new Error(procResult?.message || "Failed to remove admin access");
    }

    console.log(`[ADMIN API DELETE] Admin ${existingUser.email} (${id}) removed successfully via procedure`);
    
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

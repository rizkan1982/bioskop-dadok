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
      console.log("[ADMIN API DELETE] No authenticated user");
      return { isAdmin: false };
    }

    console.log("[ADMIN API DELETE] Checking admin for user:", user.email);

    // Check 1: Email whitelist (priority tertinggi)
    if (ADMIN_EMAILS.includes(user.email || "")) {
      console.log("[ADMIN API DELETE] User is in email whitelist");
      return { isAdmin: true, userId: user.id };
    }
    
    // Check 2: Database is_admin field (fallback)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (error) {
      console.warn("[ADMIN API DELETE] Error checking profile:", error);
      return { isAdmin: false };
    }

    const isAdmin = profile?.is_admin === true;
    console.log("[ADMIN API DELETE] Admin status from DB:", isAdmin);
    
    return { isAdmin, userId: user.id };
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
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: false })
      .eq("id", id);

    if (error) throw error;
    
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

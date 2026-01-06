import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { isAdmin } from "@/actions/admin";

// DELETE - Remove admin status from user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if current user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    const supabase = await createClient(true); // Use service role

    // Update is_admin to false (don't delete the profile)
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: false })
      .eq("id", id);

    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      message: "Admin berhasil dihapus" 
    });
  } catch (error) {
    console.error("Error removing admin:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus admin" },
      { status: 500 }
    );
  }
}

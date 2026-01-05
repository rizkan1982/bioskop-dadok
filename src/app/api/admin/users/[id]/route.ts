import { NextRequest, NextResponse } from "next/server";

// Note: In a real app, this would be a shared store with the main users route
// For demo purposes, we're simulating the delete operation

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // In a real app, delete from database
    // For demo, just return success
    
    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}

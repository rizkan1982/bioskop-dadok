import { NextRequest, NextResponse } from "next/server";
import { updateAd, deleteAd, incrementAdClick } from "@/actions/ads";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const result = await updateAd(params.id, body);
    
    if (!result.success) {
      return NextResponse.json(
        result,
        { status: result.message === "Unauthorized access" ? 401 : 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in ad PUT route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteAd(params.id);
    
    if (!result.success) {
      return NextResponse.json(
        result,
        { status: result.message === "Unauthorized access" ? 401 : 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in ad DELETE route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await incrementAdClick(params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in ad PATCH route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

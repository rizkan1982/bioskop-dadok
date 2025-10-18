import { NextRequest, NextResponse } from "next/server";
import { getAllAds, createAd, getActiveAdsByPosition } from "@/actions/ads";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("active") === "true";
    const position = searchParams.get("position");

    if (activeOnly && position) {
      const result = await getActiveAdsByPosition(position);
      return NextResponse.json(result);
    } else {
      const result = await getAllAds();
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Error in ads GET route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title || !body.image_url || !body.position) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await createAd(body);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.message === "Unauthorized access" ? 401 : 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error in ads POST route:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

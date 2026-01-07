import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("[ANONYMOUS WATCH] Recording anonymous watch...");
    
    const {
      sessionId,
      mediaId,
      mediaType,
      title,
      durationWatched,
      totalDuration,
    } = await request.json();

    // Validate input
    if (!sessionId || !mediaId || !mediaType) {
      console.warn("[ANONYMOUS WATCH] Missing required fields");
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "unknown";
    const ip = request.headers.get("x-forwarded-for") || 
              request.headers.get("x-real-ip") ||
              "unknown";

    console.log("[ANONYMOUS WATCH] Session:", sessionId, "Media:", mediaId, "Type:", mediaType);

    // Use service role to bypass RLS
    const supabase = await createClient(true);

    // Try to find existing session
    const { data: existingSession, error: findError } = await (supabase
      .from("anonymous_sessions" as any) as any)
      .select("id")
      .eq("session_id", sessionId)
      .eq("media_id", mediaId)
      .eq("media_type", mediaType)
      .single();

    if (existingSession) {
      // Update existing session
      console.log("[ANONYMOUS WATCH] Updating existing session");
      const { error: updateError } = await (supabase
        .from("anonymous_sessions" as any) as any)
        .update({
          duration_watched: durationWatched || 0,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSession.id);

      if (updateError) {
        console.error("[ANONYMOUS WATCH] Update error:", updateError);
        throw updateError;
      }
    } else {
      // Create new session
      console.log("[ANONYMOUS WATCH] Creating new session");
      const { error: insertError } = await (supabase
        .from("anonymous_sessions" as any) as any)
        .insert({
          session_id: sessionId,
          media_id: mediaId,
          media_type: mediaType,
          title: title || null,
          duration_watched: durationWatched || 0,
          total_duration: totalDuration || 0,
          user_agent: userAgent,
          ip_address: ip,
        });

      if (insertError) {
        console.error("[ANONYMOUS WATCH] Insert error:", insertError);
        throw insertError;
      }
    }

    console.log("[ANONYMOUS WATCH] Success");
    return NextResponse.json({
      success: true,
      message: "Watch session recorded",
    });
  } catch (error) {
    console.error("[ANONYMOUS WATCH] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record watch" },
      { status: 500 }
    );
  }
}

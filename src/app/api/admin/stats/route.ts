import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Admin email whitelist - DEPRECATED, use database is_admin as source of truth
const ADMIN_EMAILS = [
  "stressgue934@gmail.com",
];

// Helper to check if user is admin in API context
// Priority: Database is_admin = true > Email whitelist > is_admin = false (blocked)
async function checkAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("[ADMIN STATS] No authenticated user");
      return false;
    }

    console.log("[ADMIN STATS] Checking admin for user:", user.email);

    // Check database is_admin field FIRST (source of truth)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (error) {
      console.warn("[ADMIN STATS] Error checking profile:", error);
      return false;
    }

    // If database says is_admin = true, they are admin
    if (profile?.is_admin === true) {
      console.log("[ADMIN STATS] User is admin (from DB)");
      return true;
    }

    // If database says is_admin = false, they are NOT admin (even if in whitelist)
    if (profile?.is_admin === false) {
      console.log("[ADMIN STATS] User is NOT admin (from DB - explicitly denied)");
      return false;
    }

    // Check email whitelist as fallback if profile doesn't have is_admin value
    if (ADMIN_EMAILS.includes(user.email || "")) {
      console.log("[ADMIN STATS] User is in email whitelist (fallback)");
      return true;
    }
    
    console.log("[ADMIN STATS] User is not admin");
    return false;
  } catch (error) {
    console.error("[ADMIN STATS] Error checking admin access:", error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if current user is admin
    const isAdmin = await checkAdminAccess(request);
    if (!isAdmin) {
      console.log("[ADMIN STATS] Unauthorized access attempt");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Always use service role for admin stats (bypass RLS)
    const supabase = await createClient(true);

    console.log("[ADMIN STATS] Starting stats fetch...");

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (usersError) {
      console.error("[ADMIN STATS] Error fetching total users:", usersError);
    } else {
      console.log("[ADMIN STATS] Total users:", totalUsers);
    }

    // Get watch histories count
    const { count: totalHistories, error: historiesError } = await supabase
      .from("histories")
      .select("*", { count: "exact", head: true });

    if (historiesError) {
      console.error("[ADMIN STATS] Error fetching total histories:", historiesError);
    } else {
      console.log("[ADMIN STATS] Total histories:", totalHistories);
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    console.log("[ADMIN STATS] Today ISO:", todayISO);

    // Get this week's start
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartISO = weekStart.toISOString();

    // Get this month's start
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartISO = monthStart.toISOString();

    // Get today's watch activity (authenticated users)
    const { count: todayWatches, error: todayError } = await supabase
      .from("histories")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO);

    // Get today's anonymous watches
    const { count: todayAnonWatches, error: todayAnonError } = await (supabase
      .from("anonymous_sessions" as any)
      .select("*", { count: "exact", head: true }) as any)
      .gte("created_at", todayISO);

    const todayTotal = (todayWatches || 0) + (todayAnonWatches || 0);

    if (todayError) {
      console.error("[ADMIN STATS] Error fetching today watches:", todayError);
    }
    if (todayAnonError) {
      console.error("[ADMIN STATS] Error fetching today anonymous watches:", todayAnonError);
    }
    console.log("[ADMIN STATS] Today watches (auth):", todayWatches, "anonymous:", todayAnonWatches, "total:", todayTotal);

    // Get this week's watch activity (authenticated users)
    const { count: weekWatches, error: weekError } = await supabase
      .from("histories")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekStartISO);

    // Get this week's anonymous watches
    const { count: weekAnonWatches, error: weekAnonError } = await (supabase
      .from("anonymous_sessions" as any)
      .select("*", { count: "exact", head: true }) as any)
      .gte("created_at", weekStartISO);

    const weekTotal = (weekWatches || 0) + (weekAnonWatches || 0);

    if (weekError) {
      console.error("[ADMIN STATS] Error fetching week watches:", weekError);
    }
    if (weekAnonError) {
      console.error("[ADMIN STATS] Error fetching week anonymous watches:", weekAnonError);
    }
    console.log("[ADMIN STATS] Week watches (auth):", weekWatches, "anonymous:", weekAnonWatches, "total:", weekTotal);

    // Get this month's watch activity (use created_at, not updated_at)
    const { count: monthWatches, error: monthError } = await supabase
      .from("histories")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthStartISO);

    if (monthError) {
      console.error("[ADMIN STATS] Error fetching month watches:", monthError);
    } else {
      console.log("[ADMIN STATS] Month watches:", monthWatches);
    }

    // Get recent watch histories for "Currently Watching"
    const { data: recentHistories, error: recentError } = await supabase
      .from("histories")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (recentError) {
      console.error("[ADMIN STATS] Error fetching recent histories:", recentError);
    }

    // Also get recent anonymous sessions
    const { data: recentAnonSessions, error: recentAnonError } = await (supabase
      .from("anonymous_sessions" as any) as any)
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (recentAnonError) {
      console.error("[ADMIN STATS] Error fetching recent anonymous sessions:", recentAnonError);
    }

    console.log("[ADMIN STATS] Recent histories:", recentHistories?.length, "Recent anon sessions:", recentAnonSessions?.length);

    if (recentError) {
      console.error("[ADMIN STATS] Error fetching recent histories:", recentError);
    } else {
      console.log("[ADMIN STATS] Recent histories count:", recentHistories?.length);
    }

    // Get weekly activity (last 7 days) - use created_at
    const weeklyData = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // Get from authenticated histories
      const { count: authCount, error: dayError } = await supabase
        .from("histories")
        .select("*", { count: "exact", head: true })
        .gte("created_at", date.toISOString())
        .lt("created_at", nextDate.toISOString());

      // Get from anonymous sessions
      const { count: anonCount, error: anonDayError } = await (supabase
        .from("anonymous_sessions" as any) as any)
        .select("*", { count: "exact", head: true })
        .gte("created_at", date.toISOString())
        .lt("created_at", nextDate.toISOString());

      const dayName = days[(i === 6 ? new Date().getDay() : (new Date().getDay() + 7 - i) % 7)];
      const totalCount = (authCount || 0) + (anonCount || 0);
      
      weeklyData.push({
        day: dayName,
        visitors: totalCount,
      });

      if (dayError) {
        console.error("[ADMIN STATS] Error fetching day:", dayError);
      }
      if (anonDayError) {
        console.error("[ADMIN STATS] Error fetching anon day data:", anonDayError);
      }
    }

    // Get hourly distribution (simplified - based on existing data timestamps)
    const hourlyTraffic = Array(24).fill(0).map((_, hour) => ({
      hour,
      visitors: 0,
    }));

    // Count histories by hour of creation
    const { data: allHistories, error: hourlyError } = await supabase
      .from("histories")
      .select("created_at")
      .gte("created_at", monthStartISO);

    if (hourlyError) {
      console.error("[ADMIN STATS] Error fetching hourly data:", hourlyError);
    } else {
      console.log("[ADMIN STATS] All histories in this month:", allHistories?.length);
    }

    if (allHistories) {
      allHistories.forEach((h) => {
        const hour = new Date(h.created_at).getHours();
        hourlyTraffic[hour].visitors++;
      });
    }

    // Also count anonymous sessions by hour
    const { data: allAnonSessions, error: anonHourlyError } = await (supabase
      .from("anonymous_sessions" as any) as any)
      .select("created_at")
      .gte("created_at", monthStartISO);

    if (anonHourlyError) {
      console.error("[ADMIN STATS] Error fetching anonymous hourly data:", anonHourlyError);
    } else {
      console.log("[ADMIN STATS] Anonymous sessions in this month:", allAnonSessions?.length);
      
      if (allAnonSessions) {
        allAnonSessions.forEach((a: any) => {
          const hour = new Date(a.created_at).getHours();
          hourlyTraffic[hour].visitors++;
        });
      }
    }

    // Get unique content watched - try both column names (tmdb_id and media_id, content_type and type)
    let uniqueContent = null;
    const { data: contentData1, error: contentError1 } = await supabase
      .from("histories")
      .select("tmdb_id, content_type");

    if (contentError1) {
      console.warn("[ADMIN STATS] Error with tmdb_id/content_type, trying media_id/type:", contentError1);
      // Fallback to old column names
      const { data: contentData2, error: contentError2 } = await supabase
        .from("histories")
        .select("media_id, type");

      if (contentError2) {
        console.error("[ADMIN STATS] Error fetching unique content with both column sets:", contentError2);
      } else {
        uniqueContent = contentData2?.map((c: any) => ({
          tmdb_id: c.media_id,
          content_type: c.type
        }));
        console.log("[ADMIN STATS] Using old column names (media_id/type)");
      }
    } else {
      uniqueContent = contentData1;
      console.log("[ADMIN STATS] Using new column names (tmdb_id/content_type)");
    }

    console.log("[ADMIN STATS] Unique content found:", uniqueContent?.length);

    const uniqueMovies = new Set(
      (uniqueContent as { tmdb_id: number; content_type: string }[] | null)
        ?.filter((c) => c.content_type === "movie")
        .map((c) => c.tmdb_id)
    ).size;
    const uniqueTvShows = new Set(
      (uniqueContent as { tmdb_id: number; content_type: string }[] | null)
        ?.filter((c) => c.content_type === "tv")
        .map((c) => c.tmdb_id)
    ).size;

    console.log("[ADMIN STATS] Unique movies:", uniqueMovies);
    console.log("[ADMIN STATS] Unique TV shows:", uniqueTvShows);

    // Combine authenticated and anonymous watchers for "Sedang Ditonton"
    const allWatchers: any[] = [];

    // Add authenticated watchers
    if (recentHistories) {
      recentHistories.forEach((h, i) => {
        allWatchers.push({
          id: `auth-${i}`,
          title: h.title || "Unknown Title",
          type: (h as any).content_type || (h as any).type || "movie",
          country: "Indonesia",
          startedAt: new Date(h.updated_at),
          source: "authenticated",
        });
      });
    }

    // Add anonymous watchers
    if (recentAnonSessions) {
      recentAnonSessions.forEach((a: any, i: number) => {
        allWatchers.push({
          id: `anon-${i}`,
          title: a.title || "Unknown Title",
          type: a.media_type || "movie",
          country: "Anonymous",
          startedAt: new Date(a.updated_at),
          source: "anonymous",
        });
      });
    }

    // Sort by most recent and limit to 6
    const currentWatchers = allWatchers
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 6)
      .map((w, i) => ({
        ...w,
        id: `watcher-${i}`,
      }));

    console.log("[ADMIN STATS] Current watchers (combined):", currentWatchers.length);

    // Count movies and TV shows watched TODAY (from both authenticated and anonymous)
    let moviesWatchedToday = 0;
    let tvShowsWatchedToday = 0;

    // Count from authenticated histories
    if (allHistories) {
      allHistories.forEach((h) => {
        const isToday = new Date(h.created_at).toDateString() === new Date().toDateString();
        if (isToday) {
          if ((h as any).content_type === "movie" || (h as any).type === "movie") {
            moviesWatchedToday++;
          } else if ((h as any).content_type === "tv" || (h as any).type === "tv") {
            tvShowsWatchedToday++;
          }
        }
      });
    }

    // Count from anonymous sessions
    if (allAnonSessions) {
      allAnonSessions.forEach((a: any) => {
        const isToday = new Date(a.created_at).toDateString() === new Date().toDateString();
        if (isToday) {
          if (a.media_type === "movie") {
            moviesWatchedToday++;
          } else if (a.media_type === "tv") {
            tvShowsWatchedToday++;
          }
        }
      });
    }

    console.log("[ADMIN STATS] Movies watched today:", moviesWatchedToday, "TV shows:", tvShowsWatchedToday);

    console.log("[ADMIN STATS] Response prepared successfully");
    console.log("[ADMIN STATS] Summary: Today=" + todayTotal + ", Week=" + weekTotal + ", Month=" + monthWatches);

    // Note: Device distribution is not available because we don't track device info
    // This can be implemented later with proper analytics tracking
    const deviceDistribution: { device: string; percentage: number; count: number }[] = [];

    // Country data - based on actual data if we track it, otherwise empty
    const countryData: { country: string; code: string; flag: string; visitors: number; peakHour: string }[] = [];

    return NextResponse.json({
      success: true,
      data: {
        today: todayTotal || 0,
        thisWeek: weekTotal || 0,
        thisMonth: monthWatches || 0,
        activeNow: currentWatchers.length,
        totalUsers: totalUsers || 0,
        totalHistories: totalHistories || 0,
        uniqueMovies,
        uniqueTvShows,
        moviesWatchedToday,
        tvShowsWatchedToday,
        hourlyTraffic,
        weeklyTraffic: weeklyData,
        countryData,
        deviceDistribution,
        currentWatchers,
      },
    });
  } catch (error) {
    console.error("[ADMIN STATS] FATAL ERROR:", error);
    console.error("[ADMIN STATS] Error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { success: false, message: "Failed to fetch stats", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // This endpoint can be used to track custom events if needed
    const body = await request.json();
    
    // For now, just acknowledge the request
    return NextResponse.json({ success: true, message: "Event tracked" });
  } catch (error) {
    console.error("Error tracking event:", error);
    return NextResponse.json(
      { success: false, message: "Failed to track event" },
      { status: 500 }
    );
  }
}

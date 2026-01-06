import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Always use service role for admin stats (bypass RLS)
    const supabase = await createClient(true);

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (usersError) {
      console.error("Error fetching total users:", usersError);
    }

    // Get watch histories count
    const { count: totalHistories, error: historiesError } = await supabase
      .from("histories")
      .select("*", { count: "exact", head: true });

    if (historiesError) {
      console.error("Error fetching total histories:", historiesError);
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get this week's start
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartISO = weekStart.toISOString();

    // Get this month's start
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStartISO = monthStart.toISOString();

    // Get today's watch activity (use created_at, not updated_at)
    const { count: todayWatches, error: todayError } = await supabase
      .from("histories")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO);

    if (todayError) {
      console.error("Error fetching today watches:", todayError);
    }

    // Get this week's watch activity (use created_at, not updated_at)
    const { count: weekWatches, error: weekError } = await supabase
      .from("histories")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekStartISO);

    if (weekError) {
      console.error("Error fetching week watches:", weekError);
    }

    // Get this month's watch activity (use created_at, not updated_at)
    const { count: monthWatches, error: monthError } = await supabase
      .from("histories")
      .select("*", { count: "exact", head: true })
      .gte("created_at", monthStartISO);

    if (monthError) {
      console.error("Error fetching month watches:", monthError);
    }

    // Get recent watch histories for "Currently Watching"
    const { data: recentHistories, error: recentError } = await supabase
      .from("histories")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (recentError) {
      console.error("Error fetching recent histories:", recentError);
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

      const { count, error: dayError } = await supabase
        .from("histories")
        .select("*", { count: "exact", head: true })
        .gte("created_at", date.toISOString())
        .lt("created_at", nextDate.toISOString());

      if (dayError) {
        console.error(`Error fetching data for ${days[date.getDay()]}:`, dayError);
      }

      weeklyData.push({
        day: days[date.getDay()],
        visitors: count || 0,
      });
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
      console.error("Error fetching hourly data:", hourlyError);
    }

    if (allHistories) {
      allHistories.forEach((h) => {
        const hour = new Date(h.created_at).getHours();
        hourlyTraffic[hour].visitors++;
      });
    }

    // Get unique content watched
    const { data: uniqueContent, error: contentError } = await supabase
      .from("histories")
      .select("tmdb_id, content_type");

    if (contentError) {
      console.error("Error fetching unique content:", contentError);
    }

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

    // Format current watchers from recent histories
    const currentWatchers = (recentHistories || []).map((h, i) => ({
      id: `watcher-${i}`,
      title: h.title || "Unknown Title",
      type: h.content_type || "movie",
      country: "Indonesia", // Default since we don't track location
      startedAt: new Date(h.updated_at),
    }));

    // Note: Device distribution is not available because we don't track device info
    // This can be implemented later with proper analytics tracking
    const deviceDistribution: { device: string; percentage: number; count: number }[] = [];

    // Country data - based on actual data if we track it, otherwise empty
    const countryData: { country: string; code: string; flag: string; visitors: number; peakHour: string }[] = [];

    return NextResponse.json({
      success: true,
      data: {
        today: todayWatches || 0,
        thisWeek: weekWatches || 0,
        thisMonth: monthWatches || 0,
        activeNow: currentWatchers.length,
        totalUsers: totalUsers || 0,
        totalHistories: totalHistories || 0,
        uniqueMovies,
        uniqueTvShows,
        hourlyTraffic,
        weeklyTraffic: weeklyData,
        countryData,
        deviceDistribution,
        currentWatchers,
      },
    });
  } catch (error) {
    console.error("Error fetching visitor stats:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stats" },
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

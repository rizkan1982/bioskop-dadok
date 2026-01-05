import { NextRequest, NextResponse } from "next/server";

// In-memory storage untuk demo - gunakan database untuk production
let visitorData = {
  today: 167,
  thisWeek: 892,
  thisMonth: 3542,
  activeNow: 0,
  hourlyTraffic: Array(24).fill(0).map((_, i) => ({ hour: i, visitors: Math.floor(Math.random() * 100) })),
  weeklyTraffic: [
    { day: "Mon", visitors: 245 },
    { day: "Tue", visitors: 312 },
    { day: "Wed", visitors: 289 },
    { day: "Thu", visitors: 198 },
    { day: "Fri", visitors: 342 },
    { day: "Sat", visitors: 421 },
    { day: "Sun", visitors: 156 },
  ],
  countryData: [
    { country: "Indonesia", code: "ID", flag: "🇮🇩", visitors: 2156, peakHour: "15:00" },
    { country: "United States", code: "US", flag: "🇺🇸", visitors: 342, peakHour: "21:00" },
    { country: "Malaysia", code: "MY", flag: "🇲🇾", visitors: 178, peakHour: "19:00" },
    { country: "Singapore", code: "SG", flag: "🇸🇬", visitors: 89, peakHour: "20:00" },
    { country: "Australia", code: "AU", flag: "🇦🇺", visitors: 56, peakHour: "18:00" },
  ],
  deviceDistribution: [
    { device: "Mobile", percentage: 68, count: 2410 },
    { device: "Desktop", percentage: 28, count: 992 },
    { device: "Tablet", percentage: 4, count: 140 },
  ],
  currentWatchers: [] as { id: string; title: string; type: string; country: string; startedAt: Date }[],
  recentVisitors: [] as { id: string; country: string; device: string; page: string; timestamp: Date }[],
};

export async function GET(request: NextRequest) {
  try {
    // Simulate some random active users for demo
    const simulatedActive = Math.floor(Math.random() * 15);
    
    return NextResponse.json({
      success: true,
      data: {
        ...visitorData,
        activeNow: simulatedActive,
        currentWatchers: Array(simulatedActive).fill(null).map((_, i) => ({
          id: `watcher-${i}`,
          title: ["Squid Game", "The Penguin", "Venom 3", "Deadpool & Wolverine", "Dune 2"][Math.floor(Math.random() * 5)],
          type: Math.random() > 0.5 ? "movie" : "tv",
          country: ["Indonesia", "US", "Malaysia", "Singapore"][Math.floor(Math.random() * 4)],
          startedAt: new Date(Date.now() - Math.floor(Math.random() * 3600000)),
        })),
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
    // Track new visitor
    const { country, device, page } = await request.json();
    
    visitorData.today++;
    visitorData.thisWeek++;
    visitorData.thisMonth++;
    visitorData.activeNow++;
    
    const newVisitor = {
      id: `visitor-${Date.now()}`,
      country: country || "Unknown",
      device: device || "Unknown",
      page: page || "/",
      timestamp: new Date(),
    };
    
    visitorData.recentVisitors.unshift(newVisitor);
    if (visitorData.recentVisitors.length > 100) {
      visitorData.recentVisitors.pop();
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    return NextResponse.json(
      { success: false, message: "Failed to track visitor" },
      { status: 500 }
    );
  }
}

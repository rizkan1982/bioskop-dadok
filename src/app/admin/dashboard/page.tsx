"use client";

import { useState, useEffect } from "react";
import { Card, Chip, Progress, Spinner } from "@heroui/react";
import { TrendUp, Users, Eye, BarChart } from "@/utils/icons";
import { HiGlobeAlt, HiDevicePhoneMobile, HiComputerDesktop, HiDeviceTablet } from "react-icons/hi2";

interface VisitorStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  activeNow: number;
  hourlyTraffic: { hour: number; visitors: number }[];
  weeklyTraffic: { day: string; visitors: number }[];
  countryData: { country: string; code: string; flag: string; visitors: number; peakHour: string }[];
  deviceDistribution: { device: string; percentage: number; count: number }[];
  currentWatchers: { id: string; title: string; type: string; country: string; startedAt: Date }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const deviceIcons: Record<string, React.ReactNode> = {
    Mobile: <HiDevicePhoneMobile className="text-2xl text-primary" />,
    Desktop: <HiComputerDesktop className="text-2xl text-secondary" />,
    Tablet: <HiDeviceTablet className="text-2xl text-warning" />,
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-default-400 mt-1">Welcome to DADO CINEMA Admin Panel</p>
        </div>
        <Chip color="success" variant="dot" size="lg" className="animate-pulse">
          {stats?.activeNow || 0} Live
        </Chip>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today Visitors"
          value={stats?.today || 0}
          icon={<Eye className="text-2xl" />}
          color="primary"
          trend="+12%"
        />
        <StatsCard
          title="This Week"
          value={stats?.thisWeek || 0}
          icon={<TrendUp className="text-2xl" />}
          color="secondary"
          trend="+8%"
        />
        <StatsCard
          title="This Month"
          value={stats?.thisMonth || 0}
          icon={<BarChart className="text-2xl" />}
          color="success"
          trend="+15%"
        />
        <StatsCard
          title="Active Now"
          value={stats?.activeNow || 0}
          icon={<Users className="text-2xl" />}
          color="warning"
          live
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Traffic */}
        <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            📈 Visitor Trend (7 Days)
          </h3>
          <div className="space-y-3">
            {stats?.weeklyTraffic.map((day) => (
              <div key={day.day} className="flex items-center gap-4">
                <span className="w-10 text-sm text-default-400">{day.day}</span>
                <Progress
                  value={(day.visitors / Math.max(...stats.weeklyTraffic.map(d => d.visitors))) * 100}
                  color="primary"
                  className="flex-1"
                  size="sm"
                />
                <span className="w-12 text-sm text-right">{day.visitors}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Device Distribution */}
        <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            📱 Device Distribution
          </h3>
          <div className="space-y-4">
            {stats?.deviceDistribution.map((device) => (
              <div key={device.device} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  {deviceIcons[device.device]}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{device.device}</span>
                    <span className="text-sm text-default-400">{device.percentage}%</span>
                  </div>
                  <Progress
                    value={device.percentage}
                    color={device.device === "Mobile" ? "primary" : device.device === "Desktop" ? "secondary" : "warning"}
                    size="sm"
                  />
                </div>
                <span className="text-sm text-default-400">{device.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Currently Watching */}
      <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            👁️ Currently Watching
          </h3>
          <Chip color="success" variant="flat" size="sm">
            {stats?.currentWatchers?.length || 0} active
          </Chip>
        </div>
        {stats?.currentWatchers && stats.currentWatchers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.currentWatchers.map((watcher) => (
              <div
                key={watcher.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                  <Eye className="text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{watcher.title}</p>
                  <div className="flex items-center gap-2 text-xs text-default-400">
                    <span>{watcher.type === "movie" ? "🎬" : "📺"}</span>
                    <span>{watcher.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-default-400">
            <Eye className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No active watchers</p>
          </div>
        )}
      </Card>

      {/* Country Stats */}
      <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <HiGlobeAlt className="text-primary" /> Top Countries
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-default-400 text-sm">
                <th className="pb-3">Country</th>
                <th className="pb-3">Visitors</th>
                <th className="pb-3">Peak Hour</th>
                <th className="pb-3">Traffic</th>
              </tr>
            </thead>
            <tbody>
              {stats?.countryData.map((country) => (
                <tr key={country.code} className="border-t border-white/5">
                  <td className="py-3">
                    <span className="text-xl mr-2">{country.flag}</span>
                    {country.country}
                  </td>
                  <td className="py-3 font-medium">{country.visitors}</td>
                  <td className="py-3">
                    <Chip size="sm" variant="flat">🕐 {country.peakHour}</Chip>
                  </td>
                  <td className="py-3 w-48">
                    <Progress
                      value={(country.visitors / Math.max(...stats.countryData.map(c => c.visitors))) * 100}
                      color="primary"
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "danger";
  trend?: string;
  live?: boolean;
}

function StatsCard({ title, value, icon, color, trend, live }: StatsCardProps) {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/30",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/30",
    success: "from-success/20 to-success/5 border-success/30",
    warning: "from-warning/20 to-warning/5 border-warning/30",
    danger: "from-danger/20 to-danger/5 border-danger/30",
  };

  return (
    <Card className={`p-6 bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl`}>
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl bg-${color}/20 flex items-center justify-center text-${color}`}>
          {icon}
        </div>
        {live && (
          <Chip color="success" variant="dot" size="sm" className="animate-pulse">
            Live
          </Chip>
        )}
        {trend && (
          <Chip color="success" variant="flat" size="sm">
            {trend}
          </Chip>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold">{value.toLocaleString()}</p>
        <p className="text-sm text-default-400 mt-1">{title}</p>
      </div>
    </Card>
  );
}

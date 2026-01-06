"use client";

import { useState, useEffect } from "react";
import { Card, Chip, Progress, Spinner } from "@heroui/react";
import { TrendUp, Users, Eye, BarChart } from "@/utils/icons";
import { HiFilm, HiTv } from "react-icons/hi2";

interface VisitorStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  activeNow: number;
  totalUsers: number;
  totalHistories: number;
  uniqueMovies: number;
  uniqueTvShows: number;
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
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-default-400 mt-4">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-default-400 text-sm mt-1">Selamat datang di Admin Panel</p>
        </div>
        <Chip color="success" variant="dot" size="sm" className="animate-pulse self-start sm:self-auto">
          {stats?.activeNow || 0} Aktif
        </Chip>
      </div>

      {/* Stats Cards - Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Hari Ini"
          value={stats?.today || 0}
          icon={<Eye className="text-lg sm:text-xl" />}
          color="primary"
          subtitle="aktivitas"
        />
        <StatsCard
          title="Minggu Ini"
          value={stats?.thisWeek || 0}
          icon={<TrendUp className="text-lg sm:text-xl" />}
          color="secondary"
          subtitle="aktivitas"
        />
        <StatsCard
          title="Total User"
          value={stats?.totalUsers || 0}
          icon={<Users className="text-lg sm:text-xl" />}
          color="success"
          subtitle="terdaftar"
        />
        <StatsCard
          title="Total Watch"
          value={stats?.totalHistories || 0}
          icon={<BarChart className="text-lg sm:text-xl" />}
          color="warning"
          subtitle="history"
        />
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <HiFilm className="text-xl sm:text-2xl text-primary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{stats?.uniqueMovies || 0}</p>
              <p className="text-xs sm:text-sm text-default-400">Film Ditonton</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <HiTv className="text-xl sm:text-2xl text-secondary" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{stats?.uniqueTvShows || 0}</p>
              <p className="text-xs sm:text-sm text-default-400">TV Series</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Traffic */}
        <Card className="p-4 sm:p-6 bg-black/40 backdrop-blur-xl border border-white/10">
          <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
            📈 Trend Aktivitas (7 Hari)
          </h3>
          <div className="space-y-3">
            {stats?.weeklyTraffic.map((day) => {
              const maxVal = Math.max(...(stats?.weeklyTraffic.map(d => d.visitors) || [1]));
              return (
                <div key={day.day} className="flex items-center gap-3">
                  <span className="w-8 text-xs sm:text-sm text-default-400 font-medium">{day.day}</span>
                  <Progress
                    value={maxVal > 0 ? (day.visitors / maxVal) * 100 : 0}
                    color="primary"
                    className="flex-1"
                    size="sm"
                  />
                  <span className="w-10 text-xs sm:text-sm text-right font-medium">{day.visitors}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Summary Stats */}
        <Card className="p-4 sm:p-6 bg-black/40 backdrop-blur-xl border border-white/10">
          <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
            📊 Ringkasan Bulan Ini
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Eye className="text-xl sm:text-2xl text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg sm:text-xl font-bold">{stats?.thisMonth || 0}</p>
                <p className="text-xs sm:text-sm text-default-400">Total Aktivitas Bulan Ini</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                <Users className="text-xl sm:text-2xl text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg sm:text-xl font-bold">{stats?.totalUsers || 0}</p>
                <p className="text-xs sm:text-sm text-default-400">Total User Terdaftar</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-white/5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                <BarChart className="text-xl sm:text-2xl text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg sm:text-xl font-bold">{(stats?.uniqueMovies || 0) + (stats?.uniqueTvShows || 0)}</p>
                <p className="text-xs sm:text-sm text-default-400">Total Konten Ditonton</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Currently Watching */}
      <Card className="p-4 sm:p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
            👁️ Sedang Ditonton
          </h3>
          <Chip color="success" variant="flat" size="sm">
            {stats?.currentWatchers?.length || 0} aktif
          </Chip>
        </div>
        {stats?.currentWatchers && stats.currentWatchers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.currentWatchers.slice(0, 6).map((watcher) => (
              <div
                key={watcher.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center flex-shrink-0">
                  {watcher.type === "movie" ? <HiFilm className="text-lg" /> : <HiTv className="text-lg" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{watcher.title}</p>
                  <div className="flex items-center gap-2 text-xs text-default-400">
                    <span>{watcher.type === "movie" ? "🎬 Film" : "📺 TV"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-default-400">
            <Eye className="text-3xl sm:text-4xl mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tidak ada yang menonton saat ini</p>
          </div>
        )}
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning" | "danger";
  subtitle?: string;
}

function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/30",
    secondary: "from-secondary/20 to-secondary/5 border-secondary/30",
    success: "from-success/20 to-success/5 border-success/30",
    warning: "from-warning/20 to-warning/5 border-warning/30",
    danger: "from-danger/20 to-danger/5 border-danger/30",
  };

  const iconColorClasses = {
    primary: "bg-primary/20 text-primary",
    secondary: "bg-secondary/20 text-secondary",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    danger: "bg-danger/20 text-danger",
  };

  return (
    <Card className={`p-3 sm:p-4 lg:p-6 bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-xl`}>
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${iconColorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-lg sm:text-xl lg:text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs sm:text-sm text-default-400 truncate">{title}</p>
      {subtitle && <p className="text-[10px] sm:text-xs text-default-500">{subtitle}</p>}
    </Card>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Card, Chip, Progress, Spinner } from "@heroui/react";
import { TrendUp, Users, Eye, BarChart } from "@/utils/icons";
import { HiFilm, HiTv, HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";

interface VisitorStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  activeNow: number;
  totalUsers: number;
  totalHistories: number;
  uniqueMovies: number;
  uniqueTvShows: number;
  moviesWatchedToday?: number;
  tvShowsWatchedToday?: number;
  hourlyTraffic: { hour: number; visitors: number }[];
  weeklyTraffic: { day: string; visitors: number }[];
  countryData: { country: string; code: string; flag: string; visitors: number; peakHour: string }[];
  deviceDistribution: { device: string; percentage: number; count: number }[];
  currentWatchers: { id: string; title: string; type: string; country: string; startedAt: Date }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStats();
    // Real-time updates every 5 seconds instead of 30 seconds
    intervalRef.current = setInterval(fetchStats, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const fetchStats = async () => {
    try {
      console.log("[DASHBOARD] Fetching stats...");
      const res = await fetch("/api/admin/stats", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        }
      });
      
      console.log("[DASHBOARD] Stats response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[DASHBOARD] Stats data received:", data);
      console.log("[DASHBOARD] Stats breakdown - today:", data.data?.today, "thisWeek:", data.data?.thisWeek, "activeNow:", data.data?.activeNow);
      
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        console.warn("[DASHBOARD] Invalid response structure:", data);
        // Set default empty stats
        setStats({
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          activeNow: 0,
          totalUsers: 0,
          totalHistories: 0,
          uniqueMovies: 0,
          uniqueTvShows: 0,
          moviesWatchedToday: 0,
          tvShowsWatchedToday: 0,
          hourlyTraffic: [],
          weeklyTraffic: [],
          countryData: [],
          deviceDistribution: [],
          currentWatchers: [],
        });
      }
    } catch (error) {
      console.error("[DASHBOARD] Error fetching stats:", error);
      // Set default empty stats on error
      setStats({
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        activeNow: 0,
        totalUsers: 0,
        totalHistories: 0,
        uniqueMovies: 0,
        uniqueTvShows: 0,
        moviesWatchedToday: 0,
        tvShowsWatchedToday: 0,
        hourlyTraffic: [],
        weeklyTraffic: [],
        countryData: [],
        deviceDistribution: [],
        currentWatchers: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-slate-400 mt-4">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 select-text">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Overview statistik dan aktivitas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-slate-400">
            <span className="font-semibold text-emerald-400">{stats?.activeNow || 0}</span> aktif sekarang
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Hari Ini"
          value={stats?.today || 0}
          icon={<Eye className="text-lg" />}
          color="blue"
        />
        <StatCard
          label="Minggu Ini"
          value={stats?.thisWeek || 0}
          icon={<TrendUp className="text-lg" />}
          color="purple"
        />
        <StatCard
          label="Total User"
          value={stats?.totalUsers || 0}
          icon={<Users className="text-lg" />}
          color="green"
        />
        <StatCard
          label="Total Watch"
          value={stats?.totalHistories || 0}
          icon={<BarChart className="text-lg" />}
          color="amber"
        />
      </div>

      {/* Content Type Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <HiFilm className="text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.uniqueMovies || 0}</p>
              <p className="text-xs text-slate-400">Film Ditonton</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <HiTv className="text-xl text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.uniqueTvShows || 0}</p>
              <p className="text-xs text-slate-400">TV Series</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Activity */}
        <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Aktivitas 7 Hari</h3>
            <Chip size="sm" variant="flat" className="bg-slate-700 text-slate-300 text-xs">
              Realtime
            </Chip>
          </div>
          <div className="space-y-2.5">
            {stats?.weeklyTraffic.map((day) => {
              const maxVal = Math.max(...(stats?.weeklyTraffic.map(d => d.visitors) || [1]));
              const percentage = maxVal > 0 ? (day.visitors / maxVal) * 100 : 0;
              return (
                <div key={day.day} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-slate-400 font-medium">{day.day}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-xs text-right text-slate-300 font-medium">{day.visitors}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Monthly Summary */}
        <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-white mb-4">Ringkasan Bulan Ini</h3>
          <div className="space-y-3">
            <SummaryItem
              icon={<Eye className="text-lg text-blue-400" />}
              label="Total Aktivitas"
              value={stats?.thisMonth || 0}
              bgColor="bg-blue-500/20"
            />
            <SummaryItem
              icon={<Users className="text-lg text-emerald-400" />}
              label="Total User"
              value={stats?.totalUsers || 0}
              bgColor="bg-emerald-500/20"
            />
            <SummaryItem
              icon={<BarChart className="text-lg text-amber-400" />}
              label="Konten Ditonton"
              value={(stats?.uniqueMovies || 0) + (stats?.uniqueTvShows || 0)}
              bgColor="bg-amber-500/20"
            />
          </div>
        </Card>
      </div>

      {/* Currently Watching */}
      <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">Sedang Ditonton</h3>
          <Chip size="sm" color="success" variant="flat" className="text-xs">
            {stats?.currentWatchers?.length || 0} aktif
          </Chip>
        </div>
        
        {stats?.currentWatchers && stats.currentWatchers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {stats.currentWatchers.slice(0, 6).map((watcher) => (
              <div
                key={watcher.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 border border-slate-600/50"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
                  {watcher.type === "movie" ? (
                    <HiFilm className="text-blue-400" />
                  ) : (
                    <HiTv className="text-purple-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{watcher.title}</p>
                  <p className="text-xs text-slate-400">
                    {watcher.type === "movie" ? "Film" : "TV Series"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Eye className="text-3xl text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Tidak ada yang menonton saat ini</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "purple" | "green" | "amber" | "red";
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colors = {
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    green: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const iconColors = {
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    green: "bg-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/20 text-amber-400",
    red: "bg-red-500/20 text-red-400",
  };

  return (
    <Card className={`p-3 sm:p-4 bg-slate-800/50 border border-slate-700/50`}>
      <div className={`w-9 h-9 rounded-lg ${iconColors[color]} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </Card>
  );
}

// Summary Item Component
interface SummaryItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
}

function SummaryItem({ icon, label, value, bgColor }: SummaryItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-lg font-bold text-white">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Card, Chip, Spinner } from "@heroui/react";
import { TrendUp, Eye, BarChart } from "@/utils/icons";
import { HiClock, HiCalendar, HiFilm, HiTv } from "react-icons/hi2";

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
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStats();
    // Real-time updates every 5 seconds instead of 60 seconds
    intervalRef.current = setInterval(fetchStats, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const fetchStats = async () => {
    try {
      console.log("[ANALYTICS] Fetching stats...");
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      console.log("[ANALYTICS] Stats received:", data);
      console.log("[ANALYTICS] Stats breakdown - today:", data.data?.today, "thisWeek:", data.data?.thisWeek, "hourlyTraffic:", data.data?.hourlyTraffic?.length);
      
      if (data.success && data.data) {
        setStats(data.data);
      } else {
        console.warn("[ANALYTICS] Invalid response structure");
      }
    } catch (error) {
      console.error("[ANALYTICS] Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" color="primary" />
          <p className="text-slate-400 mt-4">Memuat analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 select-text">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <BarChart className="text-blue-400" /> Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Analisis trafik & aktivitas pengguna</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-slate-400">
            <span className="font-semibold text-emerald-400">{stats?.activeNow || 0}</span> aktif
          </span>
        </div>
      </div>

      {/* Quick Stats */}
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
          label="Film Ditonton"
          value={stats?.uniqueMovies || 0}
          icon={<HiFilm className="text-lg" />}
          color="green"
        />
        <StatCard
          label="TV Series"
          value={stats?.uniqueTvShows || 0}
          icon={<HiTv className="text-lg" />}
          color="amber"
        />
      </div>

      {/* Hourly Traffic */}
      <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <HiClock className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Distribusi Per Jam</h3>
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-1 min-w-[500px] h-28 items-end">
            {stats?.hourlyTraffic.map((hour) => {
              const maxVisitors = Math.max(...(stats?.hourlyTraffic.map(h => h.visitors) || [1]));
              const heightPercent = maxVisitors > 0 ? (hour.visitors / maxVisitors) * 100 : 0;
              return (
                <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-400 hover:to-blue-300"
                    style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '4px' : '2px' }}
                    title={`${hour.hour}:00 - ${hour.visitors} aktivitas`}
                  />
                  {hour.hour % 4 === 0 && (
                    <span className="text-[9px] text-slate-500">{hour.hour}h</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Weekly Pattern */}
      <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center gap-2 mb-4">
          <HiCalendar className="text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Pola Aktivitas Mingguan</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {stats?.weeklyTraffic.map((day) => {
            const maxVisitors = Math.max(...(stats?.weeklyTraffic.map(d => d.visitors) || [1]));
            const intensity = maxVisitors > 0 ? (day.visitors / maxVisitors) * 100 : 0;
            return (
              <div key={day.day} className="text-center">
                <div 
                  className="aspect-square rounded-lg mb-1 flex items-center justify-center transition-all border border-slate-600/50"
                  style={{ 
                    backgroundColor: `rgba(59, 130, 246, ${intensity / 100 * 0.6})`,
                  }}
                >
                  <span className="font-bold text-xs sm:text-sm text-white">{day.visitors}</span>
                </div>
                <span className="text-[10px] text-slate-400">{day.day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Monthly Summary */}
      <Card className="p-4 bg-slate-800/50 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-white mb-4">Ringkasan Bulan Ini</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-lg bg-slate-700/30 text-center">
            <p className="text-2xl font-bold text-white">{stats?.thisMonth || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Total Aktivitas</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30 text-center">
            <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Total User</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-700/30 text-center">
            <p className="text-2xl font-bold text-white">{stats?.totalHistories || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Total History</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "purple" | "green" | "amber";
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const iconColors = {
    blue: "bg-blue-500/20 text-blue-400",
    purple: "bg-purple-500/20 text-purple-400",
    green: "bg-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/20 text-amber-400",
  };

  return (
    <Card className="p-3 bg-slate-800/50 border border-slate-700/50">
      <div className={`w-9 h-9 rounded-lg ${iconColors[color]} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </Card>
  );
}

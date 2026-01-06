"use client";

import { useState, useEffect } from "react";
import { Card, Chip, Progress, Spinner, Select, SelectItem } from "@heroui/react";
import { TrendUp, Eye, BarChart } from "@/utils/icons";
import { HiGlobeAlt, HiClock, HiCalendar, HiFilm, HiTv } from "react-icons/hi2";

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
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timeRange]);

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
          <p className="text-default-400 mt-4">Memuat analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart className="text-primary" /> Analytics
          </h2>
          <p className="text-default-400 text-sm mt-1">Analisis trafik & aktivitas pengguna</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Chip color="success" variant="dot" size="sm" className="animate-pulse">
            {stats?.activeNow || 0} Aktif
          </Chip>
          <Select
            size="sm"
            selectedKeys={[timeRange]}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-28"
            classNames={{
              trigger: "bg-white/5 border-white/10",
            }}
          >
            <SelectItem key="24h">24 Jam</SelectItem>
            <SelectItem key="7d">7 Hari</SelectItem>
            <SelectItem key="30d">30 Hari</SelectItem>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Eye className="text-primary text-lg" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold">{stats?.today || 0}</p>
              <p className="text-xs text-default-400">Hari Ini</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <TrendUp className="text-secondary text-lg" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold">{stats?.thisWeek || 0}</p>
              <p className="text-xs text-default-400">Minggu Ini</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-success/20 to-success/5 border border-success/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <HiFilm className="text-success text-lg" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold">{stats?.uniqueMovies || 0}</p>
              <p className="text-xs text-default-400">Film Unik</p>
            </div>
          </div>
        </Card>
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <HiTv className="text-warning text-lg" />
            </div>
            <div>
              <p className="text-lg sm:text-xl font-bold">{stats?.uniqueTvShows || 0}</p>
              <p className="text-xs text-default-400">TV Series</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Hourly Traffic */}
      <Card className="p-4 sm:p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          <HiClock className="text-primary" /> Distribusi Per Jam
        </h3>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 min-w-[600px] h-32 items-end">
            {stats?.hourlyTraffic.map((hour) => {
              const maxVisitors = Math.max(...(stats?.hourlyTraffic.map(h => h.visitors) || [1]));
              const heightPercent = maxVisitors > 0 ? (hour.visitors / maxVisitors) * 100 : 0;
              return (
                <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t transition-all hover:from-primary hover:to-primary/70"
                    style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '4px' : '2px' }}
                    title={`${hour.hour}:00 - ${hour.visitors} aktivitas`}
                  />
                  {hour.hour % 4 === 0 && (
                    <span className="text-[9px] sm:text-[10px] text-default-400">{hour.hour}h</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Weekly Traffic Pattern */}
      <Card className="p-4 sm:p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          <HiCalendar className="text-secondary" /> Pola Aktivitas Mingguan
        </h3>
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {stats?.weeklyTraffic.map((day) => {
            const maxVisitors = Math.max(...(stats?.weeklyTraffic.map(d => d.visitors) || [1]));
            const intensity = maxVisitors > 0 ? (day.visitors / maxVisitors) * 100 : 0;
            return (
              <div key={day.day} className="text-center">
                <div 
                  className="aspect-square sm:h-20 lg:h-24 rounded-lg sm:rounded-xl mb-1 sm:mb-2 flex items-center justify-center transition-all"
                  style={{ 
                    backgroundColor: `rgba(56, 189, 248, ${intensity / 100})`,
                    border: `1px solid rgba(56, 189, 248, ${intensity / 200})`
                  }}
                >
                  <span className="font-bold text-xs sm:text-sm lg:text-lg">{day.visitors}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-default-400">{day.day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Country Stats */}
      <Card className="p-4 sm:p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
          <HiGlobeAlt className="text-primary" /> Distribusi Geografis
        </h3>
        {stats?.countryData && stats.countryData.length > 0 ? (
          <div className="space-y-4">
            {stats.countryData.map((country) => {
              const maxVisitors = Math.max(...(stats?.countryData.map(c => c.visitors) || [1]));
              return (
                <div 
                  key={country.code}
                  className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl sm:text-3xl">{country.flag}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">{country.country}</p>
                      <p className="text-xs text-default-400">{country.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg sm:text-xl">{country.visitors}</p>
                      <p className="text-xs text-default-400">aktivitas</p>
                    </div>
                  </div>
                  <Progress
                    value={maxVisitors > 0 ? (country.visitors / maxVisitors) * 100 : 0}
                    color="primary"
                    size="sm"
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-default-400">
                    <span>Peak: {country.peakHour}</span>
                    <span>{stats?.thisMonth ? ((country.visitors / stats.thisMonth) * 100).toFixed(1) : 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-default-400">
            <HiGlobeAlt className="text-4xl mx-auto mb-2 opacity-50" />
            <p className="text-sm">Belum ada data geografis</p>
          </div>
        )}
      </Card>
    </div>
  );
}

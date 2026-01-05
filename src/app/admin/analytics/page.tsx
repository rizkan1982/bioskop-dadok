"use client";

import { useState, useEffect } from "react";
import { Card, Chip, Progress, Spinner, Select, SelectItem } from "@heroui/react";
import { TrendUp, Eye, BarChart } from "@/utils/icons";
import { HiGlobeAlt, HiClock, HiCalendar } from "react-icons/hi2";

interface VisitorStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  activeNow: number;
  hourlyTraffic: { hour: number; visitors: number }[];
  weeklyTraffic: { day: string; visitors: number }[];
  countryData: { country: string; code: string; flag: string; visitors: number; peakHour: string }[];
  deviceDistribution: { device: string; percentage: number; count: number }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    fetchStats();
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
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent flex items-center gap-2">
            <BarChart className="text-primary" /> Analytics
          </h2>
          <p className="text-default-400 mt-1">Detailed traffic and visitor analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <Chip color="success" variant="dot" size="lg" className="animate-pulse">
            {stats?.activeNow || 0} Live
          </Chip>
          <Select
            size="sm"
            selectedKeys={[timeRange]}
            onChange={(e) => setTimeRange(e.target.value)}
            className="w-32"
          >
            <SelectItem key="24h">24 Hours</SelectItem>
            <SelectItem key="7d">7 Days</SelectItem>
            <SelectItem key="30d">30 Days</SelectItem>
            <SelectItem key="90d">90 Days</SelectItem>
          </Select>
        </div>
      </div>

      {/* Peak Hours by Country */}
      <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
          <HiGlobeAlt className="text-primary" /> 📊 Detailed Analytics
        </h3>
        <p className="text-default-400 text-sm mb-6">When is your website most visited per country</p>
        
        <div className="mb-8">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🌍 Peak Hours by Country
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-default-400 text-sm border-b border-white/10">
                  <th className="pb-3 px-2">Country</th>
                  <th className="pb-3 px-2">Peak Hour</th>
                  <th className="pb-3 px-2">Visitors</th>
                </tr>
              </thead>
              <tbody>
                {stats?.countryData.map((country) => (
                  <tr key={country.code} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-2">
                      <span className="text-2xl mr-3">{country.flag}</span>
                      <span className="font-medium">{country.country}</span>
                    </td>
                    <td className="py-4 px-2">
                      <Chip size="sm" variant="flat" color="primary">
                        <HiClock className="mr-1" /> {country.peakHour}
                      </Chip>
                    </td>
                    <td className="py-4 px-2 font-bold text-primary">{country.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Hourly Traffic Distribution */}
      <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          📈 Hourly Traffic Distribution
        </h3>
        <div className="grid grid-cols-12 gap-2 h-48 items-end">
          {stats?.hourlyTraffic.map((hour) => {
            const maxVisitors = Math.max(...(stats?.hourlyTraffic.map(h => h.visitors) || [1]));
            const heightPercent = (hour.visitors / maxVisitors) * 100;
            return (
              <div key={hour.hour} className="flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t-sm transition-all hover:from-primary hover:to-primary/70"
                  style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  title={`${hour.hour}:00 - ${hour.visitors} visitors`}
                />
                <span className="text-[10px] text-default-400">{hour.hour}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-default-400">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:00</span>
        </div>
      </Card>

      {/* Weekly Traffic Pattern */}
      <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <HiCalendar className="text-secondary" /> 🗓️ Weekly Traffic Pattern
        </h3>
        <div className="grid grid-cols-7 gap-4">
          {stats?.weeklyTraffic.map((day) => {
            const maxVisitors = Math.max(...(stats?.weeklyTraffic.map(d => d.visitors) || [1]));
            const intensity = (day.visitors / maxVisitors) * 100;
            return (
              <div key={day.day} className="text-center">
                <div 
                  className="h-24 rounded-xl mb-2 flex items-center justify-center transition-all"
                  style={{ 
                    backgroundColor: `rgba(56, 189, 248, ${intensity / 100})`,
                    border: `1px solid rgba(56, 189, 248, ${intensity / 200})`
                  }}
                >
                  <span className="font-bold text-lg">{day.visitors}</span>
                </div>
                <span className="text-sm text-default-400">{day.day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Geographic Distribution */}
      <Card className="p-6 bg-black/40 backdrop-blur-xl border border-white/10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          🗺️ Geographic Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.countryData.map((country) => {
            const maxVisitors = Math.max(...(stats?.countryData.map(c => c.visitors) || [1]));
            return (
              <div 
                key={country.code}
                className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{country.flag}</span>
                  <div>
                    <p className="font-semibold">{country.country}</p>
                    <p className="text-sm text-default-400">{country.code}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-default-400">Visitors</span>
                    <span className="font-bold text-primary">{country.visitors}</span>
                  </div>
                  <Progress
                    value={(country.visitors / maxVisitors) * 100}
                    color="primary"
                    size="sm"
                  />
                  <div className="flex justify-between text-xs text-default-400">
                    <span>Peak: {country.peakHour}</span>
                    <span>{((country.visitors / (stats?.thisMonth || 1)) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

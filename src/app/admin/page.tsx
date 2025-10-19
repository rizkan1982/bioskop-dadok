"use client";

import { getAdminStats } from "@/actions/admin";
import StatsCard from "@/components/sections/Admin/StatsCard";
import { BarChart, ListVideo, TrendUp, Users } from "@/utils/icons";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchStats() {
      const { data, success } = await getAdminStats();
      setStats(data);
      setSuccess(success);
      setLoading(false);
    }
    fetchStats();
  }, []);
  
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-500">Loading...</p>
      </div>
    );
  }
  
  if (!success || !stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-foreground-500">Failed to load dashboard statistics</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-foreground-500 mt-2">
          Welcome back! Here's what's happening with Cikini Asia.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users />}
          color="primary"
          description={`+${stats.recentSignups} this week`}
        />
        <StatsCard
          title="Watch History"
          value={stats.totalHistories}
          icon={<ListVideo />}
          color="success"
          description="Total watch records"
        />
        <StatsCard
          title="Watchlist Items"
          value={stats.totalWatchlist}
          icon={<BarChart />}
          color="warning"
          description="Movies & TV shows"
        />
        <StatsCard
          title="Unique Content"
          value={stats.uniqueMediaWatched}
          icon={<TrendUp />}
          color="danger"
          description="Different titles watched"
        />
      </div>
      
      {/* Charts Section - Coming Soon */}
      <Card className="border border-white/10 backdrop-blur-sm bg-black/20">
        <CardBody className="flex items-center justify-center p-12">
          <div className="text-center space-y-2">
            <p className="text-2xl">📊</p>
            <p className="text-lg font-semibold bg-gradient-to-r from-white to-default-300 bg-clip-text text-transparent">
              Analytics Charts Coming Soon
            </p>
            <p className="text-sm text-default-400">
              Beautiful charts and graphs will be available here
            </p>
          </div>
        </CardBody>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-white/10 backdrop-blur-sm bg-black/20">
          <CardHeader className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-default-300 bg-clip-text text-transparent">Quick Stats</h3>
          </CardHeader>
          <CardBody className="gap-3">
            <div className="flex items-center justify-between">
              <span className="text-default-400">New Signups (7 days)</span>
              <span className="text-success font-semibold">+{stats.recentSignups}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-default-400">Total Users</span>
              <span className="font-semibold text-white">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-default-400">Total Watches</span>
              <span className="font-semibold text-white">{stats.totalHistories}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-default-400">Avg Watches/User</span>
              <span className="font-semibold text-white">
                {stats.totalUsers > 0
                  ? (stats.totalHistories / stats.totalUsers).toFixed(1)
                  : "0"}
              </span>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border border-white/10 backdrop-blur-sm bg-black/20">
          <CardHeader className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-default-300 bg-clip-text text-transparent">Platform Health</h3>
          </CardHeader>
          <CardBody className="gap-3">
            <div className="flex items-center justify-between">
              <span className="text-default-400">Active Users</span>
              <span className="text-success font-semibold">{stats.totalUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-default-400">Content Engagement</span>
              <span className="text-success font-semibold">
                {stats.uniqueMediaWatched > 0 ? "High" : "Low"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-default-400">Watchlist Usage</span>
              <span className="font-semibold text-white">
                {stats.totalWatchlist > 0 ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-default-400">Platform Status</span>
              <span className="text-success font-semibold">Operational</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

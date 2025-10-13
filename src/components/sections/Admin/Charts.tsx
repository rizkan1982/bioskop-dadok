"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/utils/helpers";

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AdminChartsProps {
  userGrowthData?: ChartData[];
  contentViewsData?: ChartData[];
  topContentData?: ChartData[];
}

const COLORS = [
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function AdminCharts({
  userGrowthData = [],
  contentViewsData = [],
  topContentData = [],
}: AdminChartsProps) {
  // Default mock data if none provided
  const defaultUserGrowth = [
    { name: "Jan", users: 120, active: 85 },
    { name: "Feb", users: 180, active: 125 },
    { name: "Mar", users: 250, active: 180 },
    { name: "Apr", users: 320, active: 240 },
    { name: "May", users: 380, active: 290 },
    { name: "Jun", users: 450, active: 350 },
  ];

  const defaultContentViews = [
    { name: "Week 1", movies: 1200, tvShows: 800 },
    { name: "Week 2", movies: 1500, tvShows: 1100 },
    { name: "Week 3", movies: 1800, tvShows: 1300 },
    { name: "Week 4", movies: 2100, tvShows: 1600 },
  ];

  const defaultTopContent = [
    { name: "Action", value: 30 },
    { name: "Drama", value: 25 },
    { name: "Comedy", value: 20 },
    { name: "Thriller", value: 15 },
    { name: "Sci-Fi", value: 10 },
  ];

  const userGrowth = userGrowthData.length > 0 ? userGrowthData : defaultUserGrowth;
  const contentViews = contentViewsData.length > 0 ? contentViewsData : defaultContentViews;
  const topContent = topContentData.length > 0 ? topContentData : defaultTopContent;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* User Growth Chart */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="lg:col-span-2"
      >
        <Card className="border border-white/10 backdrop-blur-sm bg-black/20">
          <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-default-300 bg-clip-text text-transparent">
              User Growth Trend
            </h3>
            <p className="text-sm text-default-400">
              Total users vs active users over time
            </p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  animationDuration={1500}
                  animationBegin={0}
                />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#06b6d4"
                  fillOpacity={1}
                  fill="url(#colorActive)"
                  animationDuration={1500}
                  animationBegin={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </motion.div>

      {/* Content Views Bar Chart */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-white/10 backdrop-blur-sm bg-black/20">
          <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-default-300 bg-clip-text text-transparent">
              Content Views
            </h3>
            <p className="text-sm text-default-400">
              Movies vs TV Shows weekly views
            </p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contentViews}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="movies"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationBegin={0}
                />
                <Bar
                  dataKey="tvShows"
                  fill="#06b6d4"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                  animationBegin={300}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </motion.div>

      {/* Top Content Pie Chart */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-white/10 backdrop-blur-sm bg-black/20">
          <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-default-300 bg-clip-text text-transparent">
              Content Distribution
            </h3>
            <p className="text-sm text-default-400">
              Top genres by viewership
            </p>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topContent}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  animationBegin={0}
                >
                  {topContent.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(10px)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

"use client";

import { Card, CardBody, CardHeader } from "@heroui/react";
import { motion, type Variants } from "framer-motion";
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
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const AdminCharts: React.FC<AdminChartsProps> = ({
  userGrowthData = [],
  contentViewsData = [],
  topContentData = [],
  className,
}) => {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
      {/* User Growth Chart - Temporarily Disabled */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="lg:col-span-2"
      >
        <Card className="border border-white/10 backdrop-blur-sm bg-black/20">
          <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-default-300 bg-clip-text text-transparent">
              📊 User Growth Trend
            </h3>
            <p className="text-sm text-default-400">
              Charts temporarily disabled for better performance
            </p>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-center h-[300px] text-default-400">
              <div className="text-center space-y-2">
                <p className="text-lg">📈 Chart visualization coming soon</p>
                <p className="text-sm">Data: {userGrowthData.length} entries</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Content Views Chart - Temporarily Disabled */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-white/10 backdrop-blur-sm bg-black/20">
          <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-default-300 bg-clip-text text-transparent">
              📺 Content Views
            </h3>
            <p className="text-sm text-default-400">
              Movies vs TV Shows weekly views
            </p>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-center h-[300px] text-default-400">
              <div className="text-center space-y-2">
                <p className="text-lg">📊 Chart visualization coming soon</p>
                <p className="text-sm">Data: {contentViewsData.length} entries</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Top Content Chart - Temporarily Disabled */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
      >
        <Card className="border border-white/10 backdrop-blur-sm bg-black/20">
          <CardHeader className="flex flex-col items-start gap-2 px-6 pt-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-default-300 bg-clip-text text-transparent">
              🎬 Content Distribution
            </h3>
            <p className="text-sm text-default-400">
              Top genres by viewership
            </p>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-center h-[300px] text-default-400">
              <div className="text-center space-y-2">
                <p className="text-lg">🥧 Chart visualization coming soon</p>
                <p className="text-sm">Data: {topContentData.length} entries</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminCharts;

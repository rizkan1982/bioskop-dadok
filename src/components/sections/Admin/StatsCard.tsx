"use client";

import { Card, CardBody } from "@heroui/react";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: "primary" | "success" | "warning" | "danger";
  description?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  color = "primary",
  description 
}: StatsCardProps) {
  const colorClasses = {
    primary: "bg-primary-100 dark:bg-primary-900/20 text-primary",
    success: "bg-success-100 dark:bg-success-900/20 text-success",
    warning: "bg-warning-100 dark:bg-warning-900/20 text-warning",
    danger: "bg-danger-100 dark:bg-danger-900/20 text-danger",
  };
  
  return (
    <Card className="border-foreground-200 border">
      <CardBody className="flex flex-row items-center gap-4 p-6">
        <div className={`rounded-xl flex size-16 items-center justify-center ${colorClasses[color]}`}>
          <div className="text-3xl">{icon}</div>
        </div>
        <div className="flex-1">
          <p className="text-small text-foreground-500 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && (
            <p className="text-tiny text-foreground-400 mt-1">{description}</p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard = ({ title, value, icon, trend, className }: StatCardProps) => {
  return (
    <div
      className={cn(
        "bg-white p-5 rounded-xl border border-border flex items-center gap-4",
        className
      )}
    >
      <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-amber-600">{title}</p>
        <p className="text-2xl font-semibold text-amber-900">{value}</p>
        {trend && (
          <div className="flex items-center mt-1">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              vs last month
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

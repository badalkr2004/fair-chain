"use client";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

const DashboardCard = ({ title, children, className }: DashboardCardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-border overflow-hidden",
        className
      )}
    >
      <div className="px-5 py-4 bg-amber-50 border-b border-border">
        <h3 className="font-semibold text-amber-800">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

export default DashboardCard;

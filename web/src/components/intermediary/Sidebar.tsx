"use client";
// import { Link, useLocation } from "react-router-dom";
import Link from "next/link";
import {
  Home,
  Package,
  Map,
  Truck,
  BarChart,
  Settings,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  // const location = useLocation();
  const location = usePathname();
  console.log(location);

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Services", href: "/dashboard/services" },
    { icon: Map, label: "Service Areas", href: "/dashboard/service-areas" },
    { icon: Truck, label: "Capacity", href: "/dashboard/capacity" },
    { icon: Users, label: "Supply Chain", href: "/dashboard/supply-chain" },
    { icon: BarChart, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <aside className="flex flex-col w-64 h-screen bg-sidebar border-r border-border">
      <div className="flex items-center justify-center h-16 border-b border-border">
        <h1 className="text-2xl font-bold text-amber-600">Agri-Nexus</h1>
      </div>
      <div className="flex flex-col flex-grow p-4 gap-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-amber-500 text-white"
                  : "hover:bg-amber-100 text-amber-800"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
            <span className="text-amber-800 font-bold">JS</span>
          </div>
          <div>
            <p className="font-medium text-amber-800">John Smith</p>
            <p className="text-sm text-amber-600">Logistics Provider</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

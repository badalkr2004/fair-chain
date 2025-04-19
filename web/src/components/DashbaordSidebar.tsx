"use client";

import { Home, ShoppingBasket, TrendingUp, Lightbulb, QrCode, Truck, DollarSign, Star, Bell, HelpCircle, User } from "lucide-react";

import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const navItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/",
  },
  {
    title: "My Profile",
    icon: User,
    path: "/farmer/profile",
  },
  {
    title: "My Produce",
    icon: ShoppingBasket,
    path: "/farmer/produce",
  },
  {
    title: "Market Trends",
    icon: TrendingUp,
    path: "/farmer/market",
  },
  {
    title: "AI Suggestions",
    icon: Lightbulb,
    path: "/farmer/suggestions",
  },
  {
    title: "Traceability",
    icon: QrCode,
    path: "/farmer/traceability",
  },
  {
    title: "Logistics",
    icon: Truck,
    path: "/farmer/logistics",
  },
  {
    title: "Payments",
    icon: DollarSign,
    path: "/farmer/payments",
  },
  {
    title: "Ratings",
    icon: Star,
    path: "/farmer/ratings",
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/farmer/notifications",
  },
  {
    title: "Support",
    icon: HelpCircle,
    path: "/farmer/support",
  },
];

export default function DashboardSidebar() {
  const location = usePathname();
  const currentPath = location;

  return (
    <Sidebar>
      <SidebarHeader className="py-4">
        <div className="flex items-center px-2">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-farm-green p-1">
              <ShoppingBasket className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-lg">Fair Chain</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={currentPath === item.path}
                    tooltip={item.title}
                  >
                    <a href={item.path} className="flex items-center">
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="py-4">
        <div className="px-3 text-xs text-muted-foreground">
          <p>© 2025 FarmFlow. All rights reserved.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

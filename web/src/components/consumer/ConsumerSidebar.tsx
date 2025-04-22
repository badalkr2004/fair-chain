"use client";

import { Home, ShoppingCart, Package, Clock, Truck, CreditCard, Star, Bell, HelpCircle, User , MapPin  } from "lucide-react";
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
    path: "/consumer/dashboard",
  },
  {
    title: "My Profile",
    icon: User,
    path: "/consumer/profile",
  },
  {
    title: "Shop",
    icon: ShoppingCart,
    path: "/consumer/shop",
  },
  {
    title: "map",
    icon: "map-pin",
    path: "/consumer/map",
  },
  {
    title: "My Orders",
    icon: Package,
    path: "/consumer/orders",
  },
  {
    title: "Order History",
    icon: Clock,
    path: "/consumer/history",
  },
  {
    title: "Track Orders",
    icon: Truck,
    path: "/consumer/track",
  },
  {
    title: "Payments",
    icon: CreditCard,
    path: "/consumer/payments",
  },
  {
    title: "Reviews",
    icon: Star,
    path: "/consumer/reviews",
  },
  {
    title: "Notifications",
    icon: Bell,
    path: "/consumer/notifications",
  },
  {
    title: "Support",
    icon: HelpCircle,
    path: "/consumer/support",
  },
];

export default function ConsumerSidebar() {
  const location = usePathname();
  const currentPath = location;

  return (
    <Sidebar>
      <SidebarHeader className="py-4">
        <div className="flex items-center px-2">
          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-blue-600 p-1">
              <ShoppingCart className="h-6 w-6 text-white" />
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
          <p>© 2025 FairChain. All rights reserved.</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
} 
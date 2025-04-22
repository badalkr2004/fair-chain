"use client";

import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import ConsumerSidebar from "@/components/consumer/ConsumerSidebar";
import ConsumerHeader from "@/components/consumer/ConsumerHeader";

interface ConsumerLayoutProps {
  children: ReactNode;
}

export default function ConsumerLayout({ children }: ConsumerLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ConsumerSidebar />
        <SidebarInset>
          <div className="flex flex-col h-full">
            <ConsumerHeader />
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

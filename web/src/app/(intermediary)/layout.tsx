// import Sidebar from "@/components/intermediary/Sidebar";
import { ReactNode } from "react";
// import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar /> */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
};

export default DashboardLayout;

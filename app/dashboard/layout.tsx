import AppHeader from "@/components/custom/dashboard/AppHeader";
import { AppSidebar } from "@/components/custom/dashboard/AppSideBar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { BoardSearchProvider } from "@/context/BoardSearchContext";
import React from "react";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      {/* wraps both the header's search box and the lists it filters */}
      <BoardSearchProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <div className="p-5">
              {children}
          </div>
        </div>
      </BoardSearchProvider>
    </SidebarProvider>
  );
}

export default DashboardLayout;

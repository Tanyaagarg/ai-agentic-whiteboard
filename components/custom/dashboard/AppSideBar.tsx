"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Archive,
  Files,
  LayoutGrid,
  Settings,
  Sparkle,
  Sparkles,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@clerk/nextjs";
import CreateNewBoardDialog from "./CreateNewBoardDialog";

export function AppSidebar() {
  const path = usePathname();
  const {user} = useUser();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="logo" width={40} height={40} />
          <h2 className="text-lg font-semibold">WhizBoard</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3">
          <Button className="w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-card hover:bg-primary/90">
            <CreateNewBoardDialog/>
          </Button>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>My Boards</SidebarGroupLabel>
          <SidebarMenuButton className="p-5" isActive={path === "/dashboard"}>
            <LayoutGrid />
            <span>All Files</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className="p-5 mt-2"
            isActive={path === "/shared-files"}
          >
            <Users />
            <span>Shared</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className="p-5 mt-2"
            isActive={path === "/archived"}
          >
            <Archive />
            <span>Archived</span>
          </SidebarMenuButton>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Others</SidebarGroupLabel>
          <SidebarMenuButton className="p-5" isActive={path === "/ai"}>
            <Sparkles />
            <span>Ai Helper</span>
          </SidebarMenuButton>
          <SidebarMenuButton
            className="p-5 mt-2"
            isActive={path === "/settings"}
          >
            <Settings />
            <span>Settings</span>
          </SidebarMenuButton>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button className="w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-card hover:bg-primary/90">
          <CreateNewBoardDialog/>
        </Button>
        <div className="p-4 my-3 border rounded-md">
            <h2 className="text-sm flex justify-between mb-1">
                2 files created <span>Total 3</span>
            </h2>
            <Progress value={66} className="h-2 mt-2"/>
        </div>

        <div className="flex items-center gap-2 p-4 border rounded-md">
            <Image src={user?.imageUrl ?? ''} alt="User Image" width={40} height={40} className="rounded-full"/>
            <h2>
                {user?.firstName}{user?.lastName}
            </h2>
        </div>

      </SidebarFooter>
    </Sidebar>
  );
}

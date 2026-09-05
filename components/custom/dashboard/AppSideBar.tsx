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
import Image from "next/image";
import Link from "next/link";
import { Archive, LayoutGrid, LogOut, UserCog } from "lucide-react";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import CreateNewBoardDialog from "./CreateNewBoardDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BOARDS_CHANGED } from "./types";

// Paths live under /dashboard because that layout provides the sidebar.
// The old isActive checks pointed at "/archived" and "/shared-files", which
// never matched anything, so nothing ever highlighted.
const boardLinks = [
  { title: "All Files", path: "/dashboard", icon: LayoutGrid },
  { title: "Archived", path: "/dashboard/archived", icon: Archive },
];

export function AppSidebar() {
  const path = usePathname();
  const { user } = useUser();
  // Clerk's own <UserButton /> used to sit in the dashboard header. It is gone,
  // so this card is now the only way to reach the account — it has to offer
  // sign out as well, or there would be no way out of the app.
  const { openUserProfile, signOut } = useClerk();
  // null while the first request is in flight, so we can show "—" instead of
  // flashing a wrong "0 boards".
  const [boardCount, setBoardCount] = useState<number | null>(null);

  const loadBoardCount = useCallback(async () => {
    try {
      const result = await axios.get("/api/projects");
      setBoardCount(Array.isArray(result.data) ? result.data.length : 0);
    } catch (error) {
      console.error("Failed to load board count:", error);
    }
  }, []);

  useEffect(() => {
    loadBoardCount();

    // The lists archive/restore/delete by editing their own local state rather
    // than refetching, so without this the count would drift from the grid
    // sitting right next to it.
    window.addEventListener(BOARDS_CHANGED, loadBoardCount);
    return () => window.removeEventListener(BOARDS_CHANGED, loadBoardCount);
  }, [loadBoardCount]);

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" alt="logo" width={45} height={30} />
          <h2 className="text-lg font-semibold">WhizBoard</h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/*
          CreateNewBoardDialog already renders its own <Button>. Wrapping it in
          another <Button> made a button inside a button inside a trigger —
          invalid HTML, and the click never landed.
        */}
        <SidebarGroup className="px-3">
          <CreateNewBoardDialog />
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>My Boards</SidebarGroupLabel>
          {boardLinks.map((item) => (
            // Base UI takes `render`, not Radix's `asChild`
            <SidebarMenuButton
              key={item.path}
              className="mt-2 p-5"
              isActive={path === item.path}
              render={<Link href={item.path} />}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          ))}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="my-3 rounded-md border p-4">
          <h2 className="text-sm">
            {boardCount === null
              ? "— boards"
              : `${boardCount} ${boardCount === 1 ? "board" : "boards"} created`}
          </h2>
        </div>

        <DropdownMenu>
          {/* Base UI takes `render`, not Radix's `asChild` */}
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md border p-4 text-left transition-colors hover:bg-accent"
              />
            }
          >
            {user?.imageUrl && (
              <Image
                src={user.imageUrl}
                alt="User Image"
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <h2>
              {user?.firstName} {user?.lastName}
            </h2>
          </DropdownMenuTrigger>

          {/* opens upward — the card sits at the bottom of the sidebar */}
          <DropdownMenuContent side="top" align="start" sideOffset={8}>
            {/* a plain div, not DropdownMenuLabel — Base UI's GroupLabel
                throws unless it sits inside a <Menu.Group> */}
            <div className="truncate px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openUserProfile()}>
              <UserCog />
              Manage account
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
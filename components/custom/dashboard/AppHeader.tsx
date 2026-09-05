"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useBoardSearch } from "@/context/BoardSearchContext";
import { Search, X } from "lucide-react";
import React from "react";

function AppHeader() {
  const { query, setQuery } = useBoardSearch();

  return (
    <div className="flex w-full items-center gap-3 border-b p-4">
      <SidebarTrigger />

      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search boards"
          aria-label="Search boards"
          className="px-9"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            title="Clear search"
            aria-label="Clear search"
            className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default AppHeader;

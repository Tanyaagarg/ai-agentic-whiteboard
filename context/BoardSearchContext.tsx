"use client";

import React, { createContext, useContext, useState } from "react";

/**
 * The search box lives in the dashboard header but the boards it filters are
 * rendered by ProjectList / ArchivedList, which sit in a different branch of
 * the tree. A tiny context in the shared layout is what connects them.
 *
 * Deliberately not a ?q= URL param: /dashboard is statically prerendered, and
 * useSearchParams would force it dynamic or need a Suspense boundary for what
 * is only ever transient UI state.
 */
type BoardSearch = {
  query: string;
  setQuery: (value: string) => void;
};

const BoardSearchContext = createContext<BoardSearch>({
  query: "",
  setQuery: () => {},
});

export function BoardSearchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");

  return (
    <BoardSearchContext.Provider value={{ query, setQuery }}>
      {children}
    </BoardSearchContext.Provider>
  );
}

export const useBoardSearch = () => useContext(BoardSearchContext);

/** Case-insensitive name match. An empty or blank query matches everything. */
export const matchesQuery = (name: string, query: string) =>
  name.toLowerCase().includes(query.trim().toLowerCase());

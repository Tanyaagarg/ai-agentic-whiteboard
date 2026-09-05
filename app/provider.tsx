"use client";

import { UserDetailContext, type UserDetail } from "@/context/UserDetailContext";
import axios from "axios";
import React, { useEffect, useState } from "react";

/**
 * Runs once on load: makes sure the signed-in Clerk account has a matching row
 * in our own users table, and hands that row to the tree via context.
 */
function Provider({ children }: { children: React.ReactNode }) {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);

  useEffect(() => {
    const createNewUser = async () => {
      try {
        const result = await axios.post("/api/users");
        setUserDetail(result.data);
      } catch (error) {
        // not fatal: the page still works, the row is created on the next load
        console.error("Could not load user detail:", error);
      }
    };

    createNewUser();
  }, []);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
}

export default Provider;

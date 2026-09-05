"use client";

import { createContext, useContext } from "react";

/** The app's own users row — separate from the Clerk profile. */
export type UserDetail = {
  id: number;
  name: string | null;
  email: string;
  credits: number;
  createdAt: string;
};

type UserDetailValue = {
  userDetail: UserDetail | null;
  setUserDetail: (value: UserDetail | null) => void;
};

export const UserDetailContext = createContext<UserDetailValue>({
  userDetail: null,
  setUserDetail: () => {},
});

export const useUserDetail = () => useContext(UserDetailContext);

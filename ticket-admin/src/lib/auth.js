"use client";

import { useSession, signOut as nextSignOut } from "next-auth/react";

export function useAuth() {
  const { data, status } = useSession();
  const session = data?.user
    ? { name: data.user.name, email: data.user.email, role: data.user.role }
    : null;

  return {
    session,
    loading: status === "loading",
    logout: () => nextSignOut({ callbackUrl: "/login" }),
  };
}

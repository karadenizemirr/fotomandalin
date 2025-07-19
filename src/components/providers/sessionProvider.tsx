"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import React, { useEffect } from "react";
import { signOut } from "next-auth/react";

interface Props {
  children: React.ReactNode;
  session?: Session | null;
}

export function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}

export function AutoLogoutOnCloseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleBeforeUnload = () => {
      signOut({ redirect: false });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  return <>{children}</>;
}
export function SessionProviderWithAutoLogout({ children, session }: Props) {
  return (
    <SessionProvider session={session}>
      <AutoLogoutOnCloseProvider>{children}</AutoLogoutOnCloseProvider>
    </SessionProvider>
  );
}

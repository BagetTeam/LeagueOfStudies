"use client";

import { AuthProvider } from "@/lib/UserContext";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}

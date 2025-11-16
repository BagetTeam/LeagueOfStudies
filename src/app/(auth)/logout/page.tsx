"use client";
import { useRouter } from "next/router";
import { useEffect } from "react";
export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    setTimeout(() => router.push("/"), 2000);
  }, []);
  return <div>Logging you out...</div>;
}

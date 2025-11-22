"use client";
import React from "react";
import { useUser } from "@/lib/UserContext";
import { useRouter } from "next/navigation";
import { SignUpForm } from "@/components/SignUpForm";
export default function SignUpPage() {
  const user = useUser();
  const router = useRouter();
  if (user.user) {
    router.push("/dashboard");
  }
  return (
    <div className="mt-8">
      <SignUpForm />
    </div>
  );
}

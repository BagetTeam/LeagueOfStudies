"use client";
import { LoginForm } from "@/components/LoginForm";
import { useUser } from "@/lib/UserContext";
import { useRouter } from "next/navigation";
export default function Login() {
  const router = useRouter();
  const user = useUser();
  if (user.user) router.push("/dashboard");
  return <div className="mt-8">{!user.user && <LoginForm />}</div>;
}

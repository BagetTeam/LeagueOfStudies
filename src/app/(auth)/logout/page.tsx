"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { createSupClient } from "@/utils/supabase/client";

export default function LogoutPage() {
  const router = useRouter();
  const { setUser } = useUser();

  const supabase = createSupClient();

  const handleLogout = async () => {
    // Sign out immediately
    await supabase.auth.signOut();
    // Update user state immediately for instant UI feedback
    setUser(null);
    // Redirect after auth state has been cleared
    router.push("/");
  };

  handleLogout();

  return <div>Logging you out...</div>;
}

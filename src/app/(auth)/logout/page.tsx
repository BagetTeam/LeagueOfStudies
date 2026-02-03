"use client";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/UserContext";
import { createSupClient } from "@/utils/supabase/client";

export default function LogoutPage() {
  const router = useRouter();
  const { setUser } = useUser();

  const supabase = createSupClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  handleLogout();

  return <div>Logging you out...</div>;
}

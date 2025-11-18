"use client";

import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useContext,
} from "react";
import { User } from "@supabase/supabase-js";

import { createSupClient } from "@/utils/supabase/client";

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const supabase = createSupClient();
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(event, session);
    setTimeout(async () => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }, 0);
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return context;
};

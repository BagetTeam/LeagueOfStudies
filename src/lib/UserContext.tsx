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

  useEffect(() => {
    const supabase = createSupClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session);

      // When signed out, session is null, so set user to null immediately
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        return;
      }

      // For other events, update user from session or fetch fresh
      setUser(session.user);
      // Fallback: fetch user if not in session
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

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
  bearer: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setBearer: React.Dispatch<React.SetStateAction<string | null>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [bearer, setBearer] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      const { data } = await supabase.auth.getSession();
      const key = data?.session?.access_token;
      setBearer(key ?? null);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        return;
      }

      setUser(session.user);
      setBearer(session.access_token);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ bearer, setBearer, user, setUser }}>
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

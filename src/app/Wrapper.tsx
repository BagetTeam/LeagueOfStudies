"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import { SupabaseClient } from "@supabase/supabase-js";
import { createContext } from "react";
type Props = {
  children: React.ReactNode;
  domain: string;
  client_id: string;
  base_uri: string;
};

export default function Wrapper({
  children,
  domain,
  client_id,
  base_uri,
}: Props) {
  return (
    <Auth0Provider
      domain={domain}
      clientId={client_id}
      authorizationParams={{
        redirect_uri: base_uri,
      }}
    >
      {children}
    </Auth0Provider>
  );
}

export const Context = createContext<SupabaseClient | null>(null);

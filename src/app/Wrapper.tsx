"use client";

import { Auth0Provider } from "@auth0/auth0-react";
type Props = {
  children: React.ReactNode;
};

export default function Wrapper({ children }: Props) {
  return (
    <Auth0Provider
      domain="dev-26y6jtgreq2t3aaj.us.auth0.com"
      clientId="mWbr9XyYRxIP8I4jtaFDLioUudWuuQx6"
      authorizationParams={{
        redirect_uri: "http://localhost:3000",
      }}
    >
      {children}
    </Auth0Provider>
  );
}

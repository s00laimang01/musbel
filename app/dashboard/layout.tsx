"use client";

import ClientProvider from "@/components/client-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ClientProvider>{children}</ClientProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Layout;

"use client";

import DashboardProvider from "@/components/dashboard-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <DashboardProvider>{children}</DashboardProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default Layout;

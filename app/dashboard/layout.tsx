import ClientProvider from "@/components/client-provider";
import { Sidebar } from "@/components/sidebar";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <ClientProvider>{children}</ClientProvider>;
};

export default Layout;

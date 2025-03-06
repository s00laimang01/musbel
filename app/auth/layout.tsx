import Logo from "@/components/logo";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense>
      <div className="min-h-screen flex flex-col">
        <header className="p-4 border-b">
          <Logo showName showLogo={false} />
        </header>
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md space-y-8">{children}</div>
        </div>
      </div>
    </Suspense>
  );
};

export default Layout;

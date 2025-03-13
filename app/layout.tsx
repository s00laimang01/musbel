import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { configs } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${configs.appName}`,
  description:
    "This is a website that sells data, airtime, electricity and check exam results.",
  applicationName: configs.appName,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Toaster position="top-center" richColors />
        {children}
      </body>
    </html>
  );
}

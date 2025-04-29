"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  Settings,
  CreditCard,
  Database,
  Zap,
  X,
  ChevronRight,
  Share,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "../scroll-area";
import { PATHS } from "@/types";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Overview",
      icon: BarChart3,
      href: PATHS.ADMIN_OVERVIEW,
      active: pathname === PATHS.ADMIN_OVERVIEW,
    },
    {
      label: "Users",
      icon: Users,
      href: PATHS.ADMIN_USERS,
      active: pathname === PATHS.ADMIN_USERS,
    },
    {
      label: "Transactions",
      icon: CreditCard,
      href: PATHS.ADMIN_TRANSACTIONS,
      active: pathname === PATHS.ADMIN_TRANSACTIONS,
    },
    {
      label: "Data Plans",
      icon: Database,
      href: PATHS.ADMIN_DATA_PLANS,
      active: pathname === PATHS.ADMIN_DATA_PLANS,
    },
    {
      label: "Electricity Bills",
      icon: Zap,
      href: PATHS.ADMIN_ELECTRICITY_BILLS,
      active: pathname === PATHS.ADMIN_ELECTRICITY_BILLS,
    },
    {
      label: "Referrals",
      icon: Share,
      href: PATHS.ADMIN_REFERRALS,
      active: pathname === PATHS.ADMIN_REFERRALS,
    },
    {
      label: "Settings",
      icon: Settings,
      href: PATHS.ADMIN_SETTINGS,
      active: pathname === PATHS.ADMIN_SETTINGS,
    },
  ];

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only" />
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center px-4 border-b">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">Admin Dashboard</h2>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="px-2 py-4">
                <nav className="flex flex-col gap-1">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => onOpenChange(false)}
                    >
                      <Button
                        variant={route.active ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2",
                          route.active && "bg-secondary"
                        )}
                      >
                        <route.icon className="h-4 w-4" />
                        {route.label}
                        {route.active && (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </Button>
                    </Link>
                  ))}
                </nav>
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background md:flex md:w-64 md:flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </div>
        <ScrollArea className="flex-1">
          <div className="px-2 py-4">
            <nav className="flex flex-col gap-1">
              {routes.map((route) => (
                <Link key={route.href} href={route.href}>
                  <Button
                    variant={route.active ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2",
                      route.active && "bg-secondary"
                    )}
                  >
                    <route.icon className="h-4 w-4" />
                    {route.label}
                    {route.active && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

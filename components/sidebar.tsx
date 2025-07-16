"use client";

import type React from "react";

import {
  LayoutDashboard,
  Wallet,
  Package,
  ShoppingCart,
  Import,
  CreditCard,
  Settings,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { cn, getInitials, isPathMathching } from "@/lib/utils";
import Link from "next/link";
import { PATHS } from "@/types";
import { useUserStore } from "@/stores/user.store";
import { signOut } from "next-auth/react";
import Cookies from "js-cookie";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  path?: string;
  onClick?: () => void;
}

function NavItem({
  icon,
  label,
  isActive = false,
  path = "#",
  onClick = () => {},
}: NavItemProps) {
  return (
    <Link
      onClick={onClick}
      href={path}
      className={cn(
        "flex items-center gap-3 p-4 rounded-full text-gray-700 hover:bg-gray-100 transition-colors",
        isActive && "bg-primary/5 text-primary"
      )}
    >
      <span className={cn(isActive ? "text-primary" : "text-gray-600")}>
        {icon}
      </span>
      <span className="font-semibold text-sm">{label}</span>
    </Link>
  );
}

export function Sidebar({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  const { user } = useUserStore();

  return (
    <aside className={cn("h-full w-lg p-6", className)}>
      <Link
        onClick={onClick}
        href={PATHS.SETTINGS}
        className="mb-6 pb-2 border-b"
      >
        <div className="flex items-center flex-col gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-800 font-semibold">
              {getInitials(user?.fullName!)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user?.fullName}</h3>
            <p className="text-xs text-center text-gray-500">
              {user?.auth.email}
            </p>
          </div>
        </div>
      </Link>

      <nav className="mt-3">
        <ul className="space-y-2">
          <NavItem
            onClick={onClick}
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            path={PATHS.HOME}
            isActive={isPathMathching(PATHS.HOME)}
          />
          <NavItem
            onClick={onClick}
            icon={<Wallet size={18} />}
            label="Wallet"
            path={PATHS.WALLET}
            isActive={isPathMathching(PATHS.WALLET)}
          />
          <NavItem
            onClick={onClick}
            icon={<Package size={18} />}
            label="Buy Data"
            path={PATHS.BUY_DATA}
            isActive={isPathMathching(PATHS.BUY_DATA)}
          />
          <NavItem
            onClick={onClick}
            icon={<ShoppingCart size={18} />}
            label="Buy Airtime"
            isActive={isPathMathching(PATHS.BUY_AIRTIME)}
            path={PATHS.BUY_AIRTIME}
          />
          <NavItem
            onClick={onClick}
            icon={<Import size={18} />}
            label="Utility Payments"
            isActive={isPathMathching(PATHS.UTILITY_PAYMENT)}
            path={PATHS.UTILITY_PAYMENT}
          />
          <NavItem
            onClick={onClick}
            icon={<CreditCard size={18} />}
            label="Transactions"
            isActive={isPathMathching(PATHS.TRANSACTIONS)}
            path={PATHS.TRANSACTIONS}
          />
        </ul>
      </nav>

      <div className="mt-auto pt-8">
        <ul className="space-y-1">
          {user?.role === "admin" && (
            <NavItem
              onClick={onClick}
              icon={<ShieldAlert size={18} />}
              label="Admin"
              isActive={isPathMathching(PATHS.ADMIN_OVERVIEW)}
              path={PATHS.ADMIN_OVERVIEW}
            />
          )}
          <NavItem
            onClick={onClick}
            icon={<Settings size={18} />}
            label="Settings"
            isActive={isPathMathching(PATHS.SETTINGS)}
            path={PATHS.SETTINGS}
          />
          <NavItem
            icon={<LogOut size={18} />}
            label="Logout"
            isActive={isPathMathching("")}
            onClick={async () => {
              await signOut();
              Cookies.remove("isAuthenticated");
              location.href = PATHS.SIGNIN;
            }}
          />
        </ul>
      </div>
    </aside>
  );
}

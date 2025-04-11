"use client";

import { Bell, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthentication } from "@/hooks/use-authentication";
import { api, errorMessage, getInitials } from "@/lib/utils";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { PATHS } from "@/types";
import { toast } from "sonner";
import { useState } from "react";

interface HeaderProps {
  onMenuButtonClick: () => void;
}

export function Header({ onMenuButtonClick }: HeaderProps) {
  const { user } = useAuthentication();
  const [isPending, startTransaction] = useState(false);

  const refreshAccessToken = async () => {
    try {
      startTransaction(true);
      await api.post(`/admin/overview/refresh-token/`);
      toast.success("Token refreshed successfully");
    } catch (err) {
      toast.error(errorMessage(err) || "Something went wrong");
    } finally {
      startTransaction(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6 py-7">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuButtonClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="ml-auto flex items-center gap-2">
        <Button
          disabled={isPending}
          onClick={refreshAccessToken}
          size="sm"
          variant="secondary"
        >
          Refresh
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>{getInitials(user?.fullName)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={PATHS.ADMIN_SETTINGS}>Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await signOut({ redirect: true });
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

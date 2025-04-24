"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2Icon } from "lucide-react";
import Cookies from "js-cookie";
import { useAuthentication } from "@/hooks/use-authentication";
import { useRouter } from "next/navigation";
import { PATHS } from "@/types";

export function RemindUserToRefer() {
  const [open, setOpen] = useState(false);
  const { user, isLoading } = useAuthentication();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const doNotRemindUserToRefer = Cookies.get("do-not-remind-user-to-refer");

      if (doNotRemindUserToRefer) return;

      // Wait a moment before showing the dialog to avoid immediate popup on page load
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setOpen(false);
    }
  }, [user]);

  const handleDismiss = async () => {
    const now = new Date();
    now.setDate(now.getDate() + 1); // Set to expire in 1 day

    // Set dismissed cookie
    Cookies.set("do-not-remind-user-to-refer", "true", {
      expires: now,
    });
    setOpen(false);
  };

  const handleReferNow = () => {
    setOpen(false);
    router.push(PATHS.REFER); // Navigate to the referrals page
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) handleDismiss();
      }}
    >
      <DialogContent className="md:max-w-md w-[90%] rounded-none">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Share2Icon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center pt-4">Refer a Friend</DialogTitle>
          <DialogDescription className="text-center">
            Invite your friends to join and earn rewards for each successful
            referral. It only takes a minute to share your referral link!
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center sm:space-x-2 pt-4">
          <Button
            variant="default"
            disabled={isLoading}
            className="mb-2 sm:mb-0 rounded-none h-[3rem] w-full"
            onClick={handleReferNow}
          >
            Refer Now
          </Button>
          <Button
            variant="outline"
            className="rounded-none h-[3rem] w-full"
            onClick={handleDismiss}
            disabled={isLoading}
          >
            Not Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { FingerprintIcon } from "lucide-react";
import Cookies from "js-cookie";
import { useAuthentication } from "@/hooks/use-authentication";
import CreateOrUpdatePin from "./create-or-update";

export default function RemindUserToCreateTransactionPin() {
  const [open, setOpen] = useState(false);
  const { user, isLoading } = useAuthentication();

  useEffect(() => {
    if (user && !user.hasSetPin) {
      const doNotRemindUserToSetPin = Cookies.get(
        "do-not-remind-user-to-set-pin"
      );

      if (doNotRemindUserToSetPin) return;

      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [user]);

  const handleDismiss = async () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    // Set dismissed cookie via server action
    Cookies.set("do-not-remind-user-to-set-pin", "true", {
      expires: now,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="md:max-w-md w-[90%] rounded-none">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FingerprintIcon className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center pt-4">
            Set Transaction Pin
          </DialogTitle>
          <DialogDescription className="text-center">
            We notice that you haven't set a pin for transacting, would you take
            a minute to create one now?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center sm:space-x-2 pt-4">
          <CreateOrUpdatePin mode="create">
            <Button
              variant="default"
              disabled={isLoading}
              className="mb-2 sm:mb-0 rounded-none h-[3rem] w-full"
            >
              Create Pin
            </Button>
          </CreateOrUpdatePin>
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

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
import { Mail } from "lucide-react";
import Cookies from "js-cookie";
import { useAuthentication } from "@/hooks/use-authentication";
import VerifyEmail from "./verify-email";
import { api, errorMessage } from "@/lib/utils";
import { toast } from "sonner";

export default function RemindUserToVerifyEmail() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthentication();

  useEffect(() => {
    if (user && !user.isEmailVerified && user.hasSetPin) {
      const doNotRemindUserToVerifyEmail = Cookies.get(
        "do-not-remind-user-to-verify-email"
      );

      if (doNotRemindUserToVerifyEmail) return;

      setOpen(true);
    }
  }, [user]);

  const sendVerificationCode = async () => {
    try {
      await api.post(`users/me/verify-account/`, { type: "email" });

      toast.success("Verification code sent successfully");
    } catch (error) {
      toast.error(errorMessage(error).message);
    }
  };

  const handleDismiss = async () => {
    setLoading(true);
    try {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      // Set dismissed cookie via server action
      Cookies.set("do-not-remind-user-to-verify-email", "true", {
        expires: now,
      });
      setOpen(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="md:max-w-md w-[90%] rounded-none">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center pt-4">
            Verify your email
          </DialogTitle>
          <DialogDescription className="text-center">
            Your email address hasn't been verified yet. Verify your email to
            get your dedicated account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center sm:space-x-2 pt-4">
          <VerifyEmail>
            <Button
              variant="default"
              onClick={sendVerificationCode}
              disabled={loading}
              className="mb-2 sm:mb-0 rounded-none h-[3rem]"
            >
              {loading ? "Processing..." : "Verify Email"}
            </Button>
          </VerifyEmail>
          <Button
            variant="outline"
            className="rounded-none h-[3rem]"
            onClick={handleDismiss}
            disabled={loading}
          >
            Not Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

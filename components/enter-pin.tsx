"use client";

import type { FC, ReactNode } from "react";
import { useMediaQuery } from "@uidotdev/usehooks";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { errorMessage } from "@/lib/utils";
import { set } from "mongoose";

interface EnterPinProps {
  children: ReactNode;
  onVerify?: (pin: string) => void;
  autoVerify?: boolean;
  moreChild?: ReactNode;
}

const EnterPin: FC<EnterPinProps> = ({
  children,
  onVerify,
  autoVerify = true,
  moreChild,
}) => {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleVerify = () => {
    try {
      if (pin.length === 4) {
        onVerify?.(pin);
        setOpen(false);
        setPin("");
      }
    } catch (error) {
      toast.error(errorMessage(error).message);
    }
  };

  // Auto-verify when PIN is complete
  useEffect(() => {
    if (autoVerify && pin.length === 4) {
      handleVerify();
    }
  }, [pin, autoVerify]);

  const pinContent = (
    <div className="w-full">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">Enter Transaction PIN</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Please enter your 4-digit transaction PIN
        </p>
      </div>

      {moreChild}

      <div className="flex justify-center mb-6">
        <InputOTP maxLength={6} onChange={setPin} value={pin}>
          <InputOTPGroup>
            <InputOTPSlot index={0} className="h-14 w-14" />
            <InputOTPSlot index={1} className="h-14 w-14" />
            <InputOTPSlot index={2} className="h-14 w-14" />
            <InputOTPSlot index={3} className="h-14 w-14" />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <div className="flex justify-center">
        <Button
          variant="ringHover"
          className="w-full rounded-none h-[3rem]"
          disabled={pin.length !== 4}
          onClick={handleVerify}
        >
          Confirm
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild className="w-full">
          {children}
        </DrawerTrigger>
        <DrawerContent className="p-4">
          <DrawerTitle className="sr-only" />

          {pinContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only" />
        {pinContent}
      </DialogContent>
    </Dialog>
  );
};

export default EnterPin;

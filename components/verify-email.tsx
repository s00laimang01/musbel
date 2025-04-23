"use client";

import { useState, useEffect, FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import { api, errorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { useAuthentication } from "@/hooks/use-authentication";

const VerifyEmail: FC<{
  children?: React.ReactNode;
  email?: string;
  isOpen?: boolean;
}> = ({ email = "user@example.com", children = <div />, isOpen = false }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(isOpen);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { user } = useAuthentication();
  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Reset component state when dialog/drawer is closed
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setTimeout(() => {
        setOtp("");
        setError(null);
        setIsVerified(false);
      }, 300);
    }
  };

  // Handle OTP change
  const handleOtpChange = (value: string) => {
    setOtp(value);
    setError(null);
  };

  // Verify OTP
  const verifyOtp = async () => {
    // Check if OTP is complete
    if (otp.length !== 6) {
      setError("Please enter all digits of the verification code");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Simulate API call to verify OTP
      await api.get(`/users/me/verify-account/?otp=${otp}`);

      setIsVerified(true);
    } catch (error) {
      setError("An error occurred during verification. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    setIsResending(true);
    setError(null);

    try {
      // Simulate API call to resend OTP
      await api.post(`/users/me/verify-account/`, { type: "email" });

      toast.success("OTP resent successfully!");

      // Reset OTP input
      setOtp("");

      // Set countdown for resend button
      setCountdown(60);
    } catch (error) {
      setError(errorMessage(error).message);
    } finally {
      setIsResending(false);
    }
  };

  // Content based on verification status
  const renderContent = () => {
    if (isVerified) {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-4 rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">Email Verified!</h3>
          <p className="mb-6 text-muted-foreground">
            Your email address has been successfully verified, Thank you for
            using our service.
          </p>
          <Button
            onClick={() => handleOpenChange(false)}
            className="w-full h-[3rem] rounded-none"
          >
            Continue
          </Button>
        </div>
      );
    }

    return (
      <>
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-3">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            We've sent a verification code to
          </p>
          <p className="font-medium">{user?.auth?.email || email}</p>
        </div>

        <div className="w-full flex items-center justify-center">
          <InputOTP value={otp} onChange={handleOtpChange} maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-12" />
              <InputOTPSlot index={1} className="w-12 h-12" />
              <InputOTPSlot index={2} className="w-12 h-12" />
              <InputOTPSlot index={3} className="w-12 h-12" />
              <InputOTPSlot index={4} className="w-12 h-12" />
              <InputOTPSlot index={5} className="w-12 h-12" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <div className="mt-4 text-center text-sm text-red-500">{error}</div>
        )}

        <div className="mt-6">
          <Button
            variant="ringHover"
            onClick={verifyOtp}
            className="w-full rounded-none h-[3rem]"
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isVerifying ? "Verifying..." : "Verify Email"}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            {countdown > 0 ? (
              <span className="text-primary">Resend in {countdown}s</span>
            ) : (
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={resendOtp}
                disabled={isResending}
              >
                {isResending && (
                  <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                )}
                Resend Code
              </Button>
            )}
          </p>
        </div>
      </>
    );
  };

  // Render dialog for desktop and drawer for mobile
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent className="rounded-none">
          <DrawerHeader className="border-b pb-4">
            <DrawerTitle className="text-xl font-bold">
              Verify Your Email
            </DrawerTitle>
            <DrawerDescription>
              Enter the verification code sent to your email
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 py-6">{renderContent()}</div>
          {!isVerified && (
            <DrawerFooter className="pt-0">
              <DrawerClose asChild>
                <Button
                  className="hover:bg-white text-primary hover:text-primary rounded-none h-[3rem]"
                  variant="outline"
                >
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg rounded-none">
        <DialogHeader>
          <DialogTitle className="font-bold text-primary">
            Verify Your Email
          </DialogTitle>
          <DialogDescription>
            Enter the verification code sent to your email
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">{renderContent()}</div>
        {!isVerified && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              type="button"
              className="hover:bg-white text-primary hover:text-primary rounded-none h-[3rem]"
            >
              Cancel
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VerifyEmail;

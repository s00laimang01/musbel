"use client";

import type React from "react";

import { AuthHeader } from "@/components/auth-header";
import { PrivacyFooter } from "@/components/privacy-footer";
import Text from "@/components/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { errorMessage } from "@/lib/utils";

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      toast.info("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      toast.success("Your password has been reset successfully");

      router.push("/login");
    } catch (error) {
      toast.error("Could not reset your password, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AuthHeader
        title="Reset your password"
        description={
          <Text>
            Enter the code sent to your email and create a new password.
          </Text>
        }
      />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            value={email}
            className="h-[3rem] rounded-none"
            disabled
          />
        </div>

        <div className="space-y-2">
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit code"
            className="h-[3rem] rounded-none"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Input
            id="newPassword"
            type="password"
            placeholder="New Password"
            className="h-[3rem] rounded-none"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            className="h-[3rem] rounded-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <Button
          type="submit"
          variant="ringHover"
          className="w-full bg-primary hover:bg-primary/90 rounded-none h-[3rem]"
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <PrivacyFooter />
    </div>
  );
};

export default ResetPasswordPage;

"use client";

import type React from "react";

import { AuthHeader } from "@/components/auth-header";
import { PrivacyFooter } from "@/components/privacy-footer";
import Text from "@/components/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/utils";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/forget-password", { email });

      toast.success(
        "If your email exists in our system, you will receive a reset code shortly"
      );

      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AuthHeader
        title="Forgot your password?"
        description={
          <Text>We will send a reset token to your email account.</Text>
        }
      />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            className="h-[3rem] rounded-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {isLoading ? "Sending..." : "Reset My Password"}
        </Button>
      </form>

      <PrivacyFooter />
    </div>
  );
};

export default ForgotPasswordPage;

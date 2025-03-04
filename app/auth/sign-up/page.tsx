"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AuthHeader } from "@/components/auth-header";
import Text from "@/components/text";
import { PATHS } from "@/types";
import { PrivacyFooter } from "@/components/privacy-footer";
import { Input } from "@/components/ui/input";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState("");

  const validateFirstName = (value: string) => {
    if (!value) {
      setFirstNameError("First name is required");
    } else {
      setFirstNameError("");
    }
  };

  return (
    <div>
      <div className="space-y-6">
        <AuthHeader
          title="Hi There!"
          description={
            <Text className="">
              We're glad to serve you. To create your account, please provide
              the information below. Already have an account?
              <Link
                href={PATHS.SIGNIN}
                className="text-primary hover:underline"
              >
                {" "}
                Sign In
              </Link>
            </Text>
          }
          showWaveEmoji
        />

        <form className="space-y-6">
          <div className="space-y-1">
            <Input
              className="rounded-none h-[3rem]"
              id="firstName"
              placeholder="Full Name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                validateFirstName(e.target.value);
              }}
              onBlur={(e) => validateFirstName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Select defaultValue="nigeria">
              <SelectTrigger className="rounded-none h-[3rem]">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="nigeria" className="h-[2.5rem] rounded-none">
                  <div className="flex items-center gap-2">
                    Nigeria
                    <Text>(+234)</Text>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Input
              className="rounded-none h-[3rem]"
              id="phone"
              type="tel"
              placeholder="Phone Number"
            />
          </div>

          <div className="space-y-1">
            <Input
              className="rounded-none h-[3rem]"
              id="email"
              type="email"
              placeholder="Email Address"
            />
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Input
                className="rounded-none h-[3rem]"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 6 characters)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="ringHover"
            className="w-full bg-primary hover:bg-primary/90 h-[3rem] rounded-none"
          >
            Create My Account
          </Button>
        </form>

        <PrivacyFooter />
      </div>
    </div>
  );
}

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
import axios from "axios";
import { AuthHeader } from "@/components/auth-header";
import Text from "@/components/text";
import { PATHS } from "@/types";
import { PrivacyFooter } from "@/components/privacy-footer";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { errorMessage } from "@/lib/utils";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const r = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    country: "",
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      startTransition(true);
      await axios.post("/api/auth/sign-up/", {
        ...form,
        country: "nigeria",
      });

      toast.success("Account created successfully!");

      const resp = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      toast.loading("Authenticating user...");

      if (resp?.ok) {
        toast.dismiss();
        r.push(PATHS.HOME);
      }
    } catch (error) {
      toast.error(errorMessage(error).message);
    } finally {
      startTransition(false);
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

        <form onSubmit={signUp} className="space-y-6">
          <div className="space-y-1">
            <Input
              className="rounded-none h-[3rem]"
              name="fullName"
              placeholder="Full Name"
              value={form.fullName}
              onChange={handleChange}
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
              name="phoneNumber"
              onChange={handleChange}
              className="rounded-none h-[3rem]"
              id="phone"
              type="tel"
              value={form.phoneNumber}
              placeholder="Phone Number"
            />
          </div>

          <div className="space-y-1">
            <Input
              name="email"
              onChange={handleChange}
              className="rounded-none h-[3rem]"
              id="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
            />
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Input
                name="password"
                onChange={handleChange}
                className="rounded-none h-[3rem]"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 6 characters)"
                value={form.password}
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
            disabled={isPending}
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PrivacyFooter } from "@/components/privacy-footer";
import { AuthHeader } from "@/components/auth-header";
import Text from "@/components/text";
import { PATHS } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const n = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [auth, setAuth] = useState({
    email: "demo@example.com",
    password: "123456789",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuth({ ...auth, [e.target.name]: e?.target.value });
  };

  const signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!(auth.email && auth.password)) {
      toast.error("MISSING_REQUIRED_PARAMETER: Please provide all fields");
      return;
    }

    n.push(PATHS.HOME);
  };

  return (
    <main>
      <div className="space-y-9">
        <AuthHeader
          title="Welcome Back"
          description={
            <Text className="font-semibold">
              To continue, please sign in with your email address and password.
              Don't have an account?{" "}
              <Link
                className="text-primary hover:underline font-bold text-l"
                href={PATHS.SIGNUP}
              >
                Create your account
              </Link>
            </Text>
          }
          showWaveEmoji
        />

        <form onSubmit={signIn} className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-xs">
                EMAIL
              </Label>
              <Link
                href={PATHS.FORGET_PASSWORD}
                className="text-xs text-primary hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              id="email"
              type="email"
              name="email"
              value={auth.email}
              placeholder="Enter your email address"
              className="h-[3rem] rounded-none"
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs">
              PASSWORD
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="h-[3rem] rounded-none"
                value={auth.password}
                onChange={handleChange}
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

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-sm font-normal">
              Remember me
            </Label>
          </div>

          <Button
            type="submit"
            variant="ringHover"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 rounded-none"
          >
            Sign In
          </Button>
        </form>

        <PrivacyFooter />
      </div>
    </main>
  );
}

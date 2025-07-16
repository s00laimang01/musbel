"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PrivacyFooter } from "@/components/privacy-footer";
import { AuthHeader } from "@/components/auth-header";
import Text from "@/components/text";
import { PATHS } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { signIn, useSession } from "next-auth/react";
import Cookies from "js-cookie";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Page() {
  const n = useRouter();
  const q = useSearchParams();
  const { status } = useSession();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useState(false);
  const [auth, setAuth] = useState({
    email: "",
    password: "",
    rememberLogins: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuth({ ...auth, [e.target.name]: e?.target.value });
  };

  const _signIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      startTransition(true);
      const result = await signIn("credentials", {
        redirect: false,
        email: auth.email,
        password: auth.password,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        const now = new Date();
        now.setDate(now.getDate() + 30);

        if (auth.rememberLogins) {
          Cookies.set("email", auth.email, { expires: now });
          Cookies.set("password", auth.password, { expires: now });
        }

        n.push(PATHS.HOME);
        n.refresh();
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      startTransition(false);
    }

    n.push(PATHS.HOME);
  };

  useEffect(() => {
    if (status === "authenticated") {
      n.push(PATHS.HOME);
      return;
    }

    const email = q.get("email") || Cookies.get("email") || "";
    const password = Cookies.get("password") || "";

    if (email || password) {
      setAuth({ ...auth, email, password, rememberLogins: true });
    }
  }, [status]);

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

        {q.get("message") && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle className="text-lg font-bold">INFO</AlertTitle>
            <AlertDescription>{q.get("message")}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={_signIn} className="space-y-6">
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
            <Checkbox
              checked={auth.rememberLogins}
              onCheckedChange={(e: boolean) =>
                setAuth({ ...auth, rememberLogins: e })
              }
              id="remember"
            />
            <Label htmlFor="remember" className="text-sm font-normal">
              Remember me
            </Label>
          </div>

          <Button
            type="submit"
            variant="ringHover"
            size="lg"
            disabled={isPending}
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

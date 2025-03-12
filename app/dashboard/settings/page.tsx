"use client";

import { useNavBar } from "@/hooks/use-nav-bar";
import React, { FC, ReactNode, useEffect, useState } from "react";
import { Code, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import PromptModal from "@/components/prompt-modal";
import { toast } from "sonner";
import { api, errorMessage, getInitials } from "@/lib/utils";
import { useAuthentication } from "@/hooks/use-authentication";
import { signOut } from "next-auth/react";
import { PATHS } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import CreateOrUpdatePin from "@/components/create-or-update";

const ChangeEmailAddress: FC<{ children: ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useState(false);
  const [open, setOpen] = useState(false);

  const changeEmailAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return toast.error("Email address is required");

    try {
      startTransition(true);
      await api.patch("/users/me/", { "auth.email": email });

      // Logout the user to login with new email.
      await signOut({
        redirect: true,
        callbackUrl: `${PATHS.SIGNIN}?email=${encodeURIComponent(
          email
        )}&message=Please sign in with your new email`,
      });

      toast.success("Email address changed successfully");
    } catch (error) {
      toast.error(errorMessage(error).message);
    } finally {
      setEmail("");
      startTransition(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-none">
        <DialogTitle className="sr-only" />
        <DialogHeader>
          <DialogTitle className="font-bold">Change Email Address</DialogTitle>
          <DialogDescription>
            After updating your email, you have to signIn with your new email
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <form action="" onSubmit={changeEmailAddress} className="space-y-3">
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-[3rem] rounded-none"
            placeholder="Enter your new email address"
          />
          <Button
            disabled={isPending}
            type="submit"
            variant="ringHover"
            className="w-full h-[3rem] rounded-none hover:bg-primary/80"
          >
            CHANGE EMAIL
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Page = () => {
  useNavBar("Settings");

  const queryClient = useQueryClient();
  const [isPending, startTransition] = useState(false);
  const { user } = useAuthentication("me", 5000);
  const [_user, setUser] = useState({
    phoneNumber: "",
    fullName: "",
  });
  const [auth, setAuth] = useState({
    currentPassword: "",
    newPassword: "",
    verifyNewPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({ ..._user, [name]: value });
  };

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuth({ ...auth, [name]: value });
  };

  const updateUserData = async () => {
    try {
      startTransition(true);
      await api.patch("/users/me/", _user);
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      toast.success("User data updated successfully");
    } catch (error) {
      toast.error(errorMessage(error).message);
    } finally {
      startTransition(false);
    }
  };

  const changeAccountPassword = async () => {
    try {
      startTransition(true);
      await api.patch("/users/me/reset-password/", auth);

      toast.success("Password changed successfully");

      await signOut({
        redirect: true,
        callbackUrl: `${PATHS.SIGNIN}?message=Please sign in with your new password`,
      });
    } catch (error) {
      toast.error(errorMessage(error).message);
    } finally {
      startTransition(false);
    }
  };

  const deleteAccount = async () => {
    try {
      startTransition(true);
      await api.delete("/users/me/delete/");
      toast.success("Account deleted successfully");

      await signOut({
        redirect: true,
        callbackUrl: `${PATHS.SIGNIN}?message=Account deleted successfully}`,
      });
    } catch (error) {
      toast.error(errorMessage(error).message);
    } finally {
      startTransition(false);
    }
  };

  const createTransactionPin = async (pin: string) => {
    try {
      const res = await api.post<{ message: string }>(`/auth/create/pin/`, {
        pin,
        confirmPin: pin,
      });

      toast(res.data.message);
    } catch (error) {
      toast.error(errorMessage(error).message);
    }
  };

  useEffect(() => {
    if (user) {
      setUser({ phoneNumber: user.phoneNumber, fullName: user.fullName });
    }
  }, [user]);

  return (
    <div className="container mx-auto max-w-3xl py-3">
      <section className="mb-10">
        <h2 className="mb-6 text-xl font-bold text-primary">
          Personal information
        </h2>

        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <span className="text-2xl font-bold text-primary">
              {getInitials(user?.fullName!)}
            </span>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1 block text-xs uppercase text-muted-foreground"
            >
              Full Name
            </label>
            <Input
              id="fullName"
              name="fullName"
              value={_user.fullName}
              onChange={handleChange}
              className="h-[3rem] rounded-none"
            />
          </div>
          <div>
            <label
              htmlFor="phoneNumber"
              className="mb-1 block text-xs uppercase text-muted-foreground"
            >
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={_user.phoneNumber}
              onChange={handleChange}
              className="h-[3rem] rounded-none"
            />
          </div>
        </div>

        <Button
          disabled={isPending}
          onClick={updateUserData}
          variant="ringHover"
          className="w-full h-[3rem] bg-primary rounded-none hover:bg-primary/80"
        >
          SAVE
        </Button>
      </section>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm">
          Your email address is{" "}
          <span className="font-medium text-primary">{user?.auth.email}</span>
        </p>
        <ChangeEmailAddress>
          <Button variant="link" className="text-primary hover:text-primary/80">
            Change Email
          </Button>
        </ChangeEmailAddress>
      </div>

      <section className="mb-10 border-t pt-8">
        <h2 className="mb-6 text-xl font-bold text-primary">
          Change your password
        </h2>

        <div className="mb-6 space-y-4">
          <div>
            <Input
              type="password"
              name="currentPassword"
              value={auth.currentPassword}
              onChange={handleAuthChange}
              placeholder="Current Password"
              className="h-[3rem] rounded-none"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="New Password"
              name="newPassword"
              value={auth.newPassword}
              onChange={handleAuthChange}
              className="h-[3rem] rounded-none"
            />
          </div>
          <div>
            <Input
              type="password"
              name="verifyNewPassword"
              value={auth.verifyNewPassword}
              onChange={handleAuthChange}
              placeholder="Verify New Password"
              className="h-[3rem] rounded-none"
            />
          </div>
        </div>

        <Button
          onClick={changeAccountPassword}
          disabled={isPending}
          variant="ringHover"
          className="w-full bg-primary/30 hover:bg-primary/80 rounded-none h-[3rem]"
        >
          CHANGE PASSWORD
        </Button>
      </section>

      <CreateOrUpdatePin
        onSuccess={createTransactionPin}
        mode={user?.hasSetPin ? "update" : "create"}
      >
        <section className="mb-10 border-t pt-8 cursor-pointer">
          <h2 className="mb-6 text-xl font-bold text-primary">
            {user?.hasSetPin ? "MODIFY" : "CREATE"} TRANSACTION PIN
          </h2>

          <div className="flex items-center gap-3 rounded-md border p-4">
            <Code className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">
                {user?.hasSetPin ? "Update" : "Create"} transaction pin
              </p>
              <p className="text-sm text-muted-foreground">
                tap here to continue
              </p>
            </div>
          </div>
        </section>
      </CreateOrUpdatePin>

      <section className="border-t pt-8">
        <h2 className="mb-6 text-xl font-bold text-primary">Delete Account</h2>

        <p className="mb-4 text-sm">
          Would you like to delete your account? Please note that this action
          will delete all your data and it{" "}
          <span className="font-medium text-primary">cannot be reversed.</span>
        </p>
        <PromptModal onConfirm={deleteAccount}>
          <Button
            disabled={isPending}
            variant="destructive"
            className=" text-white rounded-none"
          >
            DELETE MY ACCOUNT
          </Button>
        </PromptModal>
      </section>
    </div>
  );
};

export default Page;

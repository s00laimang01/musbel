"use client";

import { useNavBar } from "@/hooks/use-nav-bar";
import React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Page = () => {
  useNavBar("Settings");
  return (
    <div className="container mx-auto max-w-3xl py-3">
      <section className="mb-10">
        <h2 className="mb-6 text-xl font-bold text-primary">
          Personal information
        </h2>

        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <span className="text-2xl font-bold text-primary">SA</span>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1 block text-xs uppercase text-muted-foreground"
            >
              First Name
            </label>
            <Input
              id="firstName"
              defaultValue="Suleiman"
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
              defaultValue="07068214943"
              className="h-[3rem] rounded-none"
            />
          </div>
        </div>

        <Button
          variant="ringHover"
          className="w-full h-[3rem] bg-primary rounded-none hover:bg-primary/80"
        >
          SAVE
        </Button>
      </section>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm">
          Your email address is{" "}
          <span className="font-medium text-primary">au0116401@gmail.com</span>
        </p>
        <Button variant="link" className="text-primary hover:text-primary/80">
          Change Email
        </Button>
      </div>

      <section className="mb-10 border-t pt-8">
        <h2 className="mb-6 text-xl font-bold text-primary">
          Change your password
        </h2>

        <div className="mb-6 space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Current Password"
              className="h-[3rem] rounded-none"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="New Password"
              className="h-[3rem] rounded-none"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Verify New Password"
              className="h-[3rem] rounded-none"
            />
          </div>
        </div>

        <Button
          variant="ringHover"
          className="w-full bg-primary/30 hover:bg-primary/80 rounded-none h-[3rem]"
        >
          CHANGE PASSWORD
        </Button>
      </section>

      <section className="mb-10 border-t pt-8">
        <h2 className="mb-6 text-xl font-bold text-primary">
          Manage your addresses
        </h2>

        <div className="flex items-center gap-3 rounded-md border p-4">
          <Plus className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Add a new delivery address</p>
            <p className="text-sm text-muted-foreground">
              tap here to continue
            </p>
          </div>
        </div>
      </section>

      <section className="border-t pt-8">
        <h2 className="mb-6 text-xl font-bold text-primary">Delete Account</h2>

        <p className="mb-4 text-sm">
          Would you like to delete your account? Please note that this action
          will delete all your data and it{" "}
          <span className="font-medium text-primary">cannot be reversed.</span>
        </p>

        <Button
          variant="destructive"
          className="bg-rose-500 hover:bg-rose-600 text-white"
        >
          DELETE MY ACCOUNT
        </Button>
      </section>
    </div>
  );
};

export default Page;

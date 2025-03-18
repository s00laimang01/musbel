"use client";

import type React from "react";

import { ReactNode, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api, errorMessage } from "@/lib/utils";

type NewUserData = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
};

export function AddUserDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<NewUserData>({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: NewUserData) => {
      const response = await api.post("/auth/sign-up/", formData);

      return response.data;
    },
    onSuccess: () => {
      toast("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(errorMessage(error).message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      phoneNumber: "",
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) resetForm();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="md:max-w-[500px] rounded-none max-w-[95%]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add New User
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new user account
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="text-left">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="rounded-none h-[2.5rem]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-left">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="rounded-none h-[2.5rem]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber" className="text-left">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="rounded-none h-[2.5rem]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-left">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="rounded-none h-[2.5rem]"
                required
                minLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-none border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="ringHover"
              className="rounded-none bg-primary hover:bg-primary/90"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
